'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  FileText, 
  Plus, 
  Edit,
  Trash2,
  Search,
  Filter,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Globe,
  Eye,
  EyeOff,
  Calendar,
  User,
  Tag,
  Folder,
  Upload,
  Download,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Users,
  BarChart3,
  RefreshCw,
  Copy,
  ExternalLink,
  Image,
  Video,
  Link,
  Bold,
  Italic,
  List,
  Quote,
  Code
} from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: 'page' | 'article' | 'faq' | 'guide' | 'policy';
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  itemCount: number;
  createdAt: string;
}

interface ContentStats {
  totalItems: number;
  publishedItems: number;
  draftItems: number;
  archivedItems: number;
  totalViews: number;
  popularContent: number;
  recentUpdates: number;
}

interface ContentFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: 'page' | 'article' | 'faq' | 'guide' | 'policy';
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export default function ContentManagementDashboard() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [stats, setStats] = useState<ContentStats>({
    totalItems: 0,
    publishedItems: 0,
    draftItems: 0,
    archivedItems: 0,
    totalViews: 0,
    popularContent: 0,
    recentUpdates: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    type: 'article',
    status: 'draft',
    category: '',
    tags: [],
    featured: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: []
  });

  const { socket } = useSocket();

  // Fetch content statistics
  const fetchContentStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/content/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch content stats:', error);
      toast.error('Failed to load content statistics');
    }
  }, []);

  // Fetch content items
  const fetchContentItems = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        type: selectedType,
        status: selectedStatus,
        category: selectedCategory,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/content/items?${params}`);
      const data = await response.json();
      setContentItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch content items:', error);
      toast.error('Failed to load content items');
    }
  }, [searchQuery, selectedType, selectedStatus, selectedCategory, sortBy, sortOrder]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/content/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  }, []);

  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchContentStats(),
        fetchContentItems(),
        fetchCategories()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchContentStats, fetchContentItems, fetchCategories]);

  // Load data on component mount and when filters change
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleContentUpdate = (data: { type: string; itemId?: string }) => {
      if (data.type === 'content_created' || data.type === 'content_updated' || data.type === 'content_deleted') {
        fetchContentItems();
        fetchContentStats();
      }
    };

    socket!.on('admin:content:update', handleContentUpdate);

    return () => {
      socket!.off('admin:content:update', handleContentUpdate);
    };
  }, [socket, fetchContentItems, fetchContentStats]);

  // Reset form data
  const resetFormData = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      type: 'article',
      status: 'draft',
      category: '',
      tags: [],
      featured: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: []
    });
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle form input changes
  const handleInputChange = (field: keyof ContentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug when title changes
    if (field === 'title' && value) {
      const slug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  // Handle tag input
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  // Handle SEO keywords
  const handleSeoKeywordsChange = (keywordsString: string) => {
    const keywords = keywordsString.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0);
    setFormData(prev => ({
      ...prev,
      seoKeywords: keywords
    }));
  };

  // Create content item
  const handleCreateContent = async () => {
    try {
      const response = await fetch('/api/admin/content/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Content created successfully');
        setShowCreateDialog(false);
        resetFormData();
        fetchContentItems();
        fetchContentStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create content');
      }
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Error creating content');
    }
  };

  // Update content item
  const handleUpdateContent = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/admin/content/items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Content updated successfully');
        setShowEditDialog(false);
        setEditingItem(null);
        resetFormData();
        fetchContentItems();
        fetchContentStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Error updating content');
    }
  };

  // Delete content item
  const handleDeleteContent = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/content/items/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Content deleted successfully');
        fetchContentItems();
        fetchContentStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Error deleting content');
    }
  };

  // Toggle content status
  const toggleContentStatus = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const response = await fetch(`/api/admin/content/items/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Content ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
        fetchContentItems();
        fetchContentStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update content status');
      }
    } catch (error) {
      console.error('Error updating content status:', error);
      toast.error('Error updating content status');
    }
  };

  // Open edit dialog
  const openEditDialog = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      content: item.content,
      excerpt: item.excerpt,
      type: item.type,
      status: item.status,
      category: item.category,
      tags: item.tags,
      featured: item.featured,
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      seoKeywords: item.seoKeywords || []
    });
    setShowEditDialog(true);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-100 text-blue-800';
      case 'article': return 'bg-purple-100 text-purple-800';
      case 'faq': return 'bg-orange-100 text-orange-800';
      case 'guide': return 'bg-indigo-100 text-indigo-800';
      case 'policy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage platform content, documentation, and knowledge base</p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={loadAllData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Create Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Content</DialogTitle>
                <DialogDescription>
                  Create a new content item for the platform
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter content title"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="url-friendly-slug"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page">Page</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={formData.status} onValueChange={(value: any) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tags (comma-separated)</label>
                    <Input
                      value={formData.tags.join(', ')}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">SEO Title</label>
                    <Input
                      value={formData.seoTitle}
                      onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                      placeholder="SEO optimized title"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">SEO Description</label>
                    <Textarea
                      value={formData.seoDescription}
                      onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                      placeholder="Meta description for search engines"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">SEO Keywords (comma-separated)</label>
                    <Input
                      value={formData.seoKeywords?.join(', ') || ''}
                      onChange={(e) => handleSeoKeywordsChange(e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                    />
                    <label htmlFor="featured" className="text-sm font-medium">Featured Content</label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Excerpt</label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Brief description or excerpt"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Main content body (supports Markdown)"
                    rows={8}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateContent}>
                  Create Content
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentUpdates} recent updates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedItems}</div>
            <p className="text-xs text-muted-foreground">
              Live content items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Items</CardTitle>
            <Edit className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftItems}</div>
            <p className="text-xs text-muted-foreground">
              Work in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Content engagement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="page">Pages</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="faq">FAQs</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="policy">Policies</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="views">Views</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Items</CardTitle>
          <CardDescription>Manage all platform content from one place</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contentItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      {item.featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <span>By {item.author.name}</span>
                      <span>•</span>
                      <span>{formatDate(item.updatedAt)}</span>
                      <span>•</span>
                      <span>{item.views} views</span>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{item.excerpt}</p>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeBadgeColor(item.type)}>
                        {item.type}
                      </Badge>
                      <Badge className={getStatusBadgeColor(item.status)}>
                        {item.status}
                      </Badge>
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleContentStatus(item.id, item.status)}
                    >
                      {item.status === 'published' ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Content</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{item.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteContent(item.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
            
            {contentItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No content items found. Create your first content item to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Update the content item details
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter content title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="url-friendly-slug"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: any) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">SEO Title</label>
                <Input
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  placeholder="SEO optimized title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">SEO Description</label>
                <Textarea
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="Meta description for search engines"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">SEO Keywords (comma-separated)</label>
                <Input
                  value={formData.seoKeywords?.join(', ') || ''}
                  onChange={(e) => handleSeoKeywordsChange(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured-edit"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                />
                <label htmlFor="featured-edit" className="text-sm font-medium">Featured Content</label>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Excerpt</label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Brief description or excerpt"
                rows={2}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Main content body (supports Markdown)"
                rows={8}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateContent}>
              Update Content
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}