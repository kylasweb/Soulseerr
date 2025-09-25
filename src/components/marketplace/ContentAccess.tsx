import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  Download, 
  BookOpen, 
  Headphones, 
  Video, 
  Package,
  Clock,
  Star,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Share2,
  Bookmark,
  MessageCircle,
  ThumbsUp,
  ChevronRight,
  FileText,
  CheckCircle,
  Lock,
  PlayCircle
} from 'lucide-react'

interface ContentChapter {
  id: string
  title: string
  duration?: number
  order: number
  isCompleted: boolean
  isLocked: boolean
  description?: string
  content?: {
    audioUrl?: string
    videoUrl?: string
    textContent?: string
    attachments?: Array<{
      name: string
      url: string
      type: string
    }>
  }
}

interface ContentProgress {
  totalChapters: number
  completedChapters: number
  totalDuration?: number
  watchedDuration?: number
  lastAccessedChapter?: string
  progressPercentage: number
}

interface OwnedContent {
  id: string
  title: string
  description: string
  type: 'GUIDE' | 'MEDITATION' | 'COURSE' | 'EBOOK' | 'AUDIO' | 'VIDEO' | 'BUNDLE'
  chapters: ContentChapter[]
  reader: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  progress: ContentProgress
  purchaseDate: string
  averageRating: number
  userRating?: number
  notes: Array<{
    id: string
    content: string
    timestamp?: number
    chapterId?: string
    createdAt: string
  }>
  bookmarks: Array<{
    id: string
    title: string
    timestamp?: number
    chapterId: string
    createdAt: string
  }>
}

interface ContentAccessProps {
  content: OwnedContent
  onPlay: (chapterId: string, timestamp?: number) => void
  onPause: () => void
  onSeek: (timestamp: number) => void
  onChapterComplete: (chapterId: string) => Promise<void>
  onRateContent: (rating: number) => Promise<void>
  onAddNote: (content: string, chapterId?: string, timestamp?: number) => Promise<void>
  onDeleteNote: (noteId: string) => Promise<void>
  onAddBookmark: (title: string, chapterId: string, timestamp?: number) => Promise<void>
  onDeleteBookmark: (bookmarkId: string) => Promise<void>
  onDownload: (chapterId?: string) => Promise<void>
  onShare: () => void
  currentChapter?: string
  isPlaying?: boolean
  currentTime?: number
  duration?: number
  volume?: number
  onVolumeChange?: (volume: number) => void
}

