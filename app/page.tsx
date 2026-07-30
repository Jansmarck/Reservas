'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, CalendarDays, Settings, LogOut, Loader2, User as UserIcon, LayoutGrid, Table } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookingCalendar } from '@/components/booking-calendar'
import { PropertySidebar } from '@/components/property-sidebar'
import { BookingModal } from '@/components/booking-modal'
import { PropertyModal } from '@/components/property-modal'
import { BookingList } from '@/components/booking-list'
import { BookingStats } from '@/components/booking-stats'
import { BookingGrid } from '@/components/booking-grid'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { createClient } from '@/lib/supabase/client'
import type { Booking, Property } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import { sendBookingToN8N } from '@/lib/n8n'

// Helper function to format date as YYYY-MM-DD without timezone conversion
function formatDateForDB(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper function to parse date string as local date
function parseDateFromDB(dateStr: string): Date {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day)
}

export default function BookingManagement() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null)
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'grid'>('calendar')
  
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Load user and data on mount
  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 3
    
    async function loadData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (!isMounted) return
        
        if (authError) {
          // Retry on network errors
          if (retryCount < maxRetries && authError.message?.includes('fetch')) {
            retryCount++
            setTimeout(loadData, 1000 * retryCount)
            return
          }
          router.push('/auth/login')
          return
        }
        
        if (!user) {
          router.push('/auth/login')
          return
        }
        
        setUser(user)

        // Load properties
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })

        if (propertiesData) {
          setProperties(propertiesData.map(p => ({
            id: p.id,
            name: p.name,
            address: p.address,
            pricePerNight: p.price_per_night,
            image: p.image,
            color: p.color || '#ef4444'
          })))
        }

        // Load bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .order('check_in', { ascending: true })

        if (bookingsData) {
          setBookings(bookingsData.map(b => ({
            id: b.id,
            propertyId: b.property_id,
            guestName: b.guest_name,
            guestEmail: b.guest_email,
            guestPhone: b.guest_phone || '',
            checkIn: parseDateFromDB(b.check_in),
            checkOut: parseDateFromDB(b.check_out),
            guests: b.guests,
            agreedPricePerNight: b.agreed_price_per_night || null,
            totalPrice: b.total_price,
            amountPaid: b.amount_paid || 0,
            status: b.status,
            observation: b.observation || '',
            createdAt: new Date(b.created_at)
          })))
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        router.push('/auth/login')
      }
    }

    loadData()
    
    return () => {
      isMounted = false
    }
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }, [])

  

  const handleNewBooking = useCallback(() => {
    setSelectedDate(new Date())
    setEditingBooking(null)
    setIsBookingModalOpen(true)
  }, [])

  const handleEditBooking = useCallback((booking: Booking) => {
    setEditingBooking(booking)
    setSelectedDate(null)
    setIsBookingModalOpen(true)
  }, [])

  const handleSaveBooking = useCallback(async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    if (!user) return

    if (editingBooking) {
      // Update existing booking
      const { error, data } = await supabase
        .from('bookings')
        .update({
          property_id: bookingData.propertyId,
          guest_name: bookingData.guestName,
          guest_email: bookingData.guestEmail,
          guest_phone: bookingData.guestPhone,
          check_in: formatDateForDB(bookingData.checkIn),
          check_out: formatDateForDB(bookingData.checkOut),
          guests: bookingData.guests,
          agreed_price_per_night: bookingData.agreedPricePerNight,
          total_price: bookingData.totalPrice,
          amount_paid: bookingData.amountPaid,
          status: bookingData.status,
          observation: bookingData.observation
        })
        .eq('id', editingBooking.id)
        .select()
        .single()

      if (!error && data) {
        const updatedBooking: Booking = {
          id: data.id,
          propertyId: data.property_id,
          guestName: data.guest_name,
          guestEmail: data.guest_email,
          guestPhone: data.guest_phone || '',
          checkIn: parseDateFromDB(data.check_in),
          checkOut: parseDateFromDB(data.check_out),
          guests: data.guests,
          agreedPricePerNight: data.agreed_price_per_night || null,
          totalPrice: data.total_price,
          amountPaid: data.amount_paid || 0,
          status: data.status,
          observation: data.observation || '',
          createdAt: new Date(data.created_at)
        }
        setBookings(prev =>
          prev.map(b => b.id === editingBooking.id ? updatedBooking : b)
        )
        
        // Send to n8n
        const property = properties.find(p => p.id === updatedBooking.propertyId)
        sendBookingToN8N('booking_updated', updatedBooking, property)
      }
    } else {
      // Create new booking
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          property_id: bookingData.propertyId,
          guest_name: bookingData.guestName,
          guest_email: bookingData.guestEmail,
          guest_phone: bookingData.guestPhone,
          check_in: formatDateForDB(bookingData.checkIn),
          check_out: formatDateForDB(bookingData.checkOut),
          guests: bookingData.guests,
          agreed_price_per_night: bookingData.agreedPricePerNight,
          total_price: bookingData.totalPrice,
          amount_paid: bookingData.amountPaid,
          status: bookingData.status,
          observation: bookingData.observation
        })
        .select()
        .single()

      if (!error && data) {
        const newBooking: Booking = {
          id: data.id,
          propertyId: data.property_id,
          guestName: data.guest_name,
          guestEmail: data.guest_email,
          guestPhone: data.guest_phone || '',
          checkIn: parseDateFromDB(data.check_in),
          checkOut: parseDateFromDB(data.check_out),
          guests: data.guests,
          agreedPricePerNight: data.agreed_price_per_night || null,
          totalPrice: data.total_price,
          amountPaid: data.amount_paid || 0,
          status: data.status,
          observation: data.observation || '',
          createdAt: new Date(data.created_at)
        }
        setBookings(prev => [...prev, newBooking])
        
        // Send to n8n
        const property = properties.find(p => p.id === newBooking.propertyId)
        sendBookingToN8N('booking_created', newBooking, property)
      }
    }
  }, [editingBooking, user, supabase, properties])

  const handleDeleteBooking = useCallback((id: string) => {
    setDeleteBookingId(id)
  }, [])

  const confirmDeleteBooking = useCallback(async () => {
    if (!deleteBookingId) return
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', deleteBookingId)

    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== deleteBookingId))
    }
    setDeleteBookingId(null)
  }, [deleteBookingId, supabase])

  // Property handlers
  const handleAddProperty = useCallback(() => {
    setEditingProperty(null)
    setIsPropertyModalOpen(true)
  }, [])

  const handleEditProperty = useCallback((property: Property) => {
    setEditingProperty(property)
    setIsPropertyModalOpen(true)
  }, [])

  const handleSaveProperty = useCallback(async (propertyData: Omit<Property, 'id'>) => {
    if (!user) return

    if (editingProperty) {
      // Update existing property
      const { error } = await supabase
        .from('properties')
        .update({
          name: propertyData.name,
          address: propertyData.address,
          price_per_night: propertyData.pricePerNight,
          image: propertyData.image,
          color: propertyData.color
        })
        .eq('id', editingProperty.id)

      if (!error) {
        setProperties(prev =>
          prev.map(p =>
            p.id === editingProperty.id
              ? { ...propertyData, id: p.id }
              : p
          )
        )
      }
    } else {
      // Create new property
      const { data, error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          name: propertyData.name,
          address: propertyData.address,
          price_per_night: propertyData.pricePerNight,
          image: propertyData.image,
          color: propertyData.color
        })
        .select()
        .single()

      if (!error && data) {
        const newProperty: Property = {
          id: data.id,
          name: data.name,
          address: data.address,
          pricePerNight: data.price_per_night,
          image: data.image,
          color: data.color || '#ef4444'
        }
        setProperties(prev => [...prev, newProperty])
      }
    }
  }, [editingProperty, user, supabase])

  const handleDeleteProperty = useCallback((id: string) => {
    setDeletePropertyId(id)
  }, [])

  const confirmDeleteProperty = useCallback(async () => {
    if (!deletePropertyId) return
    
    // First delete all bookings for this property
    await supabase
      .from('bookings')
      .delete()
      .eq('property_id', deletePropertyId)

    // Then delete the property
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', deletePropertyId)

    if (!error) {
      setBookings(prev => prev.filter(b => b.propertyId !== deletePropertyId))
      setProperties(prev => prev.filter(p => p.id !== deletePropertyId))
      if (selectedProperty === deletePropertyId) {
        setSelectedProperty(null)
      }
    }
    setDeletePropertyId(null)
  }, [deletePropertyId, selectedProperty, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando tus datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <CalendarDays className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">RentCalendar</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleAddProperty}
                className="gap-2 bg-transparent"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Propiedades</span>
              </Button>
              <Button onClick={handleNewBooking} className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva Reserva</span>
              </Button>
              
              {/* User info and logout */}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <div className="p-1.5 bg-muted rounded-full">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground max-w-32 truncate" title={user?.email || ''}>
                    {user?.email}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="mb-6">
          <BookingStats bookings={bookings} selectedProperty={selectedProperty} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-6">
              <PropertySidebar
                properties={properties}
                selectedProperty={selectedProperty}
                onSelectProperty={setSelectedProperty}
                onAddProperty={handleAddProperty}
                onEditProperty={handleEditProperty}
                onDeleteProperty={handleDeleteProperty}
              />
              <div className="hidden lg:block">
                <BookingList
                  bookings={bookings}
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onEdit={handleEditBooking}
                  onDelete={handleDeleteBooking}
                />
              </div>
            </div>
          </div>

          {/* Calendar/Grid View */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* View Toggle */}
            <div className="flex justify-end mb-4">
              <div className="inline-flex rounded-lg border border-border p-1 bg-muted">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="gap-2"
                >
                  <CalendarDays className="h-4 w-4" />
                  Calendario
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <Table className="h-4 w-4" />
                  Grilla
                </Button>
              </div>
            </div>

            {viewMode === 'calendar' ? (
              <BookingCalendar
                currentDate={currentDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onBookingClick={handleEditBooking}
                bookings={bookings}
                properties={properties}
                selectedProperty={selectedProperty}
              />
            ) : (
              <BookingGrid
                bookings={bookings}
                properties={properties}
                selectedProperty={selectedProperty}
                onEditBooking={handleEditBooking}
                onDeleteBooking={handleDeleteBooking}
              />
            )}
          </div>

          {/* Mobile Booking List */}
          <div className="lg:hidden order-3">
            <BookingList
              bookings={bookings}
              properties={properties}
              selectedProperty={selectedProperty}
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
            />
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveBooking}
        properties={properties}
        selectedDate={selectedDate}
        existingBooking={editingBooking}
        allBookings={bookings}
      />

      {/* Property Modal */}
      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSave={handleSaveProperty}
        existingProperty={editingProperty}
      />

      {/* Confirm Delete Booking Dialog */}
      <ConfirmDialog
        isOpen={deleteBookingId !== null}
        title="Eliminar Reserva"
        message="¿Estas seguro de que deseas eliminar esta reserva? Esta accion no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteBooking}
        onCancel={() => setDeleteBookingId(null)}
        variant="danger"
      />

      {/* Confirm Delete Property Dialog */}
      <ConfirmDialog
        isOpen={deletePropertyId !== null}
        title="Eliminar Propiedad"
        message="¿Estas seguro de que deseas eliminar esta propiedad? Se eliminaran tambien todas las reservas asociadas. Esta accion no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteProperty}
        onCancel={() => setDeletePropertyId(null)}
        variant="danger"
      />
    </div>
  )
}
