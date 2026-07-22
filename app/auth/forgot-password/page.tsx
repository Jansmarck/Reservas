'use client'

import React, { useMemo } from "react"

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Loader2, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Revisa tu email</CardTitle>
            <CardDescription>
              Hemos enviado un enlace de recuperacion a <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              Si no ves el email, revisa tu carpeta de spam. El enlace expira en 24 horas.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesion
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Calendar className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Recuperar contrasena</CardTitle>
          <CardDescription>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contrasena
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar enlace de recuperacion'
              )}
            </Button>
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary text-center">
              <span className="flex items-center justify-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesion
              </span>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
