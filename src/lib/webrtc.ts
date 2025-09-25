import { Server } from 'socket.io';
import { db } from './db';

interface WebRTCSession {
  id: string;
  clientId: string;
  readerId: string;
  sessionId: string;
  status: 'pending' | 'connecting' | 'active' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
}

interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  sessionId: string;
  from: string;
  to: string;
  data: any;
}

const activeSessions = new Map<string, WebRTCSession>();

export const setupWebRTC = (io: Server) => {
  // WebRTC signaling handlers
  io.on('connection', (socket) => {
    console.log('WebRTC client connected:', socket.id);

    // Join a session room
    socket.on('join-session', async (data: { sessionId: string; userId: string; role: string }) => {
      try {
        const { sessionId, userId, role } = data;

        // Verify session exists and user has access
        const session = await db.session.findUnique({
          where: { id: sessionId },
          include: {
            client: true,
            reader: true,
          }
        });

        if (!session) {
          socket.emit('session-error', { message: 'Session not found' });
          return;
        }

        // Verify user is part of this session
        const isParticipant =
          (role === 'CLIENT' && session.clientId === userId) ||
          (role === 'READER' && session.readerId === userId);

        if (!isParticipant) {
          socket.emit('session-error', { message: 'Unauthorized access to session' });
          return;
        }

        // Join socket room for this session
        socket.join(`session-${sessionId}`);

        // Store user info in socket
        socket.data.userId = userId;
        socket.data.role = role;
        socket.data.sessionId = sessionId;

        console.log(`${role} ${userId} joined session ${sessionId}`);

        // Notify other participant
        socket.to(`session-${sessionId}`).emit('participant-joined', {
          userId,
          role,
          sessionId,
        });

        // Create or update WebRTC session
        if (!activeSessions.has(sessionId)) {
          const webRTCSession: WebRTCSession = {
            id: sessionId,
            clientId: session.clientId,
            readerId: session.readerId,
            sessionId,
            status: 'pending',
          };
          activeSessions.set(sessionId, webRTCSession);
        }

        // Send session status to client
        const webRTCSession = activeSessions.get(sessionId);
        socket.emit('session-status', webRTCSession);

      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('session-error', { message: 'Failed to join session' });
      }
    });

    // Handle WebRTC signaling
    socket.on('webrtc-signal', (data: WebRTCSignal) => {
      const { sessionId, from, to, type, data: signalData } = data;

      // Forward signal to the target user
      socket.to(`session-${sessionId}`).emit('webrtc-signal', {
        from,
        type,
        data: signalData,
        sessionId,
      });
    });

    // Handle ICE candidates
    socket.on('ice-candidate', (data: { sessionId: string; candidate: any; to: string }) => {
      const { sessionId, candidate, to } = data;

      socket.to(`session-${sessionId}`).emit('ice-candidate', {
        candidate,
        from: socket.data.userId,
      });
    });

    // Handle call start
    socket.on('start-call', async (data: { sessionId: string }) => {
      const { sessionId } = data;
      const webRTCSession = activeSessions.get(sessionId);

      if (webRTCSession) {
        webRTCSession.status = 'connecting';
        webRTCSession.startedAt = new Date();
        activeSessions.set(sessionId, webRTCSession);

        // Notify both participants
        io.to(`session-${sessionId}`).emit('call-started', {
          sessionId,
          status: 'connecting',
        });

        // Update session in database
        await db.session.update({
          where: { id: sessionId },
          data: {
            status: 'IN_PROGRESS',
            startedAt: new Date(),
          }
        });
      }
    });

    // Handle call end
    socket.on('end-call', async (data: { sessionId: string; reason?: string }) => {
      const { sessionId, reason } = data;
      const webRTCSession = activeSessions.get(sessionId);

      if (webRTCSession) {
        webRTCSession.status = 'ended';
        webRTCSession.endedAt = new Date();
        activeSessions.set(sessionId, webRTCSession);

        // Notify both participants
        io.to(`session-${sessionId}`).emit('call-ended', {
          sessionId,
          reason: reason || 'Call ended',
          duration: webRTCSession.startedAt ?
            Date.now() - webRTCSession.startedAt.getTime() : 0,
        });

        // Update session in database
        await db.session.update({
          where: { id: sessionId },
          data: {
            status: 'COMPLETED',
            endedAt: new Date(),
          }
        });

        // Clean up
        activeSessions.delete(sessionId);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('WebRTC client disconnected:', socket.id);

      const sessionId = socket.data.sessionId;
      if (sessionId) {
        const webRTCSession = activeSessions.get(sessionId);
        if (webRTCSession && webRTCSession.status === 'active') {
          // End call if user disconnects during active session
          io.to(`session-${sessionId}`).emit('call-ended', {
            sessionId,
            reason: 'Participant disconnected',
          });

          // Update session in database
          db.session.update({
            where: { id: sessionId },
            data: {
              status: 'DISCONNECTED',
              endedAt: new Date(),
            }
          }).catch(console.error);

          activeSessions.delete(sessionId);
        }
      }
    });
  });
};

// Helper functions
export const getWebRTCSession = (sessionId: string): WebRTCSession | undefined => {
  return activeSessions.get(sessionId);
};

export const getActiveSessions = (): WebRTCSession[] => {
  return Array.from(activeSessions.values());
};

export const endAllSessions = (): void => {
  activeSessions.clear();
};