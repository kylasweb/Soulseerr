'use client';

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
  Clock,
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
  const {
    isConnected,
    isCallActive,
    isCallConnecting,
    localStream,
    remoteStream,
    error,
    localVideoRef,
    remoteVideoRef,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useWebRTC({
    sessionId,
    userId,
    role,
    onCallStarted: () => {
      console.log('Call started');
    },
    onCallEnded: (reason) => {
      console.log('Call ended:', reason);
      onCallEnd?.();
    },
    onParticipantJoined: (participant) => {
      console.log('Participant joined:', participant);
    },
    onError: (error) => {
      console.error('WebRTC error:', error);
    },
  });

  const getAudioEnabled = () => {
    return localStream?.getAudioTracks()[0]?.enabled ?? false;
  };

  const getVideoEnabled = () => {
    return localStream?.getVideoTracks()[0]?.enabled ?? false;
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
          <Badge variant={isCallActive ? 'default' : isCallConnecting ? 'secondary' : 'outline'}>
            {isCallActive ? 'Live' : isCallConnecting ? 'Connecting...' : 'Ready'}
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
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {!localStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <VideoOff className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Camera off</p>
                  </div>
                </div>
              )}
              
              {/* Local video controls overlay */}
              <div className="absolute bottom-2 left-2 flex space-x-1">
                <Badge variant="secondary" className="text-xs">
                  {getVideoEnabled() ? 'Video On' : 'Video Off'}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {getAudioEnabled() ? 'Mic On' : 'Mic Off'}
                </Badge>
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
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <User className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isCallConnecting ? 'Connecting...' : 'Waiting for participant...'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Remote video status overlay */}
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  {remoteStream ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-4">
            {/* Audio Toggle */}
            <Button
              variant={getAudioEnabled() ? 'default' : 'destructive'}
              size="lg"
              onClick={toggleAudio}
              disabled={!isCallActive && !isCallConnecting}
            >
              {getAudioEnabled() ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>

            {/* Video Toggle */}
            <Button
              variant={getVideoEnabled() ? 'default' : 'destructive'}
              size="lg"
              onClick={toggleVideo}
              disabled={!isCallActive && !isCallConnecting}
            >
              {getVideoEnabled() ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>

            {/* Start/End Call */}
            {!isCallActive && !isCallConnecting ? (
              <Button
                variant="default"
                size="lg"
                onClick={startCall}
                disabled={!isConnected}
                className="bg-green-600 hover:bg-green-700"
              >
                <Phone className="h-5 w-5 mr-2" />
                Start Call
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="lg"
                onClick={() => endCall()}
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                End Call
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call Info */}
      {isCallActive && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Session ID: {sessionId}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>Role: {role}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}