'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, 
  Mail, 
  Calendar, 
  Star, 
  DollarSign, 
  Activity, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  FileText,
  Award,
  Ban,
  ThumbsUp,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface ReaderDetailProps {
  readerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onReaderUpdate?: () => void;
}

interface ReaderDetails {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
  };
  status: string;
  verificationStatus: string;
  specialties: string[];
  bio: string;
  experience: string;
  certifications: string[];
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageRating: number;
  totalEarnings: number;
  complianceScore: number;
  warningCount: number;
  joinedAt: string;
  lastActive?: string;
  suspensionReason?: string;
  suspendedAt?: string;
  recentSessions: Array<{
    id: string;
    clientName: string;
    date: string;
    duration: number;
    rating?: number;
    status: string;
    amount: number;
  }>;
  recentReviews: Array<{
    id: string;
    clientName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  documents: Array<{
    id: string;
    type: string;
    status: string;
    uploadedAt: string;
  }>;
}

export default function ReaderDetailModal({ readerId, isOpen, onClose, onReaderUpdate }: ReaderDetailProps) {
  const [reader, setReader] = useState<ReaderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch reader details
  const fetchReaderDetails = async () => {
    if (!readerId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/readers/${readerId}/details`);
      const data = await response.json();
      
      if (response.ok) {
        setReader(data.reader);
      } else {
        toast.error('Failed to load reader details');
      }
    } catch (error) {
      console.error('Error fetching reader details:', error);
      toast.error('Error loading reader details');
    } finally {
      setLoading(false);
    }
  };

  // Load reader details when modal opens
  useEffect(() => {
    if (isOpen && readerId) {
      fetchReaderDetails();
    }
  }, [isOpen, readerId]);

  // Clear data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReader(null);
    }
  }, [isOpen]);

  // Reader actions
  const handleSuspendReader = async () => {
    if (!reader) return;
    
    const reason = prompt('Please provide a reason for suspension:');
    if (!reason) return;

    setActionLoading('suspend');
    try {
      const response = await fetch(`/api/admin/readers/${reader.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('Reader suspended successfully');
        await fetchReaderDetails();
        onReaderUpdate?.();
      } else {
        toast.error('Failed to suspend reader');
      }
    } catch (error) {
      console.error('Error suspending reader:', error);
      toast.error('Error suspending reader');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateReader = async () => {
    if (!reader) return;

    setActionLoading('activate');
    try {
      const response = await fetch(`/api/admin/readers/${reader.id}/activate`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Reader activated successfully');
        await fetchReaderDetails();
        onReaderUpdate?.();
      } else {
        toast.error('Failed to activate reader');
      }
    } catch (error) {
      console.error('Error activating reader:', error);
      toast.error('Error activating reader');
    } finally {
      setActionLoading(null);
    }
  };

  const handleWarningIssue = async () => {
    const warning = prompt('Issue warning (provide reason):');
    if (!warning) return;

    setActionLoading('warning');
    try {
      const response = await fetch(`/api/admin/readers/${reader?.id}/warning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warning })
      });

      if (response.ok) {
        toast.success('Warning issued successfully');
        await fetchReaderDetails();
      } else {
        toast.error('Failed to issue warning');
      }
    } catch (error) {
      console.error('Error issuing warning:', error);
      toast.error('Error issuing warning');
    } finally {
      setActionLoading(null);
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': case 'VERIFIED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'SUSPENDED': case 'REJECTED': return 'bg-red-500';
      case 'INACTIVE': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': case 'VERIFIED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'SUSPENDED': case 'REJECTED': return <XCircle className="w-4 h-4" />;
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reader Details</DialogTitle>
          <DialogDescription>
            Comprehensive view of reader profile and performance
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : reader ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={reader.user.avatar} alt={reader.user.name} />
                  <AvatarFallback className="text-lg">{reader.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <div>
                    <h3 className="text-2xl font-bold">{reader.user.name}</h3>
                    <p className="text-muted-foreground">{reader.user.email}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(reader.status)} text-white`}>
                      {getStatusIcon(reader.status)}
                      <span className="ml-1">{reader.status}</span>
                    </Badge>
                    <Badge className={`${getStatusColor(reader.verificationStatus)} text-white`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {reader.verificationStatus}
                    </Badge>
                    {reader.warningCount > 0 && (
                      <Badge className="bg-orange-500 text-white">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {reader.warningCount} Warnings
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(reader.joinedAt)}</span>
                    </div>
                    {reader.lastActive && (
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4" />
                        <span>Last active {formatDate(reader.lastActive)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {reader.status === 'ACTIVE' ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleSuspendReader}
                    disabled={actionLoading === 'suspend'}
                  >
                    {actionLoading === 'suspend' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 mr-1" />
                        Suspend
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleActivateReader}
                    disabled={actionLoading === 'activate'}
                  >
                    {actionLoading === 'activate' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWarningIssue}
                  disabled={actionLoading === 'warning'}
                >
                  {actionLoading === 'warning' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Issue Warning
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Suspension Notice */}
            {reader.status === 'SUSPENDED' && reader.suspensionReason && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Account Suspended</h4>
                      <p className="text-sm text-red-700 mt-1">{reader.suspensionReason}</p>
                      {reader.suspendedAt && (
                        <p className="text-xs text-red-600 mt-1">
                          Suspended on {formatDateTime(reader.suspendedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{reader.totalSessions}</div>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold flex items-center">
                    <Star className="w-5 h-5 fill-current text-yellow-500 mr-1" />
                    {reader.averageRating.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">Average Rating</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(reader.totalEarnings)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{reader.complianceScore}%</div>
                  <p className="text-xs text-muted-foreground">Compliance Score</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">
                    {reader.completedSessions > 0 ? 
                      ((reader.completedSessions / reader.totalSessions) * 100).toFixed(0) + '%' : 
                      '0%'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Information */}
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Bio</h4>
                      <p className="text-sm text-muted-foreground">{reader.bio || 'No bio provided'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Experience</h4>
                      <p className="text-sm text-muted-foreground">{reader.experience || 'No experience provided'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-1">
                        {reader.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-1">
                        {reader.certifications.length > 0 ? (
                          reader.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary">
                              <Award className="w-3 h-3 mr-1" />
                              {cert}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No certifications</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>Latest reading sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reader.recentSessions.map((session) => (
                            <TableRow key={session.id}>
                              <TableCell>{session.clientName}</TableCell>
                              <TableCell>{formatDate(session.date)}</TableCell>
                              <TableCell>{formatDuration(session.duration)}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(session.status)}>
                                  {session.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {session.rating ? (
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 fill-current text-yellow-500 mr-1" />
                                    {session.rating}
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>{formatCurrency(session.amount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                    <CardDescription>Client feedback and ratings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reader.recentReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{review.clientName}</div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating 
                                      ? 'text-yellow-500 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(review.date)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Documents</CardTitle>
                    <CardDescription>Uploaded documents for verification</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reader.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{doc.type}</div>
                              <div className="text-sm text-muted-foreground">
                                Uploaded {formatDate(doc.uploadedAt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance History</CardTitle>
                    <CardDescription>Warnings, violations, and compliance score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Compliance tracking data will be displayed here...
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Reader not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}