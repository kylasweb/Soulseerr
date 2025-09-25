'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ForumOverview } from '@/components/community/ForumOverview';
import { LiveStreamHub } from '@/components/community/LiveStreamHub';
import { VirtualGifts } from '@/components/community/VirtualGifts';
import { Users, MessageSquare, Video, Star, Gift } from 'lucide-react';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-purple/5 via-white to-mystical-pink/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-mystical-purple to-mystical-pink bg-clip-text text-transparent mb-4">
            SoulSeer Community
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Connect with fellow seekers, participate in live spiritual sessions, and explore the mystical arts together
          </p>
          
          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-mystical-purple" />
              </div>
              <div className="text-2xl font-bold text-mystical-purple">12.5K</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6 text-mystical-pink" />
              </div>
              <div className="text-2xl font-bold text-mystical-pink">3.2K</div>
              <div className="text-sm text-muted-foreground">Forum Posts</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Video className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-500">847</div>
              <div className="text-sm text-muted-foreground">Live Sessions</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-yellow-500">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="forum" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="forum" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Forum
            </TabsTrigger>
            <TabsTrigger value="streams" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Live Streams
            </TabsTrigger>
            <TabsTrigger value="gifts" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Virtual Gifts
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="forum" className="space-y-6">
            <ForumOverview />
          </TabsContent>
          
          <TabsContent value="streams" className="space-y-6">
            <LiveStreamHub />
          </TabsContent>
          
          <TabsContent value="gifts" className="space-y-6">
            <VirtualGifts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
