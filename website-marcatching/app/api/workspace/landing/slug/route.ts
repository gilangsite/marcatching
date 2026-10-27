import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberApiAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { validateSlug } from '@/lib/landingPage'
import { HOUR_MS, takeQuota } from '@/lib/rateLimit'
import { failLanding, unauthorized } from '@/lib/landingServer'

export async function GET(request: NextRequest) {
  const user = await getMemberFromRequest(request)
  if (!user?.email) return unauthorized()
  if (!takeQuota(`landing-slug:${user.id}`, 300, HOUR_MS)) return failLanding('Terlalu banyak pengecekan. Coba lagi nanti.', 429)

  const slug = (request.nextUrl.searchParams.get('slug') || '').trim().toLowerCase()
  const valid = validateSlug(slug)
  if (!valid.ok) return NextResponse.json({ available: false, reason: valid.reason })

  // The member's own current link counts as available, so re-saving without renaming never conflicts with itself.
  const { data, error } = await supabaseAdmin.from('landing_pages').select('user_id').eq('slug', slug).maybeSingle()
  if (error) return failLanding('Ketersediaan link belum bisa dicek.', 500)
  const taken = Boolean(data && data.user_id !== user.id)
  return NextResponse.json(
    { available: !taken, reason: taken ? 'Link ini sudah dipakai brand lain.' : '' },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
