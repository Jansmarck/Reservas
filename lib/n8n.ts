import type { Booking, Property } from './types'

interface N8NBookingPayload {
  event: 'booking_created' | 'booking_updated'
  booking: {
    id: string
    property_id: string
    name: string
    guestEmail: string
    guestPhone: string
    checkIn: string
    checkOut: string
    guests: number
    agreedPricePerNight: number | null
    totalPrice: number
    amountPaid: number
    amountOwed: number
    status: string
    observation: string
    createdAt: string
  }
  timestamp: string
}

export async function sendBookingToN8N(
  event: 'booking_created' | 'booking_updated',
  booking: Booking,
  property: Property | undefined
): Promise<boolean> {
  const payload: N8NBookingPayload = {
    event,
    booking: {
      id: booking.id,
      property_id: property?.name || 'Unknown',
      name: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      checkIn: booking.checkIn.toISOString().split('T')[0],
      checkOut: booking.checkOut.toISOString().split('T')[0],
      guests: booking.guests,
      agreedPricePerNight: booking.agreedPricePerNight,
      totalPrice: booking.totalPrice,
      amountPaid: booking.amountPaid,
      amountOwed: Math.max(0, booking.totalPrice - booking.amountPaid),
      status: booking.status,
      observation: booking.observation,
      createdAt: booking.createdAt.toISOString()
    },
    timestamp: new Date().toISOString()
  }

  try {
    // Call our API route instead of n8n directly to avoid CORS issues
    const response = await fetch('/api/n8n', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    return response.ok
  } catch (error) {
    // Silently fail - don't block the UI for webhook errors
    console.warn('N8N notification failed:', error)
    return false
  }
}
