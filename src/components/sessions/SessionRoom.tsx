'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { VideoCall } from '../webrtc/VideoCall';
import { SessionRecording } from './SessionRecording';
import { useAuth } from '../auth/EnhancedAuthProvider';
import { 
  Clock, 
  Calendar,
  Video,
  Phone,
  MessageSquare,
  User,
  Settings,
  Star,
  Play,
  Pause,
  Square,
  AlertCircle,
  CheckCircle,
  Timer
} from 'lucide-react';

interface SessionRoomProps {
  bookingId: string;
}

interface BookingDetails {
  id: string;
  sessionType: 'VIDEO' | 'CALL' | 'CHAT';
  scheduledDateTime: Date;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  requirements: string;
  reader: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    specialties: string[];
  };
  client: {
    id: string;
    name: string;
    avatar?: string;
  };
  session?: {
    id: string;
    status: 'WAITING' | 'ACTIVE' | 'ENDED';
    startedAt?: Date;
    endedAt?: Date;
  };
}

export function SessionRoom({ bookingId }: SessionRoomProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/sessions/booking/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      } else {
        setError('Failed to load booking details');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!booking) return;

    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });

      if (response.ok) {
        const data = await response.json();
        setBooking(prev => prev ? { ...prev, session: data.session } : null);
        setIsSessionActive(true);
      }
    } catch (err) {
      setError('Failed to start session');
    }
  };

  const handleEndSession = async () => {
    if (!booking?.session) return;

    try {
      const response = await fetch('/api/sessions/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: booking.session.id,
          duration: sessionTime
        })
      });

      if (response.ok) {
        setIsSessionActive(false);
        router.push('/sessions');
      }
    } catch (err) {
      setError('Failed to end session');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="h-4 w-4" />;
      case 'CALL': return <Phone className="h-4 w-4" />;
      case 'CHAT': return <MessageSquare className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const canStartSession = () => {
    if (!booking) return false;
    const now = new Date();
    const scheduledTime = new Date(booking.scheduledDateTime);
    const timeDiff = scheduledTime.getTime() - now.getTime();
    // Allow starting 15 minutes before scheduled time
    return timeDiff <= 15 * 60 * 1000 && booking.status === 'CONFIRMED';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mystical-pink mx-auto mb-4"></div>
            <p>Loading session details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Session Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'The requested session could not be found.'}
            </p>
            <Button onClick={() => router.push('/sessions')}>
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isReader = user?.role === 'reader';
  const participant = isReader ? booking.client : booking.reader;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-dark/10 to-purple-900/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Session Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback>
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {participant.name}
                      {isReader && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{booking.reader.rating}</span>
                        </div>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {getSessionIcon(booking.sessionType)}
                      {booking.sessionType} Session • {booking.duration} minutes
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Timer className="h-4 w-4" />
                    <span className="font-mono text-lg">
                      {formatTime(sessionTime)}
                    </span>
                  </div>
                  <Badge variant={
                    booking.status === 'CONFIRMED' ? 'default' : 
                    booking.status === 'IN_PROGRESS' ? 'default' :
                    booking.status === 'COMPLETED' ? 'secondary' : 'outline'
                  }>
                    {booking.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Session Area */}
          {booking.sessionType === 'VIDEO' && booking.session?.status === 'ACTIVE' ? (
            <Tabs defaultValue="video" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="video">Video Session</TabsTrigger>
                <TabsTrigger value="recording">Recording</TabsTrigger>
              </TabsList>
              
              <TabsContent value="video" className="mt-6">
                <VideoCall
                  sessionId={booking.session.id}
                  userId={user?.id || ''}
                  role={user?.role === 'reader' ? 'READER' : 'CLIENT'}
                  participantName={participant.name}
                  onCallEnd={handleEndSession}
                />
              </TabsContent>
              
              <TabsContent value="recording" className="mt-6">
                <SessionRecording
                  sessionId={booking.session.id}
                  userRole={user?.role === 'reader' ? 'READER' : 'CLIENT'}
                  isRecordingEnabled={true}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Session Area */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Waiting Room</CardTitle>
                    <CardDescription>
                      {canStartSession() 
                        ? 'Ready to start your session'
                        : 'Please wait for the scheduled time to begin'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-12">
                      {booking.sessionType === 'VIDEO' && (
                        <Video className="h-16 w-16 mx-auto mb-4 text-mystical-pink" />
                      )}
                      {booking.sessionType === 'CALL' && (
                        <Phone className="h-16 w-16 mx-auto mb-4 text-mystical-pink" />
                      )}
                      {booking.sessionType === 'CHAT' && (
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-mystical-pink" />
                      )}
                      
                      <h3 className="text-xl font-semibold mb-2">
                        {booking.sessionType} Session with {participant.name}
                      </h3>
                      
                      <p className="text-muted-foreground mb-6">
                        Scheduled for {new Date(booking.scheduledDateTime).toLocaleString()}
                      </p>

                      {canStartSession() ? (
                        <Button 
                          size="lg"
                          onClick={handleStartSession}
                          className="bg-mystical-pink hover:bg-mystical-pink/90"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Session
                        </Button>
                      ) : (
                        <div className="text-center">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Session will be available 15 minutes before scheduled time
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Session Details Sidebar */}
              <div className="space-y-6">
                {/* Session Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Session Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{booking.sessionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{booking.duration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scheduled:</span>
                      <span className="font-medium">
                        {new Date(booking.scheduledDateTime).toLocaleTimeString()}
                      </span>
                    </div>
                    {booking.requirements && (
                      <div className="pt-2 border-t">
                        <span className="text-sm font-medium">Special Requirements:</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {booking.requirements}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reader Specialties */}
                {isReader === false && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Reader Specialties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {booking.reader.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}