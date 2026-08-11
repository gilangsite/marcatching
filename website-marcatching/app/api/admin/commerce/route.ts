import { NextRequest, NextResponse } from 'next/server'
import { hasValidAdminSession } from '@/lib/adminSession'
import { fulfillOrder, revokeOrderAccess } from '@/lib/commerce'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function safeInteger(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0
}

export async function GET(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return unauthorized()

  const resource = req.nextUrl.searchParams.get('resource')
  if (resource === 'products') {
    const { data, error } = await supabaseAdmin.from('products').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ message: 'Gagal memuat products' }, { status: 500 })
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
  }
  if (resource === 'vouchers') {
    const { data, error } = await supabaseAdmin.from('vouchers').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ message: 'Gagal memuat vouchers' }, { status: 500 })
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
  }
  if (resource === 'orders') {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, product_id, product_name, full_name, email, whatsapp, background, referral_source, voucher_code, price_original, price_discounted, voucher_discount, total_paid, addon_items, status, midtrans_order_id, midtrans_transaction_id, payment_status, payment_type, fraud_status, paid_at, payment_updated_at, fulfillment_status, confirmation_sent_at, created_at')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ message: 'Gagal memuat orders' }, { status: 500 })
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
  }

  return NextResponse.json({ message: 'Resource tidak valid' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return unauthorized()

  try {
    const body = await req.json() as Record<string, unknown>
    const action = cleanText(body.action, 64)

    if (action === 'save_product') {
      const source = body.product && typeof body.product === 'object'
        ? body.product as Record<string, unknown>
        : {}
      const name = cleanText(source.name, 180)
      const slug = cleanText(source.slug, 180)
      if (!name || !slug) return NextResponse.json({ message: 'Nama product wajib diisi' }, { status: 400 })

      const product = {
        name,
        slug,
        sub_headline: cleanText(source.sub_headline, 300) || null,
        description: cleanText(source.description, 5000) || null,
        image_url: cleanText(source.image_url, 2000) || null,
        price_before_discount: safeInteger(source.price_before_discount),
        price_after_discount: safeInteger(source.price_after_discount),
        discount_percentage: Math.min(100, safeInteger(source.discount_percentage)),
        features: Array.isArray(source.features)
          ? source.features.filter((item): item is string => typeof item === 'string').map(item => item.slice(0, 300))
          : [],
        is_active: source.is_active !== false,
        is_coming_soon: source.is_coming_soon === true,
        category_id: cleanText(source.category_id, 64) || null,
      }
      const id = cleanText(body.id, 64)

      if (id) {
        const { error } = await supabaseAdmin.from('products').update(product).eq('id', id)
        if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      } else {
        const { error } = await supabaseAdmin.from('products').insert(product)
        if (error) return NextResponse.json({ message: error.message }, { status: 400 })

        const { count } = await supabaseAdmin.from('links').select('id', { count: 'exact', head: true })
        await supabaseAdmin.from('links').insert({
          title: product.name,
          url: `/product/${product.slug}`,
          icon: 'ShoppingBag',
          status: 'active',
          type: 'button',
          order_index: (count || 0) + 1,
        })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'delete_product') {
      const id = cleanText(body.id, 64)
      if (!id) return NextResponse.json({ message: 'Product tidak valid' }, { status: 400 })

      const { data: product } = await supabaseAdmin.from('products').select('slug').eq('id', id).maybeSingle()
      await supabaseAdmin.from('orders').update({ product_id: null }).eq('product_id', id)
      if (product?.slug) await supabaseAdmin.from('links').delete().eq('url', `/product/${product.slug}`)
      const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    if (action === 'save_voucher') {
      const source = body.voucher && typeof body.voucher === 'object'
        ? body.voucher as Record<string, unknown>
        : {}
      const code = cleanText(source.code, 64).toUpperCase()
      const discountType = source.discount_type === 'percentage' ? 'percentage' : 'fixed'
      if (!code) return NextResponse.json({ message: 'Kode voucher wajib diisi' }, { status: 400 })

      const voucher = {
        code,
        discount_value: discountType === 'percentage'
          ? Math.min(100, safeInteger(source.discount_value))
          : safeInteger(source.discount_value),
        discount_type: discountType,
        is_active: source.is_active !== false,
        applicable_products: Array.isArray(source.applicable_products)
          ? source.applicable_products.filter((id): id is string => typeof id === 'string' && id.length > 0)
          : null,
      }
      const id = cleanText(body.id, 64)
      const result = id
        ? await supabaseAdmin.from('vouchers').update(voucher).eq('id', id)
        : await supabaseAdmin.from('vouchers').insert(voucher)
      if (result.error) return NextResponse.json({ message: result.error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete_voucher') {
      const id = cleanText(body.id, 64)
      const { error } = await supabaseAdmin.from('vouchers').delete().eq('id', id)
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    if (action === 'toggle_voucher') {
      const id = cleanText(body.id, 64)
      const { error } = await supabaseAdmin
        .from('vouchers')
        .update({ is_active: body.isActive === true })
        .eq('id', id)
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    if (action === 'set_order_status') {
      const id = cleanText(body.id, 64)
      const status = body.status === 'confirmed' ? 'confirmed' : 'pending'
      const { data: currentOrder, error: currentOrderError } = await supabaseAdmin
        .from('orders')
        .select('payment_status')
        .eq('id', id)
        .maybeSingle()
      if (currentOrderError || !currentOrder) {
        return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 })
      }

      const paymentStatus = status === 'confirmed'
        ? currentOrder.payment_status === 'paid' ? 'paid' : 'legacy_confirmed'
        : currentOrder.payment_status === 'legacy_confirmed' ? 'pending' : currentOrder.payment_status
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status, payment_status: paymentStatus, payment_updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) return NextResponse.json({ message: error.message }, { status: 400 })

      if (status === 'confirmed') await fulfillOrder(id)
      else await revokeOrderAccess(id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ message: 'Action tidak valid' }, { status: 400 })
  } catch (error) {
    console.error('Admin commerce operation failed')
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Operasi gagal' }, { status: 500 })
  }
}
