'use client'

import { Home, MapPin, Plus, Pencil, Trash2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Property } from '@/lib/types'

interface PropertySidebarProps {
  properties: Property[]
  selectedProperty: string | null
  onSelectProperty: (id: string | null) => void
  onAddProperty: () => void
  onEditProperty: (property: Property) => void
  onDeleteProperty: (id: string) => void
}

function formatARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}

export function PropertySidebar({
  properties,
  selectedProperty,
  onSelectProperty,
  onAddProperty,
  onEditProperty,
  onDeleteProperty
}: PropertySidebarProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Propiedades</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onAddProperty}
          className="gap-1 bg-transparent"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Agregar</span>
        </Button>
      </div>
      
      <button
        onClick={() => onSelectProperty(null)}
        className={cn(
          'w-full text-left p-3 rounded-lg mb-2 transition-colors',
          selectedProperty === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-accent text-foreground'
        )}
      >
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span className="font-medium">Todas las propiedades</span>
        </div>
      </button>

      <div className="space-y-2">
        {properties.map(property => (
          <div
            key={property.id}
            className={cn(
              'group relative rounded-lg transition-colors',
              selectedProperty === property.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-accent'
            )}
          >
            <button
              onClick={() => onSelectProperty(property.id)}
              className="w-full text-left p-3"
            >
              <div className="font-medium text-sm pr-16">{property.name}</div>
              <div className={cn(
                'flex items-center gap-1 text-xs mt-1',
                selectedProperty === property.id
                  ? 'text-primary-foreground/80'
                  : 'text-muted-foreground'
              )}>
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{property.address}</span>
              </div>
              <div className={cn(
                'text-xs mt-1 font-medium',
                selectedProperty === property.id
                  ? 'text-primary-foreground/90'
                  : 'text-foreground/80'
              )}>
                {formatARS(property.pricePerNight)} / noche
              </div>
            </button>
            
            {/* Action buttons */}
            <div className={cn(
              'absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
              selectedProperty === property.id && 'opacity-100'
            )}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditProperty(property)
                }}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  selectedProperty === property.id
                    ? 'hover:bg-primary-foreground/20 text-primary-foreground'
                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                )}
                title="Editar propiedad"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`¿Eliminar "${property.name}"? Esta accion no se puede deshacer.`)) {
                    onDeleteProperty(property.id)
                  }
                }}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  selectedProperty === property.id
                    ? 'hover:bg-destructive text-primary-foreground'
                    : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                )}
                title="Eliminar propiedad"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Home className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay propiedades</p>
          <p className="text-xs">Agrega tu primera propiedad</p>
        </div>
      )}
    </div>
  )
}
