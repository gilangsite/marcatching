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
  const { username, password } = body

  let isValid = false

  // Try to fetch from admin_credentials table first
  const { data: credentials, error } = await supabase
    .from('admin_credentials')
    .select('*')
    .limit(1)
    .single()

  if (!error && credentials) {
    const inputHash = hashPassword(password)
    // Here we assume username can be the email
    if (username === credentials.email && inputHash === credentials.password_hash) {
      isValid = true
    }
  } else {
    // Fallback to environment variables if table is empty or error
    const validUsername = process.env.ADMIN_USERNAME || 'admin'
    const validPassword = process.env.ADMIN_PASSWORD || 'marcatching2024'
    if (username === validUsername && password === validPassword) {
      isValid = true
    }
  }

  if (isValid) {
    const res = NextResponse.json({ success: true })
    res.cookies.set('marcatching_admin', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return res
  }

  return NextResponse.json(
    { success: false, message: 'Invalid credentials' },
    { status: 401 }
  )
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('marcatching_admin', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  return res
}
