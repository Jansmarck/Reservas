'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Booking, Property } from '@/lib/types'

interface BookingCalendarProps {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  bookings: Booking[]
  properties: Property[]
  selectedProperty: string | null
  onBookingClick: (booking: Booking) => void
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function getCalendarDays(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - ((firstDayOfMonth.getDay() + 6) % 7))
  
  const days: Date[] = []
  const current = new Date(startDate)
  
  while (days.length < 42) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

function isDateInRange(date: Date, checkIn: Date, checkOut: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const start = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
  const end = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())
  return d >= start && d < end
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function BookingCalendar({
  currentDate,
  onPrevMonth,
  onNextMonth,
  bookings,
  properties,
  selectedProperty,
  onBookingClick
}: BookingCalendarProps) {
  const days = getCalendarDays(currentDate)
  const today = new Date()
  
  const filteredBookings = selectedProperty
    ? bookings.filter(b => b.propertyId === selectedProperty)
    : bookings

  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter(booking => 
      isDateInRange(date, booking.checkIn, booking.checkOut)
    )
  }

  const getPropertyColor = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    return property?.color || '#6b7280'
  }

  const getPropertyName = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.name || ''
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevMonth}
            aria-label="Mes anterior"
            className="bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            aria-label="Mes siguiente"
            className="bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const isToday = isSameDay(date, today)
          const dateBookings = getBookingsForDate(date)
          
          return (
            <div
              key={index}
              className={`
                min-h-[80px] p-2 rounded-lg text-left transition-colors
                ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                ${isToday ? 'ring-2 ring-primary' : ''}
              `}
            >
              <span
                className={`
                  text-sm font-medium
                  ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                  ${isToday ? 'text-primary' : ''}
                `}
              >
                {date.getDate()}
              </span>
              
              <div className="mt-1 space-y-0.5">
                {dateBookings.slice(0, 3).map(booking => (
                  <div
                    key={booking.id}
                    className="text-xs px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: getPropertyColor(booking.propertyId) }}
                    onClick={() => onBookingClick(booking)}
                    title={`${booking.guestName} - ${getPropertyName(booking.propertyId)}`}
                  >
                    {booking.guestName.split(' ')[0]}
                  </div>
                ))}
                {dateBookings.length > 3 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                          +{dateBookings.length - 3} más
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start" className="p-2 max-w-xs">
                        <div className="space-y-1">
                          {dateBookings.slice(3).map(booking => (
                            <div
                              key={booking.id}
                              className="text-xs px-2 py-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: getPropertyColor(booking.propertyId) }}
                              onClick={() => onBookingClick(booking)}
                            >
                              {booking.guestName} - {getPropertyName(booking.propertyId)}
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
        {properties.map(property => (
          <div key={property.id} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: getPropertyColor(property.id) }}
            />
            <span className="text-sm text-muted-foreground">{property.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
