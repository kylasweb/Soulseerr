import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only create socket connection on client side
        if (typeof window === 'undefined') return;

        if (!socket) {
            socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
                path: '/api/socket',
                addTrailingSlash: false
            });
        }

        const onConnect = () => {
            setIsConnected(true);
            console.log('Socket connected');
        };

        const onDisconnect = () => {
            setIsConnected(false);
            console.log('Socket disconnected');
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            if (socket) {
                socket.off('connect', onConnect);
                socket.off('disconnect', onDisconnect);
            }
        };
    }, []);

    return { socket, isConnected };
}

export { socket };