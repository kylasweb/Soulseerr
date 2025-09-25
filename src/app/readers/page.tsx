'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/EnhancedAuthProvider'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  Search, 
  Star, 
  DollarSign, 
  Users, 
  Calendar, 
  Video, 
  Phone, 
  MessageCircle, 
  Heart,
  Zap,
  Eye,
  Filter,
  SortAsc,
  Grid,
  List,
  Clock,
  Award,
  CheckCircle,
  X
} from 'lucide-react'
import Link from 'next/link'

interface Reader {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  bio: string
  specialties: string[]
  experience: number
  averageRating: number
  totalSessions: number
  totalReviews: number
  status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'AWAY'
  hourlyRate: number
  sessionTypes: ('CHAT' | 'CALL' | 'VIDEO')[]
  languages: string[]
  isVerified: boolean
  featured: boolean
}

interface FilterOptions {
  specialty: string
  minRating: number
  maxPrice: number
  sessionType: string
  language: string
  availability: string
}

export default function ReadersPage() {
  const { user } = useAuth()
  const [readers, setReaders] = useState<Reader[]>([])
  const [filteredReaders, setFilteredReaders] = useState<Reader[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState<FilterOptions>({
    specialty: '',
    minRating: 0,
    maxPrice: 100,
    sessionType: '',
    language: '',
    availability: ''
  })

  const specialties = [
    'Tarot', 'Astrology', 'Mediumship', 'Energy Healing', 'Channeling',
    'Crystal Healing', 'Life Coaching', 'Divination', 'Numerology', 'Palmistry'
  ]

  const languages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian']

  useEffect(() => {
    const loadReaders = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // TODO: Replace with actual API call
      const readers: Reader[] = []

      setReaders(readers)
      setFilteredReaders(readers)
      setLoading(false)
    }

    loadReaders()
  }, [])

  useEffect(() => {
    let filtered = readers

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(reader =>
        `${reader.firstName} ${reader.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reader.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reader.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply filters
    if (filters.specialty) {
      filtered = filtered.filter(reader =>
        reader.specialties.includes(filters.specialty)
      )
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(reader =>
        reader.averageRating >= filters.minRating
      )
    }

    if (filters.maxPrice < 100) {
      filtered = filtered.filter(reader =>
        reader.hourlyRate <= filters.maxPrice
      )
    }

    if (filters.sessionType) {
      filtered = filtered.filter(reader =>
        reader.sessionTypes.includes(filters.sessionType as any)
      )
    }

    if (filters.language) {
      filtered = filtered.filter(reader =>
        reader.languages.includes(filters.language)
      )
    }

    if (filters.availability) {
      filtered = filtered.filter(reader =>
        reader.status === filters.availability
      )
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.averageRating - a.averageRating
        case 'experience':
          return b.experience - a.experience
        case 'price-low':
          return a.hourlyRate - b.hourlyRate
        case 'price-high':
          return b.hourlyRate - a.hourlyRate
        case 'sessions':
          return b.totalSessions - a.totalSessions
        default:
          return 0
      }
    })

    setFilteredReaders(filtered)
  }, [readers, searchQuery, filters, sortBy])

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-4 h-4" />
      case 'CALL': return <Phone className="w-4 h-4" />
      case 'CHAT': return <MessageCircle className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return <Badge className="bg-green-600">Online</Badge>
      case 'OFFLINE':
        return <Badge className="bg-gray-600">Offline</Badge>
      case 'BUSY':
        return <Badge className="bg-red-600">Busy</Badge>
      case 'AWAY':
        return <Badge className="bg-yellow-600">Away</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const clearFilters = () => {
    setFilters({
      specialty: '',
      minRating: 0,
      maxPrice: 100,
      sessionType: '',
      language: '',
      availability: ''
    })
    setSearchQuery('')
  }

  const ReaderCard = ({ reader }: { reader: Reader }) => (
    <Card className={`mystical-card transform transition-all duration-200 hover:scale-105 ${
      reader.featured ? 'ring-2 ring-mystical-gold' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={reader.avatar} alt={`${reader.firstName} ${reader.lastName}`} />
              <AvatarFallback className="bg-mystical-pink text-white text-lg">
                {reader.firstName[0]}{reader.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-playfair text-xl font-semibold text-white">
                  {reader.firstName} {reader.lastName}
                </h3>
                {reader.isVerified && (
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                )}
                {reader.featured && (
                  <Badge className="bg-mystical-gold text-black">Featured</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 mb-2">
                {getStatusBadge(reader.status)}
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-mystical-gold fill-current" />
                  <span className="ml-1 text-white">{reader.averageRating}</span>
                  <span className="text-gray-400 ml-1">({reader.totalReviews})</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{reader.experience} years</span>
                <span>{reader.totalSessions} sessions</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-mystical-gold font-semibold text-lg">
              {formatCurrency(reader.hourlyRate)}/min
            </div>
          </div>
        </div>

        <p className="font-playfair text-gray-300 mb-4 line-clamp-2">
          {reader.bio}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {reader.specialties.slice(0, 3).map((specialty, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {specialty}
            </Badge>
          ))}
          {reader.specialties.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{reader.specialties.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {reader.sessionTypes.map((type) => (
              <div key={type} className="text-gray-400" title={type}>
                {getSessionTypeIcon(type)}
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <Link href={`/sessions/book?reader=${reader.id}`}>
              <Button size="sm" className="mystical-button">
                Book Session
              </Button>
            </Link>
            <Link href={`/readers/${reader.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ReaderListItem = ({ reader }: { reader: Reader }) => (
    <Card className="mystical-card">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={reader.avatar} alt={`${reader.firstName} ${reader.lastName}`} />
            <AvatarFallback className="bg-mystical-pink text-white text-xl">
              {reader.firstName[0]}{reader.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-playfair text-2xl font-semibold text-white">
                {reader.firstName} {reader.lastName}
              </h3>
              {reader.isVerified && (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              )}
              {reader.featured && (
                <Badge className="bg-mystical-gold text-black">Featured</Badge>
              )}
              {getStatusBadge(reader.status)}
            </div>
            
            <p className="font-playfair text-gray-300 mb-3">
              {reader.bio}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {reader.specialties.map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-mystical-gold fill-current" />
                <span className="ml-1 text-white">{reader.averageRating}</span>
                <span className="text-gray-400 ml-1">({reader.totalReviews})</span>
              </div>
              <div className="text-gray-400">
                {reader.experience} years experience
              </div>
              <div className="text-gray-400">
                {reader.totalSessions} sessions
              </div>
              <div className="text-mystical-gold font-semibold">
                {formatCurrency(reader.hourlyRate)}/min
              </div>
              <div className="flex space-x-1">
                {reader.sessionTypes.map((type) => (
                  <div key={type} className="text-gray-400">
                    {getSessionTypeIcon(type)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Link href={`/sessions/book?reader=${reader.id}`}>
              <Button className="mystical-button">
                Book Session
              </Button>
            </Link>
            <Link href={`/readers/${reader.id}`}>
              <Button variant="outline">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mystical-pink"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-alex text-4xl md:text-5xl font-bold text-transparent mystical-text-gradient mb-2">
            Discover Spiritual Readers
          </h1>
          <p className="font-playfair text-lg text-gray-300">
            Connect with gifted spiritual guides for personalized wisdom and guidance
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search readers by name, specialty, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                  <SelectItem value="price-low">Lowest Price</SelectItem>
                  <SelectItem value="price-high">Highest Price</SelectItem>
                  <SelectItem value="sessions">Most Sessions</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-800 border-gray-700 text-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="bg-gray-800 border-gray-700 text-white"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mystical-card mb-4">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Specialty</label>
                    <Select value={filters.specialty} onValueChange={(value) => setFilters({...filters, specialty: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Min Rating</label>
                    <Select value={filters.minRating.toString()} onValueChange={(value) => setFilters({...filters, minRating: parseFloat(value)})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        <SelectItem value="4.8">4.8+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Max Price</label>
                    <Select value={filters.maxPrice.toString()} onValueChange={(value) => setFilters({...filters, maxPrice: parseFloat(value)})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">Any</SelectItem>
                        <SelectItem value="3">Up to $3</SelectItem>
                        <SelectItem value="5">Up to $5</SelectItem>
                        <SelectItem value="10">Up to $10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Session Type</label>
                    <Select value={filters.sessionType} onValueChange={(value) => setFilters({...filters, sessionType: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="CHAT">Chat</SelectItem>
                        <SelectItem value="CALL">Call</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Language</label>
                    <Select value={filters.language} onValueChange={(value) => setFilters({...filters, language: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>{language}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Availability</label>
                    <Select value={filters.availability} onValueChange={(value) => setFilters({...filters, availability: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="OFFLINE">Offline</SelectItem>
                        <SelectItem value="BUSY">Busy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={clearFilters} className="mr-2">
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-300">
            Found {filteredReaders.length} spiritual reader{filteredReaders.length !== 1 ? 's' : ''}
            {(searchQuery || Object.values(filters).some(v => v)) && ' matching your criteria'}
          </div>
        </div>

        {/* Featured Readers */}
        {filteredReaders.some(r => r.featured) && (
          <div className="mb-8">
            <h2 className="font-dancing text-3xl text-white mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-mystical-gold" />
              Featured Readers
            </h2>
            <div className="grid gap-6">
              {filteredReaders.filter(r => r.featured).map((reader) => (
                <ReaderListItem key={reader.id} reader={reader} />
              ))}
            </div>
          </div>
        )}

        {/* All Readers */}
        <div>
          <h2 className="font-dancing text-3xl text-white mb-6">All Readers</h2>
          {filteredReaders.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReaders.map((reader) => (
                  <ReaderCard key={reader.id} reader={reader} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReaders.map((reader) => (
                  <ReaderListItem key={reader.id} reader={reader} />
                ))}
              </div>
            )
          ) : (
            <Card className="mystical-card">
              <CardContent className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-playfair text-2xl text-white mb-2">No readers found</h3>
                <p className="font-playfair text-gray-400 mb-6">
                  Try adjusting your search criteria or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}