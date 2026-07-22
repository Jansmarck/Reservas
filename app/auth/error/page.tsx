import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Calendar } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Error de autenticacion</CardTitle>
          <CardDescription>
            Hubo un problema al procesar tu solicitud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            El enlace puede haber expirado o ya fue utilizado. Por favor, intenta iniciar sesion nuevamente.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <Calendar className="mr-2 h-4 w-4" />
              Volver al inicio de sesion
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
