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
  Eye,
  Save,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Type,
  Palette,
  Layout,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  Star,
  Users,
  Sparkles,
  BarChart3,
  Shield,
  MessageSquare,
  Heart,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface LandingPageSettings {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    backgroundVideo: string;
    ctaText: string;
    ctaLink: string;
    enabled: boolean;
  };
  features: {
    enabled: boolean;
    items: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      enabled: boolean;
    }>;
  };
  testimonials: {
    enabled: boolean;
    items: Array<{
      id: string;
      name: string;
      role: string;
      content: string;
      rating: number;
      avatar: string;
      enabled: boolean;
    }>;
  };
  stats: {
    enabled: boolean;
    items: Array<{
      id: string;
      label: string;
      value: string;
      icon: string;
      enabled: boolean;
    }>;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
}

export function LandingPageCustomizer() {
  const [settings, setSettings] = useState<LandingPageSettings>({
    hero: {
      title: 'Discover Your Spiritual Path',
      subtitle: 'Connect with gifted spiritual readers and find guidance for your journey',
      backgroundImage: '/mystical-goddess.png',
      backgroundVideo: '',
      ctaText: 'Find Your Reader',
      ctaLink: '/readers',
      enabled: true
    },
    features: {
      enabled: true,
      items: [
        {
          id: '1',
          title: 'Expert Readers',
          description: 'Connect with verified spiritual practitioners',
          icon: 'Users',
          enabled: true
        },
        {
          id: '2',
          title: 'Secure Sessions',
          description: 'Private and confidential consultations',
          icon: 'Shield',
          enabled: true
        },
        {
          id: '3',
          title: 'Multiple Formats',
          description: 'Chat, voice, and video sessions available',
          icon: 'MessageSquare',
          enabled: true
        }
      ]
    },
    testimonials: {
      enabled: true,
      items: [
        {
          id: '1',
          name: 'Sarah Johnson',
          role: 'Regular Client',
          content: 'The guidance I received was life-changing. Highly recommend!',
          rating: 5,
          avatar: '',
          enabled: true
        }
      ]
    },
    stats: {
      enabled: true,
      items: [
        {
          id: '1',
          label: 'Happy Clients',
          value: '10,000+',
          icon: 'Users',
          enabled: true
        },
        {
          id: '2',
          label: 'Expert Readers',
          value: '500+',
          icon: 'Star',
          enabled: true
        },
        {
          id: '3',
          label: 'Sessions Completed',
          value: '50,000+',
          icon: 'Sparkles',
          enabled: true
        }
      ]
    },
    seo: {
      metaTitle: 'SoulSeer - Connect with Spiritual Readers',
      metaDescription: 'Find guidance and clarity with our community of gifted spiritual readers. Book chat, voice, and video sessions today.',
      keywords: ['spiritual', 'readers', 'guidance', 'tarot', 'psychic'],
      ogImage: '/mystical-goddess.png'
    },
    theme: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#F59E0B',
      accentColor: '#EC4899',
      fontFamily: 'Inter'
    }
  });

  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Landing page settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updateHero = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateFeature = (id: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        items: prev.features.items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const updateTestimonial = (id: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        items: prev.testimonials.items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const updateStat = (id: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        items: prev.stats.items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const updateSEO = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  const updateTheme = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      theme: { ...prev.theme, [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Landing Page Customizer</h3>
          <p className="text-sm text-muted-foreground">
            Customize your website's landing page appearance and content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Hero Section
              </CardTitle>
              <CardDescription>
                Configure the main hero section of your landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="hero-enabled">Enable Hero Section</Label>
                <Switch
                  id="hero-enabled"
                  checked={settings.hero.enabled}
                  onCheckedChange={(checked) => updateHero('enabled', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Hero Title</Label>
                  <Input
                    id="hero-title"
                    value={settings.hero.title}
                    onChange={(e) => updateHero('title', e.target.value)}
                    placeholder="Enter hero title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                  <Input
                    id="hero-subtitle"
                    value={settings.hero.subtitle}
                    onChange={(e) => updateHero('subtitle', e.target.value)}
                    placeholder="Enter hero subtitle"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta-text">Call-to-Action Text</Label>
                  <Input
                    id="cta-text"
                    value={settings.hero.ctaText}
                    onChange={(e) => updateHero('ctaText', e.target.value)}
                    placeholder="Find Your Reader"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-link">Call-to-Action Link</Label>
                  <Input
                    id="cta-link"
                    value={settings.hero.ctaLink}
                    onChange={(e) => updateHero('ctaLink', e.target.value)}
                    placeholder="/readers"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background-image">Background Image URL</Label>
                <Input
                  id="background-image"
                  value={settings.hero.backgroundImage}
                  onChange={(e) => updateHero('backgroundImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Features Section
              </CardTitle>
              <CardDescription>
                Configure the features displayed on your landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="features-enabled">Enable Features Section</Label>
                <Switch
                  id="features-enabled"
                  checked={settings.features.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    features: { ...prev.features, enabled: checked }
                  }))}
                />
              </div>

              <div className="space-y-4">
                {settings.features.items.map((feature, index) => (
                  <Card key={feature.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Feature {index + 1}</Badge>
                        <Switch
                          checked={feature.enabled}
                          onCheckedChange={(checked) => updateFeature(feature.id, 'enabled', checked)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={feature.title}
                          onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <Select
                          value={feature.icon}
                          onValueChange={(value) => updateFeature(feature.id, 'icon', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Users">Users</SelectItem>
                            <SelectItem value="Shield">Shield</SelectItem>
                            <SelectItem value="MessageSquare">MessageSquare</SelectItem>
                            <SelectItem value="Star">Star</SelectItem>
                            <SelectItem value="Heart">Heart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label>Description</Label>
                      <Textarea
                        value={feature.description}
                        onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Testimonials Section
              </CardTitle>
              <CardDescription>
                Manage customer testimonials displayed on your landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="testimonials-enabled">Enable Testimonials Section</Label>
                <Switch
                  id="testimonials-enabled"
                  checked={settings.testimonials.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    testimonials: { ...prev.testimonials, enabled: checked }
                  }))}
                />
              </div>

              <div className="space-y-4">
                {settings.testimonials.items.map((testimonial, index) => (
                  <Card key={testimonial.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Testimonial {index + 1}</Badge>
                        <Switch
                          checked={testimonial.enabled}
                          onCheckedChange={(checked) => updateTestimonial(testimonial.id, 'enabled', checked)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={testimonial.name}
                          onChange={(e) => updateTestimonial(testimonial.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                          value={testimonial.role}
                          onChange={(e) => updateTestimonial(testimonial.id, 'role', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label>Content</Label>
                      <Textarea
                        value={testimonial.content}
                        onChange={(e) => updateTestimonial(testimonial.id, 'content', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label>Rating (1-5)</Label>
                      <Select
                        value={testimonial.rating.toString()}
                        onValueChange={(value) => updateTestimonial(testimonial.id, 'rating', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistics Section
              </CardTitle>
              <CardDescription>
                Configure the statistics displayed on your landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="stats-enabled">Enable Statistics Section</Label>
                <Switch
                  id="stats-enabled"
                  checked={settings.stats.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    stats: { ...prev.stats, enabled: checked }
                  }))}
                />
              </div>

              <div className="space-y-4">
                {settings.stats.items.map((stat, index) => (
                  <Card key={stat.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Stat {index + 1}</Badge>
                        <Switch
                          checked={stat.enabled}
                          onCheckedChange={(checked) => updateStat(stat.id, 'enabled', checked)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Label</Label>
                        <Input
                          value={stat.label}
                          onChange={(e) => updateStat(stat.id, 'label', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          value={stat.value}
                          onChange={(e) => updateStat(stat.id, 'value', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <Select
                          value={stat.icon}
                          onValueChange={(value) => updateStat(stat.id, 'icon', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Users">Users</SelectItem>
                            <SelectItem value="Star">Star</SelectItem>
                            <SelectItem value="Sparkles">Sparkles</SelectItem>
                            <SelectItem value="Heart">Heart</SelectItem>
                            <SelectItem value="TrendingUp">TrendingUp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO Settings
              </CardTitle>
              <CardDescription>
                Configure SEO meta tags and social media settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={settings.seo.metaTitle}
                  onChange={(e) => updateSEO('metaTitle', e.target.value)}
                  placeholder="Page title for search engines"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={settings.seo.metaDescription}
                  onChange={(e) => updateSEO('metaDescription', e.target.value)}
                  placeholder="Page description for search engines"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={settings.seo.keywords.join(', ')}
                  onChange={(e) => updateSEO('keywords', e.target.value.split(',').map(k => k.trim()))}
                  placeholder="spiritual, readers, guidance, tarot"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="og-image">Open Graph Image URL</Label>
                <Input
                  id="og-image"
                  value={settings.seo.ogImage}
                  onChange={(e) => updateSEO('ogImage', e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Settings
              </CardTitle>
              <CardDescription>
                Customize the visual appearance of your landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.theme.primaryColor}
                      onChange={(e) => updateTheme('primaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.theme.primaryColor}
                      onChange={(e) => updateTheme('primaryColor', e.target.value)}
                      placeholder="#8B5CF6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={settings.theme.secondaryColor}
                      onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.theme.secondaryColor}
                      onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                      placeholder="#F59E0B"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={settings.theme.accentColor}
                      onChange={(e) => updateTheme('accentColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.theme.accentColor}
                      onChange={(e) => updateTheme('accentColor', e.target.value)}
                      placeholder="#EC4899"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select
                    value={settings.theme.fontFamily}
                    onValueChange={(value) => updateTheme('fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}