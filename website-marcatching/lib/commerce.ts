import 'server-only'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendCourseAccessEmail } from '@/lib/courseEmail'
import type { AddonItem, Product, Voucher } from '@/lib/supabaseClient'

export class CommerceError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'CommerceError'
    this.status = status
  }
}

export type PricedProduct = {
  id: string
  name: string
  slug: string
  priceOriginal: number
  basePrice: number
  voucherDiscount: number
  finalPrice: number
}

export type CalculatedCart = {
  main: PricedProduct
  addons: PricedProduct[]
  voucherCode: string | null
  voucherDiscount: number
  subtotal: number
  total: number
  perProductDiscounts: Record<string, number>
}

function uniqueProductIds(mainProductId: string, addonIds: unknown) {
  const normalizedAddons = Array.isArray(addonIds)
    ? addonIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
    : []
  return [mainProductId, ...new Set(normalizedAddons.filter(id => id !== mainProductId))]
}

function toPricedProduct(product: Product, voucherDiscount: number): PricedProduct {
  const basePrice = Math.max(0, Number(product.price_after_discount) || 0)
  const safeDiscount = Math.min(basePrice, Math.max(0, voucherDiscount))
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    priceOriginal: Math.max(0, Number(product.price_before_discount) || 0),
    basePrice,
    voucherDiscount: safeDiscount,
    finalPrice: basePrice - safeDiscount,
  }
}

export async function calculateCart(input: {
  productId: string
  addonIds?: unknown
  voucherCode?: string | null
}): Promise<CalculatedCart> {
  if (!input.productId) throw new CommerceError('Produk wajib dipilih')

  const ids = uniqueProductIds(input.productId, input.addonIds)
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .in('id', ids)

  if (error) throw new CommerceError('Gagal memuat produk', 500)

  const products = (data || []) as Product[]
  const productById = new Map(products.map(product => [product.id, product]))
  const orderedProducts = ids.map(id => productById.get(id))

  if (orderedProducts.some(product => !product)) {
    throw new CommerceError('Salah satu produk tidak ditemukan')
  }
  if (orderedProducts.some(product => !product!.is_active || product!.is_coming_soon)) {
    throw new CommerceError('Salah satu produk belum tersedia')
  }

  const normalizedCode = input.voucherCode?.trim().toUpperCase() || null
  let voucher: Voucher | null = null

  if (normalizedCode) {
    const { data: voucherData, error: voucherError } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle()

    if (voucherError) throw new CommerceError('Gagal memvalidasi voucher', 500)
    if (!voucherData) throw new CommerceError('Kode voucher tidak valid atau sudah tidak aktif')
    voucher = voucherData as Voucher
  }

  const perProductDiscounts: Record<string, number> = {}
  for (const product of orderedProducts as Product[]) {
    let discount = 0
    if (voucher) {
      const restrictedIds = Array.isArray(voucher.applicable_products) ? voucher.applicable_products : []
      const eligible = restrictedIds.length === 0 || restrictedIds.includes(product.id)
      if (eligible) {
        const basePrice = Math.max(0, Number(product.price_after_discount) || 0)
        discount = voucher.discount_type === 'percentage'
          ? Math.round(basePrice * Math.max(0, voucher.discount_value) / 100)
          : Math.max(0, voucher.discount_value)
        discount = Math.min(basePrice, discount)
      }
    }
    perProductDiscounts[product.id] = discount
  }

  if (voucher && !Object.values(perProductDiscounts).some(discount => discount > 0)) {
    throw new CommerceError('Voucher ini tidak berlaku untuk produk yang dipilih')
  }

  const pricedProducts = (orderedProducts as Product[]).map(product =>
    toPricedProduct(product, perProductDiscounts[product.id] || 0)
  )
  const subtotal = pricedProducts.reduce((sum, product) => sum + product.basePrice, 0)
  const voucherDiscount = pricedProducts.reduce((sum, product) => sum + product.voucherDiscount, 0)

  return {
    main: pricedProducts[0],
    addons: pricedProducts.slice(1),
    voucherCode: voucher ? normalizedCode : null,
    voucherDiscount,
    subtotal,
    total: Math.max(0, subtotal - voucherDiscount),
    perProductDiscounts,
  }
}

type FulfillableOrder = {
  id: string
  product_id: string | null
  product_name: string
  full_name: string
  email: string
  price_original: number
  price_discounted: number
  addon_items: AddonItem[] | null
  status: string
  fulfillment_status: string
  confirmation_sent_at: string | null
}

export async function fulfillOrder(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, product_id, product_name, full_name, email, price_original, price_discounted, addon_items, status, fulfillment_status, confirmation_sent_at')
    .eq('id', orderId)
    .single()

  if (error || !data) throw new CommerceError('Order tidak ditemukan', 404)
  const order = data as FulfillableOrder
  if (order.status !== 'confirmed') throw new CommerceError('Order belum dikonfirmasi')
  if (order.fulfillment_status === 'fulfilled' && order.confirmation_sent_at) return

  const { data: claimed, error: claimError } = await supabaseAdmin
    .from('orders')
    .update({ fulfillment_status: 'processing' })
    .eq('id', order.id)
    .neq('fulfillment_status', 'processing')
    .select('id')
    .maybeSingle()

  if (claimError) throw new CommerceError('Gagal memulai fulfillment', 500)
  if (!claimed) return

  const addons = Array.isArray(order.addon_items) ? order.addon_items : []
  const accessRows = [
    ...(order.product_id ? [{ product_id: order.product_id }] : []),
    ...addons.filter(addon => addon.id).map(addon => ({ product_id: addon.id })),
  ].map(item => ({
    email: order.email.toLowerCase().trim(),
    product_id: item.product_id,
    order_id: order.id,
  }))

  try {
    if (accessRows.length > 0) {
      const { error: accessError } = await supabaseAdmin
        .from('course_access_emails')
        .upsert(accessRows, { onConflict: 'email,product_id' })
      if (accessError) throw accessError
    }

    if (!order.confirmation_sent_at) {
      await sendCourseAccessEmail({
        email: order.email,
        fullName: order.full_name,
        productName: order.product_name,
        orderId: order.id,
        priceOriginal: order.price_original || 0,
        priceDiscounted: order.price_discounted || 0,
        addonItems: addons,
      })
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        fulfillment_status: 'fulfilled',
        confirmation_sent_at: order.confirmation_sent_at || new Date().toISOString(),
      })
      .eq('id', order.id)
    if (updateError) throw updateError
  } catch (error) {
    await supabaseAdmin
      .from('orders')
      .update({ fulfillment_status: 'email_failed' })
      .eq('id', order.id)
    throw error
  }
}

export async function revokeOrderAccess(orderId: string) {
  const { error: revokeError } = await supabaseAdmin
    .from('course_access_emails')
    .delete()
    .eq('order_id', orderId)
  if (revokeError) throw new CommerceError('Gagal mencabut akses order', 500)

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ fulfillment_status: 'pending', confirmation_sent_at: null })
    .eq('id', orderId)
  if (updateError) throw new CommerceError('Gagal memperbarui fulfillment order', 500)
}
