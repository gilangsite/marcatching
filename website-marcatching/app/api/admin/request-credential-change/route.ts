import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  // 1. Verify Authentication — now checks for the new session cookie
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
    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins

    // 3. Upsert into admin_credentials (handle case if empty)
    const { data: credentials } = await supabase
      .from('admin_credentials')
      .select('*')
      .limit(1)
      .single()

    if (!credentials) {
      const crypto = require('crypto')
      const fallbackEmail = process.env.ADMIN_USERNAME || 'admin'
      const fallbackPass = process.env.ADMIN_PASSWORD || 'marcatching2024'
      const fallbackHash = crypto.createHash('sha256').update(fallbackPass).digest('hex')

      await supabase.from('admin_credentials').insert({
        email: fallbackEmail,
        password_hash: fallbackHash,
        otp: otp,
        otp_expires_at: expiresAt
      })
    } else {
      await supabase.from('admin_credentials').update({
        otp: otp,
        otp_expires_at: expiresAt
      }).eq('id', credentials.id)
    }

    // 4. Send email via Google Apps Script
    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
    if (appsScriptUrl) {
      await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'otpAdmin', otp })
      })
    }

    return NextResponse.json({ success: true, message: 'OTP terkirim ke email.' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
