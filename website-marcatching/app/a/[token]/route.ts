import { NextRequest, NextResponse } from 'next/server'
import {
  AFFILIATE_COOKIE,
  createAttributionCookie,
  privacyHash,
} from '@/lib/affiliateTracking'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function storeOrigin(req: NextRequest) {
  const host = req.headers.get('host') || req.nextUrl.host
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
  if (isLocal) return req.nextUrl.origin
  return 'https://marcatching.com'
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params
  const { data: link } = await supabaseAdmin
    .from('affiliate_links')
    .select('id, affiliate_member_id, program_id, is_active')
    .eq('token', token)
    .maybeSingle()

  if (!link) return NextResponse.redirect(new URL('/store', storeOrigin(req)))

  const [{ data: program }, { data: member }, { data: enrollment }] = await Promise.all([
    supabaseAdmin.from('affiliate_programs').select('id, product_id, status, attribution_window_days').eq('id', link.program_id).maybeSingle(),
    supabaseAdmin.from('affiliate_members').select('status').eq('id', link.affiliate_member_id).maybeSingle(),
    supabaseAdmin
      .from('affiliate_enrollments')
      .select('program_version_id, status, accepted_at')
      .eq('affiliate_member_id', link.affiliate_member_id)
      .eq('program_id', link.program_id)
      .eq('status', 'active')
      .order('accepted_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!program) return NextResponse.redirect(new URL('/store', storeOrigin(req)))
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('slug')
    .eq('id', program.product_id)
    .maybeSingle()
  const destination = new URL(product?.slug ? `/product/${product.slug}` : '/store', storeOrigin(req))

  if (!link.is_active || program.status !== 'active' || member?.status !== 'active' || !enrollment || !product) {
    return NextResponse.redirect(destination)
  }

  const { data: version } = await supabaseAdmin
    .from('affiliate_program_versions')
    .select('id, status, starts_at, ends_at')
    .eq('id', enrollment.program_version_id)
    .maybeSingle()
  const now = Date.now()
  if (
    !version || version.status !== 'published' ||
    new Date(version.starts_at).getTime() > now ||
    (version.ends_at && new Date(version.ends_at).getTime() <= now)
  ) return NextResponse.redirect(destination)

  const { data: click } = await supabaseAdmin
    .from('affiliate_clicks')
    .insert({
      affiliate_link_id: link.id,
      affiliate_member_id: link.affiliate_member_id,
      program_id: link.program_id,
      program_version_id: version.id,
      ip_hash: privacyHash(req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null),
      user_agent_hash: privacyHash(req.headers.get('user-agent')),
      referrer: req.headers.get('referer')?.slice(0, 500) || null,
      landing_path: destination.pathname,
    })
    .select('click_id')
    .single()
  if (!click) return NextResponse.redirect(destination)

  const maxAge = Number(program.attribution_window_days) * 86_400
  const response = NextResponse.redirect(destination)
  response.cookies.set(AFFILIATE_COOKIE, createAttributionCookie(click.click_id, new Date(Date.now() + maxAge * 1000)), {
    httpOnly: true,
    secure: req.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge,
    domain: req.nextUrl.hostname.endsWith('marcatching.com') ? '.marcatching.com' : undefined,
  })
  return response
}
