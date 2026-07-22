'use client'

import { useState } from 'react'
import { Edit2, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Booking, Property } from '@/lib/types'

interface BookingGridProps {
  bookings: Booking[]
  properties: Property[]
  selectedProperty: string | null
  onEditBooking: (booking: Booking) => void
  onDeleteBooking: (id: string) => void
}

type SortField = 'guestName' | 'property' | 'checkIn' | 'checkOut' | 'totalPrice' | 'amountPaid' | 'status'
type SortDirection = 'asc' | 'desc'

function formatARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

const STATUS_LABELS: Record<string, string> = {
  signaled: 'Señada',
  pending: 'Pendiente',
  paid: 'Pagado',
  cancelled: 'Cancelada'
}

const STATUS_COLORS: Record<string, string> = {
  signaled: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

export function BookingGrid({
  bookings,
  properties,
  selectedProperty,
  onEditBooking,
  onDeleteBooking
}: BookingGridProps) {
  const [sortField, setSortField] = useState<SortField>('checkIn')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredBookings = selectedProperty
    ? bookings.filter(b => b.propertyId === selectedProperty)
    : bookings

  const getPropertyName = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.name || ''
  }

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let comparison = 0
    
    switch (sortField) {
      case 'guestName':
        comparison = a.guestName.localeCompare(b.guestName)
        break
      case 'property':
        comparison = getPropertyName(a.propertyId).localeCompare(getPropertyName(b.propertyId))
        break
      case 'checkIn':
        comparison = a.checkIn.getTime() - b.checkIn.getTime()
        break
      case 'checkOut':
        comparison = a.checkOut.getTime() - b.checkOut.getTime()
        break
      case 'totalPrice':
        comparison = a.totalPrice - b.totalPrice
        break
      case 'amountPaid':
        comparison = a.amountPaid - b.amountPaid
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3">
                <button 
                  className="flex items-center gap-1 font-medium text-sm hover:text-primary transition-colors"
                  onClick={() => handleSort('guestName')}
                >
                  Huésped
                  <SortIcon field="guestName" />
                </button>
              </th>
              <th className="text-left p-3">
                <button 
                  className="flex items-center gap-1 font-medium text-sm hover:text-primary transition-colors"
                  onClick={() => handleSort('property')}
                >
                  Propiedad
                  <SortIcon field="property" />
                </button>
              </th>
              <th className="text-left p-3">
                <button 
                  className="flex items-center gap-1 font-medium text-sm hover:text-primary transition-colors"
                  onClick={() => handleSort('checkIn')}
                >
                  Check-in
                  <SortIcon field="checkIn" />
                </button>
              </th>
              <th className="text-left p-3">
                <button 
                  className="flex items-center gap-1 font-medium text-sm hover:text-primary transition-colors"
                  onClick={() => handleSort('checkOut')}
                >
                  Check-out
                  <SortIcon field="checkOut" />
                </button>
              </th>
              <th className="text-left p-3">Noches</th>
              <th className="text-left p-3">
                <button 
                  className="flex items-center gap-1 font-medium text-sm hover:text-primary transition-colors"
                  onClick={() => handleSort('totalPrice')}
                >
                  Total
                  <SortIcon field="totalPrice" />
                </button>
              </th>
              <th className="text-left p-3">
                <button 
                  className="flex items-center gap-1 font-medium text-sm hover:text-primary transition-colors"
                  onClick={() => handleSort('amountPaid')}
                >
                  Pagado
                  <SortIcon field="amountPaid" />
                </button>
              </th>
              <th className="text-left p-3">Adeudado</th>
              <th className="text-left p-3">
                <button 
                  className="flex items-center gap-1 font-medium text-sm hover:text-primary transition-colors"
                  onClick={() => handleSort('status')}
                >
                  Estado
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="text-left p-3">Teléfono</th>
              <th className="text-left p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.map(booking => {
              const nights = Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))
              const owed = Math.max(0, booking.totalPrice - booking.amountPaid)
              
              return (
                <tr key={booking.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="font-medium">{booking.guestName}</div>
                    {booking.guestEmail && (
                      <div className="text-xs text-muted-foreground">{booking.guestEmail}</div>
                    )}
                  </td>
                  <td className="p-3 text-sm">{getPropertyName(booking.propertyId)}</td>
                  <td className="p-3 text-sm">{formatDate(booking.checkIn)}</td>
                  <td className="p-3 text-sm">{formatDate(booking.checkOut)}</td>
                  <td className="p-3 text-sm">{nights}</td>
                  <td className="p-3 text-sm font-medium">{formatARS(booking.totalPrice)}</td>
                  <td className="p-3 text-sm text-green-600">{formatARS(booking.amountPaid)}</td>
                  <td className={`p-3 text-sm font-medium ${owed > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {formatARS(owed)}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[booking.status] || ''}`}>
                      {STATUS_LABELS[booking.status] || booking.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{booking.guestPhone || '-'}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditBooking(booking)}
                        title="Editar"
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteBooking(booking.id)}
                        title="Eliminar"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {sortedBookings.length === 0 && (
              <tr>
                <td colSpan={11} className="p-8 text-center text-muted-foreground">
                  No hay reservas para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
