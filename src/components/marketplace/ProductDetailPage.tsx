import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Star, 
  ShoppingCart, 
  Play, 
  Download, 
  Book, 
  Headphones, 
  Video, 
  Package,
  Clock,
  DollarSign,
  Heart,
  Share,
  Flag,
  Users,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileText,
  Bookmark,
  MessageCircle
} from 'lucide-react'

interface ProductDetail {
  id: string
  title: string
  description: string
  longDescription: string
  type: 'GUIDE' | 'MEDITATION' | 'COURSE' | 'EBOOK' | 'AUDIO' | 'VIDEO' | 'BUNDLE'
  price: number
  category: string
  tags: string[]
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  averageRating: number
  totalSales: number
  totalReviews: number
  content: {
    duration?: number
    pageCount?: number
    fileUrl?: string
    streamUrl?: string
    previewUrl?: string
    chapters?: Array<{
      id: string
      title: string
      duration?: number
      order: number
      isFree?: boolean
    }>
  }
  reader: {
    id: string
    username: string
    readerProfile: {
      firstName: string
      lastName: string
      avatar?: string
      averageRating: number
      totalSessions: number
      bio?: string
      specialties: string[]
      yearsExperience?: number
    }
  }
  reviews: Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    helpful: number
    user: {
      username: string
      avatar?: string
    }
    isHelpful?: boolean
  }>
  relatedProducts: Array<{
    id: string
    title: string
    price: number
    averageRating: number
    thumbnail?: string
  }>
  createdAt: string
  updatedAt: string
  isOwned?: boolean
  isFavorited?: boolean
  inCart?: boolean
}

interface ProductDetailPageProps {
  product: ProductDetail
  onPurchase: (productId: string) => Promise<void>
  onAddToCart: (productId: string) => Promise<void>
  onRemoveFromCart: (productId: string) => Promise<void>
  onToggleFavorite: (productId: string) => Promise<void>
  onPlayPreview?: (previewUrl: string) => void
  onMarkHelpful: (reviewId: string, helpful: boolean) => Promise<void>
  onContactReader: (readerId: string) => void
  onReport: (productId: string, reason: string) => Promise<void>
  isLoading?: boolean
}

