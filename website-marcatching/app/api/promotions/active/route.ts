import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { expireIfPastDue } from '@/lib/promotionExpiry'
import type { PromotionWithProduct } from '@/lib/supabaseClient'

// Public, no auth: promotion data mirrors what's already visible on /store and
// /product/[slug], and the promotions RLS policy already lets anon read on_going rows.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('promotions')
    .select('*, product:products(id, name, slug, image_url, price_before_discount, price_after_discount, discount_percentage, is_coming_soon)')
    .eq('status', 'on_going')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ message: 'Gagal memuat promotion' }, { status: 500 })
  if (!data) return NextResponse.json({ data: null }, { headers: { 'Cache-Control': 'no-store' } })

  const promotion = await expireIfPastDue(data as PromotionWithProduct)
  return NextResponse.json({ data: promotion.status === 'on_going' ? promotion : null }, { headers: { 'Cache-Control': 'no-store' } })
}
