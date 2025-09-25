import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Bell, 
  BellOff, 
  Check, 
  X, 
  Trash2, 
  Settings,
  Calendar,
  MessageCircle,
  CreditCard,
  Star,
  Heart,
  ShoppingCart,
  User,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Archive,
  MoreHorizontal
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'SESSION_REMINDER' | 'MESSAGE' | 'PAYMENT' | 'REVIEW' | 'FAVORITE' | 'PURCHASE' | 'SYSTEM' | 'PROMO'
  title: string
  message: string
  isRead: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
  actionUrl?: string
  actionLabel?: string
  metadata?: {
    sessionId?: string
    userId?: string
    orderId?: string
    amount?: number
    productId?: string
    readerId?: string
  }
}

interface NotificationCenterProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (notificationId: string) => Promise<void>
  onMarkAllAsRead: () => Promise<void>
  onDeleteNotification: (notificationId: string) => Promise<void>
  onDeleteAll: () => Promise<void>
  onNotificationAction: (notification: Notification) => void
  onOpenSettings: () => void
  isOpen?: boolean
  onToggle?: () => void
  children?: React.ReactNode
  isLoading?: boolean
}

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onDeleteAll,
  onNotificationAction,
  onOpenSettings,
  isOpen = false,
  onToggle,
  children,
  isLoading = false
}: NotificationCenterProps) {
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-4 w-4 ${
      priority === 'URGENT' ? 'text-red-500' : 
      priority === 'HIGH' ? 'text-orange-500' : 
      priority === 'MEDIUM' ? 'text-blue-500' : 
      'text-gray-500'
    }`

    switch (type) {
      case 'SESSION_REMINDER':
        return <Calendar className={iconClass} />
      case 'MESSAGE':
        return <MessageCircle className={iconClass} />
      case 'PAYMENT':
        return <CreditCard className={iconClass} />
      case 'REVIEW':
        return <Star className={iconClass} />
      case 'FAVORITE':
        return <Heart className={iconClass} />
      case 'PURCHASE':
        return <ShoppingCart className={iconClass} />
      case 'SYSTEM':
        return <AlertCircle className={iconClass} />
      case 'PROMO':
        return <Info className={iconClass} />
      default:
        return <Bell className={iconClass} />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>
      case 'HIGH':
        return <Badge variant="default" className="text-xs bg-orange-500">High</Badge>
      case 'MEDIUM':
        return <Badge variant="secondary" className="text-xs">Medium</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (isRead: boolean) => {
    return isRead ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <Clock className="h-4 w-4 text-blue-500" />
    )
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false
    if (filter === 'read' && !notification.isRead) return false
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false
    return true
  })

  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(notification)
    return groups
  }, {} as Record<string, Notification[]>)

  const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    if (dateString === today) return 'Today'
    if (dateString === yesterday) return 'Yesterday'
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const notificationContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onOpenSettings}>
            <Settings className="h-4 w-4" />
          </Button>
          {onToggle && (
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b space-y-3">
        {/* Filter Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Types</option>
              <option value="SESSION_REMINDER">Sessions</option>
              <option value="MESSAGE">Messages</option>
              <option value="PAYMENT">Payments</option>
              <option value="REVIEW">Reviews</option>
              <option value="PURCHASE">Purchases</option>
              <option value="SYSTEM">System</option>
              <option value="PROMO">Promotions</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={isLoading}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteAll}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 
               'No notifications'}
            </h3>
            <p className="text-muted-foreground">
              {filter === 'unread' ? "You're all caught up!" : 
               'New notifications will appear here.'}
            </p>
          </div>
        ) : (
          <div className="p-4">
            {Object.entries(groupedNotifications).map(([dateGroup, dayNotifications]) => (
              <div key={dateGroup} className="space-y-3">
                <div className="sticky top-0 bg-background/95 backdrop-blur py-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {formatDateGroup(dateGroup)}
                  </h3>
                  <Separator className="mt-2" />
                </div>
                
                <div className="space-y-2">
                  {dayNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`transition-all hover:shadow-md cursor-pointer ${
                        !notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
                      }`}
                      onClick={() => onNotificationAction(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 pt-1">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className={`text-sm font-medium ${
                                    !notification.isRead ? 'font-semibold' : ''
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  {getPriorityBadge(notification.priority)}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-2">
                                {getStatusIcon(notification.isRead)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteNotification(notification.id)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {notification.type.toLowerCase().replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onMarkAsRead(notification.id)
                                    }}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Mark Read
                                  </Button>
                                )}
                                
                                {notification.actionLabel && notification.actionUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onNotificationAction(notification)
                                    }}
                                  >
                                    {notification.actionLabel}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )

  if (children) {
    return (
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>Manage your notifications and stay updated</SheetDescription>
          </SheetHeader>
          {notificationContent}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Card className="w-full max-w-md h-[600px]">
      {notificationContent}
    </Card>
  )
}

// Notification Badge Component (for header/navbar)
interface NotificationBadgeProps {
  count: number
  hasUrgent?: boolean
  onClick?: () => void
  className?: string
}

export function NotificationBadge({ 
  count, 
  hasUrgent = false, 
  onClick, 
  className 
}: NotificationBadgeProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onClick}
      className={`relative ${className}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge 
          variant={hasUrgent ? "destructive" : "default"}
          className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5 text-xs"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
      {hasUrgent && count === 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </Button>
  )
}

// Mini Notification Dropdown Component
interface MiniNotificationsProps {
  notifications: Notification[]
  unreadCount: number
  onViewAll: () => void
  onMarkAsRead: (notificationId: string) => Promise<void>
  onNotificationAction: (notification: Notification) => void
  maxItems?: number
}

export function MiniNotifications({
  notifications,
  unreadCount,
  onViewAll,
  onMarkAsRead,
  onNotificationAction,
  maxItems = 5
}: MiniNotificationsProps) {
  const displayNotifications = notifications.slice(0, maxItems)
  const hasMore = notifications.length > maxItems

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SESSION_REMINDER': return <Calendar className="h-4 w-4 text-blue-500" />
      case 'MESSAGE': return <MessageCircle className="h-4 w-4 text-green-500" />
      case 'PAYMENT': return <CreditCard className="h-4 w-4 text-purple-500" />
      case 'REVIEW': return <Star className="h-4 w-4 text-yellow-500" />
      case 'PURCHASE': return <ShoppingCart className="h-4 w-4 text-orange-500" />
      default: return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  if (notifications.length === 0) {
    return (
      <Card className="w-80">
        <CardContent className="p-6 text-center">
          <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-1">No new notifications</h3>
          <p className="text-sm text-muted-foreground">
            You're all caught up!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayNotifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-start space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${
              !notification.isRead ? 'bg-primary/5' : ''
            }`}
            onClick={() => onNotificationAction(notification)}
          >
            <div className="flex-shrink-0 pt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm ${!notification.isRead ? 'font-medium' : ''} line-clamp-1`}>
                {notification.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMarkAsRead(notification.id)
                    }}
                    className="text-xs"
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {hasMore && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All {notifications.length} Notifications
            </Button>
          </div>
        )}

        <Separator />

        <Button variant="outline" size="sm" onClick={onViewAll} className="w-full">
          <Bell className="h-4 w-4 mr-2" />
          View All Notifications
        </Button>
      </CardContent>
    </Card>
  )
}