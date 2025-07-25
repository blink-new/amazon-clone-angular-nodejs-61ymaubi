import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SeatMap as SeatMapType, Event } from '@/types'
import { blink } from '@/blink/client'

interface SeatMapProps {
  event: Event
  selectedSeats: SeatMapType[]
  onSeatSelect: (seat: SeatMapType) => void
  onSeatDeselect: (seat: SeatMapType) => void
}

export function SeatMap({ event, selectedSeats, onSeatSelect, onSeatDeselect }: SeatMapProps) {
  const [seats, setSeats] = useState<SeatMapType[]>([])
  const [loading, setLoading] = useState(true)

  const loadSeats = useCallback(async () => {
    try {
      const seatsData = await blink.db.seatMap.list({
        where: { event_id: event.id },
        orderBy: { row_name: 'asc', seat_number: 'asc' }
      })
      setSeats(seatsData)
    } catch (error) {
      console.error('Failed to load seats:', error)
    } finally {
      setLoading(false)
    }
  }, [event.id])

  useEffect(() => {
    loadSeats()
  }, [event.id, loadSeats])

  const handleSeatClick = (seat: SeatMapType) => {
    if (Number(seat.is_available) === 0) return // Seat is booked
    
    const isSelected = selectedSeats.some(s => s.id === seat.id)
    if (isSelected) {
      onSeatDeselect(seat)
    } else {
      onSeatSelect(seat)
    }
  }

  const getSeatClass = (seat: SeatMapType) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id)
    const isAvailable = Number(seat.is_available) > 0
    
    let baseClass = 'seat flex items-center justify-center text-xs font-medium'
    
    if (!isAvailable) {
      baseClass += ' booked'
    } else if (isSelected) {
      baseClass += ' selected'
    } else {
      baseClass += ' available'
      if (seat.seat_type === 'premium') baseClass += ' premium'
      if (seat.seat_type === 'vip') baseClass += ' vip'
    }
    
    return baseClass
  }

  const groupSeatsByRow = (seats: SeatMapType[]) => {
    return seats.reduce((acc, seat) => {
      if (!acc[seat.row_name]) {
        acc[seat.row_name] = []
      }
      acc[seat.row_name].push(seat)
      return acc
    }, {} as Record<string, SeatMapType[]>)
  }

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Your Seats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const seatsByRow = groupSeatsByRow(seats)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Seats</CardTitle>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="seat available w-4 h-4"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="seat selected w-4 h-4"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="seat booked w-4 h-4"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="seat premium w-4 h-4"></div>
            <span>Premium</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Screen/Stage */}
        <div className="text-center mb-8">
          <div className="bg-gray-800 text-white py-2 px-8 rounded-lg inline-block mb-2">
            {event.category === 'movie' ? 'SCREEN' : 'STAGE'}
          </div>
        </div>

        {/* Seat Map */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {Object.entries(seatsByRow).map(([rowName, rowSeats]) => (
            <div key={rowName} className="flex items-center justify-center space-x-2">
              <div className="w-8 text-center font-medium text-sm">
                {rowName}
              </div>
              <div className="flex space-x-1">
                {rowSeats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={getSeatClass(seat)}
                    disabled={Number(seat.is_available) === 0}
                    title={`Row ${seat.row_name}, Seat ${seat.seat_number} - $${seat.price.toFixed(2)}`}
                  >
                    {seat.seat_number}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Selection Summary */}
        {selectedSeats.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Selected Seats:</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedSeats.map((seat) => (
                <Badge key={seat.id} variant="secondary">
                  {seat.row_name}{seat.seat_number} - ${seat.price.toFixed(2)}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Total: ${totalPrice.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">
                {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}