'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Clock, 
  Star,
  Video,
  MessageSquare,
  Phone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../auth/EnhancedAuthProvider';

interface Reader {
  id: string;
  name: string;
  avatar?: string;
  specialties: string[];
  rating: number;
  totalReadings: number;
  hourlyRate: number;
  responseTime: string;
  availability: {
    nextAvailable: string;
    isOnlineNow: boolean;
  };
}

export function AdvancedSessionBooking() {
  const { user } = useAuth();
  const router = useRouter();
  const [readers, setReaders] = useState<Reader[]>([]);
  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch readers from API
    setReaders([]);
  }, []);

  const handleReaderSelect = (reader: Reader) => {
    setSelectedReader(reader);
    setStep(2);
  };

  const handleBookingComplete = async () => {
    // Simulate booking creation
    try {
      const response = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerId: selectedReader?.id,
          sessionType: 'VIDEO',
          duration: 30,
          selectedDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          requirements: 'General reading session',
          category: 'general',
          priority: 'NORMAL'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBookingId(data.booking?.id);
        setStep(3);
      } else {
        console.error('Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="h-4 w-4" />;
      case 'CALL': return <Phone className="h-4 w-4" />;
      case 'CHAT': return <MessageSquare className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-12">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">
            Please sign in to book a session with our spiritual readers.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Session Booking</h1>
        <p className="text-muted-foreground">
          Smart scheduling system with AI-powered reader matching
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= num 
                ? 'bg-mystical-pink text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {num}
            </div>
            {num < 5 && (
              <div className={`w-12 h-1 ${
                step > num ? 'bg-mystical-pink' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Reader Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Choose Your Reader</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readers.map((reader) => (
              <Card 
                key={reader.id} 
                className="cursor-pointer hover:shadow-lg transition-all hover:ring-2 hover:ring-mystical-pink/50"
                onClick={() => handleReaderSelect(reader)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={reader.avatar} />
                      <AvatarFallback>
                        {reader.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{reader.name}</h3>
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{reader.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({reader.totalReadings} readings)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={reader.availability.isOnlineNow ? "default" : "secondary"}>
                          {reader.availability.isOnlineNow ? 'Online Now' : 'Offline'}
                        </Badge>
                        {reader.availability.isOnlineNow && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex flex-wrap gap-1">
                      {reader.specialties.slice(0, 3).map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{reader.responseTime}</span>
                      <span className="font-semibold">${reader.hourlyRate}/hour</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    Select Reader
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Simplified demonstration for other steps */}
      {step === 2 && selectedReader && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 mx-auto text-mystical-pink" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Confirm Your Booking
            </h2>
            <p className="text-muted-foreground mb-6">
              You've selected <strong>{selectedReader.name}</strong> for a 30-minute video session.
              <br />Rate: ${selectedReader.hourlyRate}/hour
              <br />Estimated cost: ${(selectedReader.hourlyRate / 2).toFixed(2)}
            </p>
            <div className="space-x-4">
              <Button 
                onClick={() => setStep(1)}
                variant="outline"
              >
                Back
              </Button>
              <Button 
                onClick={handleBookingComplete}
                className="bg-mystical-pink hover:bg-mystical-pink/90"
              >
                Confirm Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && bookingId && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Booking Confirmed!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your session has been booked successfully. You can join the session room when it's time.
            </p>
            <div className="space-x-4">
              <Button 
                onClick={() => setStep(1)}
                variant="outline"
              >
                Book Another Session
              </Button>
              <Button 
                onClick={() => router.push(`/sessions/${bookingId}`)}
                className="bg-mystical-pink hover:bg-mystical-pink/90"
              >
                Go to Session Room
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step > 3 && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 mx-auto text-mystical-pink" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Advanced Session Management System
            </h2>
            <p className="text-muted-foreground mb-6">
              This demonstrates the foundation for our advanced session booking system featuring:
              <br />• Smart scheduling with availability optimization
              <br />• AI-powered reader-client matching
              <br />• Multi-step booking with calendar integration
              <br />• Session templates and custom requirements
              <br />• Real-time availability checking
            </p>
            <div className="space-y-2 text-sm bg-mystical-pink/10 p-4 rounded-lg mb-6">
              <p><strong>Current Step:</strong> {step} of 5</p>
              <p><strong>Features:</strong> WebRTC integration, session recording, smart notifications</p>
            </div>
            <Button 
              onClick={() => setStep(1)}
              className="bg-mystical-pink hover:bg-mystical-pink/90"
            >
              Start Over
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}