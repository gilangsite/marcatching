import { NextRequest, NextResponse } from 'next/server'
import { hasValidAdminSession } from '@/lib/adminSession'
import { sendAffiliatePayoutNotification, recordAffiliatePayoutCost } from '@/lib/affiliateNotifications'
import { getAffiliateReceipt } from '@/lib/affiliateReceipt'
import { decryptAffiliateSecret } from '@/lib/affiliateCrypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}

function clean(value: unknown, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function integer(value: unknown, min: number, max: number) {
  const parsed = Math.round(Number(value))
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null
  return parsed
}

function affiliateRuntimeConfiguration() {
  const attributionSecret = process.env.AFFILIATE_ATTRIBUTION_SECRET || ''
  const encryptionSecret = process.env.AFFILIATE_DATA_ENCRYPTION_KEY || ''
  const encryptionBytes = /^[a-f\d]{64}$/i.test(encryptionSecret)
    ? Buffer.from(encryptionSecret, 'hex')
    : Buffer.from(encryptionSecret, 'base64')

  return {
    attributionSecretConfigured: attributionSecret.length >= 24,
    encryptionKeyConfigured: encryptionBytes.length === 32,
    appsScriptPaymentSecretConfigured: Boolean(process.env.APPS_SCRIPT_PAYMENT_SECRET),
  }
}

async function dashboard() {
  await supabaseAdmin.rpc('promote_mature_affiliate_commissions')
  const [products, programs, versions, members, accounts, clicks, commissions, adjustments, cycles, statements, payouts, emailDeliveries, disputes, terms] = await Promise.all([
    supabaseAdmin.from('products').select('id,name,slug,image_url,price_after_discount,is_active,is_coming_soon').order('created_at', { ascending: false }),
    supabaseAdmin.from('affiliate_programs').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('affiliate_program_versions').select('*').order('version_number', { ascending: false }),
    supabaseAdmin.from('affiliate_members').select('id,user_id,email,display_name,affiliate_code,status,accepted_terms_at,created_at').order('created_at', { ascending: false }),
    supabaseAdmin.from('affiliate_payout_accounts').select('affiliate_member_id,bank_name,account_name,account_number_last4,tax_id_last4,verified_at'),
    supabaseAdmin.from('affiliate_clicks').select('id,affiliate_member_id,program_id,is_valid,clicked_at', { count: 'exact' }).eq('is_valid', true).order('clicked_at', { ascending: false }).limit(1000),
    supabaseAdmin.from('affiliate_commissions').select('id,order_id,affiliate_member_id,program_id,program_version_id,statement_id,status,commissionable_amount_rupiah,commission_bps,commission_amount_rupiah,available_at,reversal_reason,paid_at,created_at').order('created_at', { ascending: false }).limit(1000),
    supabaseAdmin.from('affiliate_adjustments').select('*').order('created_at', { ascending: false }).limit(1000),
    supabaseAdmin.from('affiliate_settlement_cycles').select('*').order('period_end', { ascending: false }).limit(50),
    supabaseAdmin.from('affiliate_statements').select('*').order('created_at', { ascending: false }).limit(500),
    supabaseAdmin.from('affiliate_payouts').select('*').order('created_at', { ascending: false }).limit(500),
    supabaseAdmin.from('affiliate_email_deliveries').select('id,payout_id,event_type,recipient_email,status,error_message,sent_at,created_at').order('created_at', { ascending: false }).limit(500),
    supabaseAdmin.from('affiliate_disputes').select('*').order('created_at', { ascending: false }).limit(500),
    supabaseAdmin.from('affiliate_terms_versions').select('*').order('version', { ascending: false }),
  ])
  const failed = [products, programs, versions, members, accounts, clicks, commissions, adjustments, cycles, statements, payouts, emailDeliveries, disputes, terms].find(result => result.error)
  if (failed?.error) throw failed.error

  const commissionRows = commissions.data || []
  const adjustmentRows = adjustments.data || []
  const total = (statuses: string[]) => commissionRows
    .filter(row => statuses.includes(row.status))
    .reduce((sum, row) => sum + Number(row.commission_amount_rupiah || 0), 0)
  return {
    products: products.data || [], programs: programs.data || [], versions: versions.data || [],
    members: members.data || [], accounts: accounts.data || [], clicks: clicks.data || [],
    commissions: commissionRows, adjustments: adjustmentRows, cycles: cycles.data || [], statements: statements.data || [],
    payouts: payouts.data || [], emailDeliveries: emailDeliveries.data || [], disputes: disputes.data || [], terms: terms.data || [],
    configuration: affiliateRuntimeConfiguration(),
    metrics: {
      activeAffiliates: (members.data || []).filter(row => row.status === 'active').length,
      validClicks: clicks.count ?? (clicks.data || []).length,
      pendingRupiah: total(['pending']),
      availableRupiah: total(['available']) + adjustmentRows.filter(row => row.status === 'available').reduce((sum, row) => sum + Number(row.amount_rupiah || 0), 0),
      processingRupiah: total(['allocated']) + adjustmentRows.filter(row => row.status === 'allocated').reduce((sum, row) => sum + Number(row.amount_rupiah || 0), 0),
      paidRupiah: total(['paid']) + adjustmentRows.filter(row => row.status === 'applied').reduce((sum, row) => sum + Number(row.amount_rupiah || 0), 0),
      attributedRevenueRupiah: commissionRows.reduce((sum, row) => sum + Number(row.commissionable_amount_rupiah || 0), 0),
    },
  }
}

export async function GET(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return unauthorized()
  try {
    return NextResponse.json(await dashboard(), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Affiliate admin dashboard failed', error)
    return NextResponse.json({ message: 'Dashboard affiliate belum dapat dimuat. Pastikan migration sudah dijalankan.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return unauthorized()
  try {
    const body = await req.json() as Record<string, unknown>
    const action = clean(body.action, 50)

    if (action === 'publish_program_version') {
      const productId = clean(body.productId, 64)
      const commissionBps = integer(body.commissionBps, 1, 10_000)
      const attributionWindowDays = integer(body.attributionWindowDays, 1, 90)
      const holdingDays = integer(body.holdingDays, 0, 90)
      const startsAt = clean(body.startsAt, 40)
      if (!productId || commissionBps === null || attributionWindowDays === null || holdingDays === null || !startsAt || Number.isNaN(new Date(startsAt).getTime())) {
        return NextResponse.json({ message: 'Konfigurasi program belum valid' }, { status: 400 })
      }
      const { data: published, error: publishError } = await supabaseAdmin.rpc('publish_affiliate_program_version', {
        p_product_id: productId,
        p_commission_bps: commissionBps,
        p_starts_at: new Date(startsAt).toISOString(),
        p_ends_at: clean(body.endsAt, 40) ? new Date(clean(body.endsAt, 40)).toISOString() : null,
        p_eligibility_type: body.eligibilityType === 'all_members' ? 'all_members' : 'owners_only',
        p_attribution_window_days: attributionWindowDays,
        p_holding_days: holdingDays,
        p_promotional_brief: clean(body.promotionalBrief, 5000),
        p_approved_copy: clean(body.approvedCopy, 5000),
        p_asset_url: clean(body.assetUrl, 1000),
        p_restrictions: clean(body.restrictions, 5000),
      })
      if (publishError || !published) throw publishError || new Error('Program publish failed')
      await supabaseAdmin.from('affiliate_audit_logs').insert({
        actor_type: 'admin', action: 'program_version_published', resource_type: 'affiliate_program', resource_id: published.programId,
        details: { version: published.versionNumber, commission_bps: commissionBps },
      })
    } else if (action === 'set_program_status') {
      const status = ['active', 'paused', 'ended'].includes(String(body.status)) ? String(body.status) : null
      if (!status) return NextResponse.json({ message: 'Status tidak valid' }, { status: 400 })
      const { error } = await supabaseAdmin.from('affiliate_programs').update({ status, updated_at: new Date().toISOString() }).eq('id', clean(body.programId, 64))
      if (error) throw error
    } else if (action === 'set_member_status') {
      const status = ['active', 'suspended', 'closed'].includes(String(body.status)) ? String(body.status) : null
      if (!status) return NextResponse.json({ message: 'Status tidak valid' }, { status: 400 })
      const memberId = clean(body.memberId, 64)
      const { error } = await supabaseAdmin.from('affiliate_members').update({ status, updated_at: new Date().toISOString() }).eq('id', memberId)
      if (error) throw error
      await supabaseAdmin.from('affiliate_links').update({ is_active: status === 'active', updated_at: new Date().toISOString() }).eq('affiliate_member_id', memberId)
    } else if (action === 'generate_settlement') {
      const periodStart = clean(body.periodStart, 10)
      const periodEnd = clean(body.periodEnd, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(periodStart) || !/^\d{4}-\d{2}-\d{2}$/.test(periodEnd)) {
        return NextResponse.json({ message: 'Periode settlement belum valid' }, { status: 400 })
      }
      const { data, error } = await supabaseAdmin.rpc('generate_affiliate_settlement', {
        p_period_start: periodStart,
        p_period_end: periodEnd,
        p_minimum_payout: 50_000,
      })
      if (error) throw error
      return NextResponse.json({ ok: true, settlement: data, data: await dashboard() })
    } else if (action === 'mark_payout_paid') {
      const payoutId = clean(body.payoutId, 64)
      const transferReference = clean(body.transferReference, 180)
      if (!payoutId || !transferReference) return NextResponse.json({ message: 'Referensi transfer wajib diisi' }, { status: 400 })
      const { data, error } = await supabaseAdmin.rpc('mark_affiliate_payout_paid', {
        p_payout_id: payoutId,
        p_transfer_reference: transferReference,
        p_proof_url: clean(body.proofUrl, 1000) || null,
      })
      if (error) throw error
      await supabaseAdmin.from('affiliate_audit_logs').insert({
        actor_type: 'admin', action: 'payout_marked_paid', resource_type: 'affiliate_payout', resource_id: payoutId,
        details: { transfer_reference: transferReference },
      })
      const receipt = await getAffiliateReceipt(payoutId)
      if (receipt) {
        const idempotencyKey = `affiliate-payout:${payoutId}:paid-email`
        const { data: existingDelivery } = await supabaseAdmin
          .from('affiliate_email_deliveries')
          .select('id,status')
          .eq('idempotency_key', idempotencyKey)
          .maybeSingle()
        if (existingDelivery?.status !== 'sent') {
          const delivery = existingDelivery || (await supabaseAdmin.from('affiliate_email_deliveries').insert({
            affiliate_member_id: receipt.payout.affiliate_member_id,
            payout_id: payoutId,
            event_type: 'payout_paid',
            recipient_email: receipt.member.email,
            idempotency_key: idempotencyKey,
          }).select('id,status').single()).data
          if (delivery) {
            try {
              await sendAffiliatePayoutNotification({ receipt: receipt.receiptData, pdf: receipt.pdf })
              await supabaseAdmin.from('affiliate_email_deliveries').update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null }).eq('id', delivery.id)
            } catch (emailError) {
              await supabaseAdmin.from('affiliate_email_deliveries').update({ status: 'failed', error_message: String(emailError) }).eq('id', delivery.id)
              console.error('Affiliate payout email failed', emailError)
            }
          }
        }

        const { data: payoutState } = await supabaseAdmin.from('affiliate_payouts').select('finance_exported_at').eq('id', payoutId).single()
        if (!payoutState?.finance_exported_at) {
          try {
            await recordAffiliatePayoutCost({
              payoutId,
              paidAt: receipt.receiptData.paidAt,
              amountRupiah: receipt.receiptData.netPayout,
              affiliateName: receipt.receiptData.affiliateName,
              transferReference,
            })
            await supabaseAdmin.from('affiliate_payouts').update({ finance_exported_at: new Date().toISOString() }).eq('id', payoutId).is('finance_exported_at', null)
          } catch (financeError) {
            console.error('Affiliate finance export failed', financeError)
          }
        }
      }
      return NextResponse.json({ ok: true, payout: data, data: await dashboard() })
    } else if (action === 'reveal_payout_account') {
      const payoutId = clean(body.payoutId, 64)
      const { data: snapshot, error } = await supabaseAdmin
        .from('affiliate_payout_account_snapshots')
        .select('payout_id,bank_name,account_name,account_number_encrypted,account_number_last4,tax_id_encrypted,tax_id_last4')
        .eq('payout_id', payoutId)
        .maybeSingle()
      if (error || !snapshot) return NextResponse.json({ message: 'Snapshot rekening payout tidak ditemukan' }, { status: 404 })
      const accountNumber = decryptAffiliateSecret(snapshot.account_number_encrypted)
      const taxId = snapshot.tax_id_encrypted ? decryptAffiliateSecret(snapshot.tax_id_encrypted) : null
      await supabaseAdmin.from('affiliate_audit_logs').insert({
        actor_type: 'admin', action: 'payout_account_revealed',
        resource_type: 'affiliate_payout', resource_id: payoutId,
        details: { account_number_last4: snapshot.account_number_last4 },
      })
      return NextResponse.json({
        ok: true,
        account: {
          bankName: snapshot.bank_name,
          accountName: snapshot.account_name,
          accountNumber,
          taxId,
          taxIdLast4: snapshot.tax_id_last4,
        },
      }, { headers: { 'Cache-Control': 'private, no-store' } })
    } else if (action === 'resolve_dispute') {
      const disputeId = clean(body.disputeId, 64)
      const resolution = body.resolution === 'rejected' ? 'rejected' : 'resolved'
      const { data: dispute, error } = await supabaseAdmin
        .from('affiliate_disputes')
        .update({ status: resolution, admin_note: clean(body.adminNote, 2000) || null, resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', disputeId)
        .select('statement_id')
        .single()
      if (error) throw error
      const { count } = await supabaseAdmin.from('affiliate_disputes').select('id', { count: 'exact', head: true }).eq('statement_id', dispute.statement_id).in('status', ['submitted', 'reviewing'])
      if (!count) await supabaseAdmin.from('affiliate_statements').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', dispute.statement_id).eq('status', 'disputed')
    } else if (action === 'publish_terms') {
      const title = clean(body.title, 200)
      const content = clean(body.content, 40_000)
      if (!title || content.length < 200) return NextResponse.json({ message: 'S&K harus berisi minimal 200 karakter' }, { status: 400 })
      const { error: publishError } = await supabaseAdmin.rpc('publish_affiliate_terms', { p_title: title, p_content: content })
      if (publishError) throw publishError
    } else {
      return NextResponse.json({ message: 'Action tidak dikenali' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, data: await dashboard() })
  } catch (error) {
    console.error('Affiliate admin action failed', error)
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Action affiliate gagal' }, { status: 500 })
  }
}
