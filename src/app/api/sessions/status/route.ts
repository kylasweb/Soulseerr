import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { db } from '@/lib/db';

// Initialize Upstash Redis
const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
});

// POST - Update session status
export async function POST(request: NextRequest) {
    try {
        const { sessionId, status, userId, metadata } = await request.json();

        if (!sessionId || !status) {
            return NextResponse.json({ error: 'Session ID and status required' }, { status: 400 });
        }

        const timestamp = Date.now();
        const sessionKey = `session:${sessionId}`;

        // Update session status in Redis
        const sessionData = {
            sessionId,
            status,
            userId,
            metadata,
            updatedAt: timestamp,
            lastActivity: timestamp
        };

        await redis.set(sessionKey, JSON.stringify(sessionData));

        // Set expiration (24 hours)
        await redis.expire(sessionKey, 86400);

        // Update online status if user provided
        if (userId) {
            await redis.setex(`user:${userId}:online`, 300, JSON.stringify({
                sessionId,
                lastSeen: timestamp,
                status: 'online'
            }));
        }

        // Publish real-time update
        await redis.publish('sessions:updates', JSON.stringify({
            type: 'session_update',
            data: sessionData
        }));

        // Update database asynchronously
        try {
            await db.session.update({
                where: { id: sessionId },
                data: {
                    status,
                    updatedAt: new Date(timestamp)
                }
            });
        } catch (dbError) {
            console.error('Database update error (non-blocking):', dbError);
        }

        return NextResponse.json({
            success: true,
            session: sessionData
        });
    } catch (error) {
        console.error('Error updating session status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET - Get session status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const sessionKey = `session:${sessionId}`;
        const sessionData = await redis.get(sessionKey);

        if (!sessionData) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({
            session: JSON.parse(sessionData)
        });
    } catch (error) {
        console.error('Error fetching session status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}