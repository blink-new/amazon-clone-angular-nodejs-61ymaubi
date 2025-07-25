import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Mail, Phone, User } from 'lucide-react'
import { Event, SeatMap, Booking } from '@/types'
import { blink } from '@/blink/client'
import { sendBookingConfirmation } from '../../utils/notificationService'

interface BookingFormProps {
  event: Event
  selectedSeats: SeatMap[]
  onBookingComplete: (booking: Booking) => void
  onCancel: () => void
}

export function BookingForm({ event, selectedSeats, onBookingComplete, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    paymentMethod: 'card'
  })
  const [loading, setLoading] = useState(false)

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  const bookingFee = totalAmount * 0.05 // 5% booking fee
  const finalAmount = totalAmount + bookingFee

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateBookingReference = () => {
    return 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await blink.auth.me()
      const bookingReference = generateBookingReference()
      
      // Create booking
      const booking = await blink.db.bookings.create({
        id: `booking_${Date.now()}`,
        user_id: user.id,
        event_id: event.id,
        booking_reference: bookingReference,
        total_amount: finalAmount,
        booking_status: 'confirmed',
        payment_status: 'completed',
        payment_method: formData.paymentMethod,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_name: formData.fullName,
        seat_count: selectedSeats.length,
        qr_code: `QR_${bookingReference}`,
        created_at: new Date().toISOString()
      })

      // Create booked seats records
      for (const seat of selectedSeats) {
        await blink.db.bookedSeats.create({
          id: `booked_${Date.now()}_${seat.id}`,
          booking_id: booking.id,
          seat_map_id: seat.id
        })

        // Update seat availability
        await blink.db.seatMap.update(seat.id, {
          is_available: 0
        })
      }

      // Update event available seats
      await blink.db.events.update(event.id, {
        available_seats: event.available_seats - selectedSeats.length
      })

      // Send confirmation email
      try {
        await sendBookingConfirmation(booking, event)
        console.log('Booking confirmation email sent successfully')
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the booking if email fails
      }

      onBookingComplete(booking)
    } catch (error) {
      console.error('Booking failed:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Complete Your Booking</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">{event.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {event.venue_name} • {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <Badge key={seat.id} variant="secondary">
                  Row {seat.row_name}, Seat {seat.seat_number}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Contact Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phone"
                  type="tel"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-3">
            <h3 className="font-medium">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tickets ({selectedSeats.length}x)</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Booking Fee</span>
                <span>${bookingFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>${finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Payment Method</span>
            </div>
            <p className="text-sm text-blue-700">
              This is a demo booking system. In a real application, this would integrate with Stripe or another payment processor.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading ? 'Processing...' : `Pay $${finalAmount.toFixed(2)}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}