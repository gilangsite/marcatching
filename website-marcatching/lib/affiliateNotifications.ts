import 'server-only'

import type { AffiliateReceiptData } from '@/lib/receiptPdf'

const PAYMENT_SCRIPT_FALLBACK = 'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'
const FINANCE_SCRIPT_FALLBACK = 'https://script.google.com/macros/s/AKfycbwYB7gmDbz_bZPD6TiABrd9g95VEvZ4_psIDcm5smDGFJU52koC5scR6Bl0whF_iMLR/exec'

async function post(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload), redirect: 'follow', cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Apps Script failed with ${response.status}`)
  const text = await response.text()
  const result = JSON.parse(text) as { status?: string; message?: string }
  if (result.status !== 'success') throw new Error(result.message || 'Apps Script action failed')
  return result
}

export async function sendAffiliatePayoutNotification(input: {
  receipt: AffiliateReceiptData
  pdf: Buffer
}) {
  const secret = process.env.APPS_SCRIPT_PAYMENT_SECRET
  if (!secret) throw new Error('Apps Script payment secret is not configured')
  return post(process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || PAYMENT_SCRIPT_FALLBACK, {
    action: 'affiliatePayoutPaid',
    paymentSecret: secret,
    ...input.receipt,
    receiptBase64: input.pdf.toString('base64'),
    receiptFilename: `marcatching-affiliate-${input.receipt.payoutId.slice(0, 8)}.pdf`,
    dashboardUrl: 'https://course.marcatching.com/affiliate',
  })
}

export async function recordAffiliatePayoutCost(input: {
  payoutId: string
  paidAt: string
  amountRupiah: number
  affiliateName: string
  transferReference: string
}) {
  return post(process.env.FINANCE_APPS_SCRIPT_URL || FINANCE_SCRIPT_FALLBACK, {
    action: 'financeAdd',
    sheetType: 'cost',
    date: input.paidAt.slice(0, 10),
    nominal: input.amountRupiah,
    category: 'Affiliate Commission',
    item: `Payout ${input.affiliateName}`,
    details: `Affiliate payout ${input.payoutId}; ref ${input.transferReference}`,
    billing: 'Monthly',
    status: 'Paid',
  })
}
