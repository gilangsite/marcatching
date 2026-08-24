import 'server-only'

import { createAffiliateReceiptPdf, type AffiliateReceiptData } from '@/lib/receiptPdf'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function getAffiliateReceipt(payoutId: string) {
  const { data: payout, error } = await supabaseAdmin
    .from('affiliate_payouts')
    .select('id,statement_id,affiliate_member_id,status,amount_rupiah,bank_name,account_name,account_number_last4,transfer_reference,paid_at')
    .eq('id', payoutId)
    .maybeSingle()
  if (error || !payout || payout.status !== 'paid' || !payout.paid_at) return null
  const [{ data: statement }, { data: member }, { data: items, count }] = await Promise.all([
    supabaseAdmin.from('affiliate_statements').select('settlement_cycle_id,attributed_revenue_rupiah,gross_commission_rupiah,reversal_rupiah,adjustment_rupiah,tax_withheld_rupiah,transfer_fee_rupiah,net_payout_rupiah').eq('id', payout.statement_id).single(),
    supabaseAdmin.from('affiliate_members').select('user_id,email,display_name').eq('id', payout.affiliate_member_id).single(),
    supabaseAdmin.from('affiliate_payout_items').select('id', { count: 'exact' }).eq('payout_id', payout.id),
  ])
  if (!statement || !member) return null
  const { data: cycle } = await supabaseAdmin.from('affiliate_settlement_cycles').select('period_start,period_end').eq('id', statement.settlement_cycle_id).single()
  if (!cycle) return null
  const receiptData: AffiliateReceiptData = {
    payoutId: payout.id,
    statementId: payout.statement_id,
    affiliateName: member.display_name,
    email: member.email,
    periodStart: cycle.period_start,
    periodEnd: cycle.period_end,
    attributedRevenue: Number(statement.attributed_revenue_rupiah) || 0,
    grossCommission: Number(statement.gross_commission_rupiah) || 0,
    reversal: Number(statement.reversal_rupiah) || 0,
    adjustment: Number(statement.adjustment_rupiah) || 0,
    taxWithheld: Number(statement.tax_withheld_rupiah) || 0,
    transferFee: Number(statement.transfer_fee_rupiah) || 0,
    netPayout: Number(statement.net_payout_rupiah) || 0,
    commissionCount: count ?? items?.length ?? 0,
    bankName: payout.bank_name || '-',
    accountName: payout.account_name || '-',
    accountNumberLast4: payout.account_number_last4 || '-',
    transferReference: payout.transfer_reference || '-',
    paidAt: payout.paid_at,
  }
  return { payout, member, statement, cycle, receiptData, pdf: createAffiliateReceiptPdf(receiptData) }
}
