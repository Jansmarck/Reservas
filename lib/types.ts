export interface Property {
  id: string
  name: string
  address: string
  pricePerNight: number
  image: string
  color: string
}

export interface Booking {
  id: string
  propertyId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: Date
  checkOut: Date
  guests: number
  agreedPricePerNight: number | null
  totalPrice: number
  amountPaid: number
  status: 'signaled' | 'pending' | 'cancelled' | 'paid'
  observation: string
  createdAt: Date
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  bookings: Booking[]
}
