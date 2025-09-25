'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Date;
  read: boolean;
}

interface UseChatOptions {
  sessionId: string;
  userId: string;
  receiverId: string;
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (userId: string, isTyping: boolean) => void;
  onMessagesRead?: (messageIds: string[]) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  loadMoreMessages: () => Promise<void>;
}

export const useChat = (options: UseChatOptions): UseChatReturn => {
  const {
    sessionId,
    userId,
    receiverId,
    onMessage,
    onTyping,
    onMessagesRead,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      
      // Authenticate with the server
      socket.emit('authenticate', {
        userId,
        role: 'USER', // This would come from auth context
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('authenticated', (data: { success: boolean }) => {
      if (data.success) {
        // Load initial chat history
        loadChatHistory();
      }
    });

    socket.on('auth-error', (data: { message: string }) => {
      setError(data.message);
    });

    // Chat event handlers
    socket.on('new-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      onMessage?.(message);
      
      // Mark message as read if it's from the other user
      if (message.senderId !== userId) {
        markAsRead([message.id]);
      }
    });

    socket.on('user-typing', (data: { userId: string; sessionId: string; isTyping: boolean }) => {
      if (data.userId === receiverId && data.sessionId === sessionId) {
        setIsTyping(data.isTyping);
        onTyping?.(data.userId, data.isTyping);
      }
    });

    socket.on('messages-read', (data: { messageIds: string[]; sessionId: string }) => {
      if (data.sessionId === sessionId) {
        setMessages(prev => 
          prev.map(msg => 
            data.messageIds.includes(msg.id) 
              ? { ...msg, read: true }
              : msg
          )
        );
        onMessagesRead?.(data.messageIds);
      }
    });

    socket.on('chat-history', (data: { messages: ChatMessage[]; hasMore: boolean }) => {
      setMessages(prev => [...data.messages.reverse(), ...prev]);
      setHasMore(data.hasMore);
      setLoading(false);
    });

    socket.on('chat-history-error', (data: { message: string }) => {
      setError(data.message);
      setLoading(false);
    });

    socket.on('message-error', (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [sessionId, userId, receiverId, onMessage, onTyping, onMessagesRead]);

  // Load chat history
  const loadChatHistory = async (loadMore = false) => {
    if (!hasMore && loadMore) return;
    
    setLoading(true);
    setError(null);
    
    const currentOffset = loadMore ? offset : 0;
    
    if (socketRef.current) {
      socketRef.current.emit('get-chat-history', {
        sessionId,
        limit: 50,
        offset: currentOffset,
      });
    }
  };

  // Send message
  const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to chat server');
      return;
    }

    try {
      socketRef.current.emit('send-message', {
        sessionId,
        receiverId,
        content,
        type,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  // Mark messages as read
  const markAsRead = async (messageIds: string[]) => {
    if (!socketRef.current || !isConnected) return;

    try {
      socketRef.current.emit('mark-read', { messageIds });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Set typing status
  const setTyping = (isTyping: boolean) => {
    if (!socketRef.current || !isConnected) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status
    socketRef.current.emit('typing', {
      sessionId,
      isTyping,
    });

    // If typing is true, set a timeout to automatically stop typing
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', {
          sessionId,
          isTyping: false,
        });
      }, 3000); // Stop typing after 3 seconds of inactivity
    }
  };

  // Load more messages
  const loadMoreMessages = async () => {
    if (loading || !hasMore) return;
    
    const newOffset = offset + 50;
    setOffset(newOffset);
    await loadChatHistory(true);
  };

  return {
    messages,
    isConnected,
    isTyping,
    loading,
    error,
    sendMessage,
    markAsRead,
    setTyping,
    loadMoreMessages,
  };
};