import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, getCurrentUserRole } from '@/lib/auth-server';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        // Authenticate and authorize
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getCurrentUserRole();
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { itemId } = await params;
        const data = await request.json();

        // Check if content item exists
        const existingItem = await db.contentItem.findUnique({
            where: { id: itemId }
        });

        if (!existingItem) {
            return NextResponse.json(
                { error: 'Content item not found' },
                { status: 404 }
            );
        }

        // Check if slug already exists (excluding current item)
        if (data.slug && data.slug !== existingItem.slug) {
            const slugExists = await db.contentItem.findUnique({
                where: {
                    slug: data.slug,
                    NOT: { id: itemId }
                }
            });

            if (slugExists) {
                return NextResponse.json(
                    { error: 'Slug already exists' },
                    { status: 400 }
                );
            }
        }

        // Update content item
        const updatedItem = await db.contentItem.update({
            where: { id: itemId },
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                excerpt: data.excerpt,
                type: data.type,
                status: data.status,
                categoryId: data.category || null,
                tags: data.tags || [],
                featured: data.featured || false,
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
                seoKeywords: data.seoKeywords || [],
                publishedAt: data.status === 'published' && !existingItem.publishedAt ? new Date() : existingItem.publishedAt,
                updatedAt: new Date()
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            }
        });

        return NextResponse.json({
            message: 'Content item updated successfully',
            item: {
                id: updatedItem.id,
                title: updatedItem.title,
                slug: updatedItem.slug,
                status: updatedItem.status,
                type: updatedItem.type
            }
        });

    } catch (error) {
        console.error('Update content item error:', error);
        return NextResponse.json(
            { error: 'Failed to update content item' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        // Authenticate and authorize
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getCurrentUserRole();
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { itemId } = await params;

        // Check if content item exists
        const existingItem = await db.contentItem.findUnique({
            where: { id: itemId }
        });

        if (!existingItem) {
            return NextResponse.json(
                { error: 'Content item not found' },
                { status: 404 }
            );
        }

        // Delete content item
        await db.contentItem.delete({
            where: { id: itemId }
        });

        return NextResponse.json({
            message: 'Content item deleted successfully'
        });

    } catch (error) {
        console.error('Delete content item error:', error);
        return NextResponse.json(
            { error: 'Failed to delete content item' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { itemId: string } }
) {
    try {
        // Authenticate and authorize
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getCurrentUserRole();
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const itemId = params.itemId;

        // Get content item
        const item = await db.contentItem.findUnique({
            where: { id: itemId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            }
        });

        if (!item) {
            return NextResponse.json(
                { error: 'Content item not found' },
                { status: 404 }
            );
        }

        const transformedItem = {
            id: item.id,
            title: item.title,
            slug: item.slug,
            content: item.content,
            excerpt: item.excerpt,
            type: item.type,
            status: item.status,
            category: item.category?.name || 'Uncategorized',
            tags: item.tags || [],
            author: {
                id: item.author.id,
                name: item.author.name,
                email: item.author.email
            },
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            publishedAt: item.publishedAt?.toISOString(),
            views: item.views || 0,
            featured: item.featured || false,
            seoTitle: item.seoTitle,
            seoDescription: item.seoDescription,
            seoKeywords: item.seoKeywords || []
        };

        return NextResponse.json({ item: transformedItem });

    } catch (error) {
        console.error('Get content item error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch content item' },
            { status: 500 }
        );
    }
}