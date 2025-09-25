'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Users, 
  Pin, 
  Lock, 
  Eye, 
  Plus,
  Search,
  TrendingUp,
  Clock,
  Star,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/EnhancedAuthProvider';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  replyCount: number;
  lastPost?: {
    id: string;
    title: string;
    author: string;
    createdAt: string;
  };
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  category: {
    id: string;
    name: string;
  };
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  lastReply?: {
    author: string;
    createdAt: string;
  };
}

export function ForumOverview() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [recentPosts, setRecentPosts] = useState<ForumPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForumData();
  }, []);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, postsRes] = await Promise.all([
        fetch('/api/forum/categories'),
        fetch('/api/forum/posts?recent=true&limit=10')
      ]);

      if (categoriesRes.ok && postsRes.ok) {
        const [categoriesData, postsData] = await Promise.all([
          categoriesRes.json(),
          postsRes.json()
        ]);
        setCategories(categoriesData.categories || []);
        setRecentPosts(postsData.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes < 1 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
          <p className="text-muted-foreground">
            Connect with fellow seekers and spiritual readers
          </p>
        </div>
        {user && (
          <Link href="/forum/new-post">
            <Button className="bg-mystical-pink hover:bg-mystical-pink/90">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </Link>
        )}
      </div>
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forum posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Forum Categories
              </CardTitle>
              <CardDescription>
                Explore different discussion topics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/forum/category/${category.id}`}>
                  <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-mystical-pink/10 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-mystical-pink" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {category.postCount} posts
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {category.replyCount} replies
                            </span>
                          </div>
                        </div>
                      </div>
                      {category.lastPost && (
                        <div className="text-right text-xs text-muted-foreground">
                          <p className="font-medium">{category.lastPost.author}</p>
                          <p>{formatDate(category.lastPost.createdAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Discussions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <Link key={post.id} href={`/forum/post/${post.id}`}>
                    <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>
                            {getInitials(post.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {post.isPinned && <Pin className="h-3 w-3 text-mystical-pink" />}
                            {post.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                            <h3 className="font-semibold truncate">{post.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {post.category.name}
                              </Badge>
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.replyCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Forum Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Forum Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Posts</span>
                <Badge variant="secondary">
                  {categories.reduce((sum, cat) => sum + cat.postCount, 0)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Replies</span>
                <Badge variant="secondary">
                  {categories.reduce((sum, cat) => sum + cat.replyCount, 0)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Categories</span>
                <Badge variant="secondary">{categories.length}</Badge>
              </div>
            </CardContent>
          </Card>
          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Be respectful to all community members</p>
              <p>• Keep discussions relevant to spirituality</p>
              <p>• No spam or promotional content</p>
              <p>• Report inappropriate behavior</p>
              <p>• Share knowledge and experiences</p>
            </CardContent>
          </Card>
          {/* Online Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Who's Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>24 members, 8 guests</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}