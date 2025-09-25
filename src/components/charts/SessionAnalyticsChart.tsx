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
  ComposedChart,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Star,
  TrendingUp,
  TrendingDown,
  Video,
  Phone,
  MessageCircle
} from 'lucide-react'

interface SessionData {
  date: string
  totalSessions: number
  completedSessions: number
  cancelledSessions: number
  averageDuration: number // in minutes
  averageRating: number
  videoSessions: number
  voiceSessions: number
  chatSessions: number
  newClientSessions: number
  returningClientSessions: number
  peakHourSessions: number
  offPeakSessions: number
}

interface SessionTypeBreakdown {
  type: 'VIDEO' | 'VOICE' | 'CHAT'
  count: number
  percentage: number
  averageDuration: number
  averageRating: number
  completionRate: number
  revenue: number
}

interface ReaderPerformance {
  readerId: string
  readerName: string
  username: string
  totalSessions: number
  averageRating: number
  averageDuration: number
  completionRate: number
  revenue: number
  clientRetention: number
}

interface SessionAnalyticsProps {
  data: SessionData[]
  sessionTypes: SessionTypeBreakdown[]
  topReaders: ReaderPerformance[]
  period: 'day' | 'week' | 'month' | 'year'
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

const getStatusColor = (rate: number) => {
  if (rate >= 90) return 'text-green-600'
  if (rate >= 75) return 'text-yellow-600'
  return 'text-red-600'
}

const getStatusBadgeVariant = (rate: number): "default" | "secondary" | "destructive" | "outline" => {
  if (rate >= 90) return 'default'
  if (rate >= 75) return 'secondary'
  return 'destructive'
}

const SESSION_TYPE_COLORS = {
  VIDEO: '#8884d8',
  VOICE: '#82ca9d',
  CHAT: '#ffc658'
}

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function SessionAnalyticsChart({ data, sessionTypes, topReaders, period, onPeriodChange }: SessionAnalyticsProps) {
  const totalSessions = data.reduce((sum, item) => sum + item.totalSessions, 0)
  const completedSessions = data.reduce((sum, item) => sum + item.completedSessions, 0)
  const cancelledSessions = data.reduce((sum, item) => sum + item.cancelledSessions, 0)
  const avgDuration = data.reduce((sum, item) => sum + item.averageDuration, 0) / data.length || 0
  const avgRating = data.reduce((sum, item) => sum + item.averageRating, 0) / data.length || 0
  
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
  const cancellationRate = totalSessions > 0 ? (cancelledSessions / totalSessions) * 100 : 0

  // Calculate growth (simplified - would compare with previous period in real implementation)
  const sessionGrowth = data.length > 1 ? 
    ((data[data.length - 1]?.totalSessions || 0) - (data[0]?.totalSessions || 0)) / (data[0]?.totalSessions || 1) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Session Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions.toLocaleString()}</div>
            <div className={`text-xs flex items-center space-x-1 ${sessionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {sessionGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{sessionGrowth >= 0 ? '+' : ''}{sessionGrowth.toFixed(1)}% from last {period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(completionRate)}</div>
            <div className="text-xs text-muted-foreground">
              {completedSessions.toLocaleString()} completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(avgDuration)}</div>
            <div className="text-xs text-muted-foreground">
              Per session average
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Out of 5.0 stars
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
                <CardTitle>Session Analytics</CardTitle>
                <CardDescription>
                  Comprehensive session metrics and trends
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
              <Tabs defaultValue="volume" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="volume">Volume</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                  <TabsTrigger value="types">Types</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="volume" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data}>
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
                        <YAxis 
                          yAxisId="sessions"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          yAxisId="duration"
                          orientation="right"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}m`}
                        />
                        <Tooltip 
                          formatter={(value: any, name: string) => {
                            if (name === 'averageDuration') {
                              return [formatDuration(value), 'Avg Duration']
                            }
                            return [value, name]
                          }}
                        />
                        <Legend />
                        <Bar 
                          yAxisId="sessions"
                          dataKey="completedSessions" 
                          fill="#82ca9d" 
                          name="Completed Sessions"
                        />
                        <Bar 
                          yAxisId="sessions"
                          dataKey="cancelledSessions" 
                          fill="#ff7300" 
                          name="Cancelled Sessions"
                        />
                        <Line 
                          yAxisId="duration"
                          type="monotone" 
                          dataKey="averageDuration" 
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ fill: '#8884d8', r: 4 }}
                          name="Avg Duration (min)"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis 
                          domain={[0, 5]}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value) => [parseFloat(value as string).toFixed(2), 'Average Rating']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="averageRating" 
                          stroke="#8884d8" 
                          strokeWidth={3}
                          dot={{ fill: '#8884d8', r: 5 }}
                          name="Average Rating"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="types" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="videoSessions" 
                          stackId="1"
                          stroke={SESSION_TYPE_COLORS.VIDEO} 
                          fill={SESSION_TYPE_COLORS.VIDEO}
                          name="Video Sessions"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="voiceSessions" 
                          stackId="1"
                          stroke={SESSION_TYPE_COLORS.VOICE} 
                          fill={SESSION_TYPE_COLORS.VOICE}
                          name="Voice Sessions"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="chatSessions" 
                          stackId="1"
                          stroke={SESSION_TYPE_COLORS.CHAT} 
                          fill={SESSION_TYPE_COLORS.CHAT}
                          name="Chat Sessions"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="newClientSessions" fill="#8884d8" name="New Clients" />
                        <Bar dataKey="returningClientSessions" fill="#82ca9d" name="Returning Clients" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Session Type Breakdown */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Types</CardTitle>
              <CardDescription>
                Breakdown by communication type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sessionTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="type"
                    >
                      {sessionTypes.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={SESSION_TYPE_COLORS[entry.type as keyof typeof SESSION_TYPE_COLORS]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, `${name} Sessions`]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Type Performance</CardTitle>
              <CardDescription>
                Quality metrics by session type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionTypes.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {type.type === 'VIDEO' && <Video className="h-4 w-4 text-blue-500" />}
                      {type.type === 'VOICE' && <Phone className="h-4 w-4 text-green-500" />}
                      {type.type === 'CHAT' && <MessageCircle className="h-4 w-4 text-orange-500" />}
                      <span className="text-sm font-medium">{type.type}</span>
                    </div>
                    <Badge variant={getStatusBadgeVariant(type.completionRate)}>
                      {formatPercentage(type.completionRate)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Avg Duration: {formatDuration(type.averageDuration)}</span>
                    <span>Avg Rating: {type.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Readers Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Reader Performance</CardTitle>
          <CardDescription>
            Performance metrics for highest performing readers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topReaders.map((reader, index) => (
              <div key={reader.readerId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                  <div>
                    <div className="font-medium">{reader.readerName}</div>
                    <div className="text-sm text-muted-foreground">@{reader.username}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{reader.totalSessions}</div>
                    <div className="text-muted-foreground">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{reader.averageRating.toFixed(1)}</div>
                    <div className="text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatDuration(reader.averageDuration)}</div>
                    <div className="text-muted-foreground">Avg Duration</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${getStatusColor(reader.completionRate)}`}>
                      {formatPercentage(reader.completionRate)}
                    </div>
                    <div className="text-muted-foreground">Completion</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">${reader.revenue.toLocaleString()}</div>
                    <div className="text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}