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
import { 
  Calendar,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  Zap,
  Search,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Ban,
  MessageCircle,
  Phone,
  PhoneOff
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Session {
  id: string
  type: 'CHAT' | 'VOICE' | 'VIDEO'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  scheduledAt: string
  startedAt?: string
  endedAt?: string
  duration?: number
  totalCost: number
  notes?: string
  client: {
    id: string
    username: string
    email: string
  }
  reader: {
    id: string
    username: string
    readerProfile: {
      firstName: string
      lastName: string
    }
  }
  review?: {
    rating: number
    comment: string
  }
}

interface SessionStats {
  totalSessions: number
  activeSessions: number
  scheduledSessions: number
  completedSessions: number
  cancelledSessions: number
  totalRevenue: number
  averageSessionDuration: number
  averageRating: number
}

interface SessionManagementProps {
  sessions: Session[]
  stats: SessionStats
  onRefundSession: (sessionId: string, reason: string) => Promise<void>
  onUpdateSessionStatus: (sessionId: string, status: Session['status']) => Promise<void>
  onContactParticipant: (userId: string, message: string) => Promise<void>
  onLoadMore: () => void
  hasMore: boolean
  isLoading?: boolean
}

export function SessionManagement({
  sessions,
  stats,
  onRefundSession,
  onUpdateSessionStatus,
  onContactParticipant,
  onLoadMore,
  hasMore,
  isLoading = false
}: SessionManagementProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState<string>('all')
  const [filterType, setFilterType] = React.useState<string>('all')
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null)
  const [showSessionDetails, setShowSessionDetails] = React.useState(false)
  const [showRefundDialog, setShowRefundDialog] = React.useState(false)
  const [showContactDialog, setShowContactDialog] = React.useState(false)
  const [refundReason, setRefundReason] = React.useState('')
  const [contactMessage, setContactMessage] = React.useState('')
  const [contactTarget, setContactTarget] = React.useState<'client' | 'reader' | 'both'>('both')

  // Filter sessions based on search and filters
  const filteredSessions = React.useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = 
        session.client.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${session.reader.readerProfile.firstName} ${session.reader.readerProfile.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.reader.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || session.status === filterStatus.toUpperCase()
      const matchesType = filterType === 'all' || session.type === filterType.toUpperCase()

      return matchesSearch && matchesStatus && matchesType
    })
  }, [sessions, searchTerm, filterStatus, filterType])

  const handleRefundSession = async () => {
    if (!selectedSession || !refundReason.trim()) return
    
    await onRefundSession(selectedSession.id, refundReason)
    setShowRefundDialog(false)
    setRefundReason('')
    setSelectedSession(null)
  }

  const handleContactParticipants = async () => {
    if (!selectedSession || !contactMessage.trim()) return
    
    if (contactTarget === 'client' || contactTarget === 'both') {
      await onContactParticipant(selectedSession.client.id, contactMessage)
    }
    if (contactTarget === 'reader' || contactTarget === 'both') {
      await onContactParticipant(selectedSession.reader.id, contactMessage)
    }
    
    setShowContactDialog(false)
    setContactMessage('')
    setContactTarget('both')
    setSelectedSession(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'NO_SHOW': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CHAT': return <MessageCircle className="h-4 w-4" />
      case 'VOICE': return <Phone className="h-4 w-4" />
      case 'VIDEO': return <Phone className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.averageSessionDuration)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduledSessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedSessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelledSessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <div className="text-yellow-500">⭐</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>
            Monitor and manage all sessions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions, users, or session ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="voice">Voice</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sessions Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-mono text-sm">{session.id.slice(-8)}</div>
                        {session.status === 'IN_PROGRESS' && (
                          <div className="flex items-center text-green-600 text-xs">
                            <div className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse"></div>
                            Live
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">{session.client.username}</span>
                          <span className="text-muted-foreground text-xs ml-1">(client)</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">
                            {session.reader.readerProfile.firstName} {session.reader.readerProfile.lastName}
                          </span>
                          <span className="text-muted-foreground text-xs ml-1">(reader)</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(session.type)}
                        <span className="text-sm">{session.type.toLowerCase()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(session.scheduledAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDuration(session.duration)}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${session.totalCost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {session.review ? (
                        <div className="flex items-center space-x-1">
                          <span>⭐</span>
                          <span className="text-sm">{session.review.rating}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
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
                            setSelectedSession(session)
                            setShowSessionDetails(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedSession(session)
                            setShowContactDialog(true)
                          }}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contact Participants
                          </DropdownMenuItem>
                          {session.status === 'COMPLETED' && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedSession(session)
                              setShowRefundDialog(true)
                            }}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Process Refund
                            </DropdownMenuItem>
                          )}
                          {session.status === 'SCHEDULED' && (
                            <DropdownMenuItem onClick={() => {
                              onUpdateSessionStatus(session.id, 'CANCELLED')
                            }}>
                              <Ban className="h-4 w-4 mr-2" />
                              Cancel Session
                            </DropdownMenuItem>
                          )}
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

      {/* Session Details Dialog */}
      <Dialog open={showSessionDetails} onOpenChange={setShowSessionDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              Detailed information about this session
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Session ID</Label>
                  <div className="p-2 bg-muted rounded font-mono text-sm">{selectedSession.id}</div>
                </div>
                <div>
                  <Label>Type</Label>
                  <div className="p-2 bg-muted rounded flex items-center space-x-2">
                    {getTypeIcon(selectedSession.type)}
                    <span>{selectedSession.type}</span>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="p-2">
                    <Badge className={getStatusColor(selectedSession.status)}>
                      {selectedSession.status.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Cost</Label>
                  <div className="p-2 bg-muted rounded font-medium">${selectedSession.totalCost.toFixed(2)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <div className="p-2 bg-muted rounded">
                    <div className="font-medium">{selectedSession.client.username}</div>
                    <div className="text-sm text-muted-foreground">{selectedSession.client.email}</div>
                  </div>
                </div>
                <div>
                  <Label>Reader</Label>
                  <div className="p-2 bg-muted rounded">
                    <div className="font-medium">
                      {selectedSession.reader.readerProfile.firstName} {selectedSession.reader.readerProfile.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">@{selectedSession.reader.username}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Scheduled</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {new Date(selectedSession.scheduledAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label>Started</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {selectedSession.startedAt 
                      ? new Date(selectedSession.startedAt).toLocaleString()
                      : 'N/A'
                    }
                  </div>
                </div>
                <div>
                  <Label>Duration</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {formatDuration(selectedSession.duration)}
                  </div>
                </div>
              </div>

              {selectedSession.notes && (
                <div>
                  <Label>Session Notes</Label>
                  <div className="p-3 bg-muted rounded text-sm">
                    {selectedSession.notes}
                  </div>
                </div>
              )}

              {selectedSession.review && (
                <div>
                  <Label>Review</Label>
                  <div className="p-3 bg-muted rounded space-y-2">
                    <div className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span className="font-medium">{selectedSession.review.rating}/5</span>
                    </div>
                    {selectedSession.review.comment && (
                      <div className="text-sm">{selectedSession.review.comment}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Issue a refund for this session. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSession && (
              <div className="p-3 bg-muted rounded">
                <div className="text-sm">Session: {selectedSession.id}</div>
                <div className="text-sm">Amount: ${selectedSession.totalCost.toFixed(2)}</div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="refund-reason">Reason for Refund</Label>
              <Textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefundSession} disabled={!refundReason.trim()}>
              Process Refund
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Participants</DialogTitle>
            <DialogDescription>
              Send a message to the session participants
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Send To</Label>
              <Select value={contactTarget} onValueChange={(value: any) => setContactTarget(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both Client and Reader</SelectItem>
                  <SelectItem value="client">Client Only</SelectItem>
                  <SelectItem value="reader">Reader Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleContactParticipants} disabled={!contactMessage.trim()}>
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}