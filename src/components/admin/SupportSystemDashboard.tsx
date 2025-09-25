'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Headphones, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Star, 
  Send, 
  Search,
  Filter,
  Plus,
  Eye,
  Reply,
  Archive,
  Tag,
  Calendar,
  Phone,
  Mail,
  BarChart3,
  TrendingUp,
  UserCheck,
  MessageCircle,
  RefreshCw,
  Zap
} from 'lucide-react';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'waiting-response' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    tier: 'free' | 'premium' | 'vip';
  };
  createdAt: Date;
  updatedAt: Date;
  messages: SupportMessage[];
  tags: string[];
  satisfaction?: number;
  resolutionTime?: number;
}

interface SupportMessage {
  id: string;
  content: string;
  isFromCustomer: boolean;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  attachments?: string[];
}

interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  activeTickets: number;
  completedTickets: number;
  satisfaction: number;
  responseTime: number;
}

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  ticketTrends: {
    period: string;
    tickets: number;
    resolved: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

const SupportSystemDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('tickets');

  // TODO: Replace with actual API calls
  useEffect(() => {
    const loadSupportData = async () => {
      setLoading(true);

      // TODO: Replace with actual API calls
      const stats: SupportStats = {
        totalTickets: 0,
        openTickets: 0,
        resolvedToday: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0,
        satisfactionScore: 0,
        ticketTrends: [],
        categoryBreakdown: []
      };

      // TODO: Replace with actual API calls
      const tickets: SupportTicket[] = [];

      // TODO: Replace with actual API calls
      const agents: SupportAgent[] = [];

      setStats(stats);
      setTickets(tickets);
      setAgents(agents);
      setLoading(false);
    };

    loadSupportData();
  }, []);

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'waiting-response': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: 'free' | 'premium' | 'vip') => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedTicket) {
      const message: SupportMessage = {
        id: Date.now().toString(),
        content: newMessage,
        isFromCustomer: false,
        author: { name: 'Support Agent' },
        createdAt: new Date()
      };

      setSelectedTicket({
        ...selectedTicket,
        messages: [...selectedTicket.messages, message],
        updatedAt: new Date()
      });

      setNewMessage('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading support system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Headphones className="h-8 w-8 text-purple-600" />
              Support System
            </h1>
            <p className="text-gray-600 mt-2">
              Manage customer support tickets and communication
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Open Tickets</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.openTickets}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Resolved Today</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resolvedToday}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.avgResponseTime}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Satisfaction</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold text-purple-600">{stats.satisfactionScore}</p>
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Tickets List */}
              <div className="flex-1 space-y-4">
                {/* Search and Filters */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[150px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="waiting-response">Waiting</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-full md:w-[150px]">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Tickets List */}
                <div className="space-y-2">
                  {filteredTickets.map((ticket) => (
                    <Card 
                      key={ticket.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTicket?.id === ticket.id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                              <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                                {ticket.status.replace('-', ' ')}
                              </Badge>
                              <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={`${getTierColor(ticket.customer.tier)} text-xs`}>
                                {ticket.customer.tier}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {ticket.ticketNumber}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {ticket.customer.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {ticket.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {ticket.assignedTo && (
                              <p className="text-sm text-gray-600">Assigned to: {ticket.assignedTo}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Updated: {ticket.updatedAt.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Ticket Detail Panel */}
              {selectedTicket && (
                <div className="w-full lg:w-96 space-y-4">
                  <Card className="h-fit">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        Ticket #{selectedTicket.ticketNumber}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Customer Info */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar>
                          <AvatarImage src={selectedTicket.customer.avatar} />
                          <AvatarFallback>
                            {selectedTicket.customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedTicket.customer.name}</p>
                          <p className="text-sm text-gray-600">{selectedTicket.customer.email}</p>
                        </div>
                        <Badge className={`${getTierColor(selectedTicket.customer.tier)} text-xs ml-auto`}>
                          {selectedTicket.customer.tier}
                        </Badge>
                      </div>

                      {/* Status Controls */}
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={selectedTicket.status}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="waiting-response">Waiting Response</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={selectedTicket.priority}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {selectedTicket.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Messages */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Conversation</h4>
                        <ScrollArea className="h-64">
                          <div className="space-y-3 pr-4">
                            {selectedTicket.messages.map((message) => (
                              <div
                                key={message.id}
                                className={`p-3 rounded-lg ${
                                  message.isFromCustomer
                                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                    : 'bg-purple-50 border-l-4 border-l-purple-500'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-medium text-sm">{message.author.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {message.createdAt.toLocaleTimeString()}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-700">{message.content}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>

                        {/* Reply */}
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Type your response..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            rows={3}
                          />
                          <div className="flex justify-between">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Tag className="h-4 w-4 mr-1" />
                                Add Tags
                              </Button>
                            </div>
                            <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{agent.name}</h3>
                        <p className="text-sm text-gray-600">{agent.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            agent.status === 'online' ? 'bg-green-500' :
                            agent.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`} />
                          <span className="text-sm capitalize">{agent.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Tickets</span>
                        <span className="font-medium">{agent.activeTickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="font-medium">{agent.completedTickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Satisfaction</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{agent.satisfaction}</span>
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Response</span>
                        <span className="font-medium">{agent.responseTime}h</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Ticket Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.ticketTrends.map((trend) => (
                        <div key={trend.period} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{trend.period}</span>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Created: {trend.tickets}</p>
                              <p className="text-sm text-green-600">Resolved: {trend.resolved}</p>
                            </div>
                            <Progress 
                              value={(trend.resolved / trend.tickets) * 100} 
                              className="w-16"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Category Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.categoryBreakdown.map((category) => (
                        <div key={category.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{category.category}</span>
                            <div className="text-right">
                              <span className="text-sm text-gray-600">{category.count}</span>
                              <span className="text-xs text-gray-500 ml-2">({category.percentage}%)</span>
                            </div>
                          </div>
                          <Progress value={category.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base Management</CardTitle>
                <CardDescription>
                  Manage support articles and FAQ content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Knowledge Base</h3>
                  <p className="text-gray-600 mb-6">
                    Create and manage support articles, FAQs, and help documentation.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Article
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupportSystemDashboard;