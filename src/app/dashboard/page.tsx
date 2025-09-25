'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/EnhancedAuthProvider'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Sparkles, 
  Calendar, 
  Users, 
  Wallet,
  Star,
  Clock,
  Video,
  Phone,
  MessageCircle,
  Plus,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
  id: string
  description: string
  timestamp: Date
  amount: number
}

export default function ClientDashboard() {
  const { user, loading } = useAuth()
  const [walletBalance, setWalletBalance] = useState(0)
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    // Load dashboard data when user is available
    if (user && !loading) {
      loadDashboardData()
    }
  }, [user, loading])

  const loadDashboardData = async () => {
    // TODO: Replace with actual API calls
    setWalletBalance(0)
    setUpcomingSessions([])
    setRecentActivity([])
  }

  const getDisplayName = () => {
    return user?.name || user?.email?.split('@')[0] || 'User'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatRelativeTime = (date: Date) => {
    const now = Date.now()
    const diffMs = date.getTime() - now
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    
    if (diffHours < -24) {
      return `${Math.abs(Math.round(diffHours / 24))} days ago`
    } else if (diffHours < 0) {
      return `${Math.abs(diffHours)} hours ago`
    } else {
      return `in ${diffHours} hours`
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mystical-pink"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <RoleGuard allowedRoles={['CLIENT']}>
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-alex text-4xl md:text-5xl font-bold text-transparent mystical-text-gradient mb-2">
              Welcome back, {getDisplayName()}!
            </h1>
            <p className="font-playfair text-lg text-gray-300">
              Your spiritual journey continues here
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="mystical-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Wallet Balance</CardTitle>
                <Wallet className="h-4 w-4 text-mystical-pink" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(walletBalance)}</div>
                <p className="text-xs text-gray-400">
                  <Link href="/wallet/add-funds" className="text-mystical-pink hover:underline">
                    Add funds
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card className="mystical-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Upcoming Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-mystical-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{upcomingSessions.length}</div>
                <p className="text-xs text-gray-400">
                  <Link href="/sessions" className="text-mystical-pink hover:underline">
                    View all
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card className="mystical-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Sessions</CardTitle>
                <Star className="h-4 w-4 text-mystical-pink" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">0</div>
                <p className="text-xs text-gray-400">
                  <Link href="/sessions/history" className="text-mystical-pink hover:underline">
                    View history
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card className="mystical-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Community Points</CardTitle>
                <Sparkles className="h-4 w-4 text-mystical-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">0</div>
                <p className="text-xs text-gray-400">
                  <Link href="/community" className="text-mystical-pink hover:underline">
                    Earn more
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Sessions */}
            <div className="lg:col-span-2">
              <Card className="mystical-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Upcoming Sessions</CardTitle>
                      <CardDescription className="text-gray-400">
                        Your scheduled spiritual consultations
                      </CardDescription>
                    </div>
                    <Link href="/sessions/book">
                      <Button className="mystical-button" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Upcoming Sessions</h3>
                    <p className="text-gray-400 mb-4">Book your first spiritual consultation</p>
                    <Link href="/sessions/book">
                      <Button className="mystical-button">
                        <Plus className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="mystical-card">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/sessions/book">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Book Session
                    </Button>
                  </Link>
                  <Link href="/readers">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Find Readers
                    </Button>
                  </Link>
                  <Link href="/community/streams">
                    <Button variant="outline" className="w-full justify-start">
                      <Video className="w-4 h-4 mr-2" />
                      Live Streams
                    </Button>
                  </Link>
                  <Link href="/wallet/add-funds">
                    <Button variant="outline" className="w-full justify-start">
                      <Wallet className="w-4 h-4 mr-2" />
                      Add Funds
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="mystical-card">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.length > 0 ? recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-mystical-pink rounded-full"></div>
                          <span className="text-gray-300">{activity.description}</span>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            activity.amount > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatRelativeTime(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-gray-400">
                        No recent activity
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Featured Readers */}
              <Card className="mystical-card">
                <CardHeader>
                  <CardTitle className="text-white">Featured Readers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-mystical-pink text-white">
                          ML
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">Mystic Luna</h4>
                        <p className="text-xs text-gray-400">Tarot • Astrology</p>
                      </div>
                      <Badge variant="secondary">4.9★</Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-mystical-gold text-white">
                          SC
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">Star Child</h4>
                        <p className="text-xs text-gray-400">Medium • Healing</p>
                      </div>
                      <Badge variant="secondary">4.8★</Badge>
                    </div>
                  </div>
                  <Link href="/readers">
                    <Button variant="outline" className="w-full mt-4" size="sm">
                      View All Readers
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  )
}