'use client';

import { useState } from 'react';
import { useWebRTC } from '@/hooks/use-webrtc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface VideoCallProps {
  sessionId: string;
  userId: string;
  role: 'CLIENT' | 'READER';
  participantName?: string;
  onCallEnd?: () => void;
}

export function VideoCall({
  sessionId,
  userId,
  role,
  participantName = 'Participant',
  onCallEnd
}: VideoCallProps) {
  // Enable WebRTC with Redis signaling
  const {
    isConnected,
    isInCall,
    remoteStream,
    localStream,
    error,
    startCall,
    endCall,
    localVideoRef,
    remoteVideoRef,
  } = useWebRTC(sessionId, userId, 'peer-id'); // TODO: Pass actual peer ID

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const handleEndCall = () => {
    endCall();
    onCallEnd?.();
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto p-4 space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant={isInCall ? 'default' : 'outline'}>
            {isInCall ? 'Live' : 'Ready'}
          </Badge>

          {role === 'CLIENT' && (
            <Badge variant="outline">
              <User className="h-3 w-3 mr-1" />
              Client
            </Badge>
          )}
          {role === 'READER' && (
            <Badge variant="outline">
              <User className="h-3 w-3 mr-1" />
              Reader
            </Badge>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
        {/* Local Video */}
        <Card className="relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Video className="h-4 w-4 mr-2" />
              You ({role === 'CLIENT' ? 'Client' : 'Reader'})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-video bg-muted rounded-b-lg overflow-hidden">
              {localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <VideoOff className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Camera off</p>
                  </div>
                </div>
              )}

              {/* Local video controls overlay */}
              <div className="absolute bottom-2 left-2 flex space-x-1">
                <Button
                  size="sm"
                  variant={audioEnabled ? "secondary" : "destructive"}
                  onClick={toggleAudio}
                  disabled={!isInCall}
                >
                  {audioEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                </Button>
                <Button
                  size="sm"
                  variant={videoEnabled ? "secondary" : "destructive"}
                  onClick={toggleVideo}
                  disabled={!isInCall}
                >
                  {videoEnabled ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remote Video */}
        <Card className="relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Video className="h-4 w-4 mr-2" />
              {participantName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-video bg-muted rounded-b-lg overflow-hidden">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <User className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Waiting for participant</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Controls */}
      <div className="flex justify-center space-x-4">
        {!isInCall ? (
          <Button onClick={startCall} size="lg" className="px-8">
            <Video className="h-5 w-5 mr-2" />
            Start Call
          </Button>
        ) : (
          <Button onClick={handleEndCall} size="lg" variant="destructive" className="px-8">
            <PhoneOff className="h-5 w-5 mr-2" />
            End Call
          </Button>
        )}
      </div>
    </div>
  );
}