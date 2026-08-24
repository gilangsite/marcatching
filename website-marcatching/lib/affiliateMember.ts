import 'server-only'

import type { User } from '@supabase/supabase-js'
import { encryptAffiliateSecret, lastFour } from '@/lib/affiliateCrypto'
import { createAffiliateLinkToken } from '@/lib/affiliateTracking'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export class AffiliateError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

function displayName(user: User) {
  const metadataName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : ''
  if (metadataName) return metadataName.slice(0, 120)
  return (user.email?.split('@')[0] || 'Member').replace(/[._-]+/g, ' ').slice(0, 120)
}

function affiliateCode(user: User) {
  const base = (user.email?.split('@')[0] || 'member').replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 10)
  return `${base || 'MEMBER'}-${user.id.replaceAll('-', '').slice(0, 7).toUpperCase()}`
}

async function requireCourseMember(user: User) {
  const email = user.email?.trim().toLowerCase()
  if (!email) throw new AffiliateError('Email akun tidak tersedia', 401)
  const { count, error } = await supabaseAdmin
    .from('course_access_emails')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
  if (error) throw new AffiliateError('Keanggotaan course belum dapat diverifikasi', 500)
  if (!count) throw new AffiliateError('Program affiliate hanya tersedia untuk member course', 403)
  return email
}

async function publishedTerms() {
  const { data } = await supabaseAdmin
    .from('affiliate_terms_versions')
    .select('id, version, title, content, effective_at, published_at')
    .eq('status', 'published')
    .maybeSingle()
  return data
}

export async function activateAffiliate(user: User) {
  const email = await requireCourseMember(user)
  const terms = await publishedTerms()
  if (!terms) throw new AffiliateError('Syarat dan ketentuan belum dipublikasikan oleh tim', 409)

  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('affiliate_members')
    .upsert({
      user_id: user.id,
      email,
      display_name: displayName(user),
      affiliate_code: affiliateCode(user),
      accepted_terms_id: terms.id,
      accepted_terms_at: now,
      updated_at: now,
    }, { onConflict: 'user_id' })
    .select('id')
    .single()
  if (error || !data) throw new AffiliateError('Affiliate belum berhasil diaktifkan', 500)
  await supabaseAdmin.from('affiliate_audit_logs').insert({
    actor_type: 'member', actor_id: user.id, action: 'affiliate_activated',
    resource_type: 'affiliate_member', resource_id: data.id,
    details: { terms_version: terms.version },
  })
  return data
}

async function requireAffiliate(user: User) {
  const { data, error } = await supabaseAdmin
    .from('affiliate_members')
    .select('id, user_id, email, display_name, affiliate_code, status, accepted_terms_id, accepted_terms_at')
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) throw new AffiliateError('Data affiliate belum dapat dimuat', 500)
  if (!data) throw new AffiliateError('Aktifkan affiliate terlebih dahulu', 409)
  if (data.status !== 'active') throw new AffiliateError('Akun affiliate sedang tidak aktif', 403)
  const terms = await publishedTerms()
  if (!terms || data.accepted_terms_id !== terms.id) {
    throw new AffiliateError('Syarat dan ketentuan versi terbaru perlu disetujui', 409)
  }
  return data
}

