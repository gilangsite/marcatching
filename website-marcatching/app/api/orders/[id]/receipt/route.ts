import { NextRequest } from 'next/server'
import { createReceiptPdf } from '@/lib/receiptPdf'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { AddonItem } from '@/lib/supabaseClient'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const token = req.nextUrl.searchParams.get('token') || ''
  if (!id || !token) return new Response('Receipt tidak ditemukan', { status: 404 })

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, public_status_token, payment_status, status, full_name, email, product_name, price_discounted, addon_items, voucher_code, voucher_discount, total_paid, paid_at, payment_type, midtrans_order_id')
    .eq('id', id)
    .eq('public_status_token', token)
    .maybeSingle()

  const isPaid = data?.payment_status === 'paid' || data?.payment_status === 'legacy_confirmed'
  if (error || !data || !isPaid || !data.paid_at) {
    return new Response('Receipt belum tersedia', { status: 404 })
  }

  const addons = Array.isArray(data.addon_items) ? data.addon_items as AddonItem[] : []
  const pdf = createReceiptPdf({
    orderId: data.id,
    midtransOrderId: data.midtrans_order_id,
    fullName: data.full_name,
    email: data.email,
    paidAt: data.paid_at,
    paymentType: data.payment_type,
    products: [
      { name: data.product_name, amount: Number(data.price_discounted) || 0 },
      ...addons.map(addon => ({ name: addon.name, amount: Number(addon.priceDiscounted) || 0 })),
    ],
    voucherCode: data.voucher_code,
    voucherDiscount: Number(data.voucher_discount) || 0,
    totalPaid: Number(data.total_paid) || 0,
  })
  const filename = `marcatching-receipt-${data.id.slice(0, 8)}.pdf`

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      'Content-Length': String(pdf.length),
    },
  })
}
