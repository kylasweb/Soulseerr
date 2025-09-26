import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis
const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
});

export async function GET(request: NextRequest) {
    try {
        // Create SSE stream
        const stream = new ReadableStream({
            start(controller) {
                // Send initial connection confirmation
                controller.enqueue(`data: ${JSON.stringify({
                    type: 'connected',
                    timestamp: Date.now()
                })}\n\n`);

                // Set up Redis pub/sub subscriptions
                const channels = ['chat:*', 'sessions:*', 'notifications:*', 'webrtc:*'];

                // Note: In production, you'd want to manage subscriptions more efficiently
                // This is a simplified implementation for demonstration

                // Keep connection alive
                const keepAlive = setInterval(() => {
                    controller.enqueue(`data: ${JSON.stringify({
                        type: 'ping',
                        timestamp: Date.now()
                    })}\n\n`);
                }, 30000); // 30 seconds

                // Handle client disconnect
                request.signal.addEventListener('abort', () => {
                    clearInterval(keepAlive);
                    controller.close();
                });
            },
            cancel() {
                console.log('SSE connection closed');
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control',
            },
        });
    } catch (error) {
        console.error('SSE Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Handle CORS for preflight requests
export async function OPTIONS() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}