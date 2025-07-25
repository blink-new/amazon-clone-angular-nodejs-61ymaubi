import React, { useState, useEffect } from 'react'
import { blink } from '../../blink/client'
import { Booking, Event } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Calendar, MapPin, Clock, Users, Download, QrCode } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const loadUserData = async () => {
    try {
      const userData = await blink.auth.me()
      setUser(userData)

      if (userData) {
        const [bookingsData, eventsData] = await Promise.all([
          blink.db.bookings.list({
            where: { user_id: userData.id },
            orderBy: { created_at: 'desc' }
          }),
          blink.db.events.list()
        ])

        setBookings(bookingsData)
        setEvents(eventsData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const getEventDetails = (eventId: string) => {
    return events.find(event => event.id === eventId)
  }

  const generateTicketQR = (booking: Booking) => {
    const ticketData = {
      bookingId: booking.id,
      eventId: booking.event_id,
      seats: booking.seat_count,
      customerEmail: booking.customer_email
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(ticketData))}`
  }

  const downloadTicket = (booking: Booking) => {
    const event = getEventDetails(booking.event_id)
    if (!event) return

    const ticketContent = `
DIGITAL TICKET
==============

Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString()}
Time: ${event.time}
Venue: ${event.venue}

Booking ID: ${booking.id}
Customer: ${booking.customer_name}
Email: ${booking.customer_email}
Seats: ${booking.seat_count}
Total Amount: $${booking.total_amount.toFixed(2)}

Booking Date: ${new Date(booking.created_at).toLocaleDateString()}

Please present this ticket at the venue.
    `

    const blob = new Blob([ticketContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-${booking.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (date: string) => {
    const eventDate = new Date(date)
    const now = new Date()
    
    if (eventDate > now) {
      return 'bg-green-100 text-green-800'
    } else {
      return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (date: string) => {
    const eventDate = new Date(date)
    const now = new Date()
    
    if (eventDate > now) {
      return 'Upcoming'
    } else {
      return 'Completed'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to sign in to view your bookings.</p>
          <Button onClick={() => blink.auth.login()} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Welcome back, {user.email}!</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(booking => {
                  const event = getEventDetails(booking.event_id)
                  return event && new Date(event.date) > new Date()
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${bookings.reduce((sum, booking) => sum + booking.total_amount, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">Start exploring events and make your first booking!</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Browse Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const event = getEventDetails(booking.event_id)
              if (!event) return null

              return (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-48 md:h-auto">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                            <div className="flex items-center space-x-4 text-gray-600 mb-2">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {event.time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {event.venue}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(event.date)}>
                                {getStatusText(event.date)}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {booking.seat_count} seat{booking.seat_count > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              ${booking.total_amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Booking #{booking.id.slice(-8)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <QrCode className="w-4 h-4 mr-2" />
                                View QR Code
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Digital Ticket</DialogTitle>
                              </DialogHeader>
                              <div className="text-center">
                                <img
                                  src={generateTicketQR(booking)}
                                  alt="Ticket QR Code"
                                  className="mx-auto mb-4"
                                />
                                <p className="text-sm text-gray-600 mb-2">
                                  Show this QR code at the venue
                                </p>
                                <p className="text-xs text-gray-500">
                                  Booking ID: {booking.id}
                                </p>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTicket(booking)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Ticket
                          </Button>

                          {new Date(event.date) > new Date() && (
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}