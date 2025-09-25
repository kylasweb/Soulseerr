import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const categories = await db.forumCategory.findMany({
        include: {
            threads: true,
            posts: true
        }
    });
    return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const category = await db.forumCategory.create({
        data: {
            name: body.name,
            slug: body.slug,
            description: body.description
        }
    });
    return NextResponse.json({ category });
}
