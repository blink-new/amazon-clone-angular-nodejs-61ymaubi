import { useState, useEffect } from 'react'
import { EventCard } from './EventCard'
import { Event } from '@/types'
import { blink } from '@/blink/client'
import { Skeleton } from '@/components/ui/skeleton'
import AdvancedSearch from '../search/AdvancedSearch'

interface EventGridProps {
  onEventSelect: (event: Event) => void
}

export function EventGrid({ onEventSelect }: EventGridProps) {
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const loadEvents = async () => {
    try {
      const eventsData = await blink.db.events.list({
        orderBy: { date: 'asc' },
        limit: 50
      })
      setAllEvents(eventsData)
      setFilteredEvents(eventsData)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleFilteredEvents = (events: Event[]) => {
    setFilteredEvents(events)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Search skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        
        {/* Events grid skeleton */}
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Advanced Search */}
      <AdvancedSearch 
        events={allEvents}
        onFilteredEvents={handleFilteredEvents}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredEvents.length === allEvents.length 
            ? `Showing all ${allEvents.length} events`
            : `Showing ${filteredEvents.length} of ${allEvents.length} events`
          }
        </p>
        {filteredEvents.length !== allEvents.length && (
          <p className="text-sm text-blue-600 font-medium">
            {allEvents.length - filteredEvents.length} events filtered out
          </p>
        )}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or browse all events
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onBookNow={onEventSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}