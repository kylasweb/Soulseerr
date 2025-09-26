import { useState } from 'react';

// Placeholder hook for socket functionality - disabled for Vercel deployment
export function useSocket() {
    const [isConnected] = useState(false);

    // Socket functionality disabled for Vercel deployment
    // Real-time features will be re-enabled when WebSocket API is available

    return {
        socket: null,
        isConnected
    };
}

export const socket = null;