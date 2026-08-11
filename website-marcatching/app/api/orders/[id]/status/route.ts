import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { AddonItem } from '@/lib/supabaseClient'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const token = req.nextUrl.searchParams.get('token') || ''
  if (!id || !token) {
    return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('payment_status, status, total_paid, product_name, addon_items, paid_at')
    .eq('id', id)
    .eq('public_status_token', token)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 })
  }

  const addons = Array.isArray(data.addon_items) ? data.addon_items as AddonItem[] : []
  return NextResponse.json({
    paymentStatus: data.payment_status,
    status: data.status,
    amount: data.total_paid,
    productNames: [data.product_name, ...addons.map(addon => addon.name)],
    paidAt: data.paid_at,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
