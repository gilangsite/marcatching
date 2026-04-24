import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  // 1. Verify Authentication — accept session cookie OR legacy cookies
  const sessionCookie = req.cookies.get('marcatching_admin_session')?.value
  const authCookieV2 = req.cookies.get('marcatching_admin_v2')?.value
  const authCookieV1 = req.cookies.get('marcatching_admin')?.value
  const isLegacyAuth = authCookieV2 === 'authenticated' || authCookieV1 === 'authenticated'

  if (!sessionCookie && !isLegacyAuth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete ALL sessions unconditionally — no filtering
    const { error, count } = await supabase
      .from('admin_sessions')
      .delete()
      .gte('created_at', '1970-01-01') // match all rows

    if (error) {
      console.error('[logout-all] Delete error:', error)
      return NextResponse.json({ success: false, message: 'Gagal menghapus sesi: ' + error.message }, { status: 500 })
    }

    console.log(`[logout-all] Deleted ${count} sessions`)

    const res = NextResponse.json({ success: true, message: `Hard Exit berhasil. ${count ?? 'Semua'} sesi dihapus.` })
    res.cookies.set('marcatching_admin_session', '', { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 0, path: '/' })
    res.cookies.set('marcatching_admin_v2', '', { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 0, path: '/' })
    res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
    return res

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
