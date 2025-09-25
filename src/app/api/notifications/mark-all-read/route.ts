import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Mark all unread notifications as read for the user
        const result = await db.notification.updateMany({
            where: {
                userId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            updatedCount: result.count,
            message: `Marked ${result.count} notifications as read`
        });

    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        return NextResponse.json({
            error: 'Failed to mark all notifications as read'
        }, { status: 500 });
    }
}