import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const threads = await prisma.forumThread.findMany({
        where: categoryId ? { categoryId } : {},
        include: { author: true, posts: true, category: true }
    });
    return NextResponse.json({ threads });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const thread = await prisma.forumThread.create({
        data: {
            title: body.title,
            slug: body.slug,
            categoryId: body.categoryId,
            authorId: body.authorId
        }
    });
    return NextResponse.json({ thread });
}
