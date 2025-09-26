import { useState } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

// Placeholder hook for socket functionality - disabled for Vercel deployment
export function useSocket() {
    const [isConnected] = useState(false);

    // Socket functionality disabled for Vercel deployment
    // Real-time features will be re-enabled when WebSocket API is available

    return {
        socket: null as Socket | null,
        isConnected
    };
}

export const socket: Socket | null = null;