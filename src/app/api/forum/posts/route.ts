import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const categoryId = searchParams.get('categoryId');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build the query
        const whereClause: any = {};

        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        const [posts, totalCount] = await Promise.all([
            db.forumPost.findMany({
                where: whereClause,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileImageUrl: true,
                            role: true
                        }
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            color: true
                        }
                    },
                    replies: {
                        select: {
                            id: true,
                            createdAt: true,
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    profileImageUrl: true
                                }
                            }
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    },
                    _count: {
                        select: {
                            replies: true,
                            likes: true
                        }
                    }
                },
                orderBy: [
                    { isPinned: 'desc' },
                    { updatedAt: 'desc' }
                ],
                take: limit,
                skip: offset
            }),
            db.forumPost.count({ where: whereClause })
        ]);

        const formattedPosts = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            author: {
                id: post.author.id,
                name: post.author.name,
                avatar: post.author.profileImageUrl,
                role: post.author.role
            },
            category: post.category,
            isPinned: post.isPinned,
            isLocked: post.isLocked,
            viewCount: post.viewCount,
            replyCount: post._count.replies,
            likeCount: post._count.likes,
            lastReply: post.replies[0] ? {
                id: post.replies[0].id,
                createdAt: post.replies[0].createdAt,
                author: post.replies[0].author
            } : null,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));

        return NextResponse.json({
            success: true,
            posts: formattedPosts,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Forum posts API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch forum posts' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, content, categoryId } = body;

        if (!title || !content || !categoryId) {
            return NextResponse.json(
                { success: false, error: 'Title, content, and category are required' },
                { status: 400 }
            );
        }

        // Verify category exists
        const category = await db.forumCategory.findUnique({
            where: { id: categoryId }
        });

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'Invalid category' },
                { status: 400 }
            );
        }

        const post = await db.forumPost.create({
            data: {
                title,
                content,
                categoryId,
                authorId: user.userId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImageUrl: true,
                        role: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        color: true
                    }
                },
                _count: {
                    select: {
                        replies: true,
                        likes: true
                    }
                }
            }
        });

        // Update category post count
        await db.forumCategory.update({
            where: { id: categoryId },
            data: {
                postCount: {
                    increment: 1
                },
                lastPostId: post.id,
                lastPostAt: post.createdAt
            }
        });

        const formattedPost = {
            id: post.id,
            title: post.title,
            content: post.content,
            author: {
                id: post.author.id,
                name: post.author.name,
                avatar: post.author.profileImageUrl,
                role: post.author.role
            },
            category: post.category,
            isPinned: post.isPinned,
            isLocked: post.isLocked,
            viewCount: post.viewCount,
            replyCount: post._count.replies,
            likeCount: post._count.likes,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        };

        return NextResponse.json({
            success: true,
            post: formattedPost
        });

    } catch (error) {
        console.error('Create forum post API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create forum post' },
            { status: 500 }
        );
    }
}