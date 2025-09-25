import React from 'react'
import { ToastContainer, useToast, ToastNotification } from './ToastNotifications'
import { NotificationCenter } from './NotificationCenter'

interface NotificationContextValue {
  // Toast notifications
  toast: ReturnType<typeof useToast>['toast']
  
  // Persistent notifications
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  deleteAllNotifications: () => Promise<void>
  
  // Real-time updates
  subscribeToNotifications: () => void
  unsubscribeFromNotifications: () => void
  
  // Settings
  preferences: NotificationPreferences | null
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>
  
  // Connection status
  isConnected: boolean
  connectionError: string | null
}

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

interface NotificationPreferences {
  email: {
    enabled: boolean
    sessionReminders: boolean
    newMessages: boolean
    paymentUpdates: boolean
    reviewNotifications: boolean
    marketingEmails: boolean
    weeklyDigest: boolean
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  }
  push: {
    enabled: boolean
    sessionReminders: boolean
    newMessages: boolean
    paymentUpdates: boolean
    reviewNotifications: boolean
    urgentOnly: boolean
  }
  inApp: {
    enabled: boolean
    sessionReminders: boolean
    newMessages: boolean
    paymentUpdates: boolean
    reviewNotifications: boolean
    purchaseConfirmations: boolean
    systemUpdates: boolean
    promotions: boolean
    sound: boolean
    desktop: boolean
  }
  schedule: {
    quietHours: {
      enabled: boolean
      start: string
      end: string
    }
    timezone: string
    weekendPause: boolean
  }
}

const NotificationContext = React.createContext<NotificationContextValue | null>(null)

interface NotificationProviderProps {
  children: React.ReactNode
  userId?: string
  apiBaseUrl?: string
  websocketUrl?: string
}

