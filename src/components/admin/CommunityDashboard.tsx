'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, MessageSquare, Folder, Star, Lock, Unlock, Plus, Search } from 'lucide-react';

const CommunityDashboard: React.FC = () => {
  const [tab, setTab] = useState('forums');

  // Placeholder for API data
  const [categories, setCategories] = useState([]);
  const [threads, setThreads] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch categories
    fetch('/api/community/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories));
    // Fetch threads
    fetch('/api/community/threads')
      .then(res => res.json())
      .then(data => setThreads(data.threads));
    // Fetch posts
    fetch('/api/community/posts')
      .then(res => res.json())
      .then(data => setPosts(data.posts));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            Community & Forums
          </h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Thread
          </Button>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forums">Forums</TabsTrigger>
            <TabsTrigger value="threads">Threads</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="forums">
            <Card>
              <CardHeader>
                <CardTitle>Forum Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat: any) => (
                    <div key={cat.id} className="p-4 border rounded-lg bg-white shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <Folder className="h-5 w-5 text-purple-500" />
                        <span className="font-semibold">{cat.name}</span>
                        {cat.parentId && <Badge variant="secondary">Subcategory</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{cat.description}</p>
                      <div className="flex gap-2 text-xs">
                        <span>Threads: {cat.threads.length}</span>
                        <span>Subcategories: {cat.children.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="threads">
            <Card>
              <CardHeader>
                <CardTitle>Forum Threads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threads.map((thread: any) => (
                    <div key={thread.id} className="p-4 border rounded-lg bg-white shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">{thread.title}</span>
                        {thread.pinned && <Star className="h-4 w-4 text-yellow-500" />}
                        {thread.locked ? <Lock className="h-4 w-4 text-gray-500" /> : <Unlock className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex gap-2 text-xs mb-2">
                        <span>Posts: {thread.posts.length}</span>
                        <span>Views: {thread.views}</span>
                        <span>Category: {thread.category.name}</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span>Author: {thread.author.name}</span>
                        <span>Created: {new Date(thread.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Forum Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post: any) => (
                    <div key={post.id} className="p-4 border rounded-lg bg-white shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-5 w-5 text-gray-500" />
                        <span className="font-semibold">{post.author.name}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{post.content}</p>
                      <div className="flex gap-2 text-xs">
                        <span>Thread: {post.thread.title}</span>
                        <span>Replies: {post.replies.length}</span>
                        <span>Likes: {post.likes}</span>
                        <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityDashboard;
