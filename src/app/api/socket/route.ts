import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

// WebSocket connections store (in production, use Redis or similar)
const activeConnections = new Map<string, WebSocket>();
const userConnections = new Map<string, WebSocket>();

export async function GET(request: NextRequest) {
    // Handle WebSocket upgrade
    const upgradeHeader = request.headers.get('upgrade');

    if (upgradeHeader !== 'websocket') {
        return new Response('Expected websocket', { status: 400 });
    }

    try {
        // WebSocket functionality disabled - using Socket.IO instead
        // WebSocketPair is not available in Node.js environment
        return new Response('WebSocket functionality disabled - use Socket.IO', { status: 501 });

        /*
        // Create WebSocket pair - DISABLED: WebSocketPair not available in Node.js
        // Using Socket.IO instead for WebSocket functionality
        // const { webSocket, response } = new WebSocketPair();

        // Handle incoming messages
        webSocket.addEventListener('message', async (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'authenticate':
                        await handleAuthentication(webSocket, data.payload, connectionId);
                        break;
                    case 'chat-message':
                        await handleChatMessage(webSocket, data.payload);
                        break;
                    case 'typing-indicator':
                        await handleTypingIndicator(webSocket, data.payload);
                        break;
                    case 'webrtc-signal':
                        await handleWebRTCSignal(webSocket, data.payload);
                        break;
                    default:
                        webSocket.send(JSON.stringify({
                            type: 'error',
                            payload: { message: 'Unknown message type' }
                        }));
                }
            } catch (error) {
                console.error('WebSocket message error:', error);
                webSocket.send(JSON.stringify({
                    type: 'error',
                    payload: { message: 'Invalid message format' }
                }));
            }
        });

        // Handle disconnection
        webSocket.addEventListener('close', () => {
            activeConnections.delete(connectionId);
            // Clean up user connections
            for (const [userId, ws] of userConnections.entries()) {
                if (ws === webSocket) {
                    userConnections.delete(userId);
                    break;
                }
            }
        });

        return response;
        */
    } catch (error) {
        console.error('WebSocket setup error:', error);
        return new Response('WebSocket setup failed', { status: 500 });
    }
}

async function handleAuthentication(webSocket: WebSocket, payload: any, connectionId: string) {
    try {
        const { userId, role } = payload;

        // Verify user exists
        const user = await db.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            webSocket.send(JSON.stringify({
                type: 'auth-error',
                payload: { message: 'User not found' }
            }));
            return;
        }

        // Store user connection
        userConnections.set(userId, webSocket);

        webSocket.send(JSON.stringify({
            type: 'authenticated',
            payload: { userId, role, connectionId }
        }));

    } catch (error) {
        console.error('Authentication error:', error);
        webSocket.send(JSON.stringify({
            type: 'auth-error',
            payload: { message: 'Authentication failed' }
        }));
    }
}

async function handleChatMessage(webSocket: WebSocket, payload: any) {
    try {
        const { sessionId, senderId, receiverId, content, type } = payload;

        // Save message to database
        const message = await db.chatMessage.create({
            data: {
                sessionId,
                senderId,
                content,
                messageType: type || 'TEXT',
            },
        });

        // Send to receiver if online
        const receiverSocket = userConnections.get(receiverId);
        if (receiverSocket) {
            receiverSocket.send(JSON.stringify({
                type: 'chat-message',
                payload: message
            }));
        }

        // Confirm to sender
        webSocket.send(JSON.stringify({
            type: 'message-sent',
            payload: message
        }));

    } catch (error) {
        console.error('Chat message error:', error);
        webSocket.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Failed to send message' }
        }));
    }
}

async function handleTypingIndicator(webSocket: WebSocket, payload: any) {
    try {
        const { sessionId, userId, isTyping, receiverId } = payload;

        // Send typing indicator to receiver
        const receiverSocket = userConnections.get(receiverId);
        if (receiverSocket) {
            receiverSocket.send(JSON.stringify({
                type: 'typing-indicator',
                payload: { sessionId, userId, isTyping }
            }));
        }

    } catch (error) {
        console.error('Typing indicator error:', error);
    }
}

async function handleWebRTCSignal(webSocket: WebSocket, payload: any) {
    try {
        const { sessionId, signalType, from, to, data } = payload;

        // Verify session and user access
        const session = await db.session.findUnique({
            where: { id: sessionId },
            include: { client: true, reader: true }
        });

        if (!session) {
            webSocket.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Session not found' }
            }));
            return;
        }

        // Send signal to target user
        const targetSocket = userConnections.get(to);
        if (targetSocket) {
            targetSocket.send(JSON.stringify({
                type: 'webrtc-signal',
                payload: { sessionId, signalType, from, to, data }
            }));
        }

    } catch (error) {
        console.error('WebRTC signal error:', error);
        webSocket.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Failed to send WebRTC signal' }
        }));
    }
}