import { Server } from 'socket.io';
import { db } from './db';

// Export the io instance for use in other modules
export let io: Server;

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

interface TypingIndicator {
  sessionId: string;
  userId: string;
  isTyping: boolean;
}

const activeUsers = new Map<string, string>(); // socketId -> userId
const userSockets = new Map<string, string>(); // userId -> socketId
const typingUsers = new Map<string, Set<string>>(); // sessionId -> Set of userIds typing

export const setupSocket = (ioInstance: Server) => {
  io = ioInstance; // Store the io instance for export
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // User authentication and session setup
    socket.on('authenticate', async (data: { userId: string; role: string }) => {
      try {
        const { userId, role } = data;

        // Verify user exists
        const user = await db.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          socket.emit('auth-error', { message: 'User not found' });
          return;
        }

        // Store user mapping
        activeUsers.set(socket.id, userId);
        userSockets.set(userId, socket.id);

        // Store user data in socket
        socket.data.userId = userId;
        socket.data.role = role;

        console.log(`User ${userId} authenticated with role ${role}`);

        // Join user to their personal room
        socket.join(`user-${userId}`);

        // Get user's active sessions and join those rooms
        const activeSessions = await db.session.findMany({
          where: {
            OR: [
              { clientId: userId },
              { readerId: userId },
            ],
            status: 'IN_PROGRESS',
          },
        });

        activeSessions.forEach(session => {
          socket.join(`session-${session.id}`);
          socket.join(`chat-${session.id}`);
        });

        socket.emit('authenticated', { success: true });

        // Notify user's contacts they're online
        broadcastUserStatus(userId, 'online');

      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('auth-error', { message: 'Authentication failed' });
      }
    });

    // Chat message handling
    socket.on('send-message', async (data: {
      sessionId: string;
      receiverId: string;
      content: string;
      type: 'text' | 'image' | 'file';
    }) => {
      try {
        const { sessionId, receiverId, content, type } = data;
        const senderId = socket.data.userId;

        if (!senderId) {
          socket.emit('message-error', { message: 'Not authenticated' });
          return;
        }

        // Verify session exists and user is part of it
        const session = await db.session.findUnique({
          where: { id: sessionId },
        });

        if (!session || (session.clientId !== senderId && session.readerId !== senderId)) {
          socket.emit('message-error', { message: 'Session not found or access denied' });
          return;
        }

        // Verify receiver is part of the session
        if (session.clientId !== receiverId && session.readerId !== receiverId) {
          socket.emit('message-error', { message: 'Receiver not part of session' });
          return;
        }

        // Create message in database
        const message = await db.chatMessage.create({
          data: {
            content,
            sessionId,
            senderId,
          },
        });

        // Broadcast message to both users in the session
        const messageData = {
          id: message.id,
          sessionId: message.sessionId,
          senderId: message.senderId,
          content: message.content,
          messageType: message.messageType,
          createdAt: message.createdAt,
        };

        io.to(`chat-${sessionId}`).emit('new-message', messageData);

        // Send push notification to receiver if they're offline
        const receiverSocketId = userSockets.get(receiverId);
        if (!receiverSocketId) {
          // TODO: Implement push notification
          console.log(`User ${receiverId} is offline, would send push notification`);
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing', (data: { sessionId: string; isTyping: boolean }) => {
      const userId = socket.data.userId;
      const { sessionId, isTyping } = data;

      if (!userId) return;

      // Update typing status
      if (!typingUsers.has(sessionId)) {
        typingUsers.set(sessionId, new Set());
      }

      const sessionTypingUsers = typingUsers.get(sessionId)!;

      if (isTyping) {
        sessionTypingUsers.add(userId);
      } else {
        sessionTypingUsers.delete(userId);
      }

      // Broadcast typing status to other users in the session
      socket.to(`chat-${sessionId}`).emit('user-typing', {
        userId,
        sessionId,
        isTyping,
      });
    });

    // Get chat history
    socket.on('get-chat-history', async (data: { sessionId: string; limit?: number; offset?: number }) => {
      try {
        const userId = socket.data.userId;
        const { sessionId, limit = 50, offset = 0 } = data;

        if (!userId) {
          socket.emit('chat-history-error', { message: 'Not authenticated' });
          return;
        }

        // Verify user is part of the session
        const session = await db.session.findUnique({
          where: { id: sessionId },
        });

        if (!session || (session.clientId !== userId && session.readerId !== userId)) {
          socket.emit('chat-history-error', { message: 'Session not found or access denied' });
          return;
        }

        // Get chat history
        const messages = await db.chatMessage.findMany({
          where: { sessionId: sessionId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        });

        socket.emit('chat-history', {
          messages: messages.reverse(), // Return in chronological order
          hasMore: messages.length === limit,
        });

      } catch (error) {
        console.error('Error getting chat history:', error);
        socket.emit('chat-history-error', { message: 'Failed to get chat history' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      const userId = activeUsers.get(socket.id);
      if (userId) {
        // Remove from active users
        activeUsers.delete(socket.id);
        userSockets.delete(userId);

        // Remove from typing indicators
        typingUsers.forEach((users, sessionId) => {
          users.delete(userId);
          if (users.size === 0) {
            typingUsers.delete(sessionId);
          }
        });

        // Notify user's contacts they're offline
        broadcastUserStatus(userId, 'offline');
      }
    });

    // Legacy echo functionality (keep for backward compatibility)
    socket.on('message', (msg: { text: string; senderId: string }) => {
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to SoulSeer Chat!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};

// Helper function to broadcast user status
function broadcastUserStatus(userId: string, status: 'online' | 'offline') {
  // This would typically broadcast to users who have this user in their contacts
  // For now, we'll just log it
  console.log(`User ${userId} is ${status}`);
}