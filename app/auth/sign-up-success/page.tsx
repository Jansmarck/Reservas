import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Calendar } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Revisa tu email</CardTitle>
          <CardDescription>
            Hemos enviado un enlace de confirmacion a tu correo electronico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Haz clic en el enlace del email para activar tu cuenta y comenzar a usar RentCalendar.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild variant="outline" className="w-full bg-transparent">
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
