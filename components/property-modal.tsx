'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Property } from '@/lib/types'

interface PropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (property: Omit<Property, 'id'>) => void
  existingProperty: Property | null
}

export function PropertyModal({
  isOpen,
  onClose,
  onSave,
  existingProperty
}: PropertyModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [pricePerNight, setPricePerNight] = useState('')
  const [image, setImage] = useState('')
  const [color, setColor] = useState('#ef4444')

  const COLOR_OPTIONS = [
    { value: '#ef4444', label: 'Rojo' },
    { value: '#f97316', label: 'Naranja' },
    { value: '#eab308', label: 'Amarillo' },
    { value: '#22c55e', label: 'Verde' },
    { value: '#14b8a6', label: 'Turquesa' },
    { value: '#3b82f6', label: 'Azul' },
    { value: '#8b5cf6', label: 'Violeta' },
    { value: '#ec4899', label: 'Rosa' },
    { value: '#6b7280', label: 'Gris' }
  ]

  useEffect(() => {
    if (existingProperty) {
      setName(existingProperty.name)
      setAddress(existingProperty.address)
      setPricePerNight(existingProperty.pricePerNight.toString())
      setImage(existingProperty.image)
      setColor(existingProperty.color || '#ef4444')
    } else {
      setName('')
      setAddress('')
      setPricePerNight('')
      setImage('/properties/default.jpg')
      setColor('#ef4444')
    }
  }, [existingProperty, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !address || !pricePerNight) return

    onSave({
      name,
      address,
      pricePerNight: Number(pricePerNight),
      image: image || '/properties/default.jpg',
      color
    })
    onClose()
  }

  const formatPrice = (value: string) => {
    const num = Number(value)
    if (isNaN(num)) return ''
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(num)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-semibold text-foreground">
            {existingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la propiedad</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Apartamento Centro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Direccion</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Av. Corrientes 1234, CABA"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio por noche (ARS)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id="price"
                type="number"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                placeholder="25000"
                className="pl-7"
                min="0"
                required
              />
            </div>
            {pricePerNight && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(pricePerNight)} por noche
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">URL de imagen (opcional)</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/properties/mi-propiedad.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label>Color en el calendario</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === opt.value 
                      ? 'border-foreground scale-110' 
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: opt.value }}
                  title={opt.label}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Este color se mostrara en el calendario para identificar las reservas de esta propiedad.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {existingProperty ? 'Guardar Cambios' : 'Crear Propiedad'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
