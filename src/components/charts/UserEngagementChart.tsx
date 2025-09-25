import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Calendar,
  RefreshCw,
  Target
} from 'lucide-react'

interface UserEngagementData {
  date: string
  totalUsers: number
  activeUsers: number
  newUsers: number
  returningUsers: number
  churned: number
  sessionDuration: number
  pageViews: number
  bounceRate: number
  conversionRate: number
  retentionRate: number
}

interface CohortData {
  cohort: string
  period0: number
  period1: number
  period2: number
  period3: number
  period4: number
  period5: number
  period6: number
}

interface SegmentData {
  segment: string
  users: number
  percentage: number
  avgSessionDuration: number
  avgSessions: number
  revenue: number
  retention: number
}

interface UserEngagementProps {
  data: UserEngagementData[]
  cohorts: CohortData[]
  segments: SegmentData[]
  period: 'day' | 'week' | 'month' | 'year'
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void
}

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const getRetentionColor = (rate: number) => {
  if (rate >= 80) return '#22c55e'
  if (rate >= 60) return '#eab308'
  if (rate >= 40) return '#f97316'
  return '#ef4444'
}

const SEGMENT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f']

export function UserEngagementChart({ data, cohorts, segments, period, onPeriodChange }: UserEngagementProps) {
  const totalUsers = data[data.length - 1]?.totalUsers || 0
  const activeUsers = data[data.length - 1]?.activeUsers || 0
  const newUsers = data.reduce((sum, item) => sum + item.newUsers, 0)
  const avgSessionDuration = data.reduce((sum, item) => sum + item.sessionDuration, 0) / data.length || 0
  const avgRetention = data.reduce((sum, item) => sum + item.retentionRate, 0) / data.length || 0
  const avgConversion = data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length || 0

  // Calculate growth metrics
  const userGrowth = data.length > 1 ? 
    ((data[data.length - 1]?.totalUsers || 0) - (data[0]?.totalUsers || 0)) / (data[0]?.totalUsers || 1) * 100 : 0
  
  const engagementGrowth = data.length > 1 ?
    ((data[data.length - 1]?.activeUsers || 0) - (data[0]?.activeUsers || 0)) / (data[0]?.activeUsers || 1) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Engagement Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <div className={`text-xs flex items-center space-x-1 ${userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {userGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{userGrowth >= 0 ? '+' : ''}{userGrowth.toFixed(1)}% growth</span>
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
              {totalUsers > 0 ? formatPercentage((activeUsers / totalUsers) * 100) : '0%'} of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(avgSessionDuration)}</div>
            <div className="text-xs text-muted-foreground">
              Per active session
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(avgRetention)}</div>
            <div className="text-xs text-muted-foreground">
              Monthly retention avg
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Engagement Analytics</CardTitle>
                <CardDescription>
                  Track user behavior and engagement patterns
                </CardDescription>
              </div>
              <Select value={period} onValueChange={onPeriodChange}>
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
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
                  <TabsTrigger value="behavior">Behavior</TabsTrigger>
                  <TabsTrigger value="retention">Retention</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return period === 'day' ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                                   period === 'week' ? `Week ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` :
                                   date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                          }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="totalUsers" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.3}
                          name="Total Users"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="activeUsers" 
                          stroke="#82ca9d" 
                          fill="#82ca9d" 
                          fillOpacity={0.3}
                          name="Active Users"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="acquisition" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="newUsers" fill="#8884d8" name="New Users" />
                        <Bar dataKey="returningUsers" fill="#82ca9d" name="Returning Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="behavior" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis 
                          yAxisId="duration"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}m`}
                        />
                        <YAxis 
                          yAxisId="rate"
                          orientation="right"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value: any, name: string) => {
                            if (name === 'sessionDuration') {
                              return [formatDuration(value), 'Avg Session Duration']
                            }
                            if (name === 'bounceRate' || name === 'conversionRate') {
                              return [formatPercentage(value), name]
                            }
                            return [value, name]
                          }}
                        />
                        <Legend />
                        <Line 
                          yAxisId="duration"
                          type="monotone" 
                          dataKey="sessionDuration" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          name="Session Duration"
                        />
                        <Line 
                          yAxisId="rate"
                          type="monotone" 
                          dataKey="bounceRate" 
                          stroke="#ff7300" 
                          strokeWidth={2}
                          name="Bounce Rate"
                        />
                        <Line 
                          yAxisId="rate"
                          type="monotone" 
                          dataKey="conversionRate" 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          name="Conversion Rate"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="retention" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis 
                          domain={[0, 100]}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip formatter={(value) => [formatPercentage(value as number), 'Retention Rate']} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="retentionRate" 
                          stroke="#8884d8" 
                          strokeWidth={3}
                          dot={{ fill: '#8884d8', r: 5 }}
                          name="Retention Rate"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* User Segments */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Segments</CardTitle>
              <CardDescription>
                User distribution by behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segments}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="users"
                      nameKey="segment"
                    >
                      {segments.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segment Performance</CardTitle>
              <CardDescription>
                Key metrics by user segment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {segments.map((segment, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{segment.segment}</span>
                    <Badge variant="outline">
                      {segment.users.toLocaleString()} users
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Avg Duration: {formatDuration(segment.avgSessionDuration)}</span>
                    <span>Retention: {formatPercentage(segment.retention)}</span>
                    <span>Sessions: {segment.avgSessions.toFixed(1)}</span>
                    <span>Revenue: ${segment.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${segment.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
          <CardDescription>
            User retention by acquisition cohort over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cohort</th>
                  <th className="text-center p-2">0 weeks</th>
                  <th className="text-center p-2">1 week</th>
                  <th className="text-center p-2">2 weeks</th>
                  <th className="text-center p-2">3 weeks</th>
                  <th className="text-center p-2">4 weeks</th>
                  <th className="text-center p-2">5 weeks</th>
                  <th className="text-center p-2">6 weeks</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{cohort.cohort}</td>
                    <td className="text-center p-2">
                      <div 
                        className="inline-flex items-center justify-center w-12 h-8 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: getRetentionColor(100) }}
                      >
                        100%
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div 
                        className="inline-flex items-center justify-center w-12 h-8 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: getRetentionColor(cohort.period1) }}
                      >
                        {formatPercentage(cohort.period1)}
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div 
                        className="inline-flex items-center justify-center w-12 h-8 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: getRetentionColor(cohort.period2) }}
                      >
                        {formatPercentage(cohort.period2)}
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div 
                        className="inline-flex items-center justify-center w-12 h-8 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: getRetentionColor(cohort.period3) }}
                      >
                        {formatPercentage(cohort.period3)}
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div 
                        className="inline-flex items-center justify-center w-12 h-8 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: getRetentionColor(cohort.period4) }}
                      >
                        {formatPercentage(cohort.period4)}
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div 
                        className="inline-flex items-center justify-center w-12 h-8 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: getRetentionColor(cohort.period5) }}
                      >
                        {formatPercentage(cohort.period5)}
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div 
                        className="inline-flex items-center justify-center w-12 h-8 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: getRetentionColor(cohort.period6) }}
                      >
                        {formatPercentage(cohort.period6)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newUsers.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              New users this {period}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(avgConversion)}</div>
            <div className="text-xs text-muted-foreground">
              Conversion to active users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(100 - avgRetention)}</div>
            <div className="text-xs text-muted-foreground">
              Users lost per month
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}