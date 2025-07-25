import { useState, useEffect } from 'react'
import { EventCard } from './EventCard'
import { Event } from '@/types'
import { blink } from '@/blink/client'
import { Skeleton } from '@/components/ui/skeleton'

interface EventGridProps {
  onEventSelect: (event: Event) => void
}

export function EventGrid({ onEventSelect }: EventGridProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const loadEvents = async () => {
    try {
      const eventsData = await blink.db.events.list({
        where: { status: 'active' },
        orderBy: { event_date: 'asc' },
        limit: 20
      })
      setEvents(eventsData)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onBookNow={onEventSelect}
        />
      ))}
    </div>
  )
}