import 'server-only'

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const AFFILIATE_COOKIE = 'marcatching_affiliate'

type AttributionSnapshot = {
  clickId: string
  linkId: string
  memberId: string
  programId: string
  programVersionId: string
  commissionBps: number
  holdingDays: number
  attributionWindowDays: number
}

function signingSecret() {
  const secret = process.env.AFFILIATE_ATTRIBUTION_SECRET
  if (!secret || secret.length < 24) throw new Error('Affiliate attribution secret is not configured')
  return secret
}

function signature(value: string) {
  return createHmac('sha256', signingSecret()).update(value).digest('base64url')
}

export function createAttributionCookie(clickId: string, expiresAt: Date) {
  const payload = `${clickId}.${Math.floor(expiresAt.getTime() / 1000)}`
  return `${payload}.${signature(payload)}`
}

function parseAttributionCookie(raw: string | undefined) {
  if (!raw) return null
  const [clickId, expiry, suppliedSignature] = raw.split('.')
  if (!clickId || !expiry || !suppliedSignature) return null
  const payload = `${clickId}.${expiry}`
  const expected = Buffer.from(signature(payload))
  const supplied = Buffer.from(suppliedSignature)
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null
  const expiresAt = Number(expiry) * 1000
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null
  return { clickId, expiresAt }
}

export function privacyHash(value: string | null) {
  if (!value) return null
  return createHash('sha256').update(`${signingSecret()}:${value}`).digest('hex')
}

export function createAffiliateLinkToken() {
  return randomBytes(18).toString('base64url')
}

export async function resolveAffiliateAttribution(
  req: NextRequest,
  productId: string,
  buyerEmail: string,
): Promise<AttributionSnapshot | null> {
  let parsed: ReturnType<typeof parseAttributionCookie>
  try {
    parsed = parseAttributionCookie(req.cookies.get(AFFILIATE_COOKIE)?.value)
  } catch {
    return null
  }
  if (!parsed) return null

  const { data: click } = await supabaseAdmin
    .from('affiliate_clicks')
    .select('click_id, affiliate_link_id, affiliate_member_id, program_id, program_version_id, clicked_at, is_valid')
    .eq('click_id', parsed.clickId)
    .eq('is_valid', true)
    .maybeSingle()
  if (!click) return null

  const [{ data: program }, { data: version }, { data: member }, { data: link }] = await Promise.all([
    supabaseAdmin.from('affiliate_programs').select('product_id, status, holding_days, attribution_window_days').eq('id', click.program_id).maybeSingle(),
    supabaseAdmin.from('affiliate_program_versions').select('commission_bps, status, starts_at, ends_at').eq('id', click.program_version_id).maybeSingle(),
    supabaseAdmin.from('affiliate_members').select('email, status').eq('id', click.affiliate_member_id).maybeSingle(),
    supabaseAdmin.from('affiliate_links').select('is_active').eq('id', click.affiliate_link_id).maybeSingle(),
  ])

  if (!program || !version || !member || !link) return null
  const clickedAt = new Date(click.clicked_at).getTime()
  const windowEnds = clickedAt + Number(program.attribution_window_days) * 86_400_000
  const now = Date.now()
  const versionStarts = new Date(version.starts_at).getTime()
  const versionEnds = version.ends_at ? new Date(version.ends_at).getTime() : Number.POSITIVE_INFINITY
  if (
    program.product_id !== productId || program.status !== 'active' || !['published', 'retired'].includes(version.status) ||
    member.status !== 'active' || !link.is_active || now > windowEnds || clickedAt < versionStarts || clickedAt >= versionEnds ||
    String(member.email).trim().toLowerCase() === buyerEmail.trim().toLowerCase()
  ) return null

  return {
    clickId: click.click_id,
    linkId: click.affiliate_link_id,
    memberId: click.affiliate_member_id,
    programId: click.program_id,
    programVersionId: click.program_version_id,
    commissionBps: Number(version.commission_bps),
    holdingDays: Number(program.holding_days),
    attributionWindowDays: Number(program.attribution_window_days),
  }
}

