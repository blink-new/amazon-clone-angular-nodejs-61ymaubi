import React, { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Calendar, MapPin, DollarSign, Search, Filter, X } from 'lucide-react'
import { Event } from '../../types'

interface AdvancedSearchProps {
  events: Event[]
  onFilteredEvents: (events: Event[]) => void
  onSearchChange?: (query: string) => void
}

interface SearchFilters {
  query: string
  category: string
  priceRange: string
  dateRange: string
  venue: string
  sortBy: string
}

export default function AdvancedSearch({ events, onFilteredEvents, onSearchChange }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    priceRange: 'all',
    dateRange: 'all',
    venue: 'all',
    sortBy: 'date'
  })

  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Get unique venues from events
  const uniqueVenues = [...new Set(events.map(event => event.venue))].sort()

  // Apply filters whenever filters change
  useEffect(() => {
    let filteredEvents = [...events]

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase()
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.category === filters.category)
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filteredEvents = filteredEvents.filter(event => {
        const price = event.price
        switch (filters.priceRange) {
          case 'under-25':
            return price < 25
          case '25-50':
            return price >= 25 && price <= 50
          case '50-100':
            return price >= 50 && price <= 100
          case 'over-100':
            return price > 100
          default:
            return true
        }
      })
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date)
        switch (filters.dateRange) {
          case 'today':
            return eventDate.toDateString() === now.toDateString()
          case 'this-week': {
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            return eventDate >= now && eventDate <= weekFromNow
          }
          case 'this-month':
            return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
          case 'next-month': {
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            const monthAfter = new Date(now.getFullYear(), now.getMonth() + 2, 1)
            return eventDate >= nextMonth && eventDate < monthAfter
          }
          default:
            return true
        }
      })
    }

    // Venue filter
    if (filters.venue !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.venue === filters.venue)
    }

    // Sort results
    filteredEvents.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'title':
          return a.title.localeCompare(b.title)
        case 'popularity':
          return (b.total_seats - b.available_seats) - (a.total_seats - a.available_seats)
        default:
          return 0
      }
    })

    onFilteredEvents(filteredEvents)

    // Count active filters
    let count = 0
    if (filters.query.trim()) count++
    if (filters.category !== 'all') count++
    if (filters.priceRange !== 'all') count++
    if (filters.dateRange !== 'all') count++
    if (filters.venue !== 'all') count++
    setActiveFiltersCount(count)

    // Notify parent of search query change
    if (onSearchChange) {
      onSearchChange(filters.query)
    }
  }, [filters, events, onFilteredEvents, onSearchChange])

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      priceRange: 'all',
      dateRange: 'all',
      venue: 'all',
      sortBy: 'date'
    })
  }

  const clearFilter = (key: keyof SearchFilters) => {
    const defaultValues = {
      query: '',
      category: 'all',
      priceRange: 'all',
      dateRange: 'all',
      venue: 'all',
      sortBy: 'date'
    }
    setFilters(prev => ({ ...prev, [key]: defaultValues[key] }))
  }

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search events, venues, or descriptions..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="h-12 px-6"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 font-medium">Active filters:</span>
          {filters.query && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{filters.query}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('query')} />
            </Badge>
          )}
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {filters.category}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('category')} />
            </Badge>
          )}
          {filters.priceRange !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Price: {filters.priceRange}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('priceRange')} />
            </Badge>
          )}
          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {filters.dateRange}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('dateRange')} />
            </Badge>
          )}
          {filters.venue !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Venue: {filters.venue}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('venue')} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-700">
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="movie">🎬 Movies</SelectItem>
                    <SelectItem value="concert">🎵 Concerts</SelectItem>
                    <SelectItem value="sports">⚽ Sports</SelectItem>
                    <SelectItem value="theater">🎭 Theater</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Price Range
                </label>
                <Select value={filters.priceRange} onValueChange={(value) => updateFilter('priceRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-25">Under $25</SelectItem>
                    <SelectItem value="25-50">$25 - $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="over-100">Over $100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Date Range
                </label>
                <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="next-month">Next Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Venue Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Venue
                </label>
                <Select value={filters.venue} onValueChange={(value) => updateFilter('venue', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Venues</SelectItem>
                    {uniqueVenues.map((venue) => (
                      <SelectItem key={venue} value={venue}>
                        {venue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">📅 Date (Earliest First)</SelectItem>
                    <SelectItem value="price-low">💰 Price (Low to High)</SelectItem>
                    <SelectItem value="price-high">💰 Price (High to Low)</SelectItem>
                    <SelectItem value="title">🔤 Title (A-Z)</SelectItem>
                    <SelectItem value="popularity">🔥 Popularity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                  className="w-full"
                  disabled={activeFiltersCount === 0}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}