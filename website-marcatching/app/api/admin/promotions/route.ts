import { NextRequest, NextResponse } from 'next/server'
import { hasValidAdminSession } from '@/lib/adminSession'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { expireIfPastDue } from '@/lib/promotionExpiry'
import type { PromotionWithProduct } from '@/lib/supabaseClient'

const PROMOTION_SELECT = '*, product:products(id, name, slug, image_url, price_before_discount, price_after_discount, discount_percentage, is_coming_soon)'

function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export async function GET(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return unauthorized()

  const { data, error } = await supabaseAdmin
    .from('promotions')
    .select(PROMOTION_SELECT)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ message: 'Gagal memuat promotions' }, { status: 500 })

  const promotions = await Promise.all((data as PromotionWithProduct[]).map(expireIfPastDue))
  return NextResponse.json({ data: promotions }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return unauthorized()

  try {
    const body = await req.json() as Record<string, unknown>
    const action = cleanText(body.action, 64)

    if (action === 'save_promotion') {
      const source = body.promotion && typeof body.promotion === 'object'
        ? body.promotion as Record<string, unknown>
        : {}
      const headline = cleanText(source.headline, 200)
      const productId = cleanText(source.product_id, 64)
      if (!headline || !productId) return NextResponse.json({ message: 'Headline dan produk wajib diisi' }, { status: 400 })

      const { data: product } = await supabaseAdmin.from('products').select('id, is_coming_soon').eq('id', productId).maybeSingle()
      if (!product) return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 400 })
      if (product.is_coming_soon) return NextResponse.json({ message: 'Produk "Coming Soon" tidak bisa dipakai untuk promosi' }, { status: 400 })

      const status = source.status === 'on_going' ? 'on_going' : 'off'
      const endsAtRaw = cleanText(source.ends_at, 40)
      const endsAt = endsAtRaw ? new Date(endsAtRaw).toISOString() : null

      const promotion = {
        headline,
        description: cleanText(source.description, 2000) || null,
        product_id: productId,
        status,
        ends_at: endsAt,
      }
      const id = cleanText(body.id, 64)

      // Single-active-promotion enforcement: turning this row on_going flips every other on_going row off first.
      if (status === 'on_going') {
        const otherOnGoing = supabaseAdmin.from('promotions').update({ status: 'off' }).eq('status', 'on_going')
        const { error: flipError } = await (id ? otherOnGoing.neq('id', id) : otherOnGoing)
        if (flipError) return NextResponse.json({ message: flipError.message }, { status: 400 })
      }

      if (id) {
        const { error } = await supabaseAdmin.from('promotions').update(promotion).eq('id', id)
        if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      } else {
        const { error } = await supabaseAdmin.from('promotions').insert(promotion)
        if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'delete_promotion') {
      const id = cleanText(body.id, 64)
      if (!id) return NextResponse.json({ message: 'Promotion tidak valid' }, { status: 400 })
      const { error } = await supabaseAdmin.from('promotions').delete().eq('id', id)
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ message: 'Action tidak valid' }, { status: 400 })
  } catch (error) {
    console.error('Admin promotions operation failed')
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Operasi gagal' }, { status: 500 })
  }
}
