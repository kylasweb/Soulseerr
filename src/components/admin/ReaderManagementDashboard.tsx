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
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Star, 
  DollarSign, 
  Eye,
  FileText,
  Shield,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Ban,
  Award,
  Activity
} from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { toast } from 'sonner';

interface ReaderStats {
  totalReaders: number;
  activeReaders: number;
  pendingApplications: number;
  pendingVerifications: number;
  verifiedReaders: number;
  rejectedApplications: number;
  suspendedReaders: number;
  averageRating: number;
  totalEarnings: number;
  completedSessions: number;
}

interface ReaderApplication {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  specialties: string[];
  experience: string;
  bio: string;
  certifications?: string[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  documents: Array<{
    id: string;
    type: string;
    url: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  }>;
}

interface ReaderProfile {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  specialties: string[];
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageRating: number;
  totalEarnings: number;
  joinedAt: string;
  lastActive?: string;
  complianceScore: number;
  warningCount: number;
}

interface ReaderFilters {
  search: string;
  status: string;
  verificationStatus: string;
  specialty: string;
  ratingRange: string;
  dateRange: string;
}

export default function ReaderManagementDashboard() {
  const [stats, setStats] = useState<ReaderStats>({
    totalReaders: 0,
    activeReaders: 0,
    pendingApplications: 0,
    pendingVerifications: 0,
    verifiedReaders: 0,
    rejectedApplications: 0,
    suspendedReaders: 0,
    averageRating: 0,
    totalEarnings: 0,
    completedSessions: 0
  });

  const [applications, setApplications] = useState<ReaderApplication[]>([]);
  const [readers, setReaders] = useState<ReaderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ReaderFilters>({
    search: '',
    status: 'all',
    verificationStatus: 'all',
    specialty: 'all',
    ratingRange: 'all',
    dateRange: 'all'
  });

  const { socket } = useSocket();

  // Fetch reader statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/readers/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch reader stats:', error);
      toast.error('Failed to load reader statistics');
    }
  }, []);

  // Fetch reader applications
  const fetchApplications = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: filters.status,
        verificationStatus: filters.verificationStatus,
        search: filters.search
      });

      const response = await fetch(`/api/admin/readers/applications?${params}`);
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch reader profiles
  const fetchReaders = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: filters.search,
        status: filters.status,
        verificationStatus: filters.verificationStatus,
        specialty: filters.specialty,
        ratingRange: filters.ratingRange,
        dateRange: filters.dateRange
      });

      const response = await fetch(`/api/admin/readers?${params}`);
      const data = await response.json();
      setReaders(data.readers || []);
    } catch (error) {
      console.error('Failed to fetch readers:', error);
      toast.error('Failed to load readers');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load data on component mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications(1);
    } else if (activeTab === 'readers') {
      fetchReaders(1);
    }
  }, [activeTab, fetchApplications, fetchReaders]);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleReaderUpdate = (data: { type: string; readerId?: string; applicationId?: string }) => {
      if (data.type === 'application_submitted' || data.type === 'application_reviewed') {
        fetchApplications(currentPage);
        fetchStats();
      } else if (data.type === 'reader_updated' || data.type === 'reader_suspended') {
        fetchReaders(currentPage);
        fetchStats();
      }
    };

    socket!.on('admin:reader:update', handleReaderUpdate);

    return () => {
      socket!.off('admin:reader:update', handleReaderUpdate);
    };
  }, [socket, currentPage, fetchApplications, fetchReaders, fetchStats]);

  // Application actions
  const approveApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/admin/readers/applications/${applicationId}/approve`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Application approved successfully');
        fetchApplications(currentPage);
        fetchStats();
      } else {
        toast.error('Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Error approving application');
    }
  };

  const rejectApplication = async (applicationId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/readers/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('Application rejected');
        fetchApplications(currentPage);
        fetchStats();
      } else {
        toast.error('Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Error rejecting application');
    }
  };

  // Reader actions
  const suspendReader = async (readerId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/readers/${readerId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('Reader suspended successfully');
        fetchReaders(currentPage);
        fetchStats();
      } else {
        toast.error('Failed to suspend reader');
      }
    } catch (error) {
      console.error('Error suspending reader:', error);
      toast.error('Error suspending reader');
    }
  };

  const activateReader = async (readerId: string) => {
    try {
      const response = await fetch(`/api/admin/readers/${readerId}/activate`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Reader activated successfully');
        fetchReaders(currentPage);
        fetchStats();
      } else {
        toast.error('Failed to activate reader');
      }
    } catch (error) {
      console.error('Error activating reader:', error);
      toast.error('Error activating reader');
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': case 'APPROVED': case 'VERIFIED': return 'bg-green-500';
      case 'PENDING': case 'UNDER_REVIEW': return 'bg-yellow-500';
      case 'REJECTED': case 'SUSPENDED': case 'INACTIVE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': case 'APPROVED': case 'VERIFIED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': case 'UNDER_REVIEW': return <Clock className="w-4 h-4" />;
      case 'REJECTED': case 'SUSPENDED': return <XCircle className="w-4 h-4" />;
      case 'INACTIVE': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && applications.length === 0 && readers.length === 0) {
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
          <h1 className="text-3xl font-bold">Reader Management</h1>
          <p className="text-muted-foreground">Manage reader applications, verification, and performance</p>
        </div>
        
        <Button className="flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Review Applications
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Readers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReaders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeReaders} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Need review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Readers</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedReaders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingVerifications} pending verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.completedSessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Platform revenue share
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">
            Applications
            {stats.pendingApplications > 0 && (
              <Badge className="ml-2 bg-yellow-500">{stats.pendingApplications}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="readers">Active Readers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Pending Review</span>
                  <Badge className="bg-yellow-500">{stats.pendingApplications}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Approved</span>
                  <Badge className="bg-green-500">{stats.verifiedReaders}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rejected</span>
                  <Badge className="bg-red-500">{stats.rejectedApplications}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reader Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Active</span>
                  <Badge className="bg-green-500">{stats.activeReaders}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Suspended</span>
                  <Badge className="bg-red-500">{stats.suspendedReaders}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Verification Pending</span>
                  <Badge className="bg-yellow-500">{stats.pendingVerifications}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span className="font-bold">{stats.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Sessions</span>
                  <span className="font-bold">{stats.completedSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Earnings</span>
                  <span className="font-bold">{formatCurrency(stats.totalEarnings)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Reader Applications</CardTitle>
              <CardDescription>
                Review and process new reader applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Specialties</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={application.user.avatar} alt={application.user.name} />
                              <AvatarFallback>{application.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{application.user.name}</div>
                              <div className="text-sm text-muted-foreground">{application.user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {application.specialties.slice(0, 2).map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {application.specialties.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{application.specialties.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(application.status)} text-white`}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1">{application.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(application.submittedAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {application.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-500"
                                  onClick={() => approveApplication(application.id)}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() => {
                                    const reason = prompt('Reason for rejection:');
                                    if (reason) rejectApplication(application.id, reason);
                                  }}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {applications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No applications found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readers" className="space-y-6">
          {/* Readers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Readers</CardTitle>
              <CardDescription>
                Manage active reader profiles and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reader</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readers.map((reader) => (
                      <TableRow key={reader.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={reader.user.avatar} alt={reader.user.name} />
                              <AvatarFallback>{reader.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{reader.user.name}</div>
                              <div className="text-sm text-muted-foreground">{reader.user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={`${getStatusColor(reader.status)} text-white`}>
                              {getStatusIcon(reader.status)}
                              <span className="ml-1">{reader.status}</span>
                            </Badge>
                            <Badge className={`${getStatusColor(reader.verificationStatus)} text-white text-xs`}>
                              <Shield className="w-3 h-3 mr-1" />
                              {reader.verificationStatus}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                            <span className="font-medium">{reader.averageRating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({reader.completedSessions})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{reader.totalSessions} total</div>
                            <div className="text-muted-foreground">{reader.completedSessions} completed</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(reader.totalEarnings)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {reader.status === 'ACTIVE' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => {
                                  const reason = prompt('Reason for suspension:');
                                  if (reason) suspendReader(reader.id, reason);
                                }}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-500"
                                onClick={() => activateReader(reader.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {readers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No readers found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Reader performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Performance analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}