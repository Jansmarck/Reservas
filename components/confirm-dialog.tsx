'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning'
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-sm">
        <div className="p-6 text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            variant === 'danger' ? 'bg-destructive/10' : 'bg-warning/10'
          }`}>
            <AlertTriangle className={`h-6 w-6 ${
              variant === 'danger' ? 'text-destructive' : 'text-warning'
            }`} />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {message}
          </p>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 bg-transparent" 
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
            <Button 
              variant={variant === 'danger' ? 'destructive' : 'default'}
              className="flex-1" 
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
