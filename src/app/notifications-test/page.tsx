'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/use-notifications';
import { Bell, BellRing, Clock, Star, DollarSign, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationTestPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  } = useNotifications();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testNotificationCreation = async (type: string, title: string, message: string) => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, message })
      });

      if (response.ok) {
        addTestResult(`✅ Created ${type} notification successfully`);
        toast.success(`${title} notification created`);
        await refresh();
      } else {
        addTestResult(`❌ Failed to create ${type} notification`);
        toast.error('Failed to create notification');
      }
    } catch (error) {
      addTestResult(`❌ Error creating ${type} notification: ${error}`);
      toast.error('Error creating notification');
    }
  };

  const testSessionReminder = () => {
    testNotificationCreation(
      'SESSION_REMINDER',
      '🔔 Session Starting Soon',
      'Your reading session starts in 15 minutes. Please be ready!'
    );
  };

  const testSessionStarted = () => {
    testNotificationCreation(
      'SESSION_STARTED',
      '🎉 Session Started',
      'Your session with Luna Mystic has begun. Enjoy your reading!'
    );
  };

  const testSessionEnded = () => {
    testNotificationCreation(
      'SESSION_ENDED',
      '✨ Session Complete',
      'Your reading session has ended. Please consider leaving a review!'
    );
  };

  const testPaymentReceived = () => {
    testNotificationCreation(
      'PAYMENT_RECEIVED',
      '💰 Payment Received',
      'You received a payment of $45.00 for your recent session'
    );
  };

  const testPaymentFailed = () => {
    testNotificationCreation(
      'PAYMENT_FAILED',
      '❌ Payment Failed',
      'Payment of $50.00 failed. Please check your payment method.'
    );
  };

  const testReviewReceived = () => {
    testNotificationCreation(
      'REVIEW_RECEIVED',
      '⭐ New Review',
      'Sarah left you a 5-star review! ⭐⭐⭐⭐⭐'
    );
  };

  const testSystemUpdate = () => {
    testNotificationCreation(
      'SYSTEM_UPDATE',
      '🚀 System Update',
      'SoulSeer has been updated with new features and improvements!'
    );
  };

  const testBulkNotifications = async () => {
    const notifications = [
      { type: 'SESSION_REMINDER', title: '🔔 Session in 15 min', message: 'Session with Alex starts soon' },
      { type: 'SESSION_REMINDER', title: '🔔 Session in 5 min', message: 'Session with Alex starts in 5 minutes' },
      { type: 'SESSION_STARTED', title: '🎉 Session Started', message: 'Your session has begun' },
      { type: 'PAYMENT_RECEIVED', title: '💰 Payment Received', message: 'You earned $30.00' },
      { type: 'REVIEW_RECEIVED', title: '⭐ New Review', message: 'Michael gave you 4 stars!' }
    ];

    addTestResult('Creating bulk notifications...');
    
    for (const notif of notifications) {
      await testNotificationCreation(notif.type, notif.title, notif.message);
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between notifications
    }
    
    addTestResult('✅ Bulk notification test completed');
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SESSION_REMINDER': return <Clock className="w-4 h-4" />;
      case 'SESSION_STARTED': return <Zap className="w-4 h-4" />;
      case 'SESSION_ENDED': return <CheckCircle className="w-4 h-4" />;
      case 'PAYMENT_RECEIVED': return <DollarSign className="w-4 h-4" />;
      case 'REVIEW_RECEIVED': return <Star className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SESSION_REMINDER': return 'border-blue-500/20 bg-blue-500/5';
      case 'SESSION_STARTED': return 'border-green-500/20 bg-green-500/5';
      case 'SESSION_ENDED': return 'border-purple-500/20 bg-purple-500/5';
      case 'PAYMENT_RECEIVED': return 'border-yellow-500/20 bg-yellow-500/5';
      case 'PAYMENT_FAILED': return 'border-red-500/20 bg-red-500/5';
      case 'REVIEW_RECEIVED': return 'border-pink-500/20 bg-pink-500/5';
      default: return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          🔔 Smart Notifications System
        </h1>
        <p className="text-lg text-muted-foreground">
          Test and demonstrate the comprehensive notification system for SoulSeer
        </p>
        
        {/* Stats */}
        <div className="flex justify-center items-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">{notifications.length}</span>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-red-500" />
            <span className="font-semibold">{unreadCount}</span>
            <span className="text-sm text-muted-foreground">Unread</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Notification Tests
            </CardTitle>
            <CardDescription>
              Create different types of notifications to test the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={testSessionReminder} 
                variant="outline" 
                className="justify-start"
              >
                <Clock className="w-4 h-4 mr-2" />
                Session Reminder
              </Button>
              
              <Button 
                onClick={testSessionStarted} 
                variant="outline" 
                className="justify-start"
              >
                <Zap className="w-4 h-4 mr-2" />
                Session Started
              </Button>
              
              <Button 
                onClick={testSessionEnded} 
                variant="outline" 
                className="justify-start"
              >
                <Star className="w-4 h-4 mr-2" />
                Session Ended
              </Button>
              
              <Button 
                onClick={testPaymentReceived} 
                variant="outline" 
                className="justify-start"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Payment Success
              </Button>
              
              <Button 
                onClick={testPaymentFailed} 
                variant="outline" 
                className="justify-start"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Payment Failed
              </Button>
              
              <Button 
                onClick={testReviewReceived} 
                variant="outline" 
                className="justify-start"
              >
                <Star className="w-4 h-4 mr-2" />
                New Review
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Button 
                onClick={testSystemUpdate} 
                variant="secondary" 
                className="w-full"
              >
                System Update
              </Button>
              
              <Button 
                onClick={testBulkNotifications} 
                variant="default" 
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Bulk Test (5 notifications)
              </Button>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button onClick={refresh} variant="outline" size="sm" className="flex-1">
                Refresh
              </Button>
              <Button onClick={markAllAsRead} variant="outline" size="sm" className="flex-1">
                Mark All Read
              </Button>
            </div>

            {/* Test Results */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Test Results</h4>
                <Button onClick={clearTestResults} variant="ghost" size="sm">
                  Clear
                </Button>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 h-40 overflow-y-auto font-mono text-xs">
                {testResults.length > 0 ? (
                  testResults.map((result, index) => (
                    <div key={index} className="mb-1">{result}</div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No test results yet...</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Notifications */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Live Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time notification feed with interactive controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${getNotificationColor(notification.type)} ${
                      !notification.read ? 'ring-2 ring-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0 p-2 rounded-full bg-background">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleTimeString()}
                            </span>
                            {!notification.read && (
                              <Badge variant="default" className="text-xs">NEW</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 px-2 text-xs"
                          >
                            Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-6 px-2 text-xs text-red-500 hover:text-red-600"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No notifications yet</p>
                  <p className="text-sm">Create some test notifications to see them here</p>
                </div>
              )}
            </div>

            {notifications.length > 10 && (
              <div className="mt-4 text-center">
                <Badge variant="secondary">
                  Showing 10 of {notifications.length} notifications
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Features */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Smart Notification System Features</CardTitle>
          <CardDescription>
            Comprehensive notification management for the SoulSeer platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Smart Scheduling
              </h4>
              <p className="text-sm text-muted-foreground">
                Automated session reminders at 15, 5, and 1 minute intervals
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Real-time Updates
              </h4>
              <p className="text-sm text-muted-foreground">
                Instant notifications via Socket.IO for session events
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Payment Tracking
              </h4>
              <p className="text-sm text-muted-foreground">
                Notifications for successful payments and failures
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Review Management
              </h4>
              <p className="text-sm text-muted-foreground">
                Instant alerts when clients leave reviews and ratings
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                System-wide Broadcast
              </h4>
              <p className="text-sm text-muted-foreground">
                Bulk notifications for system updates and announcements
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Toast Integration
              </h4>
              <p className="text-sm text-muted-foreground">
                Beautiful toast notifications with action buttons
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="w-4 h-4" />
              <span>Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );
}