import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  // Strictly require a valid session cookie — no legacy cookie fallbacks
  const sessionCookie = req.cookies.get('marcatching_admin_session')?.value

  if (!sessionCookie) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  // Verify session exists in DB
  const { data: session, error: sessionError } = await supabase
    .from('admin_sessions')
    .select('id')
    .eq('session_token', sessionCookie)
    .maybeSingle()

  if (sessionError) {
    console.error('[request-credential-change] Session check error:', sessionError.message)
    return NextResponse.json({ success: false, message: 'Gagal memvalidasi sesi: ' + sessionError.message }, { status: 500 })
  }

  if (!session) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid, silakan login kembali.' }, { status: 401 })
  }

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    const { data: credentials, error: credError } = await supabase
      .from('admin_credentials')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (credError) {
      console.error('[request-credential-change] Credentials fetch error:', credError.message)
      return NextResponse.json({ success: false, message: 'Gagal membaca kredensial: ' + credError.message }, { status: 500 })
    }

    if (!credentials) {
      // No credentials in DB yet — create initial record from env vars
      const crypto = require('crypto')
      const fallbackEmail = process.env.ADMIN_USERNAME || 'admin'
      const fallbackPass = process.env.ADMIN_PASSWORD || 'marcatching2024'
      const fallbackHash = crypto.createHash('sha256').update(fallbackPass).digest('hex')
      await supabase.from('admin_credentials').insert({
        email: fallbackEmail,
        password_hash: fallbackHash,
        otp,
        otp_expires_at: expiresAt
      })
    } else {
      await supabase.from('admin_credentials').update({
        otp,
        otp_expires_at: expiresAt
      }).eq('id', credentials.id)
    }

    // Send OTP via Google Apps Script
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
    console.error('[request-credential-change] Error:', error.message)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
