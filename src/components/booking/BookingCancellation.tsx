import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { AlertTriangle, Calendar, MapPin, Clock, DollarSign } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Booking, Event } from '../../types'
import { blink } from '../../blink/client'
import { sendBookingCancellation } from '../../utils/notificationService'

interface BookingCancellationProps {
  booking: Booking
  event: Event
  onCancellationComplete: () => void
}

export default function BookingCancellation({ booking, event, onCancellationComplete }: BookingCancellationProps) {
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const cancellationFee = booking.total_amount * 0.1 // 10% cancellation fee
  const refundAmount = booking.total_amount - cancellationFee

  const handleCancellation = async () => {
    setLoading(true)
    try {
      // Update booking status
      await blink.db.bookings.update(booking.id, {
        booking_status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })

      // Free up the seats by updating seat availability
      const bookedSeats = await blink.db.bookedSeats.list({
        where: { booking_id: booking.id }
      })

      for (const bookedSeat of bookedSeats) {
        await blink.db.seatMap.update(bookedSeat.seat_map_id, {
          is_available: 1
        })
      }

      // Update event available seats
      await blink.db.events.update(event.id, {
        available_seats: event.available_seats + booking.seat_count
      })

      // Send cancellation email
      try {
        await sendBookingCancellation(booking, event)
        console.log('✅ Cancellation email sent successfully')
      } catch (emailError) {
        console.error('❌ Failed to send cancellation email:', emailError)
        // Don't fail the cancellation if email fails
      }

      // Publish real-time notification
      try {
        await blink.realtime.publish('user-notifications', 'new_notification', {
          id: `notif_${Date.now()}`,
          type: 'booking_cancelled',
          title: 'Booking Cancelled',
          message: `Your booking for ${event.title} has been cancelled. Refund of $${refundAmount.toFixed(2)} is being processed.`,
          timestamp: new Date().toISOString(),
          read: false,
          bookingId: booking.id,
          eventId: event.id
        })
      } catch (realtimeError) {
        console.error('Failed to send real-time notification:', realtimeError)
      }

      setShowDialog(false)
      onCancellationComplete()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  const canCancel = () => {
    const eventDate = new Date(event.date)
    const now = new Date()
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntilEvent > 24 // Can cancel if more than 24 hours before event
  }

  const getTimeUntilEvent = () => {
    const eventDate = new Date(event.date)
    const now = new Date()
    const hoursUntilEvent = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (hoursUntilEvent < 0) return 'Event has passed'
    if (hoursUntilEvent < 24) return `${hoursUntilEvent} hours until event`
    const daysUntilEvent = Math.floor(hoursUntilEvent / 24)
    return `${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''} until event`
  }

  if (!canCancel()) {
    return (
      <Button variant="outline" size="sm" disabled className="text-gray-400">
        Cannot Cancel
      </Button>
    )
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          Cancel Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Cancel Booking</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <h3 className="font-semibold text-xl">{event.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Seats:</span>
                  <span>{booking.seat_count}</span>
                </div>
              </div>
              <Badge variant="secondary" className="mt-2">
                {getTimeUntilEvent()}
              </Badge>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg text-orange-800">Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-orange-700">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-medium">Free cancellation up to 24 hours before the event</p>
                  <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                    <li>Cancellations made more than 24 hours before the event: 10% cancellation fee</li>
                    <li>Cancellations made within 24 hours: No refund available</li>
                    <li>Refunds are processed within 3-5 business days</li>
                    <li>Refunds will be credited to your original payment method</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund Calculation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Refund Calculation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Original Amount:</span>
                  <span>${booking.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Cancellation Fee (10%):</span>
                  <span>-${cancellationFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Refund Amount:</span>
                  <span className="text-green-600">${refundAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-red-700">
                <h4 className="font-semibold mb-1">This action cannot be undone</h4>
                <p className="text-sm">
                  Once you cancel this booking, your seats will be released and made available to other customers. 
                  You will not be able to recover this booking.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="flex-1"
              disabled={loading}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancellation}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Cancelling...' : `Cancel & Refund $${refundAmount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}