export function ContentAccess({
  content,
  onPlay,
  onPause,
  onSeek,
  onChapterComplete,
  onRateContent,
  onAddNote,
  onDeleteNote,
  onAddBookmark,
  onDeleteBookmark,
  onDownload,
  onShare,
  currentChapter,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  volume = 1,
  onVolumeChange
}: ContentAccessProps) {
  const [selectedChapter, setSelectedChapter] = React.useState<string>(
    currentChapter || content.chapters[0]?.id || ''
  )
  const [showNotes, setShowNotes] = React.useState(false)
  const [newNote, setNewNote] = React.useState('')
  const [newBookmarkTitle, setNewBookmarkTitle] = React.useState('')
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1)

  const currentChapterData = content.chapters.find(c => c.id === selectedChapter)
  const currentChapterIndex = content.chapters.findIndex(c => c.id === selectedChapter)
  
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'GUIDE': return <BookOpen className="h-5 w-5" />
      case 'MEDITATION': return <Play className="h-5 w-5" />
      case 'COURSE': return <Play className="h-5 w-5" />
      case 'EBOOK': return <BookOpen className="h-5 w-5" />
      case 'AUDIO': return <Headphones className="h-5 w-5" />
      case 'VIDEO': return <Video className="h-5 w-5" />
      case 'BUNDLE': return <Package className="h-5 w-5" />
      default: return <BookOpen className="h-5 w-5" />
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatProgressTime = (seconds?: number) => {
    if (!seconds) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause()
    } else {
      onPlay(selectedChapter, currentTime)
    }
  }

  const handleNextChapter = () => {
    const nextIndex = currentChapterIndex + 1
    if (nextIndex < content.chapters.length) {
      const nextChapter = content.chapters[nextIndex]
      if (!nextChapter.isLocked) {
        setSelectedChapter(nextChapter.id)
        onPlay(nextChapter.id, 0)
      }
    }
  }

  const handlePreviousChapter = () => {
    const prevIndex = currentChapterIndex - 1
    if (prevIndex >= 0) {
      const prevChapter = content.chapters[prevIndex]
      setSelectedChapter(prevChapter.id)
      onPlay(prevChapter.id, 0)
    }
  }

  const handleAddNote = async () => {
    if (newNote.trim()) {
      await onAddNote(newNote, selectedChapter, currentTime)
      setNewNote('')
    }
  }

  const handleAddBookmark = async () => {
    if (newBookmarkTitle.trim()) {
      await onAddBookmark(newBookmarkTitle, selectedChapter, currentTime)
      setNewBookmarkTitle('')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {getContentTypeIcon(content.type)}
            <Badge variant="secondary">{content.type.toLowerCase()}</Badge>
          </div>
          <h1 className="text-3xl font-bold">{content.title}</h1>
          <p className="text-muted-foreground">{content.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Avatar className="w-6 h-6">
                <AvatarImage src={content.reader.avatar} />
                <AvatarFallback>
                  {content.reader.firstName[0]}{content.reader.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span>{content.reader.firstName} {content.reader.lastName}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{content.averageRating.toFixed(1)}</span>
            </div>
            
            <span>Purchased {new Date(content.purchaseDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={() => onDownload()}>
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Your Progress</h3>
              <span className="text-sm text-muted-foreground">
                {content.progress.completedChapters} of {content.progress.totalChapters} completed
              </span>
            </div>
            
            <Progress value={content.progress.progressPercentage} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{content.progress.completedChapters} chapters completed</span>
              </div>
              
              {content.progress.totalDuration && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatProgressTime(content.progress.watchedDuration)} / {formatProgressTime(content.progress.totalDuration)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Bookmark className="h-4 w-4" />
                <span>{content.bookmarks.length} bookmarks</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Player */}
          {(content.type === 'AUDIO' || content.type === 'VIDEO' || content.type === 'MEDITATION') && (
            <Card>
              <CardContent className="p-0">
                {/* Player Controls */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {currentChapterData?.title || 'Select a chapter to begin'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={setIsFullscreen ? () => setIsFullscreen(!isFullscreen) : undefined}
                      >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{formatProgressTime(currentTime)}</span>
                      <span>{formatProgressTime(duration)}</span>
                    </div>
                    <div 
                      className="h-2 bg-muted rounded-full cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const clickX = e.clientX - rect.left
                        const percentage = clickX / rect.width
                        onSeek(duration * percentage)
                      }}
                    >
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousChapter}
                      disabled={currentChapterIndex <= 0}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSeek(Math.max(0, currentTime - 10))}
                    >
                      <RotateCcw className="h-4 w-4" />
                      10s
                    </Button>

                    <Button
                      size="lg"
                      onClick={handlePlayPause}
                      disabled={!currentChapterData || currentChapterData.isLocked}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSeek(Math.min(duration, currentTime + 10))}
                    >
                      10s
                      <RotateCcw className="h-4 w-4 scale-x-[-1]" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextChapter}
                      disabled={currentChapterIndex >= content.chapters.length - 1}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Additional Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onVolumeChange?.(volume > 0 ? 0 : 1)}>
                        {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </Button>
                      
                      <select 
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewBookmarkTitle(`Chapter ${currentChapterIndex + 1} - ${formatProgressTime(currentTime)}`)}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotes(!showNotes)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chapter Content */}
          {currentChapterData && (
            <Card>
              <Tabs defaultValue="content">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="notes">Notes ({content.notes.filter(n => n.chapterId === selectedChapter).length})</TabsTrigger>
                      <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>

                <CardContent>
                  <TabsContent value="content" className="space-y-4">
                    {currentChapterData.description && (
                      <p className="text-muted-foreground">{currentChapterData.description}</p>
                    )}
                    
                    {currentChapterData.content?.textContent && (
                      <div className="prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: currentChapterData.content.textContent }} />
                      </div>
                    )}
                    
                    {currentChapterData.content?.attachments && currentChapterData.content.attachments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Attachments</h4>
                        <div className="space-y-2">
                          {currentChapterData.content.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{attachment.name}</span>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => window.open(attachment.url, '_blank')}>
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add a note at current timestamp..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md"
                      />
                      <Button onClick={handleAddNote}>Add Note</Button>
                    </div>
                    
                    <div className="space-y-3">
                      {content.notes
                        .filter(note => note.chapterId === selectedChapter)
                        .map((note) => (
                          <div key={note.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm">{note.content}</p>
                                <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                                  {note.timestamp && (
                                    <>
                                      <button 
                                        onClick={() => onSeek(note.timestamp!)}
                                        className="text-primary hover:underline"
                                      >
                                        {formatProgressTime(note.timestamp)}
                                      </button>
                                      <span>•</span>
                                    </>
                                  )}
                                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteNote(note.id)}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="bookmarks" className="space-y-4">
                    {newBookmarkTitle && (
                      <div className="flex space-x-2 p-3 bg-muted/50 rounded-lg">
                        <input
                          type="text"
                          value={newBookmarkTitle}
                          onChange={(e) => setNewBookmarkTitle(e.target.value)}
                          className="flex-1 px-2 py-1 border rounded"
                        />
                        <Button size="sm" onClick={handleAddBookmark}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setNewBookmarkTitle('')}>Cancel</Button>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {content.bookmarks
                        .filter(bookmark => bookmark.chapterId === selectedChapter)
                        .map((bookmark) => (
                          <div key={bookmark.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium text-sm">{bookmark.title}</h4>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                {bookmark.timestamp && (
                                  <>
                                    <button 
                                      onClick={() => onSeek(bookmark.timestamp!)}
                                      className="text-primary hover:underline"
                                    >
                                      {formatProgressTime(bookmark.timestamp)}
                                    </button>
                                    <span>•</span>
                                  </>
                                )}
                                <span>{new Date(bookmark.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteBookmark(bookmark.id)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chapter List */}
          <Card>
            <CardHeader>
              <CardTitle>Chapters</CardTitle>
              <CardDescription>{content.chapters.length} chapters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {content.chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChapter === chapter.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                  } ${chapter.isLocked ? 'opacity-50' : ''}`}
                  onClick={() => {
                    if (!chapter.isLocked) {
                      setSelectedChapter(chapter.id)
                      onPlay(chapter.id, 0)
                    }
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {chapter.isLocked ? <Lock className="h-4 w-4" /> : 
                     chapter.isCompleted ? <CheckCircle className="h-4 w-4 text-green-600" /> : 
                     selectedChapter === chapter.id && isPlaying ? <PlayCircle className="h-4 w-4 text-primary" /> :
                     index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{chapter.title}</h4>
                    {chapter.duration && (
                      <p className="text-xs text-muted-foreground">
                        {formatProgressTime(chapter.duration)}
                      </p>
                    )}
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rate Content */}
          {!content.userRating && (
            <Card>
              <CardHeader>
                <CardTitle>Rate This Content</CardTitle>
                <CardDescription>Share your experience with others</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant="ghost"
                      size="sm"
                      onClick={() => onRateContent(rating)}
                      className="p-1"
                    >
                      <Star className="h-5 w-5" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}