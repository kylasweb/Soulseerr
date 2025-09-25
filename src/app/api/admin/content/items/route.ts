import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, getCurrentUserRole } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || 'all';
        const status = searchParams.get('status') || 'all';
        const category = searchParams.get('category') || 'all';
        const sortBy = searchParams.get('sortBy') || 'updatedAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // Build where clause
        const where: any = {};

        // Add search filter
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
                { tags: { hasSome: [search] } }
            ];
        }

        // Add type filter
        if (type !== 'all') {
            where.type = type;
        }

        // Add status filter
        if (status !== 'all') {
            where.status = status;
        }

        // Add category filter
        if (category !== 'all') {
            where.categoryId = category;
        }

        // Build orderBy clause
        const orderBy: any = {};
        orderBy[sortBy] = sortOrder;

        // Get content items with pagination
        const items = await db.contentItem.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
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

        // Get total count for pagination
        const totalCount = await db.contentItem.count({ where });

        // Transform the data to match the expected format
        const transformedItems = items.map(item => ({
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
        }));

        return NextResponse.json({
            items: transformedItems,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error('Content items error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch content items' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        const data = await request.json();

        // Validate required fields
        if (!data.title || !data.slug || !data.content) {
            return NextResponse.json(
                { error: 'Title, slug, and content are required' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existingItem = await db.contentItem.findUnique({
            where: { slug: data.slug }
        });

        if (existingItem) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            );
        }

        // Create content item
        const contentItem = await db.contentItem.create({
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                excerpt: data.excerpt || '',
                type: data.type || 'article',
                status: data.status || 'draft',
                categoryId: data.category || null,
                tags: data.tags || [],
                featured: data.featured || false,
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
                seoKeywords: data.seoKeywords || [],
                views: 0,
                authorId: user.userId,
                publishedAt: data.status === 'published' ? new Date() : null
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
            message: 'Content item created successfully',
            item: {
                id: contentItem.id,
                title: contentItem.title,
                slug: contentItem.slug,
                status: contentItem.status,
                type: contentItem.type
            }
        });

    } catch (error) {
        console.error('Create content item error:', error);
        return NextResponse.json(
            { error: 'Failed to create content item' },
            { status: 500 }
        );
    }
}