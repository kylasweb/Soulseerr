import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const replies = await prisma.forumReply.findMany({
        where: postId ? { postId } : {},
        include: { author: true, post: true }
    });
    return NextResponse.json({ replies });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const reply = await prisma.forumReply.create({
        data: {
            postId: body.postId,
            authorId: body.authorId,
            content: body.content
        }
    });
    return NextResponse.json({ reply });
}
