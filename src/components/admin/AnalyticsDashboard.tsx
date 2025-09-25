import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Clock,
  Star,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface AnalyticsDashboardProps {
  data: {
    overview: {
      totalUsers: number
      totalSessions: number
      totalRevenue: number
      averageRating: number
      userGrowth: number
      sessionGrowth: number
      revenueGrowth: number
      ratingChange: number
    }
    timeSeries: Array<{
      date: string
      users: number
      sessions: number
      revenue: number
      rating: number
    }>
    sessionsByType: Array<{
      type: string
      count: number
      revenue: number
      percentage: number
    }>
    usersByRole: Array<{
      role: string
      count: number
      percentage: number
    }>
    topReaders: Array<{
      id: string
      name: string
      username: string
      sessions: number
      revenue: number
      rating: number
    }>
    revenueBreakdown: Array<{
      category: string
      amount: number
      percentage: number
    }>
  }
  dateRange: {
    startDate: Date
    endDate: Date
    period: 'day' | 'week' | 'month'
  }
  onDateRangeChange: (range: { startDate: Date; endDate: Date; period: 'day' | 'week' | 'month' }) => void
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AnalyticsDashboard({ data, dateRange, onDateRangeChange }: AnalyticsDashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />
    } else if (growth < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />
    }
    return null
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Date Range Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Select 
            value={dateRange.period} 
            onValueChange={(period: any) => onDateRangeChange({...dateRange, period})}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            Custom Range
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalUsers)}</div>
            <div className={`text-xs flex items-center space-x-1 ${getGrowthColor(data.overview.userGrowth)}`}>
              {getGrowthIcon(data.overview.userGrowth)}
              <span>{formatPercentage(data.overview.userGrowth)} from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalSessions)}</div>
            <div className={`text-xs flex items-center space-x-1 ${getGrowthColor(data.overview.sessionGrowth)}`}>
              {getGrowthIcon(data.overview.sessionGrowth)}
              <span>{formatPercentage(data.overview.sessionGrowth)} from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</div>
            <div className={`text-xs flex items-center space-x-1 ${getGrowthColor(data.overview.revenueGrowth)}`}>
              {getGrowthIcon(data.overview.revenueGrowth)}
              <span>{formatPercentage(data.overview.revenueGrowth)} from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.averageRating.toFixed(2)}</div>
            <div className={`text-xs flex items-center space-x-1 ${getGrowthColor(data.overview.ratingChange)}`}>
              {getGrowthIcon(data.overview.ratingChange)}
              <span>{formatPercentage(data.overview.ratingChange)} from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>
              Track key metrics across the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="rating">Rating</TabsTrigger>
              </TabsList>
              
              <TabsContent value="revenue" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={formatCurrency} />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="sessions" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#ffc658" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="rating" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip formatter={(value) => [Number(value).toFixed(2), 'Rating']} />
                      <Line type="monotone" dataKey="rating" stroke="#ff7300" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Session Types</CardTitle>
            <CardDescription>
              Distribution of session types by count and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sessionsByType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ type, percentage }) => `${type} (${percentage}%)`}
                  >
                    {data.sessionsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Roles Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>
              Distribution of users by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.usersByRole}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#82ca9d"
                    label={({ role, percentage }) => `${role} (${percentage}%)`}
                  >
                    {data.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers and Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Readers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Readers</CardTitle>
            <CardDescription>
              Readers with highest revenue in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topReaders.map((reader, index) => (
                <div key={reader.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{reader.name}</div>
                      <div className="text-sm text-muted-foreground">@{reader.username}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(reader.revenue)}</div>
                    <div className="text-sm text-muted-foreground">
                      {reader.sessions} sessions • ⭐ {reader.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>
              Revenue distribution by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.revenueBreakdown.map((item, index) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.category}</span>
                    <span className="font-medium">
                      {formatCurrency(item.amount)} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42m</div>
            <p className="text-xs text-muted-foreground">
              +5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Completion Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +1.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.overview.totalRevenue / data.overview.totalUsers)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8.1% from last period
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}