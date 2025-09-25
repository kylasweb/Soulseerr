'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/EnhancedAuthProvider'
import { EnhancedAnalyticsDashboard } from '@/components/admin/EnhancedAnalyticsDashboard'
import { ReaderDashboard } from '@/components/reader/ReaderDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Shield, 
  User,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalSessions: number
    totalUsers: number
    activeUsers: number
    revenueGrowth: number
    sessionGrowth: number
    userGrowth: number
  }
  earnings?: {
    date: string
    sessionEarnings: number
    marketplaceEarnings: number
    giftEarnings: number
    totalEarnings: number
    sessionCount: number
    averageSessionRate: number
    platformFee: number
    netEarnings: number
  }[]
  sessions?: {
    totalSessions: number
    completedSessions: number
    cancelledSessions: number
    averageDuration: number
    averageRating: number
    completionRate: number
    ratingTrend: number
    clientRetentionRate: number
  }
  clients?: {
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
  marketplace?: {
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
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchAnalyticsData()
  }, [period, user])

  const fetchAnalyticsData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Construct query parameters
      const params = new URLSearchParams({
        period,
        granularity: period === 'week' ? 'day' : period === 'month' ? 'day' : 'week'
      })

      // Add reader-specific parameter if user is a reader
      if (user.role === 'reader') {
        params.append('readerId', user.id)
      }

      const response = await fetch(`/api/analytics?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const data = await response.json()
      
      // Transform API data to match component expectations
      const transformedData: AnalyticsData = {
        overview: {
          totalRevenue: data.revenue?.statistics?.totalRevenue || 0,
          totalSessions: data.sessions?.statistics?.totalSessions || 0,
          totalUsers: data.sessions?.statistics?.uniqueClients || 0,
          activeUsers: data.sessions?.statistics?.uniqueClients || 0,
          revenueGrowth: 12.5, // Would be calculated from actual data
          sessionGrowth: 8.3,
          userGrowth: 15.2
        }
      }

      // Add reader-specific data if applicable
      if (user.role === 'reader') {
        transformedData.earnings = data.sessions?.timeSeries?.map((item: any) => ({
          date: item.date,
          sessionEarnings: item.revenue * 0.8, // Assuming 80% goes to reader
          marketplaceEarnings: item.marketplaceRevenue || 0,
          giftEarnings: item.giftRevenue || 0,
          totalEarnings: item.revenue * 0.8 + (item.marketplaceRevenue || 0) + (item.giftRevenue || 0),
          sessionCount: item.sessions,
          averageSessionRate: item.sessions > 0 ? item.revenue / item.sessions : 0,
          platformFee: item.revenue * 0.2,
          netEarnings: item.revenue * 0.8
        })) || []

        transformedData.sessions = {
          totalSessions: data.sessions?.statistics?.totalSessions || 0,
          completedSessions: data.sessions?.statistics?.completedSessions || 0,
          cancelledSessions: data.sessions?.statistics?.cancelledSessions || 0,
          averageDuration: data.sessions?.statistics?.averageDuration || 0,
          averageRating: data.reviews?.averageRating || 0,
          completionRate: data.sessions?.statistics?.completionRate || 0,
          ratingTrend: 2.1, // Would be calculated from historical data
          clientRetentionRate: 75.8
        }

        transformedData.clients = {
          totalClients: data.sessions?.statistics?.uniqueClients || 0,
          newClients: Math.floor((data.sessions?.statistics?.uniqueClients || 0) * 0.3),
          returningClients: Math.floor((data.sessions?.statistics?.uniqueClients || 0) * 0.7),
          topSpendingClients: [],
          clientSatisfaction: data.reviews?.averageRating || 0
        }

        transformedData.marketplace = {
          totalProducts: 0,
          activeProducts: 0,
          totalSales: 0,
          revenue: 0,
          topProducts: []
        }
      }

      setAnalyticsData(transformedData)
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>Error Loading Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAnalyticsData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You must be logged in to view analytics.
            </p>
            <Button onClick={() => window.location.href = '/login'} className="w-full mt-4">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show appropriate dashboard based on user role
  if (user.role === 'admin') {
    return (
      <div className="container mx-auto p-6">
        <EnhancedAnalyticsDashboard user={{ role: user.role, name: user.name || 'Admin' }} />
      </div>
    )
  }

  if (user.role === 'reader' && analyticsData) {
    return (
      <div className="container mx-auto p-6">
        <ReaderDashboard
          readerId={user.id}
          readerName={user.name || 'Reader'}
          earnings={analyticsData.earnings || []}
          sessions={analyticsData.sessions || {
            totalSessions: 0,
            completedSessions: 0,
            cancelledSessions: 0,
            averageDuration: 0,
            averageRating: 0,
            completionRate: 0,
            ratingTrend: 0,
            clientRetentionRate: 0
          }}
          clients={analyticsData.clients || {
            totalClients: 0,
            newClients: 0,
            returningClients: 0,
            topSpendingClients: [],
            clientSatisfaction: 0
          }}
          marketplace={analyticsData.marketplace || {
            totalProducts: 0,
            activeProducts: 0,
            totalSales: 0,
            revenue: 0,
            topProducts: []
          }}
          period={period}
          onPeriodChange={setPeriod}
        />
      </div>
    )
  }

  // Client role - simplified analytics
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Your SoulSeer Journey</h1>
          <p className="text-muted-foreground">
            Track your spiritual growth and session insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Readers</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Regular connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$480</div>
              <p className="text-xs text-muted-foreground">Lifetime investment</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>
              Your recent spiritual guidance sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your session history and insights will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}