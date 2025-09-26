'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  UserX, 
  Shield, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { toast } from 'sonner';
import UserDetailModal from './UserDetailModal';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  clientCount: number;
  readerCount: number;
  adminCount: number;
  suspendedCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'READER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  avatar?: string;
  phone?: string;
  location?: string;
  createdAt: string;
  lastActive?: string;
  totalSessions?: number;
  totalSpent?: number;
  totalEarned?: number;
  averageRating?: number;
  verificationStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  verificationStatus: string;
  dateRange: string;
}

export default function UserManagementDashboard() {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    clientCount: 0,
    readerCount: 0,
    adminCount: 0,
    suspendedCount: 0
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    verificationStatus: 'all',
    dateRange: 'all'
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);

  const { socket } = useSocket();

  // Fetch user statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      toast.error('Failed to load user statistics');
    }
  }, []);

  // Fetch users with filtering and pagination
  const fetchUsers = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: filters.search,
        role: filters.role,
        status: filters.status,
        verificationStatus: filters.verificationStatus,
        dateRange: filters.dateRange
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleUserUpdate = (data: { type: string; user: User }) => {
      if (data.type === 'created') {
        setUsers(prev => [data.user, ...prev]);
        fetchStats(); // Refresh stats
      } else if (data.type === 'updated') {
        setUsers(prev => prev.map(user => 
          user.id === data.user.id ? data.user : user
        ));
      } else if (data.type === 'deleted') {
        setUsers(prev => prev.filter(user => user.id !== data.user.id));
        fetchStats(); // Refresh stats
      }
    };

    socket!.on('admin:user:update', handleUserUpdate);

    return () => {
      socket!.off('admin:user:update', handleUserUpdate);
    };
  }, [socket, fetchStats]);

  // Filter handlers
  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all',
      verificationStatus: 'all',
      dateRange: 'all'
    });
  };

  // User actions
  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsUserDetailOpen(true);
  };

  const handleCloseUserDetail = () => {
    setIsUserDetailOpen(false);
    setSelectedUserId(null);
  };

  const handleUserUpdated = () => {
    fetchUsers(currentPage);
    fetchStats();
  };

  const suspendUser = async (userId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('User suspended successfully');
        fetchUsers(currentPage);
        fetchStats();
      } else {
        toast.error('Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Error suspending user');
    }
  };

  const activateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/activate`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('User activated successfully');
        fetchUsers(currentPage);
        fetchStats();
      } else {
        toast.error('Failed to activate user');
      }
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Error activating user');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers(currentPage);
        fetchStats();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'INACTIVE': return 'bg-gray-500';
      case 'SUSPENDED': return 'bg-red-500';
      case 'PENDING': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
      case 'INACTIVE': return <XCircle className="w-4 h-4" />;
      case 'SUSPENDED': return <Ban className="w-4 h-4" />;
      case 'PENDING': return <AlertTriangle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'READER': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'CLIENT': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading && users.length === 0) {
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
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all platform users, roles, and permissions</p>
        </div>
        
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add New User
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Growth trend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspendedCount}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.suspendedCount / stats.totalUsers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.clientCount}</div>
            <p className="text-sm text-muted-foreground">
              {((stats.clientCount / stats.totalUsers) * 100).toFixed(1)}% of users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Readers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.readerCount}</div>
            <p className="text-sm text-muted-foreground">
              {((stats.readerCount / stats.totalUsers) * 100).toFixed(1)}% of users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.adminCount}</div>
            <p className="text-sm text-muted-foreground">
              {((stats.adminCount / stats.totalUsers) * 100).toFixed(1)}% of users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced User Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">All Users</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="readers">Readers</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="CLIENT">Clients</SelectItem>
                    <SelectItem value="READER">Readers</SelectItem>
                    <SelectItem value="ADMIN">Admins</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.verificationStatus} onValueChange={(value) => handleFilterChange('verificationStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={clearFilters} variant="outline" className="whitespace-nowrap">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({users.length} of {stats.totalUsers})</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(user.status)} text-white`}>
                            {getStatusIcon(user.status)}
                            <span className="ml-1">{user.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          {user.lastActive ? formatTimeAgo(user.lastActive) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewUser(user.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewUser(user.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.status === 'ACTIVE' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => suspendUser(user.id)}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-500"
                                onClick={() => activateUser(user.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual role tabs would have similar structure with role-specific data */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>Manage client accounts and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Client-specific management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reader Management</CardTitle>
              <CardDescription>Manage reader profiles and verification</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reader-specific management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Management</CardTitle>
              <CardDescription>Manage admin accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Admin-specific management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Modal */}
      <UserDetailModal
        userId={selectedUserId}
        isOpen={isUserDetailOpen}
        onClose={handleCloseUserDetail}
        onUpdate={handleUserUpdated}
      />
    </div>
  );
}