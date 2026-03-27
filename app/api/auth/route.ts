import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { username, password } = body

  const validUsername = process.env.ADMIN_USERNAME || 'admin'
  const validPassword = process.env.ADMIN_PASSWORD || 'marcatching2024'

  if (username === validUsername && password === validPassword) {
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