export function ProductDetailPage({
  product,
  onPurchase,
  onAddToCart,
  onRemoveFromCart,
  onToggleFavorite,
  onPlayPreview,
  onMarkHelpful,
  onContactReader,
  onReport,
  isLoading = false
}: ProductDetailPageProps) {
  const [currentPreview, setCurrentPreview] = React.useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = React.useState(0)
  const [showAllReviews, setShowAllReviews] = React.useState(false)

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'GUIDE': return <Book className="h-5 w-5" />
      case 'MEDITATION': return <Play className="h-5 w-5" />
      case 'COURSE': return <Play className="h-5 w-5" />
      case 'EBOOK': return <Book className="h-5 w-5" />
      case 'AUDIO': return <Headphones className="h-5 w-5" />
      case 'VIDEO': return <Video className="h-5 w-5" />
      case 'BUNDLE': return <Package className="h-5 w-5" />
      default: return <Book className="h-5 w-5" />
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800 border-green-200'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ADVANCED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    product.reviews.forEach(review => {
      distribution[Math.floor(review.rating) - 1]++
    })
    return distribution.reverse()
  }

  const ratingDistribution = getRatingDistribution()
  const displayedReviews = showAllReviews ? product.reviews : product.reviews.slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getProductTypeIcon(product.type)}
                    <Badge variant="secondary">
                      {product.type.toLowerCase()}
                    </Badge>
                    <Badge variant="outline">{product.category}</Badge>
                    {product.difficulty && (
                      <Badge className={getDifficultyColor(product.difficulty)}>
                        {product.difficulty.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl lg:text-3xl">{product.title}</CardTitle>
                  <CardDescription className="text-base">
                    {product.description}
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleFavorite(product.id)}
                  >
                    <Heart className={`h-5 w-5 ${product.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.averageRating.toFixed(1)}</span>
                  <span>({product.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{product.totalSales} purchased</span>
                </div>
                {product.content.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(product.content.duration)}</span>
                  </div>
                )}
                {product.content.pageCount && (
                  <div className="flex items-center space-x-1">
                    <Book className="h-4 w-4" />
                    <span>{product.content.pageCount} pages</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardHeader>

            {/* Preview/Player Section */}
            {(product.content.previewUrl || product.content.streamUrl) && (
              <CardContent className="border-t">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <div className="space-y-4">
                    {product.content.previewUrl && (
                      <Button 
                        size="lg" 
                        onClick={() => onPlayPreview?.(product.content.previewUrl!)}
                      >
                        <PlayCircle className="h-5 w-5 mr-2" />
                        Play Preview
                      </Button>
                    )}
                    {product.isOwned && product.content.streamUrl && (
                      <Button variant="outline" size="lg">
                        <Play className="h-5 w-5 mr-2" />
                        Access Full Content
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Content Sections */}
          <Card className="mt-6">
            <Tabs defaultValue="description" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="contents">Contents</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="reader">About Reader</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="description" className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {product.longDescription}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contents" className="space-y-4">
                  {product.content.chapters && product.content.chapters.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Chapters & Sections</h4>
                      <div className="space-y-2">
                        {product.content.chapters.map((chapter, index) => (
                          <div
                            key={chapter.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <h5 className="font-medium">{chapter.title}</h5>
                                {chapter.duration && (
                                  <p className="text-sm text-muted-foreground">
                                    {formatDuration(chapter.duration)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {chapter.isFree && (
                                <Badge variant="secondary">Free</Badge>
                              )}
                              {product.isOwned || chapter.isFree ? (
                                <Button size="sm" variant="outline">
                                  <Play className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" disabled>
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Content structure not available</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  {/* Rating Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold">{product.averageRating.toFixed(1)}</div>
                        <div className="flex justify-center space-x-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= Math.round(product.averageRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.totalReviews} total reviews
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars, index) => (
                        <div key={stars} className="flex items-center space-x-3">
                          <span className="text-sm w-8">{stars}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Progress
                            value={(ratingDistribution[index] / product.totalReviews) * 100}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground w-12">
                            {ratingDistribution[index]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {displayedReviews.map((review) => (
                      <Card key={review.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={review.user.avatar} />
                              <AvatarFallback>{review.user.username[0]}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                              <div>
                                <div className="font-medium">{review.user.username}</div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex space-x-1">
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
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkHelpful(review.id, true)}
                            >
                              <ThumbsUp className={`h-4 w-4 mr-1 ${review.isHelpful === true ? 'text-green-600' : ''}`} />
                              Helpful ({review.helpful})
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkHelpful(review.id, false)}
                            >
                              <ThumbsDown className={`h-4 w-4 mr-1 ${review.isHelpful === false ? 'text-red-600' : ''}`} />
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}

                    {!showAllReviews && product.reviews.length > 3 && (
                      <Button
                        variant="outline"
                        onClick={() => setShowAllReviews(true)}
                        className="w-full"
                      >
                        Show All {product.reviews.length} Reviews
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reader" className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={product.reader.readerProfile.avatar} />
                      <AvatarFallback>
                        {product.reader.readerProfile.firstName[0]}
                        {product.reader.readerProfile.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {product.reader.readerProfile.firstName} {product.reader.readerProfile.lastName}
                        </h3>
                        <p className="text-muted-foreground">@{product.reader.username}</p>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{product.reader.readerProfile.averageRating.toFixed(1)} rating</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{product.reader.readerProfile.totalSessions} sessions</span>
                        </div>
                        {product.reader.readerProfile.yearsExperience && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{product.reader.readerProfile.yearsExperience} years experience</span>
                          </div>
                        )}
                      </div>

                      {product.reader.readerProfile.bio && (
                        <p className="text-sm leading-relaxed max-w-2xl">
                          {product.reader.readerProfile.bio}
                        </p>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-medium">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.reader.readerProfile.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button onClick={() => onContactReader(product.reader.id)}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Reader
                        </Button>
                        <Button variant="outline">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {product.price === 0 ? 'Free' : formatPrice(product.price)}
              </CardTitle>
              {product.price > 0 && (
                <CardDescription>One-time purchase • Lifetime access</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {product.isOwned ? (
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Download className="h-5 w-5 mr-2" />
                    Access Content
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Bookmark className="h-4 w-4 mr-2" />
                    View in Library
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => onPurchase(product.id)}
                    disabled={isLoading}
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    {product.price === 0 ? 'Get for Free' : 'Buy Now'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => product.inCart ? onRemoveFromCart(product.id) : onAddToCart(product.id)}
                    disabled={isLoading}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.inCart ? 'Remove from Cart' : 'Add to Cart'}
                  </Button>
                </div>
              )}

              <div className="text-center text-sm text-muted-foreground">
                30-day money-back guarantee
              </div>
            </CardContent>
          </Card>

          {/* Related Products */}
          {product.relatedProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Products</CardTitle>
                <CardDescription>You might also like</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.relatedProducts.map((related) => (
                  <div key={related.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Book className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">{related.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {formatPrice(related.price)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{related.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}