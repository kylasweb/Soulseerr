'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, 
  Users, 
  MessageSquare, 
  Heart,
  Gift,
  Calendar,
  Clock,
  Play,
  Square,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Settings,
  Share,
  Star,
  Send
} from 'lucide-react';
import { useAuth } from '@/components/auth/EnhancedAuthProvider';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  reader: {
    id: string;
    name: string;
    avatar?: string;
    specialties: string[];
    rating: number;
  };
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  scheduledAt?: string;
  startedAt?: string;
  viewerCount: number;
  category: string;
  thumbnail?: string;
}

interface ChatMessage {
  id: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  message: string;
  timestamp: string;
  type: 'message' | 'gift' | 'system';
}

export function LiveStreamHub() {
  const { user } = useAuth();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams();
    // Set up WebSocket for real-time updates
    // setupWebSocket();
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await fetch('/api/live-streams');
      if (response.ok) {
        const data = await response.json();
        setStreams(data.streams || []);
      }
    } catch (error) {
      console.error('Failed to fetch streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinStream = (stream: LiveStream) => {
    setSelectedStream(stream);
    // Load chat messages
    fetchChatMessages(stream.id);
  };

  const fetchChatMessages = async (streamId: string) => {
    try {
      const response = await fetch(`/api/live-streams/${streamId}/chat`);
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStream || !user) return;

    try {
      const response = await fetch(`/api/live-streams/${selectedStream.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        // Message will be added via WebSocket
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const startStream = async () => {
    if (user?.role !== 'reader') return;

    try {
      const response = await fetch('/api/live-streams/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Live Reading Session',
          description: 'Join me for live spiritual guidance'
        })
      });

      if (response.ok) {
        setIsStreaming(true);
        fetchStreams();
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-red-500';
      case 'SCHEDULED': return 'bg-blue-500';
      case 'ENDED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatViewerCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedStream) {
    return (
      <div className="max-w-7xl mx-auto p-6">
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="xl:col-span-3">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black rounded-t-lg">
                {/* Video Stream Component */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Live Stream Player</p>
                    <p className="text-sm opacity-75">WebRTC integration would go here</p>
                  </div>
                </div>
                {/* Stream Status */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge className={`${getStatusColor(selectedStream.status)} text-white`}>
                    {selectedStream.status === 'LIVE' && (
                      <>
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        LIVE
                      </>
                    )}
                    {selectedStream.status === 'SCHEDULED' && 'SCHEDULED'}
                    {selectedStream.status === 'ENDED' && 'ENDED'}
                  </Badge>
                  {selectedStream.status === 'LIVE' && (
                    <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                      <Users className="h-3 w-3 mr-1" />
                      {formatViewerCount(selectedStream.viewerCount)}
                    </Badge>
                  )}
                </div>
                {/* Stream Controls */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Button size="sm" variant="secondary" className="bg-black/50 hover:bg-black/70">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-black/50 hover:bg-black/70">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Stream Info */}
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{selectedStream.title}</h1>
                    <p className="text-muted-foreground mb-4">{selectedStream.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedStream.reader.avatar} />
                          <AvatarFallback>
                            {selectedStream.reader.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{selectedStream.reader.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{selectedStream.reader.rating}</span>
                            <span>•</span>
                            <span>{selectedStream.reader.specialties.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedStream(null)}
                    variant="outline"
                  >
                    Back to Hub
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <div className="xl:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-y-auto space-y-3 pb-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={msg.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {msg.user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">
                          {msg.user.name}
                        </span>
                        <Badge variant="outline" className="text-xs px-1">
                          {msg.user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              {/* Chat Input */}
              {user && (
                <div className="border-t p-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Send a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Stream Hub</h1>
          <p className="text-muted-foreground">
            Join live spiritual readings and connect with our community
          </p>
        </div>
        {user?.role === 'reader' && (
          <Button 
            onClick={startStream}
            className="bg-mystical-pink hover:bg-mystical-pink/90"
            disabled={isStreaming}
          >
            <Video className="h-4 w-4 mr-2" />
            {isStreaming ? 'Streaming...' : 'Go Live'}
          </Button>
        )}
      </div>
      {/* Stream Categories */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm">All Streams</Button>
        <Button variant="outline" size="sm">Tarot Reading</Button>
        <Button variant="outline" size="sm">Astrology</Button>
        <Button variant="outline" size="sm">Meditation</Button>
        <Button variant="outline" size="sm">Crystal Healing</Button>
      </div>
      {/* Live Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {streams.map((stream) => (
          <Card 
            key={stream.id} 
            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
            onClick={() => joinStream(stream)}
          >
            <div className="relative">
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-mystical-pink/20 to-mystical-purple/20 flex items-center justify-center">
                {stream.thumbnail ? (
                  <img 
                    src={stream.thumbnail} 
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Video className="h-12 w-12 text-mystical-pink/50" />
                )}
              </div>
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <Badge className={`${getStatusColor(stream.status)} text-white text-xs`}>
                  {stream.status === 'LIVE' && (
                    <>
                      <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                      LIVE
                    </>
                  )}
                  {stream.status === 'SCHEDULED' && 'SOON'}
                  {stream.status === 'ENDED' && 'ENDED'}
                </Badge>
              </div>
              {/* Viewer Count */}
              {stream.status === 'LIVE' && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/50 text-white border-white/20 text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {formatViewerCount(stream.viewerCount)}
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={stream.reader.avatar} />
                  <AvatarFallback className="text-xs">
                    {stream.reader.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {stream.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {stream.reader.name}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {stream.reader.rating}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {stream.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* No Streams Message */}
      {streams.length === 0 && (
        <Card className="p-12 text-center">
          <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">No Live Streams</h3>
          <p className="text-muted-foreground mb-4">
            There are no live streams at the moment. Check back later!
          </p>
          {user?.role === 'reader' && (
            <Button onClick={startStream} variant="outline">
              <Video className="h-4 w-4 mr-2" />
              Start Your Stream
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}