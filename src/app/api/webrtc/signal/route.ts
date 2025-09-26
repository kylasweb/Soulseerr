import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis
const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
});

export async function POST(request: NextRequest) {
    try {
        const { type, data, from, to, sessionId } = await request.json();

        if (!type || !data || !from || !to || !sessionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const signalKey = `webrtc:${sessionId}:${type}`;
        const signalData = {
            type,
            data,
            from,
            to,
            sessionId,
            timestamp: Date.now()
        };

        // Store signaling data in Redis with expiration
        await redis.setex(signalKey, 300, JSON.stringify(signalData)); // 5 minutes

        // Publish to real-time subscribers
        await redis.publish(`webrtc:${sessionId}`, JSON.stringify({
            type: 'webrtc_signal',
            data: signalData
        }));

        return NextResponse.json({
            success: true,
            signal: signalData
        });
    } catch (error) {
        console.error('Error handling WebRTC signal:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const type = searchParams.get('type');

        if (!sessionId || !type) {
            return NextResponse.json({ error: 'Session ID and type required' }, { status: 400 });
        }

        const signalKey = `webrtc:${sessionId}:${type}`;
        const signalData = await redis.get(signalKey);

        if (!signalData) {
            return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
        }

        return NextResponse.json({
            signal: JSON.parse(signalData as string)
        });
    } catch (error) {
        console.error('Error fetching WebRTC signal:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}