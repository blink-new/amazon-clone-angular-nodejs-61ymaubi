import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { EventGrid } from '@/components/events/EventGrid'
import { SeatMap } from '@/components/booking/SeatMap'
import { BookingForm } from '@/components/booking/BookingForm'
import { BookingConfirmation } from '@/components/booking/BookingConfirmation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react'
import { Event, SeatMap as SeatMapType, Booking, CartItem } from '@/types'
import { blink } from '@/blink/client'

type AppState = 'events' | 'seats' | 'booking' | 'confirmation'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentState, setCurrentState] = useState<AppState>('events')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<SeatMapType[]>([])
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event)
    setSelectedSeats([])
    setCurrentState('seats')
  }

  const handleSeatSelect = (seat: SeatMapType) => {
    if (selectedSeats.length < 8) { // Max 8 seats per booking
      setSelectedSeats(prev => [...prev, seat])
    }
  }

  const handleSeatDeselect = (seat: SeatMapType) => {
    setSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
  }

  const handleProceedToBooking = () => {
    if (selectedSeats.length > 0) {
      setCurrentState('booking')
    }
  }

  const handleBookingComplete = (booking: Booking) => {
    setCompletedBooking(booking)
    setCurrentState('confirmation')
  }

  const handleBackToEvents = () => {
    setCurrentState('events')
    setSelectedEvent(null)
    setSelectedSeats([])
    setCompletedBooking(null)
  }

  const handleBackToSeats = () => {
    setCurrentState('seats')
  }

  const handleNewBooking = () => {
    handleBackToEvents()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading TicketHub...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to TicketHub</CardTitle>
            <p className="text-muted-foreground">
              Your gateway to amazing events and experiences
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => blink.auth.login()} className="w-full">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={selectedSeats.length} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        {currentState !== 'events' && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={currentState === 'seats' ? handleBackToEvents : handleBackToSeats}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentState === 'seats' ? 'Back to Events' : 'Back to Seat Selection'}
            </Button>
            
            {selectedEvent && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedEvent.image_url || 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=400'}
                      alt={selectedEvent.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h2 className="font-semibold text-lg">{selectedEvent.title}</h2>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(selectedEvent.event_date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(selectedEvent.event_time)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedEvent.venue_name}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedEvent.category.charAt(0).toUpperCase() + selectedEvent.category.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Content */}
        {currentState === 'events' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Discover Amazing Events
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From blockbuster movies to live concerts, sports events to theater shows - 
                find and book tickets for unforgettable experiences.
              </p>
            </div>
            <EventGrid onEventSelect={handleEventSelect} />
          </div>
        )}

        {currentState === 'seats' && selectedEvent && (
          <div className="space-y-6">
            <SeatMap
              event={selectedEvent}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              onSeatDeselect={handleSeatDeselect}
            />
            
            {selectedSeats.length > 0 && (
              <div className="flex justify-center">
                <Button
                  onClick={handleProceedToBooking}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  Continue to Booking ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
                </Button>
              </div>
            )}
          </div>
        )}

        {currentState === 'booking' && selectedEvent && (
          <BookingForm
            event={selectedEvent}
            selectedSeats={selectedSeats}
            onBookingComplete={handleBookingComplete}
            onCancel={handleBackToSeats}
          />
        )}

        {currentState === 'confirmation' && completedBooking && selectedEvent && (
          <BookingConfirmation
            booking={completedBooking}
            event={selectedEvent}
            seats={selectedSeats}
            onNewBooking={handleNewBooking}
          />
        )}
      </main>
    </div>
  )
}

export default App