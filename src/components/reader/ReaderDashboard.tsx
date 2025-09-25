import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  Star, 
  Users, 
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  MessageSquare,
  Phone,
  Video,
  ShoppingBag
} from 'lucide-react'
import { RevenueChart } from '../charts/RevenueChart'
import { SessionAnalyticsChart } from '../charts/SessionAnalyticsChart'

interface EarningsData {
  date: string
  sessionEarnings: number
  marketplaceEarnings: number
  giftEarnings: number
  totalEarnings: number
  sessionCount: number
  averageSessionRate: number
  platformFee: number
  netEarnings: number
}

interface SessionPerformance {
  totalSessions: number
  completedSessions: number
  cancelledSessions: number
  averageDuration: number
  averageRating: number
  completionRate: number
  ratingTrend: number
  clientRetentionRate: number
}

interface ClientInsights {
  totalClients: number
  newClients: number
  returningClients: number
  topSpendingClients: Array<{
    id: string
    name: string
    totalSpent: number
    sessions: number
    lastSession: string
  }>
  clientSatisfaction: number
}

interface MarketplacePerformance {
  totalProducts: number
  activeProducts: number
  totalSales: number
  revenue: number
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
    rating: number
  }>
}

interface ReaderDashboardProps {
  readerId: string
  readerName: string
  earnings: EarningsData[]
  sessions: SessionPerformance
  clients: ClientInsights
  marketplace: MarketplacePerformance
  period: 'week' | 'month' | 'quarter' | 'year'
  onPeriodChange: (period: 'week' | 'month' | 'quarter' | 'year') => void
}

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

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const getGrowthColor = (growth: number) => {
  if (growth > 0) return 'text-green-600'
  if (growth < 0) return 'text-red-600'
  return 'text-gray-500'
}

const getGrowthIcon = (growth: number) => {
  if (growth > 0) return <TrendingUp className="h-3 w-3" />
  if (growth < 0) return <TrendingDown className="h-3 w-3" />
  return null
}

const getPerformanceBadge = (rate: number): "default" | "secondary" | "destructive" | "outline" => {
  if (rate >= 95) return 'default'
  if (rate >= 85) return 'secondary'
  if (rate >= 70) return 'outline'
  return 'destructive'
}

