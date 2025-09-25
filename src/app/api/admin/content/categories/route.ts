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

        // Get all categories with their content item counts
        const categories = await db.contentCategory.findMany({
            include: {
                _count: {
                    select: {
                        contentItems: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        const transformedCategories = categories.map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            parentId: category.parentId,
            itemCount: category._count.contentItems,
            createdAt: category.createdAt.toISOString()
        }));

        return NextResponse.json({
            categories: transformedCategories
        });

    } catch (error) {
        console.error('Content categories error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch content categories' },
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
        if (!data.name || !data.slug) {
            return NextResponse.json(
                { error: 'Name and slug are required' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existingCategory = await db.contentCategory.findUnique({
            where: { slug: data.slug }
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            );
        }

        // Create category
        const category = await db.contentCategory.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description || '',
                parentId: data.parentId || null
            }
        });

        return NextResponse.json({
            message: 'Content category created successfully',
            category: {
                id: category.id,
                name: category.name,
                slug: category.slug
            }
        });

    } catch (error) {
        console.error('Create content category error:', error);
        return NextResponse.json(
            { error: 'Failed to create content category' },
            { status: 500 }
        );
    }
}