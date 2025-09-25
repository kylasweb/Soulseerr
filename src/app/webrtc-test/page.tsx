'use client';

import { useState } from 'react';
import { VideoCall } from '@/components/webrtc/VideoCall';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Video, Phone, Users } from 'lucide-react';

export default function WebRTCTestPage() {
  const [sessionId, setSessionId] = useState('test-session-123');
  const [userId, setUserId] = useState('user-123');
  const [role, setRole] = useState<'CLIENT' | 'READER'>('CLIENT');
  const [participantName, setParticipantName] = useState('Spirit Guide');
  const [showVideoCall, setShowVideoCall] = useState(false);

  const handleCallEnd = () => {
    setShowVideoCall(false);
  };

  if (showVideoCall) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowVideoCall(false)}
            >
              ← Back to Setup
            </Button>
          </div>
          <VideoCall
            sessionId={sessionId}
            userId={userId}
            role={role}
            participantName={participantName}
            onCallEnd={handleCallEnd}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Video className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">WebRTC Test</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Test real-time video calls between clients and readers
            </p>
          </div>

          {/* Setup Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Call Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session Configuration */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sessionId">Session ID</Label>
                  <Input
                    id="sessionId"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    placeholder="Enter session ID"
                  />
                </div>

                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user ID"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value: 'CLIENT' | 'READER') => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Client
                        </div>
                      </SelectItem>
                      <SelectItem value="READER">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Reader
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="participantName">Participant Name</Label>
                  <Input
                    id="participantName"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Enter participant name"
                  />
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Configuration Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Session ID:</span>
                    <Badge variant="outline">{sessionId}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <Badge variant="outline">{userId}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <Badge variant={role === 'CLIENT' ? 'default' : 'secondary'}>
                      {role}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Participant:</span>
                    <Badge variant="outline">{participantName}</Badge>
                  </div>
                </div>
              </div>

              {/* Test Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Test Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Open this page in two separate browser tabs</li>
                  <li>• Set different User IDs for each tab</li>
                  <li>• Set opposite roles (one CLIENT, one READER)</li>
                  <li>• Use the same Session ID for both tabs</li>
                  <li>• Click "Start Video Call" in both tabs</li>
                  <li>• Grant camera and microphone permissions when prompted</li>
                </ul>
              </div>

              {/* Start Call Button */}
              <Button 
                onClick={() => setShowVideoCall(true)}
                className="w-full"
                size="lg"
              >
                <Video className="h-5 w-5 mr-2" />
                Start Video Call
              </Button>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>WebRTC Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2">Real-time Video</h4>
                  <p className="text-sm text-muted-foreground">
                    High-quality video streaming with adaptive bitrate
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2">Crystal Clear Audio</h4>
                  <p className="text-sm text-muted-foreground">
                    Noise cancellation and echo suppression
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2">Secure Connection</h4>
                  <p className="text-sm text-muted-foreground">
                    End-to-end encryption for all communications
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2">Smart Controls</h4>
                  <p className="text-sm text-muted-foreground">
                    Mute/unmute, video on/off, call management
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}