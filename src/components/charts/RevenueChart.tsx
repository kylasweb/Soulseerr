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
  LineChart
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, DollarSign, Receipt, ShoppingBag, Wallet } from 'lucide-react'

interface RevenueData {
  date: string
  totalRevenue: number
  sessionRevenue: number
  marketplaceRevenue: number
  giftRevenue: number
  subscriptionRevenue: number
  platformFees: number
  readerPayouts: number
  netRevenue: number
  transactionCount: number
  averageOrderValue: number
}

interface RevenueBreakdown {
  source: string
  amount: number
  percentage: number
  growth: number
  transactions: number
}

interface RevenueChartProps {
  data: RevenueData[]
  breakdown: RevenueBreakdown[]
  period: 'day' | 'week' | 'month' | 'year'
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void
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

export function RevenueChart({ data, breakdown, period, onPeriodChange }: RevenueChartProps) {
  const currentPeriodTotal = data.reduce((sum, item) => sum + item.totalRevenue, 0)
  const currentPeriodNet = data.reduce((sum, item) => sum + item.netRevenue, 0)
  const currentPeriodTransactions = data.reduce((sum, item) => sum + item.transactionCount, 0)
  const averageOrderValue = currentPeriodTransactions > 0 ? currentPeriodTotal / currentPeriodTransactions : 0

  // Calculate growth (simplified - would compare with previous period in real implementation)
  const revenueGrowth = data.length > 1 ? 
    ((data[data.length - 1]?.totalRevenue || 0) - (data[0]?.totalRevenue || 0)) / (data[0]?.totalRevenue || 1) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentPeriodTotal)}</div>
            <div className={`text-xs flex items-center space-x-1 ${getGrowthColor(revenueGrowth)}`}>
              {getGrowthIcon(revenueGrowth)}
              <span>{formatPercentage(revenueGrowth)} from last {period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentPeriodNet)}</div>
            <div className="text-xs text-muted-foreground">
              {((currentPeriodNet / currentPeriodTotal) * 100).toFixed(1)}% margin
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPeriodTransactions.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              Total transactions this {period}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
            <div className="text-xs text-muted-foreground">
              Per transaction average
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Revenue Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>
              Detailed revenue breakdown and trends over time
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
              <TabsTrigger value="sources">Revenue Sources</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
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
                               period === 'month' ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) :
                               date.getFullYear().toString()
                      }}
                    />
                    <YAxis 
                      yAxisId="revenue"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatCurrency}
                    />
                    <YAxis 
                      yAxisId="count"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === 'transactionCount') {
                          return [value.toLocaleString(), 'Transactions']
                        }
                        return [formatCurrency(value), name]
                      }}
                    />
                    <Legend />
                    <Area 
                      yAxisId="revenue"
                      type="monotone" 
                      dataKey="totalRevenue" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                      name="Total Revenue"
                    />
                    <Area 
                      yAxisId="revenue"
                      type="monotone" 
                      dataKey="netRevenue" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.3}
                      name="Net Revenue"
                    />
                    <Line 
                      yAxisId="count"
                      type="monotone" 
                      dataKey="transactionCount" 
                      stroke="#ff7300"
                      name="Transactions"
                      dot={{ fill: '#ff7300', r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="sessionRevenue" 
                        stackId="1"
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        name="Sessions"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="marketplaceRevenue" 
                        stackId="1"
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        name="Marketplace"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="giftRevenue" 
                        stackId="1"
                        stroke="#ffc658" 
                        fill="#ffc658" 
                        name="Virtual Gifts"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="subscriptionRevenue" 
                        stackId="1"
                        stroke="#ff7300" 
                        fill="#ff7300" 
                        name="Subscriptions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  {breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.source}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.transactions.toLocaleString()} transactions
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatCurrency(item.amount)}</div>
                        <div className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                        <div className={`text-xs flex items-center justify-end space-x-1 ${getGrowthColor(item.growth)}`}>
                          {getGrowthIcon(item.growth)}
                          <span>{formatPercentage(item.growth)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="averageOrderValue" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8', r: 4 }}
                      name="Average Order Value"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="totalRevenue" fill="#8884d8" name="Total Revenue" />
                    <Bar dataKey="platformFees" fill="#82ca9d" name="Platform Fees" />
                    <Bar dataKey="readerPayouts" fill="#ffc658" name="Reader Payouts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}