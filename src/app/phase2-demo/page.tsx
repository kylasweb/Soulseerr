'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/EnhancedAuthProvider';
import { useRouter } from 'next/navigation';
import { 
  Video, 
  MessageSquare, 
  CreditCard, 
  Users, 
  Calendar,
  Wallet,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

// Demo Components
function WebRTCDemo() {
  const [showDemo, setShowDemo] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="h-5 w-5 mr-2" />
          WebRTC Video Calls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Real-time video and audio calls between clients and readers with WebRTC technology.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-2">Features</h4>
            <ul className="text-sm space-y-1">
              <li>• HD video quality</li>
              <li>• Crystal clear audio</li>
              <li>• Real-time signaling</li>
              <li>• Call recording ready</li>
            </ul>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-2">Technology</h4>
            <ul className="text-sm space-y-1">
              <li>• WebRTC API</li>
              <li>• Socket.IO signaling</li>
              <li>• STUN/TURN servers</li>
              <li>• Adaptive bitrate</li>
            </ul>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowDemo(true)}
          className="w-full"
        >
          Try WebRTC Demo
        </Button>
        
        {showDemo && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              WebRTC demo available at <code className="bg-blue-100 px-1 rounded">/webrtc-test</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChatDemo() {
  const [showDemo, setShowDemo] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Real-time Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Instant messaging with typing indicators, read receipts, and message history.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-2">Features</h4>
            <ul className="text-sm space-y-1">
              <li>• Real-time messaging</li>
              <li>• Typing indicators</li>
              <li>• Read receipts</li>
              <li>• Message history</li>
            </ul>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-2">Technology</h4>
            <ul className="text-sm space-y-1">
              <li>• Socket.IO</li>
              <li>• WebSocket</li>
              <li>• Redis ready</li>
              <li>• Database persistence</li>
            </ul>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowDemo(true)}
          className="w-full"
        >
          Try Chat Demo
        </Button>
        
        {showDemo && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Chat demo available at <code className="bg-blue-100 px-1 rounded">/chat-test</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StripeDemo() {
  const [showDemo, setShowDemo] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Stripe Connect Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Secure payment processing with Stripe Connect for readers and clients.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-2">Features</h4>
            <ul className="text-sm space-y-1">
              <li>• Secure payments</li>
              <li>• Connect accounts</li>
              <li>• Instant payouts</li>
              <li>• Tax compliance</li>
            </ul>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-2">Integration</h4>
            <ul className="text-sm space-y-1">
              <li>• Payment intents</li>
              <li>• Webhooks</li>
              <li>• Dashboard API</li>
              <li>• Mobile SDK ready</li>
            </ul>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowDemo(true)}
          className="w-full"
        >
          View Payment Components
        </Button>
        
        {showDemo && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Payment components integrated and ready for testing with Stripe API keys.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">SoulSeer Phase 2 Demo</h1>
              <p className="text-lg text-muted-foreground">
                Core Real-time & Financial Engine
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold">{user?.name || user?.email}</p>
                <Badge variant={user?.role === 'client' ? 'default' : user?.role === 'reader' ? 'secondary' : 'destructive'}>
                  {user?.role}
                </Badge>
              </div>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">WebRTC System</p>
                    <p className="text-2xl font-bold">Ready</p>
                  </div>
                  <Video className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Chat System</p>
                    <p className="text-2xl font-bold">Ready</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Payments</p>
                    <p className="text-2xl font-bold">Ready</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Tabs */}
          <Tabs defaultValue="webrtc" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="webrtc">WebRTC</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="webrtc">
              <WebRTCDemo />
            </TabsContent>
            
            <TabsContent value="chat">
              <ChatDemo />
            </TabsContent>
            
            <TabsContent value="payments">
              <StripeDemo />
            </TabsContent>
          </Tabs>

          {/* Phase 2 Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Phase 2 Complete ✅
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Implemented Features</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      WebRTC video/audio calling system
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Real-time chat with Socket.IO
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Stripe Connect payment integration
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Session management infrastructure
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Wallet and balance system ready
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Next Steps</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      Reader dashboard implementation
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      Client dashboard with booking
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      Advanced session scheduling
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      Mobile app integration
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      Analytics and reporting
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Phase2DemoPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">SoulSeer Phase 2</h1>
            <p className="text-lg text-muted-foreground">
              Core Real-time & Financial Engine Demo
            </p>
          </div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onSuccess={() => {}} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm onSuccess={() => {}} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return <DashboardContent />;
}