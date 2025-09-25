import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Filter,
  Star,
  ShoppingCart,
  Play,
  Download,
  Book,
  Headphones,
  Video,
  Package,
  User,
  Clock,
  DollarSign,
  Heart,
  Grid3X3,
  List
} from 'lucide-react'

interface Product {
  id: string
  title: string
  description: string
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
  }
  reader: {
    id: string
    username: string
    readerProfile: {
      firstName: string
      lastName: string
      avatar?: string
      averageRating: number
    }
  }
  previewContent?: string
  createdAt: string
  isOwned?: boolean
  isFavorited?: boolean
}

interface ProductBrowseProps {
  products: Product[]
  categories: Array<{ category: string; count: number }>
  onLoadMore: () => void
  onAddToCart?: (productId: string) => Promise<void>
  onPurchase?: (productId: string) => Promise<void>
  onToggleFavorite?: (productId: string) => Promise<void>
  onCategoryFilter: (category: string | null) => void
  onSearch: (query: string) => void
  onSort: (sortBy: string) => void
  onTypeFilter: (type: string | null) => void
  onDifficultyFilter: (difficulty: string | null) => void
  hasMore: boolean
  isLoading?: boolean
  currentFilters: {
    category?: string
    type?: string
    difficulty?: string
    search?: string
    sortBy: string
    minPrice?: number
    maxPrice?: number
  }
}

export function ProductBrowse({
  products,
  categories,
  onLoadMore,
  onAddToCart,
  onPurchase,
  onToggleFavorite,
  onCategoryFilter,
  onSearch,
  onSort,
  onTypeFilter,
  onDifficultyFilter,
  hasMore,
  isLoading = false,
  currentFilters
}: ProductBrowseProps) {
  const [searchTerm, setSearchTerm] = React.useState(currentFilters.search || '')
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = React.useState(false)
  const [priceRange, setPriceRange] = React.useState({
    min: currentFilters.minPrice || 0,
    max: currentFilters.maxPrice || 1000
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'GUIDE': return <Book className="h-4 w-4" />
      case 'MEDITATION': return <Play className="h-4 w-4" />
      case 'COURSE': return <Play className="h-4 w-4" />
      case 'EBOOK': return <Book className="h-4 w-4" />
      case 'AUDIO': return <Headphones className="h-4 w-4" />
      case 'VIDEO': return <Video className="h-4 w-4" />
      case 'BUNDLE': return <Package className="h-4 w-4" />
      default: return <Book className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search spiritual guides, meditations, courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </form>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    value={currentFilters.category || 'all'} 
                    onValueChange={(value) => onCategoryFilter(value === 'all' ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.category} value={cat.category}>
                          {cat.category} ({cat.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={currentFilters.type || 'all'} 
                    onValueChange={(value) => onTypeFilter(value === 'all' ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="GUIDE">Guides</SelectItem>
                      <SelectItem value="MEDITATION">Meditations</SelectItem>
                      <SelectItem value="COURSE">Courses</SelectItem>
                      <SelectItem value="EBOOK">E-books</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                      <SelectItem value="VIDEO">Videos</SelectItem>
                      <SelectItem value="BUNDLE">Bundles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select 
                    value={currentFilters.difficulty || 'all'} 
                    onValueChange={(value) => onDifficultyFilter(value === 'all' ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={currentFilters.sortBy} onValueChange={onSort}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* View Controls */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {products.length} products
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Products Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {products.map((product) => (
            <Card key={product.id} className={`group hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
              <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                <CardHeader className={viewMode === 'list' ? 'pb-2' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getProductTypeIcon(product.type)}
                      <Badge variant="secondary" className="text-xs">
                        {product.type.toLowerCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFavorite?.(product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Heart className={`h-4 w-4 ${product.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <CardTitle className={`line-clamp-2 ${viewMode === 'list' ? 'text-lg' : ''}`}>
                      {product.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {product.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </div>

              <CardContent className={`${viewMode === 'list' ? 'flex-1 pt-4' : 'pt-0'}`}>
                <div className="space-y-4">
                  {/* Reader Info */}
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={product.reader.readerProfile.avatar} />
                      <AvatarFallback className="text-xs">
                        {product.reader.readerProfile.firstName[0]}
                        {product.reader.readerProfile.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {product.reader.readerProfile.firstName} {product.reader.readerProfile.lastName}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{product.reader.readerProfile.averageRating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Product Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{product.averageRating.toFixed(1)} ({product.totalReviews})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ShoppingCart className="h-4 w-4" />
                        <span>{product.totalSales}</span>
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
                    </div>
                  </div>

                  {/* Tags and Difficulty */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {product.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    {product.difficulty && (
                      <Badge className={`${getDifficultyColor(product.difficulty)} text-xs`}>
                        {product.difficulty.toLowerCase()}
                      </Badge>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div className={`flex items-center justify-between pt-2 ${viewMode === 'list' ? 'border-t' : ''}`}>
                    <div className="text-2xl font-bold">
                      {product.price === 0 ? 'Free' : formatPrice(product.price)}
                    </div>
                    <div className="flex space-x-2">
                      {product.isOwned ? (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Access
                        </Button>
                      ) : (
                        <>
                          {onAddToCart && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onAddToCart(product.id)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Cart
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            onClick={() => onPurchase?.(product.id)}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Buy Now
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More Products'}
          </Button>
        </div>
      )}
    </div>
  )
}

// Quick filter chips component
interface QuickFiltersProps {
  onFilterClick: (filter: { type?: string; category?: string; difficulty?: string }) => void
}

export function QuickFilters({ onFilterClick }: QuickFiltersProps) {
  const filters = [
    { label: 'New Releases', filter: { sortBy: 'newest' } },
    { label: 'Meditation', filter: { type: 'MEDITATION' } },
    { label: 'Beginner Friendly', filter: { difficulty: 'BEGINNER' } },
    { label: 'Free Content', filter: { maxPrice: 0 } },
    { label: 'Highly Rated', filter: { minRating: 4.5 } },
    { label: 'Audio Content', filter: { type: 'AUDIO' } },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Filters</CardTitle>
        <CardDescription>Popular categories and filters</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <Button
              key={item.label}
              variant="outline"
              size="sm"
              onClick={() => onFilterClick(item.filter as any)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}