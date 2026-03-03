import { getSupabaseServerClient } from '@/lib/supabase/server'
import { seedUser } from '@/lib/seedUser'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        try { await seedUser(user.id) } catch (_) { /* non-fatal */ }
      }
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${next}`)
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/login?error=auth_failed`
  )
}
