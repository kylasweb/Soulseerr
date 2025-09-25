'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  DollarSign, 
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface UserDetailProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'READER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  clientProfile?: {
    location?: string;
    totalSessions?: number;
    totalSpent?: number;
  };
  readerProfile?: {
    location?: string;
    totalSessions?: number;
    totalEarnings?: number;
    averageRating?: number;
    verificationStatus?: string;
  };
  sessions: Array<{
    id: string;
    createdAt: string;
    status: string;
    type: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  _count: {
    sessions: number;
    reviews: number;
    notifications: number;
  };
}

export default function UserDetailModal({ userId, isOpen, onClose, onUpdate }: UserDetailProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: ''
  });

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserDetails();
    }
  }, [userId, isOpen]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setEditData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || '',
          role: data.user.role,
          status: data.user.status
        });
      } else {
        toast.error(data.error || 'Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setEditing(false);
        fetchUserDetails();
        onUpdate?.();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            View and manage user account information
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold">{user.name}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        <Badge className={`${getStatusColor(user.status)} text-white`}>
                          {getStatusIcon(user.status)}
                          <span className="ml-1">{user.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editing ? (
                      <>
                        <Button onClick={handleSave} size="sm">
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button onClick={() => setEditing(false)} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        {editing ? (
                          <Input
                            id="name"
                            value={editData.name}
                            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{user.name}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        {editing ? (
                          <Input
                            id="email"
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{user.email}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        {editing ? (
                          <Input
                            id="phone"
                            value={editData.phone}
                            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{user.phone || 'Not provided'}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Location</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {user.clientProfile?.location || user.readerProfile?.location || 'Not provided'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="role">Role</Label>
                        {editing ? (
                          <Select value={editData.role} onValueChange={(value) => setEditData(prev => ({ ...prev, role: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CLIENT">Client</SelectItem>
                              <SelectItem value="READER">Reader</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        {editing ? (
                          <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                              <SelectItem value="SUSPENDED">Suspended</SelectItem>
                              <SelectItem value="PENDING">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(user.status)}
                            <Badge className={`${getStatusColor(user.status)} text-white`}>
                              {user.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Joined: {formatDate(user.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Last Updated: {formatDate(user.updatedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Role-specific information */}
                {user.role === 'READER' && user.readerProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Reader Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">{user.readerProfile.totalSessions || 0}</div>
                          <div className="text-sm text-muted-foreground">Total Sessions</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">{formatCurrency(user.readerProfile.totalEarnings || 0)}</div>
                          <div className="text-sm text-muted-foreground">Total Earnings</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold flex items-center justify-center gap-1">
                            <Star className="w-5 h-5 fill-current text-yellow-500" />
                            {(user.readerProfile.averageRating || 0).toFixed(1)}
                          </div>
                          <div className="text-sm text-muted-foreground">Average Rating</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {user.role === 'CLIENT' && user.clientProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">{user.clientProfile.totalSessions || 0}</div>
                          <div className="text-sm text-muted-foreground">Total Sessions</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">{formatCurrency(user.clientProfile.totalSpent || 0)}</div>
                          <div className="text-sm text-muted-foreground">Total Spent</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{user._count.sessions}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Reviews Given/Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{user._count.reviews}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{user._count.notifications}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.sessions.length > 0 ? (
                      <div className="space-y-3">
                        {user.sessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">Session #{session.id.slice(-8)}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDateTime(session.createdAt)} • {session.type}
                              </div>
                            </div>
                            <Badge variant="outline">{session.status}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No sessions found
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {user.reviews.map((review) => (
                          <div key={review.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-current text-yellow-500' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No reviews found
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            User not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}