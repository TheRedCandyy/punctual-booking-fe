import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format, addDays, startOfDay, isBefore, isAfter } from 'date-fns'
import {
  CalendarDays,
  Clock,
  Scissors,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { useBookingStore } from '@/stores/useBookingStore'
import { Booking, BookingStatus } from '@/types/booking'

// Mock available time slots
const generateTimeSlots = (date: Date) => {
  const slots = []
  const startHour = 9 // 9 AM
  const endHour = 18 // 6 PM
  const now = new Date()
  const isToday = startOfDay(date).getTime() === startOfDay(now).getTime()

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotTime = new Date(date)
      slotTime.setHours(hour, minute, 0, 0)

      // Skip times in the past for today
      if (isToday && isBefore(slotTime, now)) {
        continue
      }

      // Randomly mark some slots as unavailable (for demo purposes)
      const isAvailable = Math.random() > 0.3

      slots.push({
        time: slotTime,
        available: isAvailable,
      })
    }
  }

  return slots
}

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { userBookings, isLoading } = useBookingStore()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined)
  const [timeSlots, setTimeSlots] = useState<
    { time: Date; available: boolean }[]
  >([])
  const [rescheduleStep, setRescheduleStep] = useState<'date' | 'time'>('date')

  useEffect(() => {
    if (id && userBookings.length > 0) {
      const foundBooking = userBookings.find(booking => booking.id === id)
      setBooking(foundBooking || null)
    }
  }, [id, userBookings])

  // Generate time slots when a date is selected
  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate))
      setSelectedTime(undefined)
    }
  }, [selectedDate])

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-100 text-green-800 border-green-200'
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case BookingStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200'
      case BookingStatus.NO_SHOW:
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return t('booking.status.confirmed')
      case BookingStatus.PENDING:
        return t('booking.status.pending')
      case BookingStatus.COMPLETED:
        return t('booking.status.completed')
      case BookingStatus.CANCELLED:
        return t('booking.status.cancelled')
      case BookingStatus.NO_SHOW:
        return t('booking.status.noShow')
      default:
        return status
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleRescheduleClick = () => {
    setShowRescheduleDialog(true)
    setRescheduleStep('date')
    setSelectedDate(undefined)
    setSelectedTime(undefined)
  }

  const handleRescheduleDialogClose = () => {
    if (!isRescheduling) {
      setShowRescheduleDialog(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setRescheduleStep('time')
    }
  }

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time)
  }

  const handleBackToDateSelection = () => {
    setRescheduleStep('date')
    setSelectedTime(undefined)
  }

  const handleRescheduleConfirm = () => {
    if (!booking || !selectedDate || !selectedTime) return

    setIsRescheduling(true)

    // Calculate end time (assuming same duration as original booking)
    const originalDuration =
      new Date(booking.endTime).getTime() -
      new Date(booking.startTime).getTime()
    const newEndTime = new Date(selectedTime.getTime() + originalDuration)

    // Simulate API call to reschedule booking
    setTimeout(() => {
      console.log('Booking rescheduled:', booking.id, 'New time:', selectedTime)
      setIsRescheduling(false)
      setShowRescheduleDialog(false)

      // Update the booking with new times
      setBooking({
        ...booking,
        startTime: selectedTime.toISOString(),
        endTime: newEndTime.toISOString(),
        status: BookingStatus.CONFIRMED,
      })

      // In a real app, you would call an API to reschedule the booking
      // and then update the state with the response
    }, 1500)
  }

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleCancelConfirm = () => {
    if (!booking) return

    setIsCancelling(true)

    // Simulate API call to cancel booking
    setTimeout(() => {
      console.log('Booking cancelled:', booking.id)
      setIsCancelling(false)
      setShowCancelDialog(false)

      // Update the booking status locally
      setBooking({
        ...booking,
        status: BookingStatus.CANCELLED,
      })

      // In a real app, you would call an API to cancel the booking
      // and then update the state with the response
    }, 1000)
  }

  const handleCancelDialogClose = () => {
    if (!isCancelling) {
      setShowCancelDialog(false)
    }
  }

  if (isLoading) {
    return <Loading centered className="py-8" />
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">
          {t('booking.notFound.title')}
        </h1>
        <p className="text-muted-foreground mb-6">
          {t('booking.notFound.description')}
        </p>
        <Button onClick={() => navigate('/user/dashboard')}>
          {t('common.backToDashboard')}
        </Button>
      </div>
    )
  }

  const isUpcoming = new Date(booking.startTime) > new Date()
  const canCancel = isUpcoming && booking.status !== BookingStatus.CANCELLED
  const canReschedule =
    isUpcoming &&
    (booking.status === BookingStatus.CONFIRMED ||
      booking.status === BookingStatus.PENDING)

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div className="flex items-center">
        <Button
          variant="default"
          size="sm"
          className="mr-4"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
        <h1 className="text-2xl font-bold">{t('booking.details.title')}</h1>
      </div>

      {/* Booking Status */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>{t('booking.details.status')}</CardTitle>
            <Badge className={getStatusColor(booking.status)}>
              {getStatusLabel(booking.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>
              {t('booking.details.bookingId')}: {booking.id}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <Clock className="h-4 w-4" />
            <span>
              {t('booking.details.created')}:{' '}
              {format(new Date(booking.createdAt), 'PPp')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t('booking.details.serviceDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="font-medium text-lg">{booking.service.name}</h3>
            {booking.service.description && (
              <p className="text-muted-foreground mt-1">
                {booking.service.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-4">
              {booking.service.price !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {new Intl.NumberFormat('pt-PT', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(booking.service.price)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">{t('booking.details.dateAndTime')}</h3>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(booking.startTime), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(booking.startTime), 'p')} -{' '}
                {format(new Date(booking.endTime), 'p')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t('booking.details.staffDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Scissors className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{booking.staff.name}</h3>
              {booking.staff.specialties && (
                <p className="text-sm text-muted-foreground">
                  {booking.staff.specialties.join(', ')}
                </p>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-border my-4"></div>

          <div className="space-y-2">
            {booking.staff.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{booking.staff.phone}</span>
              </div>
            )}
            {booking.staff.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{booking.staff.email}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {booking.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t('booking.details.notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <p className="text-sm">{booking.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isUpcoming && (
        <Card>
          <CardHeader>
            <CardTitle>{t('booking.details.actions')}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            {canReschedule && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleRescheduleClick}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                {t('booking.actions.reschedule')}
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancelClick}
              >
                {t('booking.actions.cancel')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={handleCancelDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('booking.cancel.title')}</DialogTitle>
            <DialogDescription>
              {t('booking.cancel.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border p-4 bg-muted/30">
              <h4 className="font-medium">{booking.service.name}</h4>
              <div className="mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>{format(new Date(booking.startTime), 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(booking.startTime), 'p')} -{' '}
                    {format(new Date(booking.endTime), 'p')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDialogClose}
              disabled={isCancelling}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <span className="mr-2">{t('common.loading')}</span>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                t('booking.cancel.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={showRescheduleDialog}
        onOpenChange={handleRescheduleDialogClose}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('booking.reschedule.title')}</DialogTitle>
            <DialogDescription>
              {t('booking.reschedule.description')}
            </DialogDescription>
          </DialogHeader>

          {rescheduleStep === 'date' ? (
            <div className="py-4 space-y-4">
              <h3 className="font-medium">{t('booking.selectDate')}</h3>
              <div className="flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={date =>
                    isBefore(date, startOfDay(new Date())) ||
                    isAfter(date, addDays(new Date(), 30))
                  }
                  className="rounded-md border"
                />
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBackToDateSelection}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t('booking.backToDate')}
                </Button>
                <h3 className="font-medium">
                  {selectedDate && format(selectedDate, 'PPP')}
                </h3>
              </div>

              <h3 className="font-medium">{t('booking.selectTime')}</h3>

              <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                {timeSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={
                      selectedTime?.getTime() === slot.time.getTime()
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    disabled={!slot.available}
                    className={`${!slot.available ? 'opacity-50' : ''}`}
                    onClick={() => handleTimeSelect(slot.time)}
                  >
                    {format(slot.time, 'p')}
                  </Button>
                ))}
              </div>

              {selectedTime && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium">
                    {t('booking.reschedule.summary')}
                  </h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>{format(selectedDate!, 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(selectedTime, 'p')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleRescheduleDialogClose}
              disabled={isRescheduling}
            >
              {t('common.cancel')}
            </Button>
            {rescheduleStep === 'time' && (
              <Button
                variant="default"
                onClick={handleRescheduleConfirm}
                disabled={isRescheduling || !selectedTime}
              >
                {isRescheduling ? (
                  <>
                    <span className="mr-2">{t('common.loading')}</span>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  t('booking.reschedule.confirm')
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BookingDetails
