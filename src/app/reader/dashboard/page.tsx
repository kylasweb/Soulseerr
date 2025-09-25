'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/EnhancedAuthProvider'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DollarSign,
  Calendar, 
  MessageSquare, 
  Star,
  Clock,
  Video,
  Phone,
  MessageCircle,
  Settings,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface ReaderStats {
  totalEarnings: number
  pendingEarnings: number
  totalSessions: number
  averageRating: number
  completionRate: number
}

export default function ReaderDashboard() {
  const { user, loading } = useAuth()
  const [isOnline, setIsOnline] = useState(false)
  const [stats, setStats] = useState<ReaderStats>({
    totalEarnings: 0,
    pendingEarnings: 0,
    totalSessions: 0,
    averageRating: 0,
    completionRate: 0
  })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (user && !loading) {
      loadDashboardData()
    }
  }, [user, loading])

  const loadDashboardData = async () => {
    // TODO: Replace with actual API calls
    setStats({
      totalEarnings: 0,
      pendingEarnings: 0,
      totalSessions: 0,
      averageRating: 0,
      completionRate: 0
    })
    setDataLoading(false)
  }

  const toggleOnlineStatus = (online: boolean) => {
    setIsOnline(online)
  }

  if (loading || dataLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading your dashboard...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <RoleGuard allowedRoles={['READER']}>
      <MainLayout>
        <div className="container mx-auto px-6 py-8">
          {/* Welcome Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, Reader! 🔮
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your sessions and help seekers on their spiritual journey.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Available</span>
                <Switch
                  checked={isOnline}
                  onCheckedChange={toggleOnlineStatus}
                />
                {isOnline && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalEarnings.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All-time earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.pendingEarnings.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From active sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalSessions}
                </div>
                <p className="text-xs text-muted-foreground">
                  All sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                  {stats.averageRating > 0 && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 ml-1" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average rating
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.completionRate.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Sessions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Recent Sessions
                      </CardTitle>
                      <CardDescription>
                        Your latest client consultations
                      </CardDescription>
                    </div>
                    <Link href="/sessions">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent sessions</h3>
                    <p className="text-gray-500 mb-4">
                      Turn on your availability to start receiving session requests from clients.
                    </p>
                    <Button onClick={() => toggleOnlineStatus(true)} disabled={isOnline}>
                      {isOnline ? 'Already Available' : 'Go Online'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile & Settings */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Profile & Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {(user?.name || 'Reader')[0]?.toUpperCase() || 'R'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user?.name || 'Reader'}
                      </div>
                      <div className="text-sm text-gray-500">
                        $60/hour
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link href="/reader/profile">
                      <Button variant="outline" className="w-full justify-start">
                        <Eye className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link href="/reader/schedule">
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Manage Schedule
                      </Button>
                    </Link>
                    <Link href="/reader/earnings">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Earnings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>This Month</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sessions</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Earnings</span>
                    <span className="font-medium">$320.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Rating</span>
                    <span className="font-medium flex items-center">
                      4.8 <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  )
}