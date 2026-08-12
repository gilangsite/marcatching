import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const genericMessage = 'Jika email terdaftar, link pembuatan password baru akan dikirim ke email tersebut.'
const resetRedirectUrl = 'https://course.marcatching.com/reset-password'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>
    const email = typeof body.email === 'string'
      ? body.email.toLowerCase().trim().slice(0, 180)
      : ''

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { message: 'Masukkan alamat email yang valid.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Public Supabase configuration is incomplete')
    }

    const resetClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    })
    const { error } = await resetClient.auth.resetPasswordForEmail(email, {
      redirectTo: resetRedirectUrl,
    })

    if (error) throw error

    return NextResponse.json(
      { message: genericMessage },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('Course password reset request failed', error)
    return NextResponse.json(
      { message: 'Permintaan belum dapat diproses. Silakan coba lagi beberapa saat.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
