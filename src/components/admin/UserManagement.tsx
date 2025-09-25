import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Ban,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface User {
  id: string
  username: string
  email: string
  role: 'CLIENT' | 'READER' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
  isEmailVerified: boolean
  createdAt: string
  lastLoginAt?: string
  _count: {
    sessions: number
    transactions: number
  }
  wallet?: {
    balance: number
  }
  readerProfile?: {
    firstName: string
    lastName: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    averageRating: number
    totalSessions: number
  }
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  pendingReaders: number
  suspendedUsers: number
  newUsersToday: number
  newUsersThisWeek: number
}

interface UserManagementProps {
  users: User[]
  stats: UserStats
  onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>
  onSuspendUser: (userId: string, reason: string) => Promise<void>
  onSendMessage: (userId: string, subject: string, message: string) => Promise<void>
  onLoadMore: () => void
  hasMore: boolean
  isLoading?: boolean
}

export function UserManagement({
  users,
  stats,
  onUpdateUser,
  onSuspendUser,
  onSendMessage,
  onLoadMore,
  hasMore,
  isLoading = false
}: UserManagementProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterRole, setFilterRole] = React.useState<string>('all')
  const [filterStatus, setFilterStatus] = React.useState<string>('all')
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [showUserDetails, setShowUserDetails] = React.useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = React.useState(false)
  const [showMessageDialog, setShowMessageDialog] = React.useState(false)
  const [suspendReason, setSuspendReason] = React.useState('')
  const [messageSubject, setMessageSubject] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')

  // Filter users based on search and filters
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.readerProfile && 
          `${user.readerProfile.firstName} ${user.readerProfile.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesRole = filterRole === 'all' || user.role === filterRole.toUpperCase()
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus.toUpperCase()

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, filterRole, filterStatus])

  const handleUpdateUserRole = async (userId: string, newRole: 'CLIENT' | 'READER' | 'ADMIN') => {
    await onUpdateUser(userId, { role: newRole })
  }

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    await onUpdateUser(user.id, { status: newStatus })
  }

  const handleSuspendUser = async () => {
    if (!selectedUser || !suspendReason.trim()) return
    
    await onSuspendUser(selectedUser.id, suspendReason)
    setShowSuspendDialog(false)
    setSuspendReason('')
    setSelectedUser(null)
  }

  const handleSendMessage = async () => {
    if (!selectedUser || !messageSubject.trim() || !messageContent.trim()) return
    
    await onSendMessage(selectedUser.id, messageSubject, messageContent)
    setShowMessageDialog(false)
    setMessageSubject('')
    setMessageContent('')
    setSelectedUser(null)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'READER': return 'bg-blue-100 text-blue-800'
      case 'CLIENT': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      case 'DEACTIVATED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Readers</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReaders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspendedUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersToday}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersThisWeek}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage users, roles, and account statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="reader">Reader</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.readerProfile && (
                          <div className="text-xs text-muted-foreground">
                            {user.readerProfile.firstName} {user.readerProfile.lastName}
                            {user.readerProfile.averageRating > 0 && (
                              <span className="ml-2">⭐ {user.readerProfile.averageRating.toFixed(1)}</span>
                            )}
                          </div>
                        )}
                        {!user.isEmailVerified && (
                          <Badge variant="outline" className="text-xs">Unverified</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.toLowerCase()}
                      </Badge>
                      {user.readerProfile && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          {user.readerProfile.status.toLowerCase()}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{user._count.sessions}</TableCell>
                    <TableCell>
                      {user.wallet ? `$${user.wallet.balance.toFixed(2)}` : '$0.00'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user)
                            setShowUserDetails(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user)
                            setShowMessageDialog(true)
                          }}>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user)
                            setShowSuspendDialog(true)
                          }}>
                            <Ban className="h-4 w-4 mr-2" />
                            {user.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button onClick={onLoadMore} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <div className="p-2 bg-muted rounded">{selectedUser.username}</div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="p-2 bg-muted rounded">{selectedUser.email}</div>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select 
                    value={selectedUser.role} 
                    onValueChange={(value) => handleUpdateUserRole(selectedUser.id, value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT">Client</SelectItem>
                      <SelectItem value="READER">Reader</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={selectedUser.status === 'ACTIVE'}
                      onCheckedChange={() => handleToggleUserStatus(selectedUser)}
                    />
                    <span>{selectedUser.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Sessions</Label>
                  <div className="p-2 bg-muted rounded">{selectedUser._count.sessions}</div>
                </div>
                <div>
                  <Label>Transactions</Label>
                  <div className="p-2 bg-muted rounded">{selectedUser._count.transactions}</div>
                </div>
                <div>
                  <Label>Wallet Balance</Label>
                  <div className="p-2 bg-muted rounded">
                    ${selectedUser.wallet?.balance.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>

              {selectedUser.readerProfile && (
                <div className="space-y-2">
                  <Label>Reader Profile</Label>
                  <div className="p-3 bg-muted rounded space-y-2">
                    <div>Name: {selectedUser.readerProfile.firstName} {selectedUser.readerProfile.lastName}</div>
                    <div>Status: {selectedUser.readerProfile.status}</div>
                    <div>Rating: ⭐ {selectedUser.readerProfile.averageRating.toFixed(1)}</div>
                    <div>Total Sessions: {selectedUser.readerProfile.totalSessions}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.status === 'SUSPENDED' ? 'Reactivate User' : 'Suspend User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.status === 'SUSPENDED' 
                ? 'This will reactivate the user account.'
                : 'Please provide a reason for suspending this user.'
              }
            </DialogDescription>
          </DialogHeader>
          {selectedUser?.status !== 'SUSPENDED' && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Suspension</Label>
              <Textarea
                id="reason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter reason for suspension..."
              />
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSuspendUser}>
              {selectedUser?.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to User</DialogTitle>
            <DialogDescription>
              Send a notification message to {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Message subject..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Enter your message..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}