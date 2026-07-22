'use client'

import { Calendar, User, Trash2, Edit2, CheckCircle, Clock, XCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Booking, Property } from '@/lib/types'

interface BookingListProps {
  bookings: Booking[]
  properties: Property[]
  selectedProperty: string | null
  onEdit: (booking: Booking) => void
  onDelete: (id: string) => void
}

import { DollarSign } from 'lucide-react'

const STATUS_CONFIG = {
  signaled: {
    label: 'Señada',
    icon: CheckCircle,
    className: 'bg-blue-500/10 text-blue-600'
  },
  pending: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-warning/10 text-warning'
  },
  paid: {
    label: 'Pagado Totalmente',
    icon: DollarSign,
    className: 'bg-success/10 text-success'
  },
  cancelled: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive'
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function formatARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}

export function BookingList({
  bookings,
  properties,
  selectedProperty,
  onEdit,
  onDelete
}: BookingListProps) {
  const filteredBookings = selectedProperty
    ? bookings.filter(b => b.propertyId === selectedProperty)
    : bookings

  const sortedBookings = [...filteredBookings].sort(
    (a, b) => a.checkIn.getTime() - b.checkIn.getTime()
  )

  const getPropertyName = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.name || 'Propiedad desconocida'
  }

  if (sortedBookings.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No hay reservas
        </h3>
        <p className="text-sm text-muted-foreground">
          {selectedProperty
            ? 'Esta propiedad no tiene reservas programadas.'
            : 'No hay reservas programadas en ninguna propiedad.'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          Próximas Reservas
        </h3>
        <p className="text-sm text-muted-foreground">
          {sortedBookings.length} reserva{sortedBookings.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {sortedBookings.map(booking => {
          const status = STATUS_CONFIG[booking.status]
          const StatusIcon = status.icon

          return (
            <div
              key={booking.id}
              className="p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-foreground truncate">
                      {booking.guestName}
                    </span>
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                      status.className
                    )}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-1">
                    {getPropertyName(booking.propertyId)}
                  </div>
                  {booking.guestPhone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{booking.guestPhone}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-1">
                    <div className="text-muted-foreground">
                      Total: <span className="font-medium text-foreground">{formatARS(booking.totalPrice)}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Pagado: <span className="font-medium text-green-600">{formatARS(booking.amountPaid || 0)}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Adeudado: <span className={`font-medium ${(booking.totalPrice - (booking.amountPaid || 0)) <= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {formatARS(Math.max(0, booking.totalPrice - (booking.amountPaid || 0)))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(booking)}
                    aria-label="Editar reserva"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(booking.id)}
                    aria-label="Eliminar reserva"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
