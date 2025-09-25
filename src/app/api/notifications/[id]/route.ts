import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: notificationId } = await params;

        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
        }

        // Delete notification
        await db.notification.delete({
            where: { id: notificationId }
        });

        return NextResponse.json({
            success: true,
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json({
            error: 'Failed to delete notification'
        }, { status: 500 });
    }
}