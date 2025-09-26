import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { db } from '@/lib/db';

// Initialize Upstash Redis
const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
});

// POST - Send notification to user
export async function POST(request: NextRequest) {
    try {
        const { userId, type, title, message, metadata } = await request.json();

        if (!userId || !type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const notificationId = crypto.randomUUID();
        const timestamp = Date.now();

        const notification = {
            id: notificationId,
            userId,
            type,
            title,
            message,
            metadata,
            timestamp,
            read: false
        };

        // Store in user's notification queue
        await redis.lpush(`notifications:${userId}`, JSON.stringify(notification));

        // Keep only last 100 notifications per user
        await redis.ltrim(`notifications:${userId}`, 0, 99);

        // Publish real-time notification
        await redis.publish(`user:${userId}:notifications`, JSON.stringify({
            type: 'new_notification',
            data: notification
        }));

        // Store in database for persistence
        try {
            await db.notification.create({
                data: {
                    id: notificationId,
                    userId,
                    type,
                    title,
                    message,
                    metadata: metadata || null,
                    isRead: false
                }
            });
        } catch (dbError) {
            console.error('Database error (non-blocking):', dbError);
        }

        return NextResponse.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET - Get user's notifications
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Get notifications from Redis
        let notifications = await redis.lrange(`notifications:${userId}`, 0, limit - 1);

        // Parse notifications
        let parsedNotifications = notifications.map(n => JSON.parse(n));

        // Filter unread only if requested
        if (unreadOnly) {
            parsedNotifications = parsedNotifications.filter(n => !n.read);
        }

        // Reverse to get chronological order
        parsedNotifications.reverse();

        return NextResponse.json({
            notifications: parsedNotifications,
            userId
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Mark notification as read
export async function PATCH(request: NextRequest) {
    try {
        const { notificationId, userId } = await request.json();

        if (!notificationId || !userId) {
            return NextResponse.json({ error: 'Notification ID and User ID required' }, { status: 400 });
        }

        // Get all notifications for user
        const notifications = await redis.lrange(`notifications:${userId}`, 0, -1);
        const parsedNotifications = notifications.map(n => JSON.parse(n));

        // Find and update the notification
        const updatedNotifications = parsedNotifications.map(notification => {
            if (notification.id === notificationId) {
                return { ...notification, read: true };
            }
            return notification;
        });

        // Clear and repopulate the list
        await redis.del(`notifications:${userId}`);
        for (const notification of updatedNotifications.reverse()) {
            await redis.lpush(`notifications:${userId}`, JSON.stringify(notification));
        }

        // Update database
        try {
            await db.notification.update({
                where: { id: notificationId },
                data: { isRead: true }
            });
        } catch (dbError) {
            console.error('Database update error (non-blocking):', dbError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}