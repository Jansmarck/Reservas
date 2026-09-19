'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { X, Calendar as CalendarIcon, User, Mail, Users, Home, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Property, Booking } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function formatARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (booking: Omit<Booking, 'id' | 'createdAt'>) => void
  properties: Property[]
  selectedDate: Date | null
  existingBooking?: Booking | null
  allBookings: Booking[]
}

export function BookingModal({
  isOpen,
  onClose,
  onSave,
  properties,
  selectedDate,
  existingBooking,
  allBookings
}: BookingModalProps) {
  const [propertyId, setPropertyId] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined)
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined)
  const [guests, setGuests] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [status, setStatus] = useState<Booking['status']>('pending')
  const [observation, setObservation] = useState('')
  const [agreedPricePerNight, setAgreedPricePerNight] = useState('')

  useEffect(() => {
    if (existingBooking) {
      setPropertyId(existingBooking.propertyId)
      setGuestName(existingBooking.guestName)
      setGuestEmail(existingBooking.guestEmail)
      setGuestPhone(existingBooking.guestPhone || '')
      setCheckIn(existingBooking.checkIn)
      setCheckOut(existingBooking.checkOut)
      setGuests(existingBooking.guests.toString())
      setAmountPaid((existingBooking.amountPaid || 0).toString())
      setStatus(existingBooking.status)
      setObservation(existingBooking.observation || '')
      setAgreedPricePerNight(existingBooking.agreedPricePerNight ? existingBooking.agreedPricePerNight.toString() : '')
    } else if (selectedDate) {
      const nextDay = new Date(selectedDate)
      nextDay.setDate(nextDay.getDate() + 1)
      setPropertyId(properties[0]?.id || '')
      setGuestName('')
      setGuestEmail('')
      setGuestPhone('')
      setCheckIn(selectedDate)
      setCheckOut(nextDay)
      setGuests('1')
      setAmountPaid('0')
      setStatus('pending')
      setObservation('')
      setAgreedPricePerNight('')
    }
  }, [existingBooking, selectedDate, properties])

  const selectedProperty = properties.find(p => p.id === propertyId)
  
  // Get booked dates for the selected property (excluding current booking if editing)
  // Check-in to check-out-1 are the occupied nights (check-out day guest leaves, not a night)
  const getBookedDatesForProperty = () => {
    if (!propertyId) return []
    
    return allBookings
      .filter(b => b.propertyId === propertyId && b.id !== existingBooking?.id && b.status !== 'cancelled')
      .flatMap(booking => {
        const dates: Date[] = []
        const current = new Date(booking.checkIn)
        const end = new Date(booking.checkOut)
        // Do NOT include check-out day (guest leaves that day, it's not a night)
        while (current < end) {
          dates.push(new Date(current))
          current.setDate(current.getDate() + 1)
        }
        return dates
      })
  }

  const bookedDates = getBookedDatesForProperty()

  const isDateBooked = (date: Date) => {
    const isBooked = bookedDates.some(bookedDate => 
      bookedDate.getFullYear() === date.getFullYear() &&
      bookedDate.getMonth() === date.getMonth() &&
      bookedDate.getDate() === date.getDate()
    )
    return isBooked
  }

  const isDateDisabledForCheckIn = (date: Date) => {
    return isDateBooked(date)
  }

  const isDateDisabledForCheckOut = (date: Date) => {
    // Check-out must be after check-in
    if (checkIn && date <= checkIn) return true
    if (!checkIn) return false
    
    // Check if any night between checkIn and this checkout date is booked
    // (we don't include the checkout day itself as a night)
    const current = new Date(checkIn)
    while (current < date) {
      if (isDateBooked(current)) return true
      current.setDate(current.getDate() + 1)
    }
    return false
  }

  // Check for overlap before saving
  // Nights are from check-in to check-out-1 (checkout day is when guest leaves)
  const hasOverlap = () => {
    if (!checkIn || !checkOut || !propertyId) return false
    
    return allBookings.some(booking => {
      if (booking.propertyId !== propertyId) return false
      if (booking.id === existingBooking?.id) return false
      if (booking.status === 'cancelled') return false
      
      const bookingStart = new Date(booking.checkIn)
      const bookingEnd = new Date(booking.checkOut)
      
      // Ranges overlap if new check-in is before existing check-out 
      // AND new check-out is after existing check-in
      return checkIn < bookingEnd && checkOut > bookingStart
    })
  }

  const calculateTotalPrice = () => {
    if (!selectedProperty || !checkIn || !checkOut) return 0
    // Nights = checkout - checkin (guest enters on checkin, leaves on checkout)
    // Example: checkin 5, checkout 10 = 5 nights (5, 6, 7, 8, 9)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    // Use agreed price if set, otherwise use property price
    const pricePerNight = agreedPricePerNight ? parseFloat(agreedPricePerNight) : selectedProperty.pricePerNight
    return nights > 0 ? nights * pricePerNight : 0
  }

  const agreedPriceNum = agreedPricePerNight ? parseFloat(agreedPricePerNight) : null

  const totalPrice = calculateTotalPrice()
  const amountPaidNum = parseFloat(amountPaid) || 0
  const amountOwed = Math.max(0, totalPrice - amountPaidNum)

  const [overlapError, setOverlapError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkIn || !checkOut) return
    
    if (hasOverlap()) {
      setOverlapError(true)
      return
    }
    setOverlapError(false)
    
    const guestsNum = parseInt(guests) || 1
    const finalStatus = amountPaidNum >= totalPrice && totalPrice > 0 ? 'paid' : status
    
    onSave({
      propertyId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests: guestsNum,
      agreedPricePerNight: agreedPriceNum,
      totalPrice,
      amountPaid: amountPaidNum,
      status: finalStatus,
      observation
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {existingBooking ? 'Editar Reserva' : 'Nueva Reserva'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Propiedad
            </Label>
            <select
              id="property"
              value={propertyId}
              onChange={e => setPropertyId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              required
            >
              <option value="">Seleccionar propiedad</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name} - {formatARS(property.pricePerNight)}/noche
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre del huesped
            </Label>
            <Input
              id="guestName"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="Maria Garcia"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email (opcional)
            </Label>
            <Input
              id="guestEmail"
              type="email"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
              placeholder="maria@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefono
            </Label>
            <Input
              id="guestPhone"
              type="tel"
              value={guestPhone}
              onChange={e => setGuestPhone(e.target.value)}
              placeholder="+54 11 1234-5678"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Check-in
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    defaultMonth={checkIn}
                    onSelect={(date) => {
                      setCheckIn(date)
                      // Keep check-out valid: if it's now on/before the new check-in, push it to the next day
                      if (date && checkOut && checkOut <= date) {
                        const nextDay = new Date(date)
                        nextDay.setDate(nextDay.getDate() + 1)
                        setCheckOut(nextDay)
                      }
                      setOverlapError(false)
                    }}
                    locale={es}
                    disabled={isDateDisabledForCheckIn}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    defaultMonth={checkOut ?? checkIn}
                    onSelect={(date) => {
                      setCheckOut(date)
                      setOverlapError(false)
                    }}
                    locale={es}
                    disabled={isDateDisabledForCheckOut}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guests" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Huespedes
              </Label>
              <Input
                id="guests"
                type="text"
                inputMode="numeric"
                value={guests}
                onChange={e => setGuests(e.target.value)}
                placeholder="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agreedPrice">Precio acordado/noche</Label>
              <Input
                id="agreedPrice"
                type="text"
                inputMode="numeric"
                value={agreedPricePerNight}
                onChange={e => setAgreedPricePerNight(e.target.value)}
                placeholder={selectedProperty ? selectedProperty.pricePerNight.toString() : '0'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observaciones</Label>
            <textarea
              id="observation"
              value={observation}
              onChange={e => setObservation(e.target.value)}
              placeholder="Notas adicionales sobre la reserva..."
              className="w-full min-h-20 px-3 py-2 rounded-md border border-input bg-background text-foreground resize-y"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={status}
                onChange={e => setStatus(e.target.value as Booking['status'])}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                <option value="pending">Pendiente</option>
                <option value="signaled">Senada</option>
                <option value="paid">Pagado Totalmente</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountPaid">Monto Pagado (ARS)</Label>
              <Input
                id="amountPaid"
                type="text"
                inputMode="numeric"
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {overlapError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              Las fechas seleccionadas se solapan con otra reserva existente. Por favor, selecciona fechas disponibles.
            </div>
          )}

          {totalPrice > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Precio total</span>
                <span className="text-lg font-bold text-foreground">
                  {formatARS(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pagado</span>
                <span className="text-lg font-medium text-green-600">
                  {formatARS(amountPaidNum)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-muted-foreground font-medium">Adeudado</span>
                <span className={`text-xl font-bold ${amountOwed <= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {formatARS(amountOwed)}
                </span>
              </div>
              {amountPaidNum >= totalPrice && (
                <div className="text-center text-sm text-green-600 font-medium pt-1">
                  PAGADO TOTALMENTE
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {existingBooking ? 'Guardar cambios' : 'Crear reserva'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
