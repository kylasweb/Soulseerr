# SoulSeer WebRTC Architecture Plan

## Overview
This document outlines the comprehensive WebRTC architecture for the SoulSeer spiritual consultation platform. The system implements a custom WebRTC solution without third-party SDKs, providing real-time communication capabilities for chat, voice, and video sessions.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client A      │    │   Signaling     │    │   Client B      │
│   (Browser)     │◄──►│    Server       │◄──►│   (Browser)     │
│                 │    │   (WebSocket)   │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   WebRTC    │ │    │ │   Session   │ │    │ │   WebRTC    │ │
│ │   Peer A    │ │    │ │   Manager   │ │    │ │   Peer B    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Media       │ │    │ │   Message   │ │    │ │ Media       │ │
│ │ Streams     │ │    │ │   Router    │ │    │ │ Streams     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Data        │ │    │ │   Recording │ │    │ │ Data        │ │
│ │ Channel     │ │    │ │   Service   │ │    │ │ Channel     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Components

### 1. Signaling Server (WebSocket-based)

#### Server Architecture (`src/lib/signaling/`)

```typescript
├── SignalingServer.ts           # Main WebSocket server
├── SessionManager.ts            # Session lifecycle management
├── MessageRouter.ts             # Message routing and handling
├── ConnectionManager.ts         # Client connection management
├── RoomManager.ts               # Room management for sessions
├── STUNServer.ts                # STUN server integration
├── TURNServer.ts               # TURN server integration
└── RecordingService.ts          # Session recording service
```

#### Signaling Protocol

```typescript
// Message Types
enum SignalingMessageType {
  // Connection Management
  JOIN_SESSION = 'join_session',
  LEAVE_SESSION = 'leave_session',
  SESSION_CREATED = 'session_created',
  SESSION_ENDED = 'session_ended',
  
  // WebRTC Signaling
  OFFER = 'offer',
  ANSWER = 'answer',
  ICE_CANDIDATE = 'ice_candidate',
  CONNECTION_STATE = 'connection_state',
  
  // Media Control
  MEDIA_REQUEST = 'media_request',
  MEDIA_RESPONSE = 'media_response',
  MUTE_AUDIO = 'mute_audio',
  MUTE_VIDEO = 'mute_video',
  SHARE_SCREEN = 'share_screen',
  
  // Session Control
  START_SESSION = 'start_session',
  END_SESSION = 'end_session',
  PAUSE_SESSION = 'pause_session',
  RESUME_SESSION = 'resume_session',
  
  // Data Channel
  CHAT_MESSAGE = 'chat_message',
  FILE_TRANSFER = 'file_transfer',
  SESSION_DATA = 'session_data',
  
  // Recording
  START_RECORDING = 'start_recording',
  STOP_RECORDING = 'stop_recording',
  RECORDING_STATUS = 'recording_status',
  
  // Quality & Stats
  QUALITY_REPORT = 'quality_report',
  CONNECTION_STATS = 'connection_stats',
  
  // Error Handling
  ERROR = 'error',
  RECONNECT = 'reconnect',
  TIMEOUT = 'timeout'
}

// Message Structure
interface SignalingMessage {
  type: SignalingMessageType;
  sessionId: string;
  senderId: string;
  receiverId?: string;
  timestamp: number;
  payload: any;
  messageId: string;
}
```

### 2. WebRTC Peer Connection Manager

#### Client-side Architecture (`src/lib/webrtc/`)

```typescript
├── WebRTCManager.ts              # Main WebRTC manager
├── PeerConnection.ts            # Individual peer connection
├── MediaManager.ts              # Media stream management
├── DataChannelManager.ts        # Data channel management
├── ConnectionMonitor.ts         # Connection quality monitoring
├── RecordingManager.ts          # Recording management
├── ICEConfiguration.ts          # ICE server configuration
└── QualityController.ts         # Quality adaptation controller
```

#### WebRTC Configuration

```typescript
// ICE Server Configuration
interface ICEConfiguration {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize: number;
  bundlePolicy: RTCBundlePolicy;
  rtcpMuxPolicy: RTCRtcpMuxPolicy;
}

// Default ICE Servers
const defaultICEServers: RTCIceServer[] = [
  {
    urls: 'stun:stun.l.google.com:19302'
  },
  {
    urls: 'stun:stun1.l.google.com:19302'
  },
  // Custom STUN/TURN servers would be added here
  {
    urls: 'turn:your-turn-server.com:3478',
    username: 'username',
    credential: 'credential'
  }
];

// Peer Connection Configuration
interface PeerConnectionConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize: number;
  sdpSemantics: 'unified-plan';
  encodedInsertableStreams: boolean;
  forceRelay: boolean;
}

// Media Constraints
interface MediaConstraints {
  audio: MediaTrackConstraints | boolean;
  video: MediaTrackConstraints | boolean;
  screen: MediaTrackConstraints | boolean;
}
```

