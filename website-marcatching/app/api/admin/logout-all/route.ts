import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  // 1. Verify Authentication
  const sessionCookie = req.cookies.get('marcatching_admin_session')?.value
  
  if (!sessionCookie) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if the current session exists
    const { data } = await supabase.from('admin_sessions').select('id').eq('session_token', sessionCookie).single()
    if (!data) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Delete all sessions to force everyone (including current user) out
    await supabase.from('admin_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const res = NextResponse.json({ success: true, message: 'Berhasil logout dari semua device' })
    res.cookies.set('marcatching_admin_session', '', { maxAge: 0, path: '/' })
    res.cookies.set('marcatching_admin_v2', '', { maxAge: 0, path: '/' })
    res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
    return res

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
