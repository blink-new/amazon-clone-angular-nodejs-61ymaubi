import React, { useState, useEffect } from 'react'
import { blink } from '../../blink/client'
import { Event, Booking } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Calendar, Users, DollarSign, Plus, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
    upcomingEvents: 0
  })

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'movie',
    date: '',
    time: '',
    venue: '',
    price: '',
    image_url: '',
    total_seats: '100'
  })

  const loadData = async () => {
    try {
      const [eventsData, bookingsData] = await Promise.all([
        blink.db.events.list({ orderBy: { created_at: 'desc' } }),
        blink.db.bookings.list({ orderBy: { created_at: 'desc' } })
      ])

      setEvents(eventsData)
      setBookings(bookingsData)

      // Calculate stats
      const now = new Date()
      const upcomingEvents = eventsData.filter(event => new Date(event.date) > now).length
      const totalRevenue = bookingsData.reduce((sum, booking) => sum + booking.total_amount, 0)

      setStats({
        totalEvents: eventsData.length,
        totalBookings: bookingsData.length,
        totalRevenue,
        upcomingEvents
      })
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateEvent = async () => {
    try {
      await blink.db.events.create({
        ...newEvent,
        price: parseFloat(newEvent.price),
        total_seats: parseInt(newEvent.total_seats),
        available_seats: parseInt(newEvent.total_seats),
        created_at: new Date().toISOString()
      })

      setNewEvent({
        title: '',
        description: '',
        category: 'movie',
        date: '',
        time: '',
        venue: '',
        price: '',
        image_url: '',
        total_seats: '100'
      })
      setShowCreateEvent(false)
      loadData()
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await blink.db.events.delete(eventId)
        loadData()
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      movie: 'bg-blue-100 text-blue-800',
      concert: 'bg-purple-100 text-purple-800',
      sports: 'bg-green-100 text-green-800',
      theater: 'bg-orange-100 text-orange-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newEvent.category} onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movie">Movie</SelectItem>
                      <SelectItem value="concert">Concert</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="theater">Theater</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    placeholder="Enter venue name"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newEvent.price}
                    onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="total_seats">Total Seats</Label>
                  <Input
                    id="total_seats"
                    type="number"
                    value={newEvent.total_seats}
                    onChange={(e) => setNewEvent({ ...newEvent, total_seats: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={newEvent.image_url}
                    onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} className="bg-blue-600 hover:bg-blue-700">
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            </CardContent>
          </Card>
        </div>

        {/* Events Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Events Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.venue}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">${event.price}</p>
                      <p className="text-sm text-gray-600">
                        {event.available_seats}/{event.total_seats} seats
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.slice(0, 10).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Booking #{booking.id.slice(-8)}</h3>
                    <p className="text-sm text-gray-600">{booking.customer_email}</p>
                    <p className="text-sm text-gray-500">
                      {booking.seat_count} seats • {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${booking.total_amount.toFixed(2)}</p>
                    <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}