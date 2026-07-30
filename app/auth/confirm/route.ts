import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/auth/reset-password'

  const supabase = await createClient()

  // PKCE flow (default for @supabase/ssr) - exchange code for session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.log('[v0] exchangeCodeForSession error:', error.message)
  }

  // Token hash flow (email OTP) - verify the recovery token
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.log('[v0] verifyOtp error:', error.message)
  }

  // Something went wrong - redirect to error page
  return NextResponse.redirect(`${origin}/auth/error`)
}
