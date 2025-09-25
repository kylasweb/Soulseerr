import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  X, 
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Calendar,
  MessageCircle,
  CreditCard,
  Star,
  ShoppingCart,
  User,
  Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'session' | 'message' | 'payment' | 'review'
  title: string
  message: string
  duration?: number // in milliseconds, 0 for persistent
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
  avatar?: string
  priority?: 'low' | 'normal' | 'high'
}

interface ToastContainerProps {
  notifications: ToastNotification[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxNotifications?: number
}

interface ToastProps {
  notification: ToastNotification
  onDismiss: (id: string) => void
  index: number
}

function Toast({ notification, onDismiss, index }: ToastProps) {
  const [progress, setProgress] = React.useState(100)
  const [isHovered, setIsHovered] = React.useState(false)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = React.useRef<number>(Date.now())

  const duration = notification.duration || 5000

  const getTypeIcon = (type: string) => {
    const iconClass = "h-5 w-5"
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />
      case 'warning':
        return <AlertCircle className={`${iconClass} text-yellow-500`} />
      case 'info':
        return <Info className={`${iconClass} text-blue-500`} />
      case 'session':
        return <Calendar className={`${iconClass} text-purple-500`} />
      case 'message':
        return <MessageCircle className={`${iconClass} text-green-500`} />
      case 'payment':
        return <CreditCard className={`${iconClass} text-blue-500`} />
      case 'review':
        return <Star className={`${iconClass} text-yellow-500`} />
      default:
        return <Bell className={`${iconClass} text-gray-500`} />
    }
  }

  const getTypeColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
      case 'session':
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
      case 'message':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
      case 'payment':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
      case 'review':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
      default:
        return 'border-border bg-background'
    }
  }

  React.useEffect(() => {
    if (duration === 0) return // Persistent notification

    const updateProgress = () => {
      if (isHovered) return
      
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, duration - elapsed)
      const newProgress = (remaining / duration) * 100

      setProgress(newProgress)

      if (remaining <= 0) {
        onDismiss(notification.id)
      } else {
        timerRef.current = setTimeout(updateProgress, 50)
      }
    }

    timerRef.current = setTimeout(updateProgress, 50)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [duration, notification.id, onDismiss, isHovered])

  React.useEffect(() => {
    if (isHovered) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    } else {
      startTimeRef.current = Date.now() - (duration * (1 - progress / 100))
    }
  }, [isHovered, duration, progress])

  const handleDismiss = () => {
    onDismiss(notification.id)
    notification.onDismiss?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <Card className={`w-full max-w-sm shadow-lg hover:shadow-xl transition-shadow ${getTypeColors(notification.type)}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getTypeIcon(notification.type)}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold leading-tight">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    {notification.message}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {notification.action && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      notification.action!.onClick()
                      handleDismiss()
                    }}
                    className="text-xs"
                  >
                    {notification.action.label}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar for timed notifications */}
          {duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1">
              <Progress 
                value={progress} 
                className="h-full rounded-none rounded-b-md"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ToastContainer({
  notifications,
  position = 'top-right',
  maxNotifications = 5
}: ToastContainerProps) {
  const [toasts, setToasts] = React.useState<ToastNotification[]>([])

  React.useEffect(() => {
    // Limit the number of visible notifications
    const visibleNotifications = notifications.slice(-maxNotifications)
    setToasts(visibleNotifications)
  }, [notifications, maxNotifications])

  const handleDismiss = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  const isBottom = position.includes('bottom')

  return (
    <div className={`fixed z-50 ${getPositionClasses()} space-y-2`}>
      <AnimatePresence>
        {(isBottom ? [...toasts].reverse() : toasts).map((notification, index) => (
          <Toast
            key={notification.id}
            notification={notification}
            onDismiss={handleDismiss}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for managing toast notifications
export function useToast() {
  const [notifications, setNotifications] = React.useState<ToastNotification[]>([])

  const addToast = React.useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastNotification = {
      id,
      duration: 5000,
      priority: 'normal',
      ...toast
    }

    setNotifications(prev => [...prev, newToast])

    // Auto-remove after duration if not persistent
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(t => t.id !== id))
      }, newToast.duration + 500) // Extra buffer for animation
    }

    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = React.useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods for different toast types
  const toast = React.useMemo(() => ({
    success: (title: string, message: string, options?: Partial<ToastNotification>) =>
      addToast({ type: 'success', title, message, ...options }),
    
    error: (title: string, message: string, options?: Partial<ToastNotification>) =>
      addToast({ type: 'error', title, message, ...options }),
    
    warning: (title: string, message: string, options?: Partial<ToastNotification>) =>
      addToast({ type: 'warning', title, message, ...options }),
    
    info: (title: string, message: string, options?: Partial<ToastNotification>) =>
      addToast({ type: 'info', title, message, ...options }),
    
    session: (title: string, message: string, options?: Partial<ToastNotification>) =>
      addToast({ type: 'session', title, message, ...options }),
    
    message: (title: string, message: string, options?: Partial<ToastNotification>) =>
      addToast({ type: 'message', title, message, ...options }),
    
    payment: (title: string, message: string, options?: Partial<ToastNotification>) =>
      addToast({ type: 'payment', title, message, ...options }),
    
    review: (title: string, message: string, options?: Partial<ToastNotification>) =>
      addToast({ type: 'review', title, message, ...options }),

    custom: (notification: Omit<ToastNotification, 'id'>) =>
      addToast(notification),
  }), [addToast])

  return {
    notifications,
    toast,
    removeToast,
    clearAllToasts,
    addToast
  }
}

// Example usage component
export function ToastDemo() {
  const { toast } = useToast()

  const handleTestToasts = () => {
    toast.success('Session Completed', 'Your tarot reading session has ended successfully.')
    
    setTimeout(() => {
      toast.message('New Message', 'You have received a new message from your reader.', {
        action: {
          label: 'View Message',
          onClick: () => console.log('Viewing message...')
        }
      })
    }, 1000)

    setTimeout(() => {
      toast.payment('Payment Processed', 'Your payment of $75.00 has been successfully processed.')
    }, 2000)

    setTimeout(() => {
      toast.session('Upcoming Session', 'Your session starts in 15 minutes.', {
        duration: 0, // Persistent
        priority: 'high',
        action: {
          label: 'Join Now',
          onClick: () => console.log('Joining session...')
        }
      })
    }, 3000)
  }

  return (
    <div className="p-8">
      <Button onClick={handleTestToasts}>
        Test Toast Notifications
      </Button>
    </div>
  )
}

export type { ToastNotification, ToastContainerProps }