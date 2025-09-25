'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  CreditCard,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Upload,
  Settings,
  Database,
  Server,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SiteSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    logoUrl: string;
    faviconUrl: string;
    defaultLanguage: string;
    timezone: string;
    maintenanceMode: boolean;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    supportEmail: string;
    businessHours: string;
  };
  security: {
    enableTwoFactor: boolean;
    sessionTimeout: number;
    passwordMinLength: number;
    enableCaptcha: boolean;
    allowedDomains: string[];
  };
  payments: {
    stripePublishableKey: string;
    stripeSecretKey: string;
    paypalClientId: string;
    paypalSecret: string;
    currency: string;
    taxRate: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  };
  integrations: {
    googleAnalyticsId: string;
    facebookPixelId: string;
    firebaseConfig: {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
    };
  };
  features: {
    enableMarketplace: boolean;
    enableCommunity: boolean;
    enableLiveStreaming: boolean;
    enableVirtualGifts: boolean;
    enableReviews: boolean;
    enableAnalytics: boolean;
  };
}

export function SiteCustomizer() {
  const [settings, setSettings] = useState<SiteSettings>({
    general: {
      siteName: 'SoulSeer',
      siteDescription: 'A Community of Gifted Psychics',
      siteUrl: 'https://soulseer.com',
      logoUrl: '/logo.svg',
      faviconUrl: '/favicon.ico',
      defaultLanguage: 'en',
      timezone: 'UTC',
      maintenanceMode: false
    },
    contact: {
      email: 'contact@soulseer.com',
      phone: '+1 (555) 123-4567',
      address: '123 Mystic Way, Spiritual City, SC 12345',
      supportEmail: 'support@soulseer.com',
      businessHours: 'Mon-Fri 9AM-6PM EST'
    },
    security: {
      enableTwoFactor: true,
      sessionTimeout: 30,
      passwordMinLength: 8,
      enableCaptcha: true,
      allowedDomains: ['soulseer.com', 'gmail.com', 'yahoo.com', 'hotmail.com']
    },
    payments: {
      stripePublishableKey: '',
      stripeSecretKey: '',
      paypalClientId: '',
      paypalSecret: '',
      currency: 'USD',
      taxRate: 0.08
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: ''
    },
    integrations: {
      googleAnalyticsId: '',
      facebookPixelId: '',
      firebaseConfig: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
      }
    },
    features: {
      enableMarketplace: true,
      enableCommunity: true,
      enableLiveStreaming: true,
      enableVirtualGifts: true,
      enableReviews: true,
      enableAnalytics: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Site settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updateGeneral = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }));
  };

  const updateContact = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const updateSecurity = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [field]: value }
    }));
  };

  const updatePayments = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      payments: { ...prev.payments, [field]: value }
    }));
  };

  const updateNotifications = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const updateIntegrations = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      integrations: { ...prev.integrations, [field]: value }
    }));
  };

  const updateFeatures = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Site Customizer</h3>
          <p className="text-sm text-muted-foreground">
            Configure global site settings, integrations, and features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save All Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic site configuration and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={settings.general.siteName}
                    onChange={(e) => updateGeneral('siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-url">Site URL</Label>
                  <Input
                    id="site-url"
                    value={settings.general.siteUrl}
                    onChange={(e) => updateGeneral('siteUrl', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea
                  id="site-description"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateGeneral('siteDescription', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    value={settings.general.logoUrl}
                    onChange={(e) => updateGeneral('logoUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon-url">Favicon URL</Label>
                  <Input
                    id="favicon-url"
                    value={settings.general.faviconUrl}
                    onChange={(e) => updateGeneral('faviconUrl', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-language">Default Language</Label>
                  <Select
                    value={settings.general.defaultLanguage}
                    onValueChange={(value) => updateGeneral('defaultLanguage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => updateGeneral('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">EST</SelectItem>
                      <SelectItem value="PST">PST</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                      <SelectItem value="CET">CET</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="maintenance-mode"
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={(checked) => updateGeneral('maintenanceMode', checked)}
                  />
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Configure contact details and business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Primary Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={settings.contact.email}
                    onChange={(e) => updateContact('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={settings.contact.supportEmail}
                    onChange={(e) => updateContact('supportEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.contact.phone}
                    onChange={(e) => updateContact('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-hours">Business Hours</Label>
                  <Input
                    id="business-hours"
                    value={settings.contact.businessHours}
                    onChange={(e) => updateContact('businessHours', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={settings.contact.address}
                  onChange={(e) => updateContact('address', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="two-factor"
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) => updateSecurity('enableTwoFactor', checked)}
                  />
                  <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="captcha"
                    checked={settings.security.enableCaptcha}
                    onCheckedChange={(checked) => updateSecurity('enableCaptcha', checked)}
                  />
                  <Label htmlFor="captcha">Enable CAPTCHA</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSecurity('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-min-length">Minimum Password Length</Label>
                  <Input
                    id="password-min-length"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSecurity('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed-domains">Allowed Email Domains (comma-separated)</Label>
                <Input
                  id="allowed-domains"
                  value={settings.security.allowedDomains.join(', ')}
                  onChange={(e) => updateSecurity('allowedDomains', e.target.value.split(',').map(d => d.trim()))}
                  placeholder="gmail.com, yahoo.com, hotmail.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>
                Configure payment processors and financial settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Stripe Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripe-pub-key">Publishable Key</Label>
                      <Input
                        id="stripe-pub-key"
                        type="password"
                        value={settings.payments.stripePublishableKey}
                        onChange={(e) => updatePayments('stripePublishableKey', e.target.value)}
                        placeholder="pk_live_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-secret-key">Secret Key</Label>
                      <Input
                        id="stripe-secret-key"
                        type="password"
                        value={settings.payments.stripeSecretKey}
                        onChange={(e) => updatePayments('stripeSecretKey', e.target.value)}
                        placeholder="sk_live_..."
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">PayPal Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paypal-client-id">Client ID</Label>
                      <Input
                        id="paypal-client-id"
                        value={settings.payments.paypalClientId}
                        onChange={(e) => updatePayments('paypalClientId', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paypal-secret">Secret</Label>
                      <Input
                        id="paypal-secret"
                        type="password"
                        value={settings.payments.paypalSecret}
                        onChange={(e) => updatePayments('paypalSecret', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.payments.currency}
                      onValueChange={(value) => updatePayments('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      step="0.01"
                      value={settings.payments.taxRate * 100}
                      onChange={(e) => updatePayments('taxRate', parseFloat(e.target.value) / 100)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure email, SMS, and push notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-notifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateNotifications('emailNotifications', checked)}
                  />
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sms-notifications"
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => updateNotifications('smsNotifications', checked)}
                  />
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="push-notifications"
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => updateNotifications('pushNotifications', checked)}
                  />
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">SMTP Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input
                      id="smtp-host"
                      value={settings.notifications.smtpHost}
                      onChange={(e) => updateNotifications('smtpHost', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      value={settings.notifications.smtpPort}
                      onChange={(e) => updateNotifications('smtpPort', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-user">SMTP Username</Label>
                    <Input
                      id="smtp-user"
                      value={settings.notifications.smtpUser}
                      onChange={(e) => updateNotifications('smtpUser', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">SMTP Password</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      value={settings.notifications.smtpPassword}
                      onChange={(e) => updateNotifications('smtpPassword', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Third-Party Integrations
              </CardTitle>
              <CardDescription>
                Configure external services and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ga-id">Google Analytics ID</Label>
                  <Input
                    id="ga-id"
                    value={settings.integrations.googleAnalyticsId}
                    onChange={(e) => updateIntegrations('googleAnalyticsId', e.target.value)}
                    placeholder="GA_MEASUREMENT_ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-pixel">Facebook Pixel ID</Label>
                  <Input
                    id="fb-pixel"
                    value={settings.integrations.facebookPixelId}
                    onChange={(e) => updateIntegrations('facebookPixelId', e.target.value)}
                    placeholder="123456789012345"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Firebase Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firebase-api-key">API Key</Label>
                    <Input
                      id="firebase-api-key"
                      value={settings.integrations.firebaseConfig.apiKey}
                      onChange={(e) => updateIntegrations('firebaseConfig', {
                        ...settings.integrations.firebaseConfig,
                        apiKey: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firebase-auth-domain">Auth Domain</Label>
                    <Input
                      id="firebase-auth-domain"
                      value={settings.integrations.firebaseConfig.authDomain}
                      onChange={(e) => updateIntegrations('firebaseConfig', {
                        ...settings.integrations.firebaseConfig,
                        authDomain: e.target.value
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="firebase-project-id">Project ID</Label>
                    <Input
                      id="firebase-project-id"
                      value={settings.integrations.firebaseConfig.projectId}
                      onChange={(e) => updateIntegrations('firebaseConfig', {
                        ...settings.integrations.firebaseConfig,
                        projectId: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firebase-storage-bucket">Storage Bucket</Label>
                    <Input
                      id="firebase-storage-bucket"
                      value={settings.integrations.firebaseConfig.storageBucket}
                      onChange={(e) => updateIntegrations('firebaseConfig', {
                        ...settings.integrations.firebaseConfig,
                        storageBucket: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firebase-app-id">App ID</Label>
                    <Input
                      id="firebase-app-id"
                      value={settings.integrations.firebaseConfig.appId}
                      onChange={(e) => updateIntegrations('firebaseConfig', {
                        ...settings.integrations.firebaseConfig,
                        appId: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketplace</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable product catalog and purchases
                      </p>
                    </div>
                    <Switch
                      checked={settings.features.enableMarketplace}
                      onCheckedChange={(checked) => updateFeatures('enableMarketplace', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Community Features</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable forums and social features
                      </p>
                    </div>
                    <Switch
                      checked={settings.features.enableCommunity}
                      onCheckedChange={(checked) => updateFeatures('enableCommunity', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Live Streaming</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable live video streaming
                      </p>
                    </div>
                    <Switch
                      checked={settings.features.enableLiveStreaming}
                      onCheckedChange={(checked) => updateFeatures('enableLiveStreaming', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Virtual Gifts</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable digital gift system
                      </p>
                    </div>
                    <Switch
                      checked={settings.features.enableVirtualGifts}
                      onCheckedChange={(checked) => updateFeatures('enableVirtualGifts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Reviews & Ratings</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable user reviews and ratings
                      </p>
                    </div>
                    <Switch
                      checked={settings.features.enableReviews}
                      onCheckedChange={(checked) => updateFeatures('enableReviews', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable platform analytics tracking
                      </p>
                    </div>
                    <Switch
                      checked={settings.features.enableAnalytics}
                      onCheckedChange={(checked) => updateFeatures('enableAnalytics', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}