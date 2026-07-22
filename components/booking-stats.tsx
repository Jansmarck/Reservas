'use client'

import { Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react'
import type { Booking } from '@/lib/types'

function formatARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}

interface BookingStatsProps {
  bookings: Booking[]
  selectedProperty: string | null
}

export function BookingStats({ bookings, selectedProperty }: BookingStatsProps) {
  const filteredBookings = selectedProperty
    ? bookings.filter(b => b.propertyId === selectedProperty)
    : bookings

  const stats = {
    total: filteredBookings.length,
    signaled: filteredBookings.filter(b => b.status === 'signaled').length,
    paid: filteredBookings.filter(b => b.status === 'paid').length,
    pending: filteredBookings.filter(b => b.status === 'pending').length,
    totalPaid: filteredBookings.reduce((acc, b) => acc + (b.amountPaid || 0), 0),
    totalOwed: filteredBookings.reduce((acc, b) => acc + Math.max(0, b.totalPrice - (b.amountPaid || 0)), 0)
  }

  const items = [
    {
      label: 'Total Reservas',
      value: stats.total,
      icon: Calendar,
      color: 'text-foreground bg-muted'
    },
    {
      label: 'Señadas',
      value: stats.signaled,
      icon: CheckCircle,
      color: 'text-blue-600 bg-blue-500/10'
    },
    {
      label: 'Pagadas',
      value: stats.paid,
      icon: DollarSign,
      color: 'text-success bg-success/10'
    },
    {
      label: 'Cobrado',
      value: formatARS(stats.totalPaid),
      icon: DollarSign,
      color: 'text-primary bg-primary/10'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(item => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {item.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.label}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
