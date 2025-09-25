'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebRTCConfig {
  sessionId: string;
  userId: string;
  role: 'CLIENT' | 'READER';
  onCallStarted?: () => void;
  onCallEnded?: (reason: string) => void;
  onParticipantJoined?: (participant: { userId: string; role: string }) => void;
  onError?: (error: string) => void;
}

interface WebRTCState {
  isConnected: boolean;
  isCallActive: boolean;
  isCallConnecting: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  error: string | null;
}

export const useWebRTC = (config: WebRTCConfig) => {
  const {
    sessionId,
    userId,
    role,
    onCallStarted,
    onCallEnded,
    onParticipantJoined,
    onError,
  } = config;

  const [state, setState] = useState<WebRTCState>({
    isConnected: false,
    isCallActive: false,
    isCallConnecting: false,
    localStream: null,
    remoteStream: null,
    error: null,
  });

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setState(prev => ({ ...prev, isConnected: true }));
      
      // Join the session
      socket.emit('join-session', {
        sessionId,
        userId,
        role,
      });
    });

    socket.on('disconnect', () => {
      setState(prev => ({ ...prev, isConnected: false }));
    });

    // WebRTC event handlers
    socket.on('session-error', (data: { message: string }) => {
      setState(prev => ({ ...prev, error: data.message }));
      onError?.(data.message);
    });

    socket.on('participant-joined', (data: { userId: string; role: string }) => {
      onParticipantJoined?.(data);
    });

    socket.on('call-started', (data: { sessionId: string; status: string }) => {
      setState(prev => ({ 
        ...prev, 
        isCallConnecting: data.status === 'connecting',
        isCallActive: data.status === 'active',
      }));
      onCallStarted?.();
    });

    socket.on('call-ended', (data: { sessionId: string; reason: string; duration: number }) => {
      setState(prev => ({ 
        ...prev, 
        isCallActive: false,
        isCallConnecting: false,
        localStream: null,
        remoteStream: null,
      }));
      
      // Clean up peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      
      onCallEnded?.(data.reason);
    });

    // WebRTC signaling handlers
    socket.on('webrtc-signal', async (data: { 
      from: string; 
      type: string; 
      signalData: any; 
      sessionId: string; 
    }) => {
      if (!peerConnectionRef.current) {
        await createPeerConnection();
      }

      const { type, signalData } = data;
      
      try {
        if (type === 'offer') {
          await peerConnectionRef.current!.setRemoteDescription(
            new RTCSessionDescription(signalData)
          );
          const answer = await peerConnectionRef.current!.createAnswer();
          await peerConnectionRef.current!.setLocalDescription(answer);
          
          socket.emit('webrtc-signal', {
            sessionId,
            from: userId,
            to: data.from,
            type: 'answer',
            signalData: answer,
          });
        } else if (type === 'answer') {
          await peerConnectionRef.current!.setRemoteDescription(
            new RTCSessionDescription(signalData)
          );
        }
      } catch (error) {
        console.error('Error handling WebRTC signal:', error);
        setState(prev => ({ ...prev, error: 'Failed to handle WebRTC signal' }));
      }
    });

    socket.on('ice-candidate', async (data: { candidate: any; from: string }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    return () => {
      socket.disconnect();
      cleanup();
    };
  }, [sessionId, userId, role, onCallStarted, onCallEnded, onParticipantJoined, onError]);

  // Create WebRTC peer connection
  const createPeerConnection = async (): Promise<RTCPeerConnection> => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          sessionId,
          candidate: event.candidate,
          to: 'all', // Will be filtered by server
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      setState(prev => ({ ...prev, remoteStream: event.streams[0] }));
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log('Connection state:', state);
      
      if (state === 'connected') {
        setState(prev => ({ ...prev, isCallActive: true, isCallConnecting: false }));
      } else if (state === 'disconnected' || state === 'failed') {
        setState(prev => ({ 
          ...prev, 
          isCallActive: false, 
          isCallConnecting: false,
          error: 'Connection lost',
        }));
      }
    };

    return peerConnection;
  };

  // Start a call
  const startCall = async () => {
    try {
      setState(prev => ({ ...prev, isCallConnecting: true, error: null }));
      
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      
      setState(prev => ({ ...prev, localStream: stream }));
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = await createPeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      if (socketRef.current) {
        socketRef.current.emit('webrtc-signal', {
          sessionId,
          from: userId,
          to: 'all',
          type: 'offer',
          signalData: offer,
        });
        
        socketRef.current.emit('start-call', { sessionId });
      }
      
    } catch (error) {
      console.error('Error starting call:', error);
      setState(prev => ({ 
        ...prev, 
        isCallConnecting: false, 
        error: 'Failed to start call. Please check camera/microphone permissions.',
      }));
    }
  };

  // End a call
  const endCall = (reason?: string) => {
    if (socketRef.current) {
      socketRef.current.emit('end-call', { 
        sessionId, 
        reason: reason || 'Call ended by user',
      });
    }
    cleanup();
  };

  // Clean up resources
  const cleanup = () => {
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setState(prev => ({ 
      ...prev, 
      isCallActive: false,
      isCallConnecting: false,
      localStream: null,
      remoteStream: null,
    }));
  };

  // Toggle audio
  const toggleAudio = () => {
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  return {
    ...state,
    localVideoRef,
    remoteVideoRef,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };
};