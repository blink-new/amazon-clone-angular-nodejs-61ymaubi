import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { Event } from '@/types'

interface EventCardProps {
  event: Event
  onBookNow: (event: Event) => void
}

export function EventCard({ event, onBookNow }: EventCardProps) {
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'movie': return 'bg-blue-100 text-blue-800'
      case 'concert': return 'bg-purple-100 text-purple-800'
      case 'sports': return 'bg-green-100 text-green-800'
      case 'theater': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=400'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getCategoryColor(event.category)}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Badge>
        </div>
        {event.available_seats < 10 && (
          <div className="absolute top-3 right-3">
            <Badge variant="destructive">
              Only {event.available_seats} left!
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(event.event_date)} at {formatTime(event.event_time)}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {event.venue_name}
          </div>
          {event.duration && (
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {Math.floor(event.duration / 60)}h {event.duration % 60}m
            </div>
          )}
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {event.available_seats} / {event.total_seats} available
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-lg font-bold text-primary">
          From ${event.base_price.toFixed(2)}
        </div>
        <Button 
          onClick={() => onBookNow(event)}
          disabled={event.available_seats === 0}
          className="bg-primary hover:bg-primary/90"
        >
          {event.available_seats === 0 ? 'Sold Out' : 'Book Now'}
        </Button>
      </CardFooter>
    </Card>
  )
}