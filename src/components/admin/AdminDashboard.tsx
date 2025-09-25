import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Bell,
  ShoppingBag,
  Shield,
  Database,
  Activity,
  AlertTriangle
} from 'lucide-react'
import { UserManagement } from './UserManagement'
import { SessionManagement } from './SessionManagement'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { LandingPageCustomizer } from './LandingPageCustomizer'
import { SiteCustomizer } from './SiteCustomizer'

interface AdminDashboardProps {
  user: {
    id: string
    username: string
    role: 'ADMIN'
  }
}

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  activeUsers: number
  activeSessions: number
  systemLoad: number
  databaseStatus: 'connected' | 'disconnected' | 'slow'
  lastBackup: string
  alerts: Array<{
    id: string
    type: 'warning' | 'error'
    message: string
    timestamp: string
  }>
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = React.useState('overview')
  const [systemStatus, setSystemStatus] = React.useState<SystemStatus>({
    status: 'healthy',
    uptime: '15d 4h 32m',
    activeUsers: 1247,
    activeSessions: 23,
    systemLoad: 0.65,
    databaseStatus: 'connected',
    lastBackup: '2024-01-15 03:00:00',
    alerts: [
      {
        id: '1',
        type: 'warning',
        message: 'High session volume detected',
        timestamp: '2024-01-15 14:30:00'
      }
    ]
  })

  // TODO: Replace with actual API calls
  const userStats = {
    totalUsers: 0,
    activeUsers: 0,
    pendingReaders: 0,
    suspendedUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0
  }

  const users = [] // This would be populated from API

  const sessionStats = {
    totalSessions: 0,
    activeSessions: 0,
    scheduledSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    totalRevenue: 0,
    averageSessionDuration: 0,
    averageRating: 0
  }

  const sessions = [] // This would be populated from API

  const analyticsData = {
    overview: {
      totalUsers: 0,
      totalSessions: 0,
      totalRevenue: 0,
      averageRating: 0,
      userGrowth: 0,
      sessionGrowth: 0,
      revenueGrowth: 0,
      ratingChange: 0
    },
    timeSeries: [],
    sessionsByType: [],
    usersByRole: [],
    topReaders: [],
    revenueBreakdown: []
  }

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleUserAction = async (action: string, ...args: any[]) => {
    // Mock implementation - in real app, this would call API
    console.log('Admin action:', action, args)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Badge variant="outline" className="font-mono">
              {user.username}
            </Badge>
            <Badge className={getStatusColor(systemStatus.status)}>
              System {systemStatus.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r min-h-screen">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('users')}
            >
              <Users className="mr-2 h-4 w-4" />
              User Management
            </Button>
            <Button
              variant={activeTab === 'sessions' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('sessions')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Session Management
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button
              variant={activeTab === 'marketplace' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('marketplace')}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Marketplace
            </Button>
            <Button
              variant={activeTab === 'system' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('system')}
            >
              <Database className="mr-2 h-4 w-4" />
              System Status
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">System Overview</h2>
                <p className="text-muted-foreground">
                  Monitor platform health and key metrics
                </p>
              </div>

              {/* System Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Status</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{systemStatus.status}</div>
                    <p className="text-xs text-muted-foreground">
                      Uptime: {systemStatus.uptime}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStatus.activeUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Currently online
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStatus.activeSessions}</div>
                    <p className="text-xs text-muted-foreground">
                      In progress
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Load</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(systemStatus.systemLoad * 100).toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">
                      CPU utilization
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest platform activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm">47 new users registered today</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">156 sessions scheduled for today</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-sm">12 new reader applications</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        <span className="text-sm">3 marketplace products published</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Alerts</CardTitle>
                    <CardDescription>Active system notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {systemStatus.alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div>
                            <div className="text-sm">{alert.message}</div>
                            <div className="text-xs text-muted-foreground">{alert.timestamp}</div>
                          </div>
                        </div>
                      ))}
                      {systemStatus.alerts.length === 0 && (
                        <div className="text-sm text-muted-foreground">No active alerts</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={users}
              stats={userStats}
              onUpdateUser={handleUserAction}
              onSuspendUser={handleUserAction}
              onSendMessage={handleUserAction}
              onLoadMore={() => {}}
              hasMore={false}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionManagement
              sessions={sessions}
              stats={sessionStats}
              onRefundSession={handleUserAction}
              onUpdateSessionStatus={handleUserAction}
              onContactParticipant={handleUserAction}
              onLoadMore={() => {}}
              hasMore={false}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              data={analyticsData}
              dateRange={{
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                endDate: new Date(),
                period: 'day'
              }}
              onDateRangeChange={() => {}}
            />
          )}

          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Marketplace Management</h2>
                <p className="text-muted-foreground">
                  Manage products, reviews, and marketplace settings
                </p>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    Marketplace management interface coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">System Status</h2>
                <p className="text-muted-foreground">
                  Monitor system health, performance, and infrastructure
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Status</CardTitle>
                    <CardDescription>Database connection and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Badge className={systemStatus.databaseStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {systemStatus.databaseStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Backup</span>
                        <span className="text-sm text-muted-foreground">{systemStatus.lastBackup}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>System performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>CPU Load</span>
                        <span>{(systemStatus.systemLoad * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Usage</span>
                        <span>64%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disk Usage</span>
                        <span>23%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Site Customization</h2>
                <p className="text-muted-foreground">
                  Customize your landing page and configure global site settings
                </p>
              </div>
              <Tabs defaultValue="landing-page" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="landing-page">Landing Page</TabsTrigger>
                  <TabsTrigger value="site-settings">Site Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="landing-page">
                  <LandingPageCustomizer />
                </TabsContent>
                <TabsContent value="site-settings">
                  <SiteCustomizer />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}