### 3. Media Management System

#### Media Stream Handling

```typescript
// Media Types
enum MediaType {
  AUDIO = 'audio',
  VIDEO = 'video',
  SCREEN = 'screen',
  DATA = 'data'
}

// Media Stream Configuration
interface MediaStreamConfig {
  audio: {
    enabled: boolean;
    deviceId?: string;
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
    sampleRate: number;
    channelCount: number;
  };
  video: {
    enabled: boolean;
    deviceId?: string;
    width: { min: number; ideal: number; max: number };
    height: { min: number; ideal: number; max: number };
    frameRate: { min: number; ideal: number; max: number };
    facingMode: 'user' | 'environment';
  };
  screen: {
    enabled: boolean;
    width: number;
    height: number;
    frameRate: number;
  };
}

// Quality Adaptation
interface QualityAdaptation {
  targetBitrate: number;
  currentBitrate: number;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  resolution: '1080p' | '720p' | '480p' | '360p';
  frameRate: number;
}
```

### 4. Session Management

#### Session Lifecycle

```typescript
// Session States
enum SessionState {
  CREATED = 'created',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDING = 'ending',
  ENDED = 'ended',
  ERROR = 'error'
}

// Session Configuration
interface SessionConfig {
  sessionId: string;
  type: SessionType;
  participants: string[];
  maxDuration: number;
  recordingEnabled: boolean;
  quality: QualityLevel;
  features: SessionFeatures;
}

// Session Features
interface SessionFeatures {
  chat: boolean;
  screenShare: boolean;
  fileTransfer: boolean;
  recording: boolean;
  whiteboard: boolean;
  reactions: boolean;
}
```

### 5. Recording System

#### Recording Architecture

```typescript
// Recording Manager
class RecordingManager {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  
  async startRecording(stream: MediaStream): Promise<void> {
    const options = {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 2500000,
      audioBitsPerSecond: 128000
    };
    
    this.mediaRecorder = new MediaRecorder(stream, options);
    this.recordedChunks = [];
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    
    this.mediaRecorder.start();
    this.isRecording = true;
  }
  
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (this.mediaRecorder) {
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
          resolve(blob);
        };
        this.mediaRecorder.stop();
        this.isRecording = false;
      }
    });
  }
}
```

## Detailed Implementation Plan

### Phase 1: Signaling Server Implementation

#### 1.1 WebSocket Server Setup

```typescript
// src/lib/signaling/SignalingServer.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export class SignalingServer {
  private io: SocketIOServer;
  private sessionManager: SessionManager;
  private connectionManager: ConnectionManager;
  
  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST']
      }
    });
    
    this.sessionManager = new SessionManager();
    this.connectionManager = new ConnectionManager();
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }
  
  private handleConnection(socket: any): void {
    // Handle authentication
    socket.on('authenticate', (data) => {
      this.handleAuthentication(socket, data);
    });
    
    // Handle session joining
    socket.on('join_session', (data) => {
      this.handleJoinSession(socket, data);
    });
    
    // Handle WebRTC signaling
    socket.on('offer', (data) => {
      this.handleOffer(socket, data);
    });
    
    socket.on('answer', (data) => {
      this.handleAnswer(socket, data);
    });
    
    socket.on('ice_candidate', (data) => {
      this.handleICECandidate(socket, data);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }
}
```

#### 1.2 Session Management

```typescript
// src/lib/signaling/SessionManager.ts
export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  
  createSession(participants: string[], config: SessionConfig): string {
    const sessionId = this.generateSessionId();
    const session = new Session(sessionId, participants, config);
    this.sessions.set(sessionId, session);
    return sessionId;
  }
  
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }
  
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.end();
      this.sessions.delete(sessionId);
    }
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

class Session {
  constructor(
    public id: string,
    public participants: string[],
    public config: SessionConfig
  ) {
    this.state = SessionState.CREATED;
    this.createdAt = new Date();
  }
  
  state: SessionState;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  
  start(): void {
    this.state = SessionState.ACTIVE;
    this.startedAt = new Date();
  }
  
  end(): void {
    this.state = SessionState.ENDED;
    this.endedAt = new Date();
  }
}
```

### Phase 2: WebRTC Client Implementation

#### 2.1 WebRTC Manager

