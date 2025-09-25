import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageCircle, 
  Calendar, 
  CreditCard, 
  Star, 
  ShoppingCart,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Clock,
  AlertTriangle,
  Info,
  Settings,
  Save,
  RotateCcw,
  TestTube
} from 'lucide-react'

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
      start: string // HH:MM format
      end: string // HH:MM format
    }
    timezone: string
    weekendPause: boolean
  }
}

interface NotificationSettingsProps {
  preferences: NotificationPreferences
  onUpdatePreferences: (preferences: NotificationPreferences) => Promise<void>
  onSendTestNotification: (type: 'email' | 'push' | 'inApp') => Promise<void>
  onResetToDefaults: () => Promise<void>
  isLoading?: boolean
  hasUnsavedChanges?: boolean
}

export function NotificationSettings({
  preferences,
  onUpdatePreferences,
  onSendTestNotification,
  onResetToDefaults,
  isLoading = false,
  hasUnsavedChanges = false
}: NotificationSettingsProps) {
  const [localPreferences, setLocalPreferences] = React.useState<NotificationPreferences>(preferences)
  const [activeTab, setActiveTab] = React.useState('email')

  React.useEffect(() => {
    setLocalPreferences(preferences)
  }, [preferences])

  const handlePreferenceChange = (
    category: keyof NotificationPreferences,
    key: string,
    value: any,
    subKey?: string
  ) => {
    setLocalPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subKey ? key : key]: subKey ? {
          ...(prev[category] as any)[key],
          [subKey]: value
        } : value
      }
    }))
  }

  const handleSave = async () => {
    await onUpdatePreferences(localPreferences)
  }

  const handleReset = async () => {
    await onResetToDefaults()
  }

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'sessionReminders': return <Calendar className="h-4 w-4" />
      case 'newMessages': return <MessageCircle className="h-4 w-4" />
      case 'paymentUpdates': return <CreditCard className="h-4 w-4" />
      case 'reviewNotifications': return <Star className="h-4 w-4" />
      case 'marketingEmails': return <Mail className="h-4 w-4" />
      case 'purchaseConfirmations': return <ShoppingCart className="h-4 w-4" />
      case 'systemUpdates': return <AlertTriangle className="h-4 w-4" />
      case 'promotions': return <Info className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationDescription = (type: string) => {
    switch (type) {
      case 'sessionReminders': 
        return 'Upcoming session reminders and scheduling updates'
      case 'newMessages': 
        return 'New messages from readers and support'
      case 'paymentUpdates': 
        return 'Payment confirmations, receipts, and billing updates'
      case 'reviewNotifications': 
        return 'New reviews on your sessions and reminders to leave reviews'
      case 'marketingEmails': 
        return 'Promotional offers, new features, and spiritual tips'
      case 'weeklyDigest': 
        return 'Weekly summary of your activity and recommendations'
      case 'purchaseConfirmations': 
        return 'Purchase receipts and access notifications'
      case 'systemUpdates': 
        return 'Platform updates, maintenance notices, and important announcements'
      case 'promotions': 
        return 'Special offers, discounts, and featured content'
      case 'urgentOnly': 
        return 'Only urgent notifications like payment failures or security alerts'
      default: 
        return 'Various platform notifications'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="h-8 w-8 mr-3" />
            Notification Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize how and when you receive notifications to stay informed without being overwhelmed.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Main Settings */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="email">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="push">
                <Smartphone className="h-4 w-4 mr-2" />
                Push
              </TabsTrigger>
              <TabsTrigger value="inApp">
                <Monitor className="h-4 w-4 mr-2" />
                In-App
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Clock className="h-4 w-4 mr-2" />
                Schedule
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <TabsContent value="email" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <p className="text-muted-foreground">
                    Receive notifications via email to stay updated even when you're away.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendTestNotification('email')}
                    disabled={!localPreferences.email.enabled || isLoading}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Send Test
                  </Button>
                  <Switch
                    checked={localPreferences.email.enabled}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('email', 'enabled', checked)
                    }
                  />
                </div>
              </div>

              {localPreferences.email.enabled && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {/* Email Frequency */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Email Frequency</Label>
                      <p className="text-sm text-muted-foreground">
                        How often should we bundle your email notifications?
                      </p>
                    </div>
                    <Select
                      value={localPreferences.email.frequency}
                      onValueChange={(value) => 
                        handlePreferenceChange('email', 'frequency', value as any)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly digest</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Email Categories */}
                  <div className="space-y-4">
                    {[
                      'sessionReminders',
                      'newMessages',
                      'paymentUpdates',
                      'reviewNotifications',
                      'marketingEmails',
                      'weeklyDigest'
                    ].map((type) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getNotificationTypeIcon(type)}
                          <div>
                            <Label className="font-medium capitalize">
                              {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {getNotificationDescription(type)}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={localPreferences.email[type as keyof typeof localPreferences.email] as boolean}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange('email', type, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Push Notifications */}
            <TabsContent value="push" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Push Notifications</h3>
                  <p className="text-muted-foreground">
                    Get instant notifications on your mobile device and desktop browser.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendTestNotification('push')}
                    disabled={!localPreferences.push.enabled || isLoading}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Send Test
                  </Button>
                  <Switch
                    checked={localPreferences.push.enabled}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('push', 'enabled', checked)
                    }
                  />
                </div>
              </div>

              {localPreferences.push.enabled && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {/* Urgent Only Option */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <div>
                        <Label className="font-medium">Urgent Only</Label>
                        <p className="text-sm text-muted-foreground">
                          {getNotificationDescription('urgentOnly')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={localPreferences.push.urgentOnly}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          // Turn off all other categories when urgent only is enabled
                          const updatedPrefs = { ...localPreferences }
                          updatedPrefs.push.urgentOnly = true
                          updatedPrefs.push.sessionReminders = false
                          updatedPrefs.push.newMessages = false
                          updatedPrefs.push.paymentUpdates = false
                          updatedPrefs.push.reviewNotifications = false
                          setLocalPreferences(updatedPrefs)
                        } else {
                          handlePreferenceChange('push', 'urgentOnly', false)
                        }
                      }}
                    />
                  </div>

                  {!localPreferences.push.urgentOnly && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        {[
                          'sessionReminders',
                          'newMessages',
                          'paymentUpdates',
                          'reviewNotifications'
                        ].map((type) => (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getNotificationTypeIcon(type)}
                              <div>
                                <Label className="font-medium capitalize">
                                  {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {getNotificationDescription(type)}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={localPreferences.push[type as keyof typeof localPreferences.push] as boolean}
                              onCheckedChange={(checked) => 
                                handlePreferenceChange('push', type, checked)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            {/* In-App Notifications */}
            <TabsContent value="inApp" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">In-App Notifications</h3>
                  <p className="text-muted-foreground">
                    Control notifications that appear within the SoulSeer platform.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendTestNotification('inApp')}
                    disabled={!localPreferences.inApp.enabled || isLoading}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Send Test
                  </Button>
                  <Switch
                    checked={localPreferences.inApp.enabled}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('inApp', 'enabled', checked)
                    }
                  />
                </div>
              </div>

              {localPreferences.inApp.enabled && (
                <div className="space-y-6 pl-4 border-l-2 border-muted">
                  {/* Sound and Desktop Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {localPreferences.inApp.sound ? 
                          <Volume2 className="h-4 w-4" /> : 
                          <VolumeX className="h-4 w-4" />
                        }
                        <div>
                          <Label className="font-medium">Sound Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Play sound for new notifications
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={localPreferences.inApp.sound}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange('inApp', 'sound', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Monitor className="h-4 w-4" />
                        <div>
                          <Label className="font-medium">Desktop Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Show browser notifications
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={localPreferences.inApp.desktop}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange('inApp', 'desktop', checked)
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* In-App Categories */}
                  <div className="space-y-4">
                    {[
                      'sessionReminders',
                      'newMessages',
                      'paymentUpdates',
                      'reviewNotifications',
                      'purchaseConfirmations',
                      'systemUpdates',
                      'promotions'
                    ].map((type) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getNotificationTypeIcon(type)}
                          <div>
                            <Label className="font-medium capitalize">
                              {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {getNotificationDescription(type)}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={localPreferences.inApp[type as keyof typeof localPreferences.inApp] as boolean}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange('inApp', type, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Schedule & Timing */}
            <TabsContent value="schedule" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Notification Schedule</h3>
                <p className="text-muted-foreground">
                  Control when you receive notifications to maintain your peace and focus.
                </p>
              </div>

              <div className="space-y-6">
                {/* Timezone */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Timezone</Label>
                    <p className="text-sm text-muted-foreground">
                      All notification times will be based on this timezone
                    </p>
                  </div>
                  <Select
                    value={localPreferences.schedule.timezone}
                    onValueChange={(value) => 
                      handlePreferenceChange('schedule', 'timezone', value)
                    }
                  >
                    <SelectTrigger className="w-60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Central Europe (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Quiet Hours */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Quiet Hours</Label>
                      <p className="text-sm text-muted-foreground">
                        Pause non-urgent notifications during your rest time
                      </p>
                    </div>
                    <Switch
                      checked={localPreferences.schedule.quietHours.enabled}
                      onCheckedChange={(checked) => 
                        handlePreferenceChange('schedule', 'quietHours', checked, 'enabled')
                      }
                    />
                  </div>

                  {localPreferences.schedule.quietHours.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                      <div>
                        <Label className="text-sm font-medium">Start Time</Label>
                        <input
                          type="time"
                          value={localPreferences.schedule.quietHours.start}
                          onChange={(e) => 
                            handlePreferenceChange('schedule', 'quietHours', e.target.value, 'start')
                          }
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">End Time</Label>
                        <input
                          type="time"
                          value={localPreferences.schedule.quietHours.end}
                          onChange={(e) => 
                            handlePreferenceChange('schedule', 'quietHours', e.target.value, 'end')
                          }
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Weekend Pause */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Weekend Pause</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce non-urgent notifications on weekends for better work-life balance
                    </p>
                  </div>
                  <Switch
                    checked={localPreferences.schedule.weekendPause}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('schedule', 'weekendPause', checked)
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Privacy Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-medium">Privacy & Data Protection</p>
              <p className="text-muted-foreground">
                Your notification preferences are stored securely and used only to deliver the notifications you've requested. 
                We never share your notification data with third parties. You can update these settings at any time, 
                and changes take effect immediately.
              </p>
              <p className="text-muted-foreground">
                For push notifications, we use secure tokens that don't contain personal information. 
                Email notifications include an unsubscribe link for your convenience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}