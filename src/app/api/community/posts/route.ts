import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const posts = await db.forumPost.findMany({
        where: threadId ? { threadId } : {},
        include: { author: true, replies: true, thread: true }
    });
    return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const post = await db.forumPost.create({
        data: {
            threadId: body.threadId,
            authorId: body.authorId,
            content: body.content,
            title: body.title || 'Reply', // Default title for replies
            categoryId: body.categoryId // Required field
        }
    });
    return NextResponse.json({ post });
}
