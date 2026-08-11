import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim().slice(0, 180) : ''
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ eligible: false }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('course_access_emails')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (error) return NextResponse.json({ eligible: false }, { status: 500 })
    return NextResponse.json({ eligible: Boolean(data?.length) })
  } catch {
    return NextResponse.json({ eligible: false }, { status: 500 })
  }
}
