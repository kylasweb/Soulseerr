'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  UserCheck,
  DollarSign,
  Clock,
  Star,
  Activity,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Target,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Filter,
  LineChart,
  BarChart,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { toast } from 'sonner';

interface AnalyticsStats {
  // User Analytics
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  userGrowthRate: number;
  userRetentionRate: number;
  averageSessionDuration: number;
  
  // Reader Analytics
  totalReaders: number;
  activeReaders: number;
  readerUtilizationRate: number;
  averageReaderRating: number;
  topPerformingReaders: number;
  readerChurnRate: number;
  
  // Session Analytics
  totalSessions: number;
  completedSessions: number;
  sessionCompletionRate: number;
  averageSessionValue: number;
  sessionsToday: number;
  sessionGrowthRate: number;
  
  // Revenue Analytics
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowthRate: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  churnRevenueLoss: number;
  
  // Platform Analytics
  platformUptime: number;
  responseTime: number;
  errorRate: number;
  apiCallsToday: number;
  dataUsage: number;
  systemHealth: number;
}

interface ChartData {
  date: string;
  users: number;
  sessions: number;
  revenue: number;
  readers: number;
}

interface GeographicData {
  country: string;
  users: number;
  sessions: number;
  revenue: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  users: number;
  percentage: number;
}

interface TopReader {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  sessions: number;
  revenue: number;
  growthRate: number;
}