export function ReaderDashboard({ 
  readerId, 
  readerName, 
  earnings, 
  sessions, 
  clients, 
  marketplace, 
  period, 
  onPeriodChange 
}: ReaderDashboardProps) {
  const totalEarnings = earnings.reduce((sum, item) => sum + item.totalEarnings, 0)
  const netEarnings = earnings.reduce((sum, item) => sum + item.netEarnings, 0)
  const platformFees = earnings.reduce((sum, item) => sum + item.platformFee, 0)
  const totalSessions = earnings.reduce((sum, item) => sum + item.sessionCount, 0)
  const avgEarningsPerSession = totalSessions > 0 ? totalEarnings / totalSessions : 0

  // Calculate growth (simplified - would compare with previous period in real implementation)
  const earningsGrowth = earnings.length > 1 ? 
    ((earnings[earnings.length - 1]?.totalEarnings || 0) - (earnings[0]?.totalEarnings || 0)) / (earnings[0]?.totalEarnings || 1) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {readerName}!</h1>
          <p className="text-muted-foreground">Here's your performance overview</p>
        </div>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <div className={`text-xs flex items-center space-x-1 ${getGrowthColor(earningsGrowth)}`}>
              {getGrowthIcon(earningsGrowth)}
              <span>{formatPercentage(earningsGrowth)} from last {period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.totalSessions.toLocaleString()}</div>
            <Badge variant={getPerformanceBadge(sessions.completionRate)}>
              {sessions.completionRate.toFixed(1)}% completion
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.averageRating.toFixed(2)}</div>
            <div className={`text-xs flex items-center space-x-1 ${getGrowthColor(sessions.ratingTrend)}`}>
              {getGrowthIcon(sessions.ratingTrend)}
              <span>{formatPercentage(sessions.ratingTrend)} trend</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.totalClients.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {clients.newClients} new this {period}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="earnings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-6">
          {/* Earnings Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(netEarnings)}</div>
                <div className="text-xs text-muted-foreground">
                  After platform fees
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(platformFees)}</div>
                <div className="text-xs text-muted-foreground">
                  {((platformFees / totalEarnings) * 100).toFixed(1)}% of gross
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Per Session</CardTitle>
                <Award className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(avgEarningsPerSession)}</div>
                <div className="text-xs text-muted-foreground">
                  Average earnings
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <RevenueChart 
            data={earnings.map(item => ({
              date: item.date,
              totalRevenue: item.totalEarnings,
              sessionRevenue: item.sessionEarnings,
              marketplaceRevenue: item.marketplaceEarnings,
              giftRevenue: item.giftEarnings,
              subscriptionRevenue: 0, // Placeholder
              platformFees: item.platformFee,
              readerPayouts: item.netEarnings,
              netRevenue: item.netEarnings,
              transactionCount: item.sessionCount,
              averageOrderValue: item.averageSessionRate
            }))}
            breakdown={[
              {
                source: 'Sessions',
                amount: earnings.reduce((sum, item) => sum + item.sessionEarnings, 0),
                percentage: (earnings.reduce((sum, item) => sum + item.sessionEarnings, 0) / totalEarnings) * 100,
                growth: 5.2,
                transactions: totalSessions
              },
              {
                source: 'Marketplace',
                amount: earnings.reduce((sum, item) => sum + item.marketplaceEarnings, 0),
                percentage: (earnings.reduce((sum, item) => sum + item.marketplaceEarnings, 0) / totalEarnings) * 100,
                growth: 12.8,
                transactions: marketplace.totalSales
              },
              {
                source: 'Virtual Gifts',
                amount: earnings.reduce((sum, item) => sum + item.giftEarnings, 0),
                percentage: (earnings.reduce((sum, item) => sum + item.giftEarnings, 0) / totalEarnings) * 100,
                growth: 8.4,
                transactions: 0
              }
            ]}
            period={period as any}
            onPeriodChange={() => {}}
          />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          {/* Session Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{sessions.completedSessions}</div>
                <div className="text-xs text-muted-foreground">
                  {sessions.completionRate.toFixed(1)}% completion rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <Calendar className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{sessions.cancelledSessions}</div>
                <div className="text-xs text-muted-foreground">
                  {((sessions.cancelledSessions / sessions.totalSessions) * 100).toFixed(1)}% cancellation rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatDuration(sessions.averageDuration)}</div>
                <div className="text-xs text-muted-foreground">
                  Per session average
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{sessions.clientRetentionRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">
                  Returning clients
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Analytics would go here - simplified for now */}
          <Card>
            <CardHeader>
              <CardTitle>Session Performance Trends</CardTitle>
              <CardDescription>
                Track your session metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Session analytics chart would be rendered here with session data over time
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          {/* Client Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.totalClients}</div>
                <div className="text-xs text-muted-foreground">
                  Lifetime clients served
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Clients</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{clients.newClients}</div>
                <div className="text-xs text-muted-foreground">
                  This {period}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Satisfaction</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{clients.clientSatisfaction.toFixed(1)}/5.0</div>
                <div className="text-xs text-muted-foreground">
                  Average rating from clients
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
              <CardDescription>
                Your highest value clients this {period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.topSpendingClients.map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Last session: {new Date(client.lastSession).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(client.totalSpent)}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.sessions} sessions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Marketplace Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <ShoppingBag className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketplace.activeProducts}</div>
                <div className="text-xs text-muted-foreground">
                  of {marketplace.totalProducts} total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{marketplace.totalSales}</div>
                <div className="text-xs text-muted-foreground">
                  Products sold
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(marketplace.revenue)}</div>
                <div className="text-xs text-muted-foreground">
                  Marketplace earnings
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg per Sale</CardTitle>
                <Award className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {marketplace.totalSales > 0 ? formatCurrency(marketplace.revenue / marketplace.totalSales) : '$0'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Average revenue per sale
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>
                Your best performing products this {period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketplace.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3" />
                          <span>{product.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(product.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.sales} sales
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}