```typescript
// src/lib/webrtc/WebRTCManager.ts
export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private mediaManager: MediaManager;
  private dataChannelManager: DataChannelManager;
  private connectionMonitor: ConnectionMonitor;
  private signalingClient: SignalingClient;
  
  constructor(config: WebRTCConfig) {
    this.mediaManager = new MediaManager(config.media);
    this.dataChannelManager = new DataChannelManager();
    this.connectionMonitor = new ConnectionMonitor();
    this.signalingClient = new SignalingClient(config.signaling);
  }
  
  async initialize(): Promise<void> {
    await this.createPeerConnection();
    await this.setupEventHandlers();
  }
  
  private async createPeerConnection(): Promise<void> {
    const config: RTCConfiguration = {
      iceServers: defaultICEServers,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };
    
    this.peerConnection = new RTCPeerConnection(config);
    
    // Setup data channel
    this.dataChannelManager.createDataChannel(this.peerConnection);
    
    // Setup connection monitoring
    this.connectionMonitor.monitor(this.peerConnection);
  }
  
  private setupEventHandlers(): void {
    if (!this.peerConnection) return;
    
    this.peerConnection.onicecandidate = (event) => {
      this.handleICECandidate(event);
    };
    
    this.peerConnection.onconnectionstatechange = () => {
      this.handleConnectionStateChange();
    };
    
    this.peerConnection.ontrack = (event) => {
      this.handleTrack(event);
    };
    
    this.peerConnection.ondatachannel = (event) => {
      this.handleDataChannel(event);
    };
  }
}
```

#### 2.2 Media Management

```typescript
// src/lib/webrtc/MediaManager.ts
export class MediaManager {
  private localStream: MediaStream | null = null;
  private config: MediaStreamConfig;
  
  constructor(config: MediaStreamConfig) {
    this.config = config;
  }
  
  async getLocalStream(): Promise<MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }
    
    const constraints: MediaStreamConstraints = {
      audio: this.config.audio.enabled ? this.config.audio : false,
      video: this.config.video.enabled ? this.config.video : false
    };
    
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error getting media stream:', error);
      throw error;
    }
  }
  
  async getScreenStream(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: this.config.screen,
        audio: false
      });
      return screenStream;
    } catch (error) {
      console.error('Error getting screen stream:', error);
      throw error;
    }
  }
  
  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
  
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }
  
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }
}
```

### Phase 3: Quality Management & Monitoring

#### 3.1 Connection Monitor

```typescript
// src/lib/webrtc/ConnectionMonitor.ts
export class ConnectionMonitor {
  private statsInterval: NodeJS.Timeout | null = null;
  private qualityController: QualityController;
  
  constructor() {
    this.qualityController = new QualityController();
  }
  
  monitor(peerConnection: RTCPeerConnection): void {
    this.startStatsCollection(peerConnection);
  }
  
  private startStatsCollection(peerConnection: RTCPeerConnection): void {
    this.statsInterval = setInterval(async () => {
      const stats = await peerConnection.getStats();
      this.analyzeStats(stats);
    }, 1000);
  }
  
  private analyzeStats(stats: RTCStatsReport): void {
    let totalBitrate = 0;
    let packetLoss = 0;
    let rtt = 0;
    
    stats.forEach((report) => {
      if (report.type === 'outbound-rtp' && report.kind === 'video') {
        totalBitrate += (report as any).bytesSent;
      }
      
      if (report.type === 'remote-inbound-rtp') {
        packetLoss = (report as any).packetsLost;
        rtt = (report as any).roundTripTime;
      }
    });
    
    const quality = this.assessQuality(totalBitrate, packetLoss, rtt);
    this.qualityController.adaptQuality(quality);
  }
  
  private assessQuality(bitrate: number, packetLoss: number, rtt: number): NetworkQuality {
    if (rtt < 100 && packetLoss < 1) {
      return 'excellent';
    } else if (rtt < 200 && packetLoss < 3) {
      return 'good';
    } else if (rtt < 400 && packetLoss < 5) {
      return 'fair';
    } else {
      return 'poor';
    }
  }
  
  stop(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }
}
```

#### 3.2 Quality Controller

```typescript
// src/lib/webrtc/QualityController.ts
export class QualityController {
  private currentQuality: QualityLevel = 'high';
  private adaptationThresholds = {
    excellent: { bitrate: 3000, resolution: '1080p', framerate: 30 },
    good: { bitrate: 2000, resolution: '720p', framerate: 25 },
    fair: { bitrate: 1000, resolution: '480p', framerate: 20 },
    poor: { bitrate: 500, resolution: '360p', framerate: 15 }
  };
  
  adaptQuality(quality: NetworkQuality): void {
    const targetQuality = this.mapNetworkQualityToQualityLevel(quality);
    
    if (targetQuality !== this.currentQuality) {
      this.applyQualitySettings(targetQuality);
      this.currentQuality = targetQuality;
    }
  }
  
  private mapNetworkQualityToQualityLevel(quality: NetworkQuality): QualityLevel {
    switch (quality) {
      case 'excellent':
        return 'high';
      case 'good':
        return 'medium';
      case 'fair':
        return 'low';
      case 'poor':
        return 'minimal';
      default:
        return 'medium';
    }
  }
  
  private applyQualitySettings(quality: QualityLevel): void {
    const settings = this.adaptationThresholds[quality];
    
    // Apply bitrate constraints
    // Apply resolution constraints
    // Apply frame rate constraints
    
    console.log(`Quality adapted to ${quality}:`, settings);
  }
}
```

