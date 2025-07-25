export interface Event {
  id: string
  title: string
  description?: string
  category: 'movie' | 'concert' | 'sports' | 'theater'
  venue_name: string
  venue_address?: string
  event_date: string
  event_time: string
  duration?: number
  image_url?: string
  base_price: number
  total_seats: number
  available_seats: number
  status: 'active' | 'cancelled' | 'sold_out'
  created_at: string
  updated_at: string
}

export interface SeatMap {
  id: string
  event_id: string
  row_name: string
  seat_number: number
  seat_type: 'regular' | 'premium' | 'vip'
  price: number
  is_available: number
  x_position?: number
  y_position?: number
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  event_id: string
  booking_reference: string
  total_amount: number
  booking_status: 'pending' | 'confirmed' | 'cancelled'
  payment_status: 'pending' | 'completed' | 'failed'
  payment_method?: string
  booking_date: string
  qr_code?: string
  email?: string
  phone?: string
  created_at: string
}

export interface BookedSeat {
  id: string
  booking_id: string
  seat_map_id: string
  created_at: string
}

export interface CartItem {
  seat: SeatMap
  event: Event
}