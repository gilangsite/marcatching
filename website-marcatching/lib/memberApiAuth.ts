import 'server-only'

import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function getMemberFromRequest(request: NextRequest) {
  const authorization = request.headers.get('authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (!token || token.length > 4096) return null

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user?.email) return null
  return data.user
}
