import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        const categories = await db.forumCategory.findMany({
            include: {
                lastPost: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                profileImageUrl: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        posts: true
                    }
                }
            },
            orderBy: {
                order: 'asc'
            }
        });

        const formattedCategories = categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
            color: category.color,
            icon: category.icon,
            postCount: category._count.posts,
            lastPost: category.lastPost ? {
                id: category.lastPost.id,
                title: category.lastPost.title,
                author: category.lastPost.author,
                createdAt: category.lastPost.createdAt
            } : null,
            lastPostAt: category.lastPostAt,
            createdAt: category.createdAt
        }));

        return NextResponse.json({
            success: true,
            categories: formattedCategories
        });

    } catch (error) {
        console.error('Forum categories API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch forum categories' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, description, slug, color, icon } = body;

        if (!name || !description || !slug) {
            return NextResponse.json(
                { success: false, error: 'Name, description, and slug are required' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existingCategory = await db.forumCategory.findUnique({
            where: { slug }
        });

        if (existingCategory) {
            return NextResponse.json(
                { success: false, error: 'Category slug already exists' },
                { status: 409 }
            );
        }

        // Get the next order number
        const lastCategory = await db.forumCategory.findFirst({
            orderBy: { order: 'desc' }
        });

        const nextOrder = (lastCategory?.order || 0) + 1;

        const category = await db.forumCategory.create({
            data: {
                name,
                description,
                slug,
                color: color || '#6B7280',
                icon: icon || 'MessageSquare',
                order: nextOrder
            }
        });

        return NextResponse.json({
            success: true,
            category: {
                id: category.id,
                name: category.name,
                description: category.description,
                slug: category.slug,
                color: category.color,
                icon: category.icon,
                postCount: 0,
                lastPost: null,
                lastPostAt: null,
                createdAt: category.createdAt
            }
        });

    } catch (error) {
        console.error('Create forum category API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create forum category' },
            { status: 500 }
        );
    }
}