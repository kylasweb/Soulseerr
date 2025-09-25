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
  MessageSquare, 
  Users, 
  TrendingUp, 
  Wallet,
  Star,
  Clock,
  Video,
  Phone,
  MessageCircle,
  Plus,
  ArrowRight,
  Gift,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

interface WalletData {
  wallet: {
    balance: number
  }
  transactions: any[]
}

interface SessionData {
  sessions: any[]
  pagination: {
    total: number
    hasMore: boolean
  }
}

interface ReaderData {
  readers: any[]
  pagination: {
    total: number
    hasMore: boolean
  }
}

export default function ClientDashboard() {
  const { user, loading } = useAuth()
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [featuredReaders, setFeaturedReaders] = useState<ReaderData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (user && !loading) {
      loadDashboardData()
    }
  }, [user, loading])

  const loadDashboardData = async () => {
    try {
      setDataLoading(true)
      
      const [walletResponse, sessionsResponse, readersResponse] = await Promise.all([
        axios.get('/api/wallet'),
        axios.get('/api/sessions?limit=5'),
        axios.get('/api/readers?limit=6&isOnline=true')
      ])

      setWalletData(walletResponse.data)
      setSessionData(sessionsResponse.data)
      setFeaturedReaders(readersResponse.data)
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />
      case 'CALL':
        return <Phone className="h-4 w-4" />
      case 'CHAT':
        return <MessageCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
    <RoleGuard allowedRoles={['CLIENT']}>
      <MainLayout>
        <div className="container mx-auto px-6 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Seeker'}! ✨
            </h1>
            <p className="text-gray-600 mt-2">
              Your spiritual journey continues here. Connect with readers and explore your path.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${walletData?.wallet?.balance?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available for sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sessionData?.sessions?.filter(s => s.status === 'CONFIRMED' || s.status === 'IN_PROGRESS').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upcoming & in progress
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
                  {sessionData?.pagination?.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All-time sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Readers Online</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {featuredReaders?.readers?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available now
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
                        Your latest spiritual consultations
                      </CardDescription>
                    </div>
                    <Link href="/sessions">
                      <Button variant="outline" size="sm">
                        View All
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {sessionData?.sessions?.length ? (
                    <div className="space-y-4">
                      {sessionData.sessions.slice(0, 5).map((session: any) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {getSessionTypeIcon(session.sessionType)}
                              <span className="font-medium">
                                {session.reader?.readerProfile?.firstName} {session.reader?.readerProfile?.lastName}
                              </span>
                            </div>
                            <Badge className={getStatusColor(session.status)}>
                              {session.status.toLowerCase()}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${session.cost}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
                      <p className="text-gray-500 mb-4">
                        Start your spiritual journey by booking a session with one of our readers.
                      </p>
                      <Link href="/readers">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Book Your First Session
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Featured Readers */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Featured Readers
                  </CardTitle>
                  <CardDescription>
                    Top-rated readers available now
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {featuredReaders?.readers?.length ? (
                    <div className="space-y-4">
                      {featuredReaders.readers.slice(0, 3).map((reader: any) => (
                        <div key={reader.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={reader.readerProfile?.avatar} />
                            <AvatarFallback>
                              {reader.readerProfile?.firstName?.[0]}{reader.readerProfile?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">
                              {reader.readerProfile?.firstName} {reader.readerProfile?.lastName}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {reader.readerProfile?.averageRating?.toFixed(1) || '5.0'}
                              </div>
                              <span>•</span>
                              <span>${reader.readerProfile?.hourlyRate || 60}/hr</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {reader.readerProfile?.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                      <Link href="/readers">
                        <Button variant="outline" className="w-full">
                          Browse All Readers
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No readers online right now</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/wallet" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Wallet className="h-4 w-4 mr-2" />
                      Add Funds to Wallet
                    </Button>
                  </Link>
                  <Link href="/readers" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Browse Readers
                    </Button>
                  </Link>
                  <Link href="/sessions/book" className="block">
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Book a Session
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