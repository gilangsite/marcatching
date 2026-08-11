import 'server-only'

import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function hasValidAdminSession(req: NextRequest) {
  const sessionToken = req.cookies.get('marcatching_admin_session')?.value
  if (!sessionToken) return false

  const { data, error } = await supabaseAdmin
    .from('admin_sessions')
    .select('id')
    .eq('session_token', sessionToken)
    .limit(1)
    .maybeSingle()

  return !error && Boolean(data)
}