interface UserMetric {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export default function AdvancedAnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    userGrowthRate: 0,
    userRetentionRate: 0,
    averageSessionDuration: 0,
    totalReaders: 0,
    activeReaders: 0,
    readerUtilizationRate: 0,
    averageReaderRating: 0,
    topPerformingReaders: 0,
    readerChurnRate: 0,
    totalSessions: 0,
    completedSessions: 0,
    sessionCompletionRate: 0,
    averageSessionValue: 0,
    sessionsToday: 0,
    sessionGrowthRate: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowthRate: 0,
    averageRevenuePerUser: 0,
    conversionRate: 0,
    churnRevenueLoss: 0,
    platformUptime: 0,
    responseTime: 0,
    errorRate: 0,
    apiCallsToday: 0,
    dataUsage: 0,
    systemHealth: 0
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [topReaders, setTopReaders] = useState<TopReader[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetric[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('summary');

  const { socket } = useSocket();

  // Fetch analytics statistics
  const fetchAnalyticsStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/stats?period=${dateRange}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch analytics stats:', error);
      toast.error('Failed to load analytics statistics');
    }
  }, [dateRange]);

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/chart-data?period=${dateRange}`);
      const data = await response.json();
      setChartData(data.chartData || []);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    }
  }, [dateRange]);

  // Fetch geographic data
  const fetchGeographicData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/geographic?period=${dateRange}`);
      const data = await response.json();
      setGeographicData(data.geographicData || []);
    } catch (error) {
      console.error('Failed to fetch geographic data:', error);
    }
  }, [dateRange]);

  // Fetch device data
  const fetchDeviceData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/devices?period=${dateRange}`);
      const data = await response.json();
      setDeviceData(data.deviceData || []);
    } catch (error) {
      console.error('Failed to fetch device data:', error);
    }
  }, [dateRange]);

  // Fetch top readers
  const fetchTopReaders = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/top-readers?period=${dateRange}`);
      const data = await response.json();
      setTopReaders(data.topReaders || []);
    } catch (error) {
      console.error('Failed to fetch top readers:', error);
    }
  }, [dateRange]);

  // Fetch user metrics
  const fetchUserMetrics = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/user-metrics?period=${dateRange}`);
      const data = await response.json();
      setUserMetrics(data.userMetrics || []);
    } catch (error) {
      console.error('Failed to fetch user metrics:', error);
    }
  }, [dateRange]);

  // Load all analytics data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAnalyticsStats(),
        fetchChartData(),
        fetchGeographicData(),
        fetchDeviceData(),
        fetchTopReaders(),
        fetchUserMetrics()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchAnalyticsStats, fetchChartData, fetchGeographicData, fetchDeviceData, fetchTopReaders, fetchUserMetrics]);

  // Load data on component mount and when date range changes
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleAnalyticsUpdate = (data: { type: string; metric?: string }) => {
      // Refresh specific metrics based on the update type
      if (data.type === 'user_activity' || data.type === 'session_completed') {
        fetchAnalyticsStats();
        fetchChartData();
      } else if (data.type === 'new_user_registered') {
        fetchAnalyticsStats();
        fetchUserMetrics();
      } else if (data.type === 'reader_performance_update') {
        fetchTopReaders();
      }
    };

    socket.on('admin:analytics:update', handleAnalyticsUpdate);

    return () => {
      socket.off('admin:analytics:update', handleAnalyticsUpdate);
    };
  }, [socket, fetchAnalyticsStats, fetchChartData, fetchUserMetrics, fetchTopReaders]);

  // Export report
  const exportReport = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?type=${reportType}&period=${dateRange}`, {
        method: 'POST'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${reportType}-${dateRange}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Report exported successfully');
      } else {
        toast.error('Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error exporting report');
    }
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (value: number, showSign: boolean = true) => {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <TrendingUp className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
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
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform analytics and business intelligence</p>
        </div>
        
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary Report</SelectItem>
              <SelectItem value="detailed">Detailed Report</SelectItem>
              <SelectItem value="financial">Financial Report</SelectItem>
              <SelectItem value="user">User Analytics</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-1" />
            Export Report
          </Button>
          
          <Button onClick={loadAllData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
            <div className="flex items-center space-x-1">
              <span className={`text-xs ${getTrendColor(stats.userGrowthRate)}`}>
                {formatPercentage(stats.userGrowthRate)} from last period
              </span>
              {stats.userGrowthRate > 0 ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Readers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.activeReaders)}</div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">
                {formatPercentage(stats.readerUtilizationRate, false)} utilization
              </span>
              <Activity className="w-3 h-3 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center space-x-1">
              <span className={`text-xs ${getTrendColor(stats.revenueGrowthRate)}`}>
                {formatPercentage(stats.revenueGrowthRate)} growth
              </span>
              {stats.revenueGrowthRate > 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.systemHealth, false)}</div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">
                {formatPercentage(stats.platformUptime, false)} uptime
              </span>
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="readers">Readers</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Growth Trends</span>
                </CardTitle>
                <CardDescription>User, session, and revenue growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart visualization will be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Revenue Distribution</span>
                </CardTitle>
                <CardDescription>Revenue breakdown by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Pie chart visualization will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Daily Active Users</span>
                  <span className="font-bold">{formatNumber(stats.activeUsers)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Session Duration</span>
                  <span className="font-bold">{stats.averageSessionDuration} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Retention Rate</span>
                  <span className="font-bold">{formatPercentage(stats.userRetentionRate, false)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Conversion Rate</span>
                  <span className="font-bold">{formatPercentage(stats.conversionRate, false)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reader Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span className="font-bold">{stats.averageReaderRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Utilization Rate</span>
                  <span className="font-bold">{formatPercentage(stats.readerUtilizationRate, false)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Top Performers</span>
                  <span className="font-bold">{stats.topPerformingReaders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Churn Rate</span>
                  <span className="font-bold text-red-600">{formatPercentage(stats.readerChurnRate, false)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>System Uptime</span>
                  <span className="font-bold text-green-600">{formatPercentage(stats.platformUptime, false)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Response Time</span>
                  <span className="font-bold">{stats.responseTime}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Error Rate</span>
                  <span className="font-bold text-yellow-600">{formatPercentage(stats.errorRate, false)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>API Calls Today</span>
                  <span className="font-bold">{formatNumber(stats.apiCallsToday)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  User growth chart will be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Metrics</CardTitle>
                <CardDescription>Key user engagement metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{metric.metric}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatNumber(metric.current)}</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-xs ${getTrendColor(metric.change)}`}>
                          {formatPercentage(Math.abs(metric.change))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Geographic and Device Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Geographic Distribution</span>
                </CardTitle>
                <CardDescription>Users by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geographicData.slice(0, 5).map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{country.country}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${country.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {formatNumber(country.users)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5" />
                  <span>Device Usage</span>
                </CardTitle>
                <CardDescription>Users by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deviceData.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {device.device === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                        <span className="text-sm font-medium capitalize">{device.device}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${device.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {formatPercentage(device.percentage, false)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="readers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Readers</CardTitle>
              <CardDescription>Readers with highest performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topReaders.map((reader, index) => (
                  <div key={reader.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">{reader.name}</div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                            <span className="text-sm text-muted-foreground">{reader.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{reader.sessions}</div>
                        <div className="text-muted-foreground">Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{formatCurrency(reader.revenue)}</div>
                        <div className="text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-medium ${getTrendColor(reader.growthRate)}`}>
                          {formatPercentage(reader.growthRate)}
                        </div>
                        <div className="text-muted-foreground">Growth</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatNumber(stats.totalSessions)}</div>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatNumber(stats.completedSessions)}</div>
                <p className="text-xs text-muted-foreground">Completed Sessions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatPercentage(stats.sessionCompletionRate, false)}</div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatCurrency(stats.averageSessionValue)}</div>
                <p className="text-xs text-muted-foreground">Average Value</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Session Analytics</CardTitle>
              <CardDescription>Detailed session performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Session analytics dashboard will be displayed here...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatCurrency(stats.averageRevenuePerUser)}</div>
                <p className="text-xs text-muted-foreground">ARPU</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.churnRevenueLoss)}</div>
                <p className="text-xs text-muted-foreground">Churn Loss</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Revenue trends and forecasting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Revenue analytics dashboard will be displayed here...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{formatPercentage(stats.platformUptime, false)}</div>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.responseTime}ms</div>
                <p className="text-xs text-muted-foreground">Response Time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">{formatPercentage(stats.errorRate, false)}</div>
                <p className="text-xs text-muted-foreground">Error Rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatNumber(stats.apiCallsToday)}</div>
                <p className="text-xs text-muted-foreground">API Calls Today</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
              <CardDescription>System performance and monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Platform health dashboard will be displayed here...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}