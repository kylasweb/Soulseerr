import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  Activity
} from 'lucide-react'
import { RevenueChart } from '../charts/RevenueChart'
import { SessionAnalyticsChart } from '../charts/SessionAnalyticsChart'
import { UserEngagementChart } from '../charts/UserEngagementChart'

interface EnhancedAnalyticsDashboardProps {
  user: {
    role: string
    name: string
  }
}

// TODO: Replace with actual API calls
const revenueData = []

const sessionData = []

const userEngagementData = []

export function EnhancedAnalyticsDashboard({ user }: EnhancedAnalyticsDashboardProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    period: 'month' as 'day' | 'week' | 'month'
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Calculate key metrics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.totalRevenue, 0)
  const totalSessions = sessionData.reduce((sum, item) => sum + item.totalSessions, 0)
  const totalUsers = userEngagementData[userEngagementData.length - 1]?.totalUsers || 0
  const activeUsers = userEngagementData[userEngagementData.length - 1]?.activeUsers || 0

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive platform insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs flex items-center space-x-1 text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% from last {period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions.toLocaleString()}</div>
            <div className="text-xs flex items-center space-x-1 text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+8.3% from last {period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <div className="text-xs flex items-center space-x-1 text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+15.2% from last {period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0'}% engagement rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>
                  Key platform performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Uptime</span>
                  <Badge variant="default">99.9%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Response Time</span>
                  <Badge variant="secondary">145ms</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Readers</span>
                  <Badge variant="outline">247</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Session Success Rate</span>
                  <Badge variant="default">94.2%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Success Rate</span>
                  <Badge variant="default">98.7%</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Highest performing readers this {period}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Sarah Wilson', rating: 4.9, sessions: 156, revenue: 7800 },
                  { name: 'Michael Chen', rating: 4.8, sessions: 142, revenue: 7100 },
                  { name: 'Emma Thompson', rating: 4.8, sessions: 138, revenue: 6900 },
                  { name: 'David Rodriguez', rating: 4.7, sessions: 134, revenue: 6700 },
                  { name: 'Jennifer Kumar', rating: 4.7, sessions: 129, revenue: 6450 }
                ].map((reader, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{reader.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {reader.sessions} sessions • ⭐ {reader.rating}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(reader.revenue)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest platform events and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: '2 minutes ago', event: 'New reader application approved', type: 'success' },
                  { time: '15 minutes ago', event: 'High session volume detected', type: 'info' },
                  { time: '1 hour ago', event: 'Monthly payout processed for 156 readers', type: 'success' },
                  { time: '2 hours ago', event: 'System maintenance completed', type: 'info' },
                  { time: '4 hours ago', event: 'New marketplace product featured', type: 'success' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' : 
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">{activity.event}</div>
                    <div className="text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueChart 
            data={revenueData}
            breakdown={[
              {
                source: 'Sessions',
                amount: revenueData.reduce((sum, item) => sum + item.sessionRevenue, 0),
                percentage: 75.2,
                growth: 12.8,
                transactions: totalSessions
              },
              {
                source: 'Marketplace',
                amount: revenueData.reduce((sum, item) => sum + item.marketplaceRevenue, 0),
                percentage: 18.5,
                growth: 25.4,
                transactions: 850
              },
              {
                source: 'Virtual Gifts',
                amount: revenueData.reduce((sum, item) => sum + item.giftRevenue, 0),
                percentage: 6.3,
                growth: 8.7,
                transactions: 320
              }
            ]}
            period={period}
            onPeriodChange={setPeriod}
          />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionAnalyticsChart
            data={sessionData}
            sessionTypes={[
              {
                type: 'VIDEO',
                count: sessionData.reduce((sum, item) => sum + item.videoSessions, 0),
                percentage: 51.4,
                averageDuration: 52,
                averageRating: 4.7,
                completionRate: 96.2,
                revenue: 45000
              },
              {
                type: 'VOICE',
                count: sessionData.reduce((sum, item) => sum + item.voiceSessions, 0),
                percentage: 34.7,
                averageDuration: 48,
                averageRating: 4.6,
                completionRate: 94.8,
                revenue: 32000
              },
              {
                type: 'CHAT',
                count: sessionData.reduce((sum, item) => sum + item.chatSessions, 0),
                percentage: 13.9,
                averageDuration: 35,
                averageRating: 4.5,
                completionRate: 92.1,
                revenue: 18000
              }
            ]}
            topReaders={[
              {
                readerId: '1',
                readerName: 'Sarah Wilson',
                username: 'sarahw',
                totalSessions: 156,
                averageRating: 4.9,
                averageDuration: 55,
                completionRate: 98.7,
                revenue: 7800,
                clientRetention: 89.2
              },
              // ... more readers
            ]}
            period={period}
            onPeriodChange={setPeriod}
          />
        </TabsContent>

        <TabsContent value="users">
          <UserEngagementChart
            data={userEngagementData}
            cohorts={[
              {
                cohort: 'Jan 2024',
                period0: 100,
                period1: 85.4,
                period2: 72.8,
                period3: 65.2,
                period4: 58.9,
                period5: 53.7,
                period6: 49.2
              },
              {
                cohort: 'Feb 2024',
                period0: 100,
                period1: 87.2,
                period2: 74.6,
                period3: 67.8,
                period4: 61.4,
                period5: 55.9,
                period6: 0
              },
              // ... more cohorts
            ]}
            segments={[
              {
                segment: 'Power Users',
                users: 850,
                percentage: 16.5,
                avgSessionDuration: 75,
                avgSessions: 12.4,
                revenue: 42000,
                retention: 94.2
              },
              {
                segment: 'Regular Users',
                users: 2100,
                percentage: 40.8,
                avgSessionDuration: 45,
                avgSessions: 6.8,
                revenue: 89000,
                retention: 78.5
              },
              {
                segment: 'Casual Users',
                users: 1800,
                percentage: 35.0,
                avgSessionDuration: 28,
                avgSessions: 2.3,
                revenue: 28000,
                retention: 45.7
              },
              {
                segment: 'New Users',
                users: 400,
                percentage: 7.7,
                avgSessionDuration: 15,
                avgSessions: 1.2,
                revenue: 5000,
                retention: 25.8
              }
            ]}
            period={period}
            onPeriodChange={setPeriod}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>
                  AI-powered analytics insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Revenue Growth</h4>
                      <p className="text-sm text-green-700">
                        Revenue is up 25% compared to last month, driven primarily by increased video session bookings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">User Engagement</h4>
                      <p className="text-sm text-blue-700">
                        Session duration has increased by 12% this month, indicating higher user satisfaction.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start space-x-3">
                    <BarChart3 className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900">Market Opportunity</h4>
                      <p className="text-sm text-orange-700">
                        Marketplace sales show 40% growth potential with improved product discovery features.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>
                  Data-driven recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Reduce Session Cancellations</h4>
                    <p className="text-sm text-muted-foreground">
                      Implement better reader-client matching to reduce the 5.8% cancellation rate.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Optimize Peak Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Increase reader availability during 7-9 PM when demand is highest.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Expand Marketplace</h4>
                    <p className="text-sm text-muted-foreground">
                      Focus on meditation and spiritual guidance products for maximum ROI.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}