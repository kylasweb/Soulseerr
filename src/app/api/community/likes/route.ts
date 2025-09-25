import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const like = await db.forumPostLike.create({
        data: {
            postId: body.postId,
            userId: body.userId
        }
    });
    return NextResponse.json({ like });
}

export async function DELETE(request: NextRequest) {
    const body = await request.json();
    await db.forumPostLike.delete({
        where: {
            userId_postId: {
                userId: body.userId,
                postId: body.postId
            }
        }
    });
    return NextResponse.json({ success: true });
}