export function NotificationProvider({
  children,
  userId,
  apiBaseUrl = '/api',
  websocketUrl = process.env.NODE_ENV === 'production' ? 'wss://soulseer.com/ws' : 'ws://localhost:3001'
}: NotificationProviderProps) {
  const toastSystem = useToast()
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [preferences, setPreferences] = React.useState<NotificationPreferences | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)
  const [connectionError, setConnectionError] = React.useState<string | null>(null)
  
  const websocketRef = React.useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = React.useRef(0)
  const maxReconnectAttempts = 5

  // Calculate unread count
  const unreadCount = React.useMemo(() => {
    return notifications.filter(n => !n.isRead).length
  }, [notifications])

  // Load initial data
  React.useEffect(() => {
    if (!userId) return

    const loadNotifications = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/notifications`)
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }

    const loadPreferences = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/notifications/preferences`)
        if (response.ok) {
          const data = await response.json()
          setPreferences(data.preferences)
        }
      } catch (error) {
        console.error('Failed to load notification preferences:', error)
      }
    }

    loadNotifications()
    loadPreferences()
  }, [userId, apiBaseUrl])

  // WebSocket connection management
  const connectWebSocket = React.useCallback(() => {
    if (!userId || websocketRef.current?.readyState === WebSocket.CONNECTING) return

    try {
      const ws = new WebSocket(`${websocketUrl}?userId=${userId}`)
      websocketRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttempts.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        websocketRef.current = null

        // Attempt to reconnect unless it was a deliberate close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff
          reconnectAttempts.current++
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`)
            connectWebSocket()
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError('Unable to maintain connection to notification service')
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionError('Connection error occurred')
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      setConnectionError('Failed to connect to notification service')
    }
  }, [userId, websocketUrl])

  const disconnectWebSocket = React.useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (websocketRef.current) {
      websocketRef.current.close(1000, 'Client disconnect')
      websocketRef.current = null
    }
    setIsConnected(false)
  }, [])

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = React.useCallback((data: any) => {
    switch (data.type) {
      case 'notification':
        const newNotification: Notification = {
          id: data.id,
          type: data.notificationType,
          title: data.title,
          message: data.message,
          isRead: false,
          priority: data.priority || 'MEDIUM',
          createdAt: data.createdAt || new Date().toISOString(),
          actionUrl: data.actionUrl,
          actionLabel: data.actionLabel,
          metadata: data.metadata
        }

        // Add to persistent notifications
        setNotifications(prev => [newNotification, ...prev])

        // Show toast if enabled and appropriate
        if (preferences?.inApp.enabled && shouldShowToast(newNotification, preferences)) {
          showNotificationToast(newNotification)
        }

        // Play sound if enabled
        if (preferences?.inApp.sound && preferences?.inApp.enabled) {
          playNotificationSound()
        }

        // Show desktop notification if enabled and permitted
        if (preferences?.inApp.desktop && preferences?.inApp.enabled && 'Notification' in window) {
          showDesktopNotification(newNotification)
        }
        break

      case 'notification_read':
        setNotifications(prev => 
          prev.map(n => n.id === data.notificationId ? { ...n, isRead: true } : n)
        )
        break

      case 'notification_deleted':
        setNotifications(prev => prev.filter(n => n.id !== data.notificationId))
        break

      case 'preferences_updated':
        setPreferences(data.preferences)
        break

      default:
        console.log('Unknown WebSocket message type:', data.type)
    }
  }, [preferences])

  // Determine if notification should show as toast
  const shouldShowToast = (notification: Notification, prefs: NotificationPreferences): boolean => {
    if (!prefs.inApp.enabled) return false

    // Check quiet hours
    if (prefs.schedule.quietHours.enabled) {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()
      const startTime = parseInt(prefs.schedule.quietHours.start.split(':')[0]) * 60 + 
                       parseInt(prefs.schedule.quietHours.start.split(':')[1])
      const endTime = parseInt(prefs.schedule.quietHours.end.split(':')[0]) * 60 + 
                     parseInt(prefs.schedule.quietHours.end.split(':')[1])
      
      if (startTime <= endTime) {
        if (currentTime >= startTime && currentTime <= endTime) {
          return notification.priority === 'URGENT'
        }
      } else {
        if (currentTime >= startTime || currentTime <= endTime) {
          return notification.priority === 'URGENT'
        }
      }
    }

    // Check weekend pause
    if (prefs.schedule.weekendPause) {
      const dayOfWeek = new Date().getDay()
      if ((dayOfWeek === 0 || dayOfWeek === 6) && notification.priority !== 'URGENT') {
        return false
      }
    }

    // Check specific type preferences
    switch (notification.type) {
      case 'SESSION_REMINDER':
        return prefs.inApp.sessionReminders
      case 'MESSAGE':
        return prefs.inApp.newMessages
      case 'PAYMENT':
        return prefs.inApp.paymentUpdates
      case 'REVIEW':
        return prefs.inApp.reviewNotifications
      case 'PURCHASE':
        return prefs.inApp.purchaseConfirmations
      case 'SYSTEM':
        return prefs.inApp.systemUpdates
      case 'PROMO':
        return prefs.inApp.promotions
      default:
        return true
    }
  }

  // Show notification as toast
  const showNotificationToast = (notification: Notification) => {
    const toastType = getToastType(notification.type)
    const duration = notification.priority === 'URGENT' ? 0 : 
                    notification.priority === 'HIGH' ? 8000 : 5000

    toastSystem.toast.custom({
      type: toastType,
      title: notification.title,
      message: notification.message,
      duration,
      priority: notification.priority.toLowerCase() as any,
      action: notification.actionUrl ? {
        label: notification.actionLabel || 'View',
        onClick: () => window.location.href = notification.actionUrl!
      } : undefined
    })
  }

  const getToastType = (notificationType: string): ToastNotification['type'] => {
    switch (notificationType) {
      case 'SESSION_REMINDER': return 'session'
      case 'MESSAGE': return 'message'
      case 'PAYMENT': return 'payment'
      case 'REVIEW': return 'review'
      case 'PURCHASE': return 'success'
      case 'SYSTEM': return 'warning'
      case 'PROMO': return 'info'
      default: return 'info'
    }
  }

  // Play notification sound
  const playNotificationSound = () => {
    // Create and play a simple notification sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  }

  // Show desktop notification
  const showDesktopNotification = (notification: Notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: notification.id
      })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showDesktopNotification(notification)
        }
      })
    }
  }

  // API methods
  const addNotification = React.useCallback((notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Math.random().toString(36).substr(2, 9),
      isRead: false,
      createdAt: new Date().toISOString()
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const markAsRead = React.useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [apiBaseUrl])

  const markAllAsRead = React.useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/notifications/read-all`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [apiBaseUrl])

  const deleteNotification = React.useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [apiBaseUrl])

  const deleteAllNotifications = React.useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/notifications`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotifications([])
      }
    } catch (error) {
      console.error('Failed to delete all notifications:', error)
    }
  }, [apiBaseUrl])

  const updatePreferences = React.useCallback(async (newPreferences: NotificationPreferences) => {
    try {
      const response = await fetch(`${apiBaseUrl}/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences: newPreferences })
      })
      
      if (response.ok) {
        setPreferences(newPreferences)
      }
    } catch (error) {
      console.error('Failed to update preferences:', error)
      throw error
    }
  }, [apiBaseUrl])

  // Subscription methods
  const subscribeToNotifications = React.useCallback(() => {
    connectWebSocket()
  }, [connectWebSocket])

  const unsubscribeFromNotifications = React.useCallback(() => {
    disconnectWebSocket()
  }, [disconnectWebSocket])

  // Auto-connect when user ID is available
  React.useEffect(() => {
    if (userId) {
      subscribeToNotifications()
    }

    return () => {
      unsubscribeFromNotifications()
    }
  }, [userId, subscribeToNotifications, unsubscribeFromNotifications])

  const contextValue: NotificationContextValue = {
    toast: toastSystem.toast,
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    preferences,
    updatePreferences,
    isConnected,
    connectionError
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer 
        notifications={toastSystem.notifications}
        position="top-right"
        maxNotifications={5}
      />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export type { 
  Notification, 
  NotificationPreferences, 
  NotificationContextValue 
}