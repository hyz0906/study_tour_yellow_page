import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user profile exists, create if not
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            nickname: data.user.user_metadata?.name || data.user.email!.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
          })
      }
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}