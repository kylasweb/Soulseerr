'use client';

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
}

interface UseChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  loadMoreMessages: () => Promise<void>;
}

import { useState, useEffect, useCallback } from 'react';

interface UseChatOptions {
  sessionId: string;
  userId: string;
  receiverId: string;
}

export function useChat({ sessionId, userId, receiverId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Send message
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          senderId: userId,
          receiverId,
          content,
          type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Message will be received via SSE and added to state
        return data.message;
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      throw err;
    }
  }, [sessionId, userId, receiverId]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    // Implementation for marking messages as read
    // This would typically call an API endpoint
    console.log('Marking messages as read:', messageIds);
  }, []);

  // Set typing indicator
  const setTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);

  // Load more messages (for pagination)
  const loadMoreMessages = useCallback(async () => {
    // Implementation for loading more messages
    console.log('Loading more messages...');
  }, []);

  // Set up SSE connection for real-time updates
  useEffect(() => {
    if (!sessionId) return;

    // Load initial messages
    loadMessages();

    // Set up SSE connection
    const eventSource = new EventSource('/api/realtime');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'connected') {
          setIsConnected(true);
          setError(null);
        } else if (data.type === 'new_message' && data.data.sessionId === sessionId) {
          // Add new message to state
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === data.data.id)) {
              return prev;
            }
            return [...prev, data.data];
          });
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError('Connection lost');
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [sessionId, loadMessages]);

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
}