async function currentProgramVersion(programId: string) {
  const now = new Date().toISOString()
  const { data } = await supabaseAdmin
    .from('affiliate_program_versions')
    .select('id, version_number, commission_bps, starts_at, ends_at')
    .eq('program_id', programId)
    .eq('status', 'published')
    .lte('starts_at', now)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export async function joinAffiliateProgram(user: User, programId: string) {
  const member = await requireAffiliate(user)
  const { data: program } = await supabaseAdmin
    .from('affiliate_programs')
    .select('id, product_id, status, eligibility_type')
    .eq('id', programId)
    .maybeSingle()
  if (!program || program.status !== 'active') throw new AffiliateError('Program sedang tidak tersedia', 404)

  if (program.eligibility_type === 'owners_only') {
    const { count } = await supabaseAdmin
      .from('course_access_emails')
      .select('id', { count: 'exact', head: true })
      .eq('email', member.email)
      .eq('product_id', program.product_id)
    if (!count) throw new AffiliateError('Program ini hanya untuk member yang memiliki produknya', 403)
  }

  const { data: existingEnrollment } = await supabaseAdmin
    .from('affiliate_enrollments')
    .select('id, program_version_id, affiliate_program_versions(status,starts_at,ends_at)')
    .eq('affiliate_member_id', member.id)
    .eq('program_id', program.id)
    .eq('status', 'active')
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  let existing = existingEnrollment
  if (existingEnrollment) {
    const nested = existingEnrollment.affiliate_program_versions as unknown as { status: string; starts_at: string; ends_at: string | null } | Array<{ status: string; starts_at: string; ends_at: string | null }> | null
    const enrollmentVersion = Array.isArray(nested) ? nested[0] : nested
    const expired = !enrollmentVersion || !['published', 'retired'].includes(enrollmentVersion.status)
      || (enrollmentVersion.ends_at && new Date(enrollmentVersion.ends_at).getTime() <= Date.now())
    if (expired) {
      await supabaseAdmin.from('affiliate_enrollments').update({ status: 'ended' }).eq('id', existingEnrollment.id)
      existing = null
    }
  }
  const version = existing ? { id: existing.program_version_id } : await currentProgramVersion(program.id)
  if (!version) throw new AffiliateError('Versi komisi aktif belum tersedia', 409)

  if (!existing) {
    const { error } = await supabaseAdmin.from('affiliate_enrollments').insert({
      affiliate_member_id: member.id,
      program_id: program.id,
      program_version_id: version.id,
    })
    if (error) throw new AffiliateError('Program belum berhasil diikuti', 500)
  }

  const { data: link, error: linkError } = await supabaseAdmin
    .from('affiliate_links')
    .upsert({
      affiliate_member_id: member.id,
      program_id: program.id,
      token: createAffiliateLinkToken(),
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'affiliate_member_id,program_id', ignoreDuplicates: true })
    .select('id, token')
    .maybeSingle()
  if (linkError) throw new AffiliateError('Link affiliate belum berhasil dibuat', 500)
  if (link) return link
  const { data: savedLink } = await supabaseAdmin
    .from('affiliate_links')
    .select('id, token')
    .eq('affiliate_member_id', member.id)
    .eq('program_id', program.id)
    .single()
  return savedLink
}

export async function saveAffiliatePayoutAccount(user: User, input: {
  bankName: string
  accountName: string
  accountNumber: string
  taxId?: string
}) {
  const member = await requireAffiliate(user)
  const bankName = input.bankName.trim().slice(0, 80)
  const accountName = input.accountName.trim().slice(0, 120)
  const accountNumber = input.accountNumber.replace(/\s+/g, '').slice(0, 40)
  const taxId = input.taxId?.replace(/\s+/g, '').slice(0, 40) || ''
  if (!bankName || !accountName || !/^\d{6,40}$/.test(accountNumber)) {
    throw new AffiliateError('Data rekening belum valid')
  }
  const { error } = await supabaseAdmin.from('affiliate_payout_accounts').upsert({
    affiliate_member_id: member.id,
    bank_name: bankName,
    account_name: accountName,
    account_number_encrypted: encryptAffiliateSecret(accountNumber),
    account_number_last4: lastFour(accountNumber),
    tax_id_encrypted: taxId ? encryptAffiliateSecret(taxId) : null,
    tax_id_last4: taxId ? lastFour(taxId) : null,
    verified_at: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'affiliate_member_id' })
  if (error) throw new AffiliateError('Rekening payout belum berhasil disimpan', 500)
}

export async function submitAffiliateDispute(user: User, input: {
  statementId: string
  reason: string
  disputedAmountRupiah?: number
  evidenceUrl?: string
}) {
  const member = await requireAffiliate(user)
  const { data: statement } = await supabaseAdmin
    .from('affiliate_statements')
    .select('id, issued_at, status, net_payout_rupiah')
    .eq('id', input.statementId)
    .eq('affiliate_member_id', member.id)
    .maybeSingle()
  if (!statement || !statement.issued_at) throw new AffiliateError('Statement tidak ditemukan', 404)
  if (Date.now() > new Date(statement.issued_at).getTime() + 3 * 86_400_000) {
    throw new AffiliateError('Masa banding tiga hari sudah berakhir', 409)
  }
  const reason = input.reason.trim().slice(0, 2000)
  if (reason.length < 10) throw new AffiliateError('Jelaskan alasan banding minimal 10 karakter')
  const { error } = await supabaseAdmin.from('affiliate_disputes').insert({
    affiliate_member_id: member.id,
    statement_id: statement.id,
    disputed_amount_rupiah: Math.min(Math.max(0, Number(input.disputedAmountRupiah) || 0), Number(statement.net_payout_rupiah)),
    reason,
    evidence_url: input.evidenceUrl?.trim().slice(0, 500) || null,
  })
  if (error) throw new AffiliateError('Banding belum berhasil dikirim', 500)
  await supabaseAdmin.from('affiliate_statements').update({ status: 'disputed' }).eq('id', statement.id).neq('status', 'paid')
}

export async function getAffiliateDashboard(user: User, storeOrigin: string) {
  const email = await requireCourseMember(user)
  await supabaseAdmin.rpc('promote_mature_affiliate_commissions')
  const terms = await publishedTerms()
  const { data: member } = await supabaseAdmin
    .from('affiliate_members')
    .select('id, display_name, affiliate_code, status, accepted_terms_id, accepted_terms_at')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: accessRows } = await supabaseAdmin.from('course_access_emails').select('product_id').eq('email', email)
  const owned = new Set((accessRows || []).map(row => row.product_id).filter(Boolean))
  const { data: programs } = await supabaseAdmin
    .from('affiliate_programs')
    .select('id, product_id, status, eligibility_type, attribution_window_days, holding_days, promotional_brief, approved_copy, asset_url, restrictions, products(id,name,slug,image_url,price_after_discount)')
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false })

  const memberId = member?.id
  const [enrollmentsResult, linksResult, clicksResult, attributionsResult, commissionsResult, adjustmentsResult, payoutsResult, statementsResult, disputesResult, accountResult] = memberId
    ? await Promise.all([
      supabaseAdmin.from('affiliate_enrollments').select('program_id, program_version_id, status, accepted_at, affiliate_program_versions(version_number,commission_bps,starts_at,ends_at)').eq('affiliate_member_id', memberId),
      supabaseAdmin.from('affiliate_links').select('program_id, token, is_active').eq('affiliate_member_id', memberId),
      supabaseAdmin.from('affiliate_clicks').select('id, program_id, clicked_at', { count: 'exact' }).eq('affiliate_member_id', memberId).order('clicked_at', { ascending: false }).limit(100),
      supabaseAdmin.from('affiliate_attributions').select('id', { count: 'exact', head: true }).eq('affiliate_member_id', memberId).eq('status', 'invalid').eq('invalid_reason', 'self_purchase'),
      supabaseAdmin.from('affiliate_commissions').select('id, order_id, program_id, status, commissionable_amount_rupiah, commission_bps, commission_amount_rupiah, available_at, created_at').eq('affiliate_member_id', memberId).order('created_at', { ascending: false }).limit(100),
      supabaseAdmin.from('affiliate_adjustments').select('id, source_commission_id, statement_id, adjustment_type, status, amount_rupiah, reason, available_at, created_at').eq('affiliate_member_id', memberId).order('created_at', { ascending: false }).limit(100),
      supabaseAdmin.from('affiliate_payouts').select('id, statement_id, status, amount_rupiah, bank_name, account_name, account_number_last4, transfer_reference, proof_url, paid_at, created_at').eq('affiliate_member_id', memberId).order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('affiliate_statements').select('id, settlement_cycle_id, status, attributed_revenue_rupiah, gross_commission_rupiah, reversal_rupiah, adjustment_rupiah, tax_withheld_rupiah, transfer_fee_rupiah, net_payout_rupiah, issued_at, created_at').eq('affiliate_member_id', memberId).order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('affiliate_disputes').select('id, statement_id, disputed_amount_rupiah, reason, evidence_url, status, admin_note, resolved_at, created_at').eq('affiliate_member_id', memberId).order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('affiliate_payout_accounts').select('bank_name, account_name, account_number_last4, tax_id_last4, verified_at').eq('affiliate_member_id', memberId).maybeSingle(),
    ])
    : Array.from({ length: 10 }, () => ({ data: [] }))

  const enrollments = enrollmentsResult.data || []
  const links = linksResult.data || []
  const commissions = commissionsResult.data || []
  const enrollmentByProgram = new Map(enrollments.filter(row => row.status === 'active').map(row => [row.program_id, row]))
  const linkByProgram = new Map(links.map(row => [row.program_id, row]))
  const programDtos = await Promise.all((programs || []).map(async program => {
    const currentVersion = await currentProgramVersion(program.id)
    const enrollment = enrollmentByProgram.get(program.id)
    const link = linkByProgram.get(program.id)
    const productNested = program.products as unknown as Record<string, unknown> | Array<Record<string, unknown>> | null
    const product = Array.isArray(productNested) ? productNested[0] : productNested
    return {
      ...program,
      products: product,
      currentVersion,
      eligible: program.eligibility_type === 'all_members' || owned.has(program.product_id),
      enrollment,
      affiliateUrl: link?.token ? `${storeOrigin}/a/${link.token}` : null,
    }
  }))

  const totals = commissions.reduce((sum, row) => {
    const amount = Number(row.commission_amount_rupiah) || 0
    if (row.status === 'pending') sum.pending += amount
    if (row.status === 'available') sum.available += amount
    if (row.status === 'allocated') sum.processing += amount
    if (row.status === 'paid') sum.paid += amount
    return sum
  }, { pending: 0, available: 0, processing: 0, paid: 0 })
  for (const adjustment of adjustmentsResult.data || []) {
    const amount = Number(adjustment.amount_rupiah) || 0
    if (adjustment.status === 'available') totals.available += amount
    if (adjustment.status === 'allocated') totals.processing += amount
    if (adjustment.status === 'applied') totals.paid += amount
  }
  const clickCount = 'count' in clicksResult
    ? clicksResult.count ?? clicksResult.data?.length ?? 0
    : clicksResult.data?.length ?? 0
  const blockedSelfPurchases = 'count' in attributionsResult
    ? attributionsResult.count ?? 0
    : 0

  return {
    terms,
    member: member || null,
    requiresTermsAcceptance: Boolean(member && terms && member.accepted_terms_id !== terms.id),
    settings: {
      minimumPayoutRupiah: 50_000,
      settlementSchedule: 'Statement tanggal 1, masa banding tanggal 1–3, transfer maksimal tanggal 5 atau hari kerja berikutnya.',
      attributionModel: 'Last valid click',
      commissionBase: 'Nilai item setelah diskon voucher; biaya Midtrans ditanggung Marcatching.',
    },
    totals: { clicks: clickCount, blockedSelfPurchases, ...totals },
    programs: programDtos,
    commissions,
    adjustments: adjustmentsResult.data || [],
    statements: statementsResult.data || [],
    payouts: payoutsResult.data || [],
    disputes: disputesResult.data || [],
    payoutAccount: Array.isArray(accountResult.data) ? null : accountResult.data || null,
  }
}
