import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, getCurrentUserRole } from '@/lib/auth-server';

export async function PATCH(
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
        const { status } = await request.json();

        // Validate status
        if (!['draft', 'published', 'archived'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

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

        // Update content item status
        const updatedItem = await db.contentItem.update({
            where: { id: itemId },
            data: {
                status,
                publishedAt: status === 'published' && !existingItem.publishedAt ? new Date() : existingItem.publishedAt,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            message: `Content item ${status === 'published' ? 'published' : status === 'archived' ? 'archived' : 'moved to draft'} successfully`,
            item: {
                id: updatedItem.id,
                title: updatedItem.title,
                status: updatedItem.status
            }
        });

    } catch (error) {
        console.error('Update content item status error:', error);
        return NextResponse.json(
            { error: 'Failed to update content item status' },
            { status: 500 }
        );
    }
}