### Phase 4: Recording Implementation

#### 4.1 Recording Service

```typescript
// src/lib/webrtc/RecordingManager.ts
export class RecordingManager {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private recordingStartTime: number | null = null;
  
  async startRecording(stream: MediaStream): Promise<void> {
    try {
      const options = this.getRecordingOptions();
      this.mediaRecorder = new MediaRecorder(stream, options);
      this.recordedChunks = [];
      this.recordingStartTime = Date.now();
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }
  
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.isRecording = false;
        this.recordingStartTime = null;
        console.log('Recording stopped');
        resolve(blob);
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  private getRecordingOptions(): MediaRecorderOptions {
    return {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 2500000,
      audioBitsPerSecond: 128000
    };
  }
  
  getRecordingDuration(): number {
    if (!this.recordingStartTime) {
      return 0;
    }
    return Date.now() - this.recordingStartTime;
  }
  
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}
```

### Phase 5: Error Handling & Recovery

#### 5.1 Error Management

```typescript
// src/lib/webrtc/ErrorHandler.ts
export class WebRTCErrors {
  static handleConnectionError(error: Error): void {
    console.error('WebRTC Connection Error:', error);
    
    // Classify error type
    const errorType = this.classifyError(error);
    
    // Implement recovery strategy
    this.recoverFromError(errorType);
  }
  
  private static classifyError(error: Error): ErrorType {
    if (error.message.includes('ICE failed')) {
      return 'ice_failure';
    } else if (error.message.includes('DTLS')) {
      return 'dtls_failure';
    } else if (error.message.includes('media')) {
      return 'media_failure';
    } else {
      return 'unknown';
    }
  }
  
  private static recoverFromError(errorType: ErrorType): void {
    switch (errorType) {
      case 'ice_failure':
        this.restartICE();
        break;
      case 'dtls_failure':
        this.restartConnection();
        break;
      case 'media_failure':
        this.restartMedia();
        break;
      default:
        this.restartConnection();
    }
  }
  
  private static restartICE(): void {
    // Restart ICE gathering
    console.log('Restarting ICE gathering');
  }
  
  private static restartConnection(): void {
    // Restart the entire connection
    console.log('Restarting connection');
  }
  
  private static restartMedia(): void {
    // Restart media streams
    console.log('Restarting media streams');
  }
}
```

## Security Considerations

### 1. Encryption
- **DTLS-SRTP**: All media streams are encrypted using DTLS-SRTP
- **Data Channel Encryption**: Data channels use TLS encryption
- **Signaling Security**: WebSocket connections use WSS (secure WebSocket)

### 2. Authentication
- **Session Tokens**: All connections require valid session tokens
- **User Verification**: Participants are verified before joining sessions
- **Room Access Control**: Access to sessions is controlled based on user roles

### 3. Privacy
- **No Third-Party Servers**: All media flows directly between peers
- **Local Processing**: Media processing happens locally when possible
- **Secure Storage**: Recordings are stored securely with encryption

## Performance Optimization

### 1. Network Optimization
- **ICE Candidate Prioritization**: Prioritize local network candidates
- **Adaptive Bitrate**: Dynamically adjust quality based on network conditions
- **Packet Loss Recovery**: Implement FEC (Forward Error Correction)

### 2. CPU Optimization
- **Hardware Acceleration**: Use hardware acceleration for encoding/decoding
- **Efficient Codecs**: Use VP9/Opus for better compression
- **Background Processing**: Offload processing to web workers when possible

### 3. Memory Optimization
- **Stream Management**: Properly clean up unused streams
- **Buffer Management**: Optimize buffer sizes for memory efficiency
- **Garbage Collection**: Ensure proper cleanup of WebRTC objects

## Testing Strategy

### 1. Unit Testing
- Test individual components in isolation
- Mock WebRTC APIs for testing
- Verify error handling scenarios

### 2. Integration Testing
- Test component interactions
- Verify signaling protocol implementation
- Test media stream handling

### 3. E2E Testing
- Test complete session flows
- Verify real-time communication
- Test recording functionality

### 4. Load Testing
- Test with multiple concurrent sessions
- Verify performance under load
- Test scalability limits

This WebRTC architecture provides a robust, scalable, and secure foundation for real-time communication in the SoulSeer platform, supporting all required features while maintaining high quality and reliability.