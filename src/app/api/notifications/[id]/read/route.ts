import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: notificationId } = await params;

        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
        }

        // Update notification as read
        const notification = await db.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            notification: {
                id: notification.id,
                isRead: notification.isRead,
                readAt: notification.readAt
            }
        });

    } catch (error) {
        console.error('Mark notification as read error:', error);
        return NextResponse.json({
            error: 'Failed to mark notification as read'
        }, { status: 500 });
    }
}