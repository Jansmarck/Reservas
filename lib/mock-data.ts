import type { Property, Booking } from './types'

export const initialProperties: Property[] = [
  {
    id: '1',
    name: 'Departamento Palermo',
    address: 'Av. Santa Fe 3200, CABA',
    pricePerNight: 35000,
    image: '/properties/apt-palermo.jpg'
  },
  {
    id: '2',
    name: 'Casa Costa Atlantica',
    address: 'Av. del Mar 450, Mar del Plata',
    pricePerNight: 55000,
    image: '/properties/casa-costa.jpg'
  },
  {
    id: '3',
    name: 'Cabana Bariloche',
    address: 'Circuito Chico km 12, Bariloche',
    pricePerNight: 48000,
    image: '/properties/cabana-bariloche.jpg'
  }
]

const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth()

export const initialBookings: Booking[] = [
  {
    id: '1',
    propertyId: '1',
    guestName: 'María García',
    guestEmail: 'maria@email.com',
    checkIn: new Date(currentYear, currentMonth, 5),
    checkOut: new Date(currentYear, currentMonth, 8),
    guests: 2,
    totalPrice: 105000,
    status: 'confirmed',
    createdAt: new Date(currentYear, currentMonth, 1)
  },
  {
    id: '2',
    propertyId: '2',
    guestName: 'Carlos López',
    guestEmail: 'carlos@email.com',
    checkIn: new Date(currentYear, currentMonth, 12),
    checkOut: new Date(currentYear, currentMonth, 16),
    guests: 4,
    totalPrice: 220000,
    status: 'confirmed',
    createdAt: new Date(currentYear, currentMonth, 5)
  },
  {
    id: '3',
    propertyId: '1',
    guestName: 'Ana Martínez',
    guestEmail: 'ana@email.com',
    checkIn: new Date(currentYear, currentMonth, 20),
    checkOut: new Date(currentYear, currentMonth, 23),
    guests: 1,
    totalPrice: 105000,
    status: 'pending',
    createdAt: new Date(currentYear, currentMonth, 10)
  },
  {
    id: '4',
    propertyId: '3',
    guestName: 'Pedro Sánchez',
    guestEmail: 'pedro@email.com',
    checkIn: new Date(currentYear, currentMonth, 15),
    checkOut: new Date(currentYear, currentMonth, 20),
    guests: 3,
    totalPrice: 240000,
    status: 'confirmed',
    createdAt: new Date(currentYear, currentMonth, 8)
  }
]
