'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Video, Phone } from 'lucide-react';

export default function ChatTestPage() {
  const [sessionId, setSessionId] = useState('chat-session-123');
  const [userId, setUserId] = useState('user-123');
  const [receiverId, setReceiverId] = useState('user-456');
  const [receiverName, setReceiverName] = useState('Spirit Guide');
  const [showChat, setShowChat] = useState(false);

  const handleVideoCall = () => {
    alert('Video call feature would be implemented here');
  };

  const handleVoiceCall = () => {
    alert('Voice call feature would be implemented here');
  };

  if (showChat) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-4 h-screen">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowChat(false)}
            >
              ← Back to Setup
            </Button>
          </div>
          <div className="h-full">
            <ChatInterface
              sessionId={sessionId}
              userId={userId}
              receiverId={receiverId}
              receiverName={receiverName}
              onVideoCall={handleVideoCall}
              onVoiceCall={handleVoiceCall}
            />
          </div>
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
              <MessageSquare className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">Chat Test</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Test real-time chat functionality between users
            </p>
          </div>

          {/* Setup Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Chat Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chat Configuration */}
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
                  <Label htmlFor="userId">Your User ID</Label>
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your user ID"
                  />
                </div>

                <div>
                  <Label htmlFor="receiverId">Receiver User ID</Label>
                  <Input
                    id="receiverId"
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    placeholder="Enter receiver user ID"
                  />
                </div>

                <div>
                  <Label htmlFor="receiverName">Receiver Name</Label>
                  <Input
                    id="receiverName"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Enter receiver name"
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
                    <span>Your User ID:</span>
                    <Badge variant="outline">{userId}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Receiver ID:</span>
                    <Badge variant="outline">{receiverId}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Receiver Name:</span>
                    <Badge variant="outline">{receiverName}</Badge>
                  </div>
                </div>
              </div>

              {/* Test Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Test Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Open this page in two separate browser tabs</li>
                  <li>• Set different User IDs for each tab</li>
                  <li>• Swap the User IDs and Receiver IDs between tabs</li>
                  <li>• Use the same Session ID for both tabs</li>
                  <li>• Click "Start Chat" in both tabs</li>
                  <li>• Send messages between the two tabs</li>
                  <li>• Test typing indicators and read receipts</li>
                </ul>
              </div>

              {/* Start Chat Button */}
              <Button 
                onClick={() => setShowChat(true)}
                className="w-full"
                size="lg"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Chat Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2">Real-time Messaging</h4>
                  <p className="text-sm text-muted-foreground">
                    Instant message delivery with WebSocket
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2">Typing Indicators</h4>
                  <p className="text-sm text-muted-foreground">
                    See when others are typing
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2">Read Receipts</h4>
                  <p className="text-sm text-muted-foreground">
                    Know when messages are read
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2">Message History</h4>
                  <p className="text-sm text-muted-foreground">
                    Load and browse past conversations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Integration Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Video className="h-4 w-4 mr-2" />
                    Video Calls
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Seamlessly start video calls from chat
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Voice Calls
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Quick voice call integration
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