import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(req: NextRequest) {
  // 1. Verify Authentication — accept new session cookie OR legacy cookies
  const sessionCookie = req.cookies.get('marcatching_admin_session')?.value
  const authCookieV2 = req.cookies.get('marcatching_admin_v2')?.value
  const authCookieV1 = req.cookies.get('marcatching_admin')?.value
  const isLegacyAuth = authCookieV2 === 'authenticated' || authCookieV1 === 'authenticated'

  if (!sessionCookie && !isLegacyAuth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  // If using new session cookie, verify it exists in DB
  if (sessionCookie) {
    const { data: session } = await supabase
      .from('admin_sessions')
      .select('id')
      .eq('session_token', sessionCookie)
      .single()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Sesi tidak valid, silakan login kembali.' }, { status: 401 })
    }
  }

  try {
    const { otp, oldEmail, oldPassword, newEmail, newPassword } = await req.json()

    if (!otp || !oldEmail || !oldPassword || !newEmail || !newPassword) {
      return NextResponse.json({ success: false, message: 'Semua field wajib diisi' }, { status: 400 })
    }

    // 2. Fetch credentials
    const { data: credentials, error } = await supabase
      .from('admin_credentials')
      .select('*')
      .limit(1)
      .single()

    if (!credentials || error) {
      return NextResponse.json({ success: false, message: 'Data admin tidak ditemukan. Silakan request OTP ulang.' }, { status: 400 })
    }

    // 3. Verify OTP and Expiration
    if (credentials.otp !== otp) {
      return NextResponse.json({ success: false, message: 'OTP salah' }, { status: 400 })
    }

    const now = new Date()
    const expiresAt = new Date(credentials.otp_expires_at)
    if (now > expiresAt) {
      return NextResponse.json({ success: false, message: 'OTP sudah kedaluwarsa' }, { status: 400 })
    }

    // 4. Verify Old Credentials
    const oldHash = hashPassword(oldPassword)
    if (credentials.email !== oldEmail || credentials.password_hash !== oldHash) {
      // Check fallback just in case we recently migrated
      const validUsername = process.env.ADMIN_USERNAME || 'admin'
      const validPassword = process.env.ADMIN_PASSWORD || 'marcatching2024'
      const fallbackHash = hashPassword(validPassword)
      
      if (
        (credentials.email !== validUsername && credentials.email !== oldEmail) ||
        (credentials.password_hash !== fallbackHash && credentials.password_hash !== oldHash)
      ) {
        return NextResponse.json({ success: false, message: 'Email/Password lama salah' }, { status: 400 })
      }
    }

    // 5. Update Credentials and Clear OTP
    const newHash = hashPassword(newPassword)
    await supabase.from('admin_credentials').update({
      email: newEmail,
      password_hash: newHash,
      otp: null,
      otp_expires_at: null
    }).eq('id', credentials.id)

    // 6. Logout ALL devices (including the current one)
    await supabase.from('admin_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const res = NextResponse.json({ success: true, message: 'Kredensial berhasil diperbarui. Semua device telah dilogout, silakan login kembali.' })
    res.cookies.set('marcatching_admin_session', '', { maxAge: 0, path: '/' })
    res.cookies.set('marcatching_admin_v2', '', { maxAge: 0, path: '/' })
    res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
    return res
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
