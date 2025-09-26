import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { db } from '@/lib/db';

// Initialize Upstash Redis
const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
});

// GET - Retrieve chat messages for a session
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // Get messages from Redis (most recent first)
        const messages = await redis.lrange(`chat:${sessionId}`, 0, limit - 1);

        // Parse and reverse to get chronological order
        const parsedMessages = messages
            .map(msg => JSON.parse(msg))
            .reverse();

        return NextResponse.json({
            messages: parsedMessages,
            sessionId
        });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Send a new chat message
export async function POST(request: NextRequest) {
    try {
        const { sessionId, senderId, receiverId, content, type = 'text' } = await request.json();

        if (!sessionId || !senderId || !receiverId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const messageId = crypto.randomUUID();
        const timestamp = Date.now();

        const message = {
            id: messageId,
            sessionId,
            senderId,
            receiverId,
            content,
            type,
            timestamp,
            read: false
        };

        // Store in Redis (for real-time access)
        await redis.lpush(`chat:${sessionId}`, JSON.stringify(message));

        // Keep only last 1000 messages per session to prevent memory issues
        await redis.ltrim(`chat:${sessionId}`, 0, 999);

        // Publish to real-time subscribers
        await redis.publish(`chat:${sessionId}`, JSON.stringify({
            type: 'new_message',
            data: message
        }));

        // Also store in database for persistence (async)
        try {
            await db.chatMessage.create({
                data: {
                    id: messageId,
                    sessionId,
                    senderId,
                    receiverId,
                    content,
                    type,
                    timestamp: new Date(timestamp),
                    read: false
                }
            });
        } catch (dbError) {
            console.error('Database error (non-blocking):', dbError);
            // Continue - Redis storage is primary for real-time
        }

        return NextResponse.json({
            success: true,
            message: message
        });
    } catch (error) {
        console.error('Error sending chat message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}