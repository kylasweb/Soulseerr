import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Copy,
  Repeat
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface AvailabilitySlot {
  id: string
  startTime: string // ISO date string
  endTime: string   // ISO date string
  isRecurring: boolean
  recurrencePattern?: {
    type: 'weekly' | 'biweekly' | 'monthly'
    daysOfWeek: number[] // 0-6, Sunday = 0
    endDate?: string
  }
  isBooked: boolean
  sessionId?: string
  isBlocked: boolean
  notes?: string
}

interface AvailabilityCalendarProps {
  availabilitySlots: AvailabilitySlot[]
  onCreateSlot: (slot: Omit<AvailabilitySlot, 'id' | 'isBooked' | 'sessionId'>) => Promise<void>
  onUpdateSlot: (slotId: string, updates: Partial<AvailabilitySlot>) => Promise<void>
  onDeleteSlot: (slotId: string) => Promise<void>
  onBlockTime: (startTime: string, endTime: string, reason: string) => Promise<void>
  timeZone: string
  onTimeZoneChange: (timeZone: string) => void
}

export function AvailabilityCalendar({
  availabilitySlots,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
  onBlockTime,
  timeZone,
  onTimeZoneChange
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [editingSlot, setEditingSlot] = React.useState<AvailabilitySlot | null>(null)
  const [viewMode, setViewMode] = React.useState<'month' | 'week'>('week')

  // Form state
  const [formData, setFormData] = React.useState({
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: false,
    recurrenceType: 'weekly' as 'weekly' | 'biweekly' | 'monthly',
    daysOfWeek: [] as number[],
    recurrenceEndDate: '',
    isBlocked: false,
    notes: ''
  })

  // Get current week dates
  const getWeekDates = (date: Date): Date[] => {
    const week: Date[] = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay()) // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDates = getWeekDates(currentDate)
  const today = new Date()

  // Filter slots for current week
  const weekSlots = availabilitySlots.filter(slot => {
    const slotDate = new Date(slot.startTime)
    return weekDates.some(date => 
      date.toDateString() === slotDate.toDateString()
    )
  })

  // Group slots by date
  const slotsByDate = weekSlots.reduce((acc, slot) => {
    const date = new Date(slot.startTime).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {} as Record<string, AvailabilitySlot[]>)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone
    })
  }

  const handleCreateSlot = async () => {
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`)
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`)

      const newSlot: Omit<AvailabilitySlot, 'id' | 'isBooked' | 'sessionId'> = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        isRecurring: formData.isRecurring,
        isBlocked: formData.isBlocked,
        notes: formData.notes || undefined,
        ...(formData.isRecurring && {
          recurrencePattern: {
            type: formData.recurrenceType,
            daysOfWeek: formData.daysOfWeek,
            endDate: formData.recurrenceEndDate || undefined
          }
        })
      }

      await onCreateSlot(newSlot)
      setShowCreateDialog(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create slot:', error)
    }
  }

  const handleEditSlot = async () => {
    if (!editingSlot) return
    
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`)
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`)

      const updates: Partial<AvailabilitySlot> = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        isRecurring: formData.isRecurring,
        isBlocked: formData.isBlocked,
        notes: formData.notes || undefined,
        ...(formData.isRecurring && {
          recurrencePattern: {
            type: formData.recurrenceType,
            daysOfWeek: formData.daysOfWeek,
            endDate: formData.recurrenceEndDate || undefined
          }
        })
      }

      await onUpdateSlot(editingSlot.id, updates)
      setShowEditDialog(false)
      setEditingSlot(null)
      resetForm()
    } catch (error) {
      console.error('Failed to update slot:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      isRecurring: false,
      recurrenceType: 'weekly',
      daysOfWeek: [],
      recurrenceEndDate: '',
      isBlocked: false,
      notes: ''
    })
  }

  const openCreateDialog = (date?: Date) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0]
      }))
    }
    setShowCreateDialog(true)
  }

  const openEditDialog = (slot: AvailabilitySlot) => {
    const startTime = new Date(slot.startTime)
    const endTime = new Date(slot.endTime)
    
    setFormData({
      date: startTime.toISOString().split('T')[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      isRecurring: slot.isRecurring,
      recurrenceType: slot.recurrencePattern?.type || 'weekly',
      daysOfWeek: slot.recurrencePattern?.daysOfWeek || [],
      recurrenceEndDate: slot.recurrencePattern?.endDate?.split('T')[0] || '',
      isBlocked: slot.isBlocked,
      notes: slot.notes || ''
    })
    
    setEditingSlot(slot)
    setShowEditDialog(true)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const getSlotStatusColor = (slot: AvailabilitySlot) => {
    if (slot.isBlocked) return 'bg-red-100 text-red-800 border-red-200'
    if (slot.isBooked) return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getSlotStatusText = (slot: AvailabilitySlot) => {
    if (slot.isBlocked) return 'Blocked'
    if (slot.isBooked) return 'Booked'
    return 'Available'
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Availability Calendar</h2>
          <Select value={timeZone} onValueChange={onTimeZoneChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">Eastern Time</SelectItem>
              <SelectItem value="America/Chicago">Central Time</SelectItem>
              <SelectItem value="America/Denver">Mountain Time</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => openCreateDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Availability
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-medium">
                Week of {weekDates[0].toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week View */}
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
              const dateStr = date.toDateString()
              const daySlots = slotsByDate[dateStr] || []
              const isToday = date.toDateString() === today.toDateString()
              const isPast = date < today

              return (
                <div key={dateStr} className="min-h-[200px]">
                  {/* Day Header */}
                  <div className={`text-center py-2 border-b ${isToday ? 'bg-blue-50 text-blue-600' : ''}`}>
                    <div className="font-medium">{dayNames[index]}</div>
                    <div className={`text-sm ${isToday ? 'font-semibold' : 'text-muted-foreground'}`}>
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Day Content */}
                  <div className="p-2 space-y-1">
                    {!isPast && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs h-6"
                        onClick={() => openCreateDialog(date)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                    
                    {daySlots
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className={`text-xs p-2 rounded border cursor-pointer hover:shadow-sm transition-shadow ${getSlotStatusColor(slot)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {formatTime(new Date(slot.startTime))} - {formatTime(new Date(slot.endTime))}
                              </div>
                              <div className="text-xs opacity-75">
                                {getSlotStatusText(slot)}
                                {slot.isRecurring && (
                                  <Repeat className="h-3 w-3 inline ml-1" />
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => openEditDialog(slot)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDeleteSlot(slot.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Availability Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
            <DialogDescription>
              Set your available time slots for sessions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isBlocked}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBlocked: checked }))}
                  />
                  <Label className="text-sm">Block time</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
                />
                <Label>Recurring</Label>
              </div>
            </div>

            {formData.isRecurring && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label>Repeat</Label>
                  <Select 
                    value={formData.recurrenceType} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurrenceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-2">
                    {dayNames.map((day, index) => (
                      <Badge
                        key={day}
                        variant={formData.daysOfWeek.includes(index) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newDays = formData.daysOfWeek.includes(index)
                            ? formData.daysOfWeek.filter(d => d !== index)
                            : [...formData.daysOfWeek, index]
                          setFormData(prev => ({ ...prev, daysOfWeek: newDays }))
                        }}
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrenceEndDate">End Date (optional)</Label>
                  <Input
                    id="recurrenceEndDate"
                    type="date"
                    value={formData.recurrenceEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSlot}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Availability Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Availability</DialogTitle>
            <DialogDescription>
              Update your availability slot
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isBlocked}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBlocked: checked }))}
                  />
                  <Label className="text-sm">Block time</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">End Time</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSlot}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}