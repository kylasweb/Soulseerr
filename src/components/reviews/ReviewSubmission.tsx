import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Star, Send, Clock, User, MessageCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Session {
  id: string
  readerId: string
  reader: {
    username: string
    readerProfile: {
      firstName: string
      lastName: string
      avatar?: string
    }
  }
  type: 'CHAT' | 'VOICE' | 'VIDEO'
  scheduledAt: string
  duration: number
  totalCost: number
  status: 'COMPLETED'
}

interface ReviewSubmissionProps {
  session: Session
  onSubmitReview: (sessionId: string, rating: number, comment: string) => Promise<void>
  onClose: () => void
  isLoading?: boolean
}

export function ReviewSubmission({ 
  session, 
  onSubmitReview, 
  onClose, 
  isLoading = false 
}: ReviewSubmissionProps) {
  const [rating, setRating] = React.useState(0)
  const [hoveredRating, setHoveredRating] = React.useState(0)
  const [comment, setComment] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return
    
    setIsSubmitting(true)
    try {
      await onSubmitReview(session.id, rating, comment)
      onClose()
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Rate Your Session</DialogTitle>
          <DialogDescription>
            Share your experience and help improve our community
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Session Details */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {session.reader.readerProfile.avatar ? (
                    <img 
                      src={session.reader.readerProfile.avatar} 
                      alt="Reader avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        {session.reader.readerProfile.firstName} {session.reader.readerProfile.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">@{session.reader.username}</p>
                    </div>
                    <Badge variant="outline">
                      {session.type.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(session.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>${session.totalCost.toFixed(2)}</span>
                    </div>
                    <div>
                      {new Date(session.scheduledAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Selection */}
          <div className="space-y-3">
            <Label>How was your session?</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-muted-foreground">
                {rating > 0 && (
                  <>
                    {rating} star{rating !== 1 ? 's' : ''} - {
                      rating === 5 ? 'Excellent' :
                      rating === 4 ? 'Good' :
                      rating === 3 ? 'Average' :
                      rating === 2 ? 'Poor' : 'Very Poor'
                    }
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <Label htmlFor="comment">
              Share your experience <span className="text-sm text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think about your session? How did the reader help you?"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Your review will help other clients and support reader growth. Please be honest and constructive.
            </p>
          </div>

          {/* Rating Guidelines */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <h4 className="text-sm font-medium mb-2">Rating Guidelines</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span>Excellent - Exceeded expectations, highly recommend</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="h-3 w-3 text-gray-300" />
                  </div>
                  <span>Good - Met expectations, would book again</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3].map((star) => (
                      <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    {[4, 5].map((star) => (
                      <Star key={star} className="h-3 w-3 text-gray-300" />
                    ))}
                  </div>
                  <span>Average - Okay experience, some room for improvement</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Skip for Now
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={rating === 0 || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Component for displaying a list of sessions waiting for review
interface PendingReviewsProps {
  sessions: Session[]
  onSelectSession: (session: Session) => void
}

export function PendingReviews({ sessions, onSelectSession }: PendingReviewsProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Pending Reviews</h3>
            <p className="text-muted-foreground">
              You're all caught up! Complete more sessions to leave reviews.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Reviews</CardTitle>
        <CardDescription>
          Rate your recent sessions and help our community grow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {session.reader.readerProfile.avatar ? (
                    <img 
                      src={session.reader.readerProfile.avatar} 
                      alt="Reader avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {session.reader.readerProfile.firstName} {session.reader.readerProfile.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.type.toLowerCase()} • {new Date(session.scheduledAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-muted-foreground">
                  {formatDuration(session.duration)}
                </div>
                <Button size="sm" onClick={() => onSelectSession(session)}>
                  <Star className="h-4 w-4 mr-1" />
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }
}