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
  const body = await req.json()
  const { action, username, password, otp } = body

  // Try to fetch from admin_credentials table first
  const { data: credentials, error } = await supabase
    .from('admin_credentials')
    .select('*')
    .limit(1)
    .single()

  let isValidUsernamePass = false

  if (!error && credentials) {
    const inputHash = hashPassword(password)
    // The UI now uses "Username", but DB column might still be 'email'.
    if (username === credentials.email && inputHash === credentials.password_hash) {
      isValidUsernamePass = true
    }
  } else {
    // Fallback to environment variables if table is empty or error
    const validUsername = process.env.ADMIN_USERNAME || 'admin'
    const validPassword = process.env.ADMIN_PASSWORD || 'marcatching2024'
    if (username === validUsername && password === validPassword) {
      isValidUsernamePass = true
    }
  }

  if (action === 'verify_otp') {
    if (!isValidUsernamePass) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    if (credentials && credentials.otp === otp) {
      const now = new Date()
      const expiresAt = credentials.otp_expires_at ? new Date(credentials.otp_expires_at) : null
      
      if (!expiresAt || now > expiresAt) {
        return NextResponse.json({ success: false, message: 'OTP expired' }, { status: 401 })
      }

      // Valid OTP
      const res = NextResponse.json({ success: true })
      res.cookies.set('marcatching_admin_v2', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days persistence
        path: '/',
      })
      // Clear old cookie just in case
      res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
      
      // Clear OTP from DB
      await supabase.from('admin_credentials').update({ otp: null, otp_expires_at: null }).eq('id', credentials.id)
      
      return res
    }

    return NextResponse.json({ success: false, message: 'OTP salah atau kadaluarsa' }, { status: 401 })
  }

  // default: action === 'login'
  if (isValidUsernamePass) {
    // Generate OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins

    if (credentials) {
      await supabase.from('admin_credentials').update({
        otp: generatedOtp,
        otp_expires_at: expiresAt
      }).eq('id', credentials.id)
    } else {
      // Create fallback record
      const fallbackHash = hashPassword(password)
      await supabase.from('admin_credentials').insert({
        email: username,
        password_hash: fallbackHash,
        otp: generatedOtp,
        otp_expires_at: expiresAt
      })
    }

    // Send email via Google Apps Script
    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
    if (appsScriptUrl) {
      await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'otpAdmin', otp: generatedOtp })
      })
    }

    return NextResponse.json({ success: true, requireOtp: true })
  }

  return NextResponse.json(
    { success: false, message: 'Invalid credentials' },
    { status: 401 }
  )
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('marcatching_admin_v2', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
  return res
}
