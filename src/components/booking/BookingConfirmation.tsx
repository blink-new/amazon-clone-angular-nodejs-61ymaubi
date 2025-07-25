import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Download, Mail, Calendar, MapPin, QrCode } from 'lucide-react'
import { Booking, Event, SeatMap } from '@/types'

interface BookingConfirmationProps {
  booking: Booking
  event: Event
  seats: SeatMap[]
  onNewBooking: () => void
}

export function BookingConfirmation({ booking, event, seats, onNewBooking }: BookingConfirmationProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleDownloadTicket = () => {
    // In a real app, this would generate a PDF ticket
    alert('Ticket download would be implemented with PDF generation')
  }

  const handleEmailTicket = () => {
    // In a real app, this would send email with ticket
    alert('Email ticket functionality would be implemented')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-green-900">Booking Confirmed!</h2>
              <p className="text-green-700">Your tickets have been successfully booked.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Booking Reference:</span>
              <p className="font-mono font-medium">{booking.booking_reference}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Booking Date:</span>
              <p className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Payment Status:</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Total Amount:</span>
              <p className="font-medium text-lg">${booking.total_amount.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Information */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <img
              src={event.image_url || 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=400'}
              alt={event.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-muted-foreground mb-2">{event.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(event.event_date)} at {formatTime(event.event_time)}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.venue_name}
                  {event.venue_address && (
                    <span className="ml-1">• {event.venue_address}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seat Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Seats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {seats.map((seat) => (
              <div key={seat.id} className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="font-medium">Row {seat.row_name}</div>
                <div className="text-sm text-muted-foreground">Seat {seat.seat_number}</div>
                <div className="text-sm font-medium text-blue-600">
                  {seat.seat_type.charAt(0).toUpperCase() + seat.seat_type.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>Digital Ticket</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="bg-gray-100 p-8 rounded-lg">
              <QrCode className="h-24 w-24 mx-auto text-gray-400" />
              <p className="text-sm text-muted-foreground mt-2">
                QR Code: {booking.qr_code}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Show this QR code at the venue entrance for quick check-in
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleDownloadTicket}
          variant="outline"
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Ticket
        </Button>
        <Button
          onClick={handleEmailTicket}
          variant="outline"
          className="flex-1"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email Ticket
        </Button>
        <Button
          onClick={onNewBooking}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          Book Another Event
        </Button>
      </div>

      {/* Important Information */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <h4 className="font-medium text-yellow-900 mb-2">Important Information</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Please arrive at least 30 minutes before the event starts</li>
            <li>• Bring a valid ID that matches the booking name</li>
            <li>• Screenshots of tickets are not accepted - use the QR code above</li>
            <li>• Contact support if you need to make changes to your booking</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}