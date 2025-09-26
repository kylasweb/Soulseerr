'use client';

interface WebRTCConfig {
  sessionId: string;
  userId: string;
  role: 'CLIENT' | 'READER';
}

interface WebRTCState {
  isConnected: boolean;
  isCallActive: boolean;
  isCallConnecting: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  error: string | null;
}

import { useState, useEffect, useRef, useCallback } from 'react';

interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to: string;
  sessionId: string;
}

export function useWebRTC(sessionId: string, userId: string, peerId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize WebRTC peer connection
  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice-candidate',
          data: event.candidate,
          from: userId,
          to: peerId,
          sessionId,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      setIsConnected(pc.connectionState === 'connected');
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setError('Connection lost');
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [sessionId, userId, peerId]);

  // Send signaling data via API
  const sendSignal = async (signal: WebRTCSignal) => {
    try {
      await fetch('/api/webrtc/signal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signal),
      });
    } catch (err) {
      console.error('Error sending signal:', err);
      setError('Failed to send signaling data');
    }
  };

  // Start call
  const startCall = useCallback(async () => {
    try {
      setError(null);
      const pc = initializePeerConnection();

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer
      await sendSignal({
        type: 'offer',
        data: offer,
        from: userId,
        to: peerId,
        sessionId,
      });

      setIsInCall(true);
    } catch (err) {
      setError('Failed to start call');
      console.error('Error starting call:', err);
    }
  }, [initializePeerConnection, sendSignal, userId, peerId, sessionId]);

  // Answer call
  const answerCall = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      setError(null);
      const pc = initializePeerConnection();

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Set remote description
      await pc.setRemoteDescription(offer);

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer
      await sendSignal({
        type: 'answer',
        data: answer,
        from: userId,
        to: peerId,
        sessionId,
      });

      setIsInCall(true);
    } catch (err) {
      setError('Failed to answer call');
      console.error('Error answering call:', err);
    }
  }, [initializePeerConnection, sendSignal, userId, peerId, sessionId]);

  // End call
  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setIsInCall(false);
    setIsConnected(false);
    setRemoteStream(null);
  }, [localStream]);

  // Set up SSE for receiving signals
  useEffect(() => {
    if (!sessionId) return;

    const eventSource = new EventSource('/api/realtime');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'webrtc_signal' &&
          data.data.sessionId === sessionId &&
          data.data.to === userId) {

          const pc = peerConnectionRef.current;
          if (!pc) return;

          const { type, data: signalData } = data.data;

          if (type === 'offer') {
            answerCall(signalData);
          } else if (type === 'answer') {
            pc.setRemoteDescription(signalData);
          } else if (type === 'ice-candidate') {
            pc.addIceCandidate(signalData);
          }
        }
      } catch (err) {
        console.error('Error handling WebRTC signal:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId, userId, answerCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    isConnected,
    isInCall,
    remoteStream,
    localStream,
    error,
    startCall,
    answerCall,
    endCall,
    localVideoRef,
    remoteVideoRef,
  };
}