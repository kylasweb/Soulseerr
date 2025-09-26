'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, DollarSign, Users, Star, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { toast } from 'sonner';

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  totalRevenue: number;
  averageRating: number;
  totalReaders: number;
  totalClients: number;
}

interface SessionBooking {
  id: string;
  scheduledDateTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  duration: number;
  price: number;
  client: {
    id: string;
    name: string;
    email: string;
  };
  reader: {
    id: string;
    name: string;
    email: string;
    averageRating: number;
  };
  session?: {
    id: string;
    actualStartTime?: string;
    actualEndTime?: string;
    notes?: string;
  };
  createdAt: string;
}

interface ReaderPerformance {
  id: string;
  name: string;
  email: string;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  totalEarnings: number;
  joinedAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export default function SessionManagementDashboard() {
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReaders: 0,
    totalClients: 0
  });
  const [sessions, setSessions] = useState<SessionBooking[]>([]);
  const [readers, setReaders] = useState<ReaderPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const { socket } = useSocket();

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/dashboard/stats?range=${dateRange}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  }, [dateRange]);

  // Fetch session bookings
  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/sessions?range=${dateRange}&limit=50`);
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to load session bookings');
    }
  }, [dateRange]);

  // Fetch reader performance
  const fetchReaders = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/readers/performance?range=${dateRange}`);
      const data = await response.json();
      setReaders(data.readers || []);
    } catch (error) {
      console.error('Failed to fetch reader performance:', error);
      toast.error('Failed to load reader performance data');
    }
  }, [dateRange]);

  // Load all data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchSessions(), fetchReaders()]);
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchSessions, fetchReaders]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleSessionUpdate = (data: { type: string; sessionId: string; status?: string }) => {
      setSessions(prev => prev.map(session => 
        session.id === data.sessionId 
          ? { ...session, status: data.status as any || session.status }
          : session
      ));
      
      // Refresh stats on significant updates
      if (['started', 'completed', 'cancelled'].includes(data.type)) {
        fetchStats();
      }
    };

    const handleBookingUpdate = (booking: SessionBooking) => {
      setSessions(prev => {
        const existingIndex = prev.findIndex(s => s.id === booking.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = booking;
          return updated;
        }
        return [booking, ...prev];
      });
      fetchStats();
    };

    socket!.on('admin:session:update', handleSessionUpdate);
    socket!.on('admin:booking:new', handleBookingUpdate);
    socket!.on('admin:booking:update', handleBookingUpdate);

    return () => {
      socket!.off('admin:session:update', handleSessionUpdate);
      socket!.off('admin:booking:new', handleBookingUpdate);
      socket!.off('admin:booking:update', handleBookingUpdate);
    };
  }, [socket, fetchStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-500';
      case 'IN_PROGRESS': return 'bg-green-500';
      case 'COMPLETED': return 'bg-gray-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Session Management Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage all session activities</p>
        </div>
        
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              onClick={() => setDateRange(range)}
              className="capitalize"
            >
              {range === 'all' ? 'All Time' : range}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSessions} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.completedSessions} completed sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Across all completed sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReaders + stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReaders} readers, {stats.totalClients} clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="readers">Readers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Completed</span>
                  <Badge variant="secondary">{stats.completedSessions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active</span>
                  <Badge className="bg-green-500">{stats.activeSessions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cancelled</span>
                  <Badge variant="destructive">{stats.cancelledSessions}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Revenue</span>
                  <span className="font-bold">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average per Session</span>
                  <span>{formatCurrency(stats.totalRevenue / Math.max(stats.completedSessions, 1))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Platform Fee (10%)</span>
                  <span>{formatCurrency(stats.totalRevenue * 0.1)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Growth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Readers</span>
                  <Badge variant="outline">{stats.totalReaders}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Clients</span>
                  <Badge variant="outline">{stats.totalClients}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Reader to Client Ratio</span>
                  <span>{(stats.totalReaders / Math.max(stats.totalClients, 1)).toFixed(2)}:1</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Latest session bookings and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                      <div>
                        <div className="font-medium">
                          {session.client.name} ↔ {session.reader.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(session.scheduledDateTime)} • {session.duration} min • {formatCurrency(session.price)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={session.status === 'COMPLETED' ? 'secondary' : 'default'}
                        className={getStatusColor(session.status)}
                      >
                        {getStatusIcon(session.status)}
                        <span className="ml-1">{session.status}</span>
                      </Badge>
                      
                      {session.reader.averageRating > 0 && (
                        <div className="flex items-center text-sm">
                          <Star className="w-3 h-3 fill-current text-yellow-500 mr-1" />
                          {session.reader.averageRating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No sessions found for the selected time period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reader Performance</CardTitle>
              <CardDescription>Performance metrics for all readers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {readers.map((reader) => (
                  <div key={reader.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {reader.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{reader.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {reader.email} • Joined {new Date(reader.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold">{reader.totalSessions}</div>
                        <div className="text-muted-foreground">Sessions</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-bold flex items-center">
                          <Star className="w-3 h-3 fill-current text-yellow-500 mr-1" />
                          {reader.averageRating.toFixed(1)}
                        </div>
                        <div className="text-muted-foreground">Rating</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-bold">{formatCurrency(reader.totalEarnings)}</div>
                        <div className="text-muted-foreground">Earned</div>
                      </div>
                      
                      <Badge 
                        variant={reader.status === 'ACTIVE' ? 'secondary' : 'destructive'}
                      >
                        {reader.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {readers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No readers found for the selected time period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}