export async function createOrderItemsAndAttribution(input: {
  req: NextRequest
  orderId: string
  buyerEmail: string
  items: Array<{
    productId: string
    productName: string
    unitPriceRupiah: number
    voucherDiscountRupiah: number
    finalAmountRupiah: number
  }>
}) {
  const rows = input.items.map((item, index) => ({
    order_id: input.orderId,
    product_id: item.productId,
    product_name: item.productName,
    line_position: index,
    quantity: 1,
    unit_price_rupiah: item.unitPriceRupiah,
    voucher_discount_rupiah: item.voucherDiscountRupiah,
    final_amount_rupiah: item.finalAmountRupiah,
  }))
  const { data: orderItems, error } = await supabaseAdmin
    .from('order_items')
    .insert(rows)
    .select('id, product_id, line_position')
  if (error || !orderItems) throw new Error('Failed to create normalized order items')

  // Affiliate attribution only follows the exact product encoded in the link.
  // Add-ons can earn separately only when their own affiliate link is the landing link.
  const mainItem = orderItems.find(item => item.line_position === 0)
  const mainProductId = input.items[0]?.productId
  if (!mainItem || !mainProductId) return
  const attribution = await resolveAffiliateAttribution(input.req, mainProductId, input.buyerEmail)
  if (!attribution) return

  const { error: attributionError } = await supabaseAdmin.from('affiliate_attributions').insert({
    order_id: input.orderId,
    order_item_id: mainItem.id,
    click_id: attribution.clickId,
    affiliate_link_id: attribution.linkId,
    affiliate_member_id: attribution.memberId,
    program_id: attribution.programId,
    program_version_id: attribution.programVersionId,
    commission_bps: attribution.commissionBps,
    holding_days: attribution.holdingDays,
    attribution_window_days: attribution.attributionWindowDays,
  })
  if (attributionError) throw new Error('Failed to save affiliate attribution')
}

export async function accrueAffiliateCommission(orderId: string) {
  const { data: attribution } = await supabaseAdmin
    .from('affiliate_attributions')
    .select('id, order_item_id, affiliate_member_id, program_id, program_version_id, commission_bps, holding_days, status, order_items(final_amount_rupiah)')
    .eq('order_id', orderId)
    .eq('status', 'valid')
    .maybeSingle()
  if (!attribution) return null

  const nested = attribution.order_items as unknown as { final_amount_rupiah: number } | Array<{ final_amount_rupiah: number }> | null
  const orderItem = Array.isArray(nested) ? nested[0] : nested
  const commissionable = Math.max(0, Number(orderItem?.final_amount_rupiah) || 0)
  const amount = Math.round(commissionable * Number(attribution.commission_bps) / 10_000)
  if (amount <= 0) return null
  const availableAt = new Date(Date.now() + Number(attribution.holding_days) * 86_400_000).toISOString()

  const { data: commission, error } = await supabaseAdmin
    .from('affiliate_commissions')
    .upsert({
      attribution_id: attribution.id,
      order_id: orderId,
      order_item_id: attribution.order_item_id,
      affiliate_member_id: attribution.affiliate_member_id,
      program_id: attribution.program_id,
      program_version_id: attribution.program_version_id,
      commissionable_amount_rupiah: commissionable,
      commission_bps: attribution.commission_bps,
      commission_amount_rupiah: amount,
      available_at: availableAt,
    }, { onConflict: 'attribution_id', ignoreDuplicates: true })
    .select('id, affiliate_member_id, commission_amount_rupiah')
    .maybeSingle()
  if (error) throw error
  if (!commission) return null

  await supabaseAdmin.from('affiliate_ledger_entries').upsert({
    affiliate_member_id: commission.affiliate_member_id,
    commission_id: commission.id,
    entry_type: 'commission_accrual',
    amount_rupiah: commission.commission_amount_rupiah,
    reference_key: `commission:${commission.id}:accrual`,
    description: `Komisi order ${orderId}`,
  }, { onConflict: 'reference_key', ignoreDuplicates: true })
  return commission
}

export async function reverseAffiliateCommission(orderId: string, reason = 'Order refunded or cancelled') {
  const { error } = await supabaseAdmin.rpc('reverse_affiliate_commissions_for_order', {
    p_order_id: orderId,
    p_reason: reason.slice(0, 500),
  })
  if (error) throw error
}
