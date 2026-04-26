import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  // Verify that the caller holds a valid session cookie
  const sessionToken = req.cookies.get('marcatching_admin_session')?.value

  if (!sessionToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  // Verify session exists in DB before allowing hard-exit
  const { data: session } = await supabase
    .from('admin_sessions')
    .select('id')
    .eq('session_token', sessionToken)
    .maybeSingle()

  if (!session) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid' }, { status: 401 })
  }

  try {
    // Delete ALL sessions unconditionally (hard exit from every device)
    const { error, count } = await supabase
      .from('admin_sessions')
      .delete()
      .gte('created_at', '1970-01-01') // matches every row

    if (error) {
      console.error('[logout-all] Delete error:', error)
      return NextResponse.json(
        { success: false, message: 'Gagal menghapus sesi: ' + error.message },
        { status: 500 }
      )
    }

    console.log(`[logout-all] Hard Exit — deleted ${count} sessions`)

    // Clear all cookies on the calling browser as well
    const res = NextResponse.json({
      success: true,
      message: `Hard Exit berhasil. ${count ?? 'Semua'} sesi dihapus.`,
    })
    res.cookies.set('marcatching_admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
    res.cookies.set('marcatching_admin_v2', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
    res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
    return res
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
