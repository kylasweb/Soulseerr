import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Star, 
  User, 
  Calendar,
  MessageCircle,
  ThumbsUp,
  Flag,
  MoreHorizontal,
  Filter,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  sessionId: string
  session: {
    type: 'CHAT' | 'VOICE' | 'VIDEO'
    scheduledAt: string
    duration: number
  }
  user: {
    id: string
    username: string
    avatar?: string
  }
  readerId: string
  isHelpful?: boolean
  helpfulCount: number
  reported: boolean
}

interface RatingStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

interface ReviewDisplayProps {
  reviews: Review[]
  ratingStats: RatingStats
  onLoadMore?: () => void
  onMarkHelpful?: (reviewId: string) => Promise<void>
  onReportReview?: (reviewId: string, reason: string) => Promise<void>
  hasMore?: boolean
  isLoading?: boolean
  showUserInfo?: boolean
}

export function ReviewDisplay({
  reviews,
  ratingStats,
  onLoadMore,
  onMarkHelpful,
  onReportReview,
  hasMore = false,
  isLoading = false,
  showUserInfo = false
}: ReviewDisplayProps) {
  const [filterRating, setFilterRating] = React.useState<string>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'>('newest')

  // Filter and sort reviews
  const filteredReviews = React.useMemo(() => {
    let filtered = reviews.filter(review => {
      const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating)
      const matchesSearch = !searchTerm || 
        (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
        review.user.username.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesRating && matchesSearch && !review.reported
    })

    // Sort reviews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'rating_high':
          return b.rating - a.rating
        case 'rating_low':
          return a.rating - b.rating
        case 'helpful':
          return b.helpfulCount - a.helpfulCount
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [reviews, filterRating, searchTerm, sortBy])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'bg-purple-100 text-purple-800'
      case 'VOICE': return 'bg-blue-100 text-blue-800'
      case 'CHAT': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateRatingPercentage = (rating: number) => {
    return (ratingStats.ratingDistribution[rating as keyof typeof ratingStats.ratingDistribution] / ratingStats.totalReviews) * 100
  }

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Overview</CardTitle>
          <CardDescription>
            Based on {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-4xl font-bold">{ratingStats.averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(ratingStats.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm w-3">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Progress 
                    value={calculateRatingPercentage(rating)} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {ratingStats.ratingDistribution[rating as keyof typeof ratingStats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="rating_high">Highest Rated</SelectItem>
                <SelectItem value="rating_low">Lowest Rated</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Reviews Found</h3>
                <p className="text-muted-foreground">
                  {reviews.length === 0 
                    ? "No reviews yet. Be the first to leave a review!"
                    : "Try adjusting your filters to see more reviews."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.user.avatar} />
                        <AvatarFallback>
                          {review.user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          {showUserInfo && (
                            <span className="font-medium">{review.user.username}</span>
                          )}
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                          <Badge className={getSessionTypeColor(review.session.type)} variant="secondary">
                            {review.session.type.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onReportReview?.(review.id, 'inappropriate')}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Report Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <div className="text-sm text-gray-700 leading-relaxed pl-13">
                      {review.comment}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center space-x-4 pl-13">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkHelpful?.(review.id)}
                      className={review.isHelpful ? 'text-blue-600' : ''}
                    >
                      <ThumbsUp className={`h-4 w-4 mr-1 ${review.isHelpful ? 'fill-current' : ''}`} />
                      Helpful ({review.helpfulCount})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center">
            <Button onClick={onLoadMore} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load More Reviews'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Component for reader's review management
interface ReviewManagementProps {
  reviews: Review[]
  ratingStats: RatingStats
  onResponseToReview?: (reviewId: string, response: string) => Promise<void>
}

export function ReviewManagement({ 
  reviews, 
  ratingStats,
  onResponseToReview 
}: ReviewManagementProps) {
  const [selectedReview, setSelectedReview] = React.useState<Review | null>(null)
  const [response, setResponse] = React.useState('')

  const recentReviews = reviews.slice(0, 5) // Show last 5 reviews
  const lowRatingReviews = reviews.filter(r => r.rating <= 3)

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{ratingStats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{ratingStats.totalReviews}</div>
            <div className="text-sm text-muted-foreground">Total Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{ratingStats.ratingDistribution[5]}</div>
            <div className="text-sm text-muted-foreground">5-Star Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{lowRatingReviews.length}</div>
            <div className="text-sm text-muted-foreground">Need Attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>Your latest client feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  )}
                </div>
                {review.rating <= 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReview(review)}
                  >
                    Respond
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Reviews with Management Features */}
      <ReviewDisplay
        reviews={reviews}
        ratingStats={ratingStats}
        showUserInfo={false}
      />
    </div>
  )

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }
}