import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { calculateCart, CommerceError, fulfillOrder, notifyPaidOrder } from '@/lib/commerce'
import { recordCheckout } from '@/lib/courseEmail'
import { createSnapTransaction, type MidtransItem } from '@/lib/midtrans'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { AddonItem } from '@/lib/supabaseClient'

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function statusUrl(req: NextRequest, orderId: string, token: string) {
  const url = new URL('/payment/status', req.nextUrl.origin)
  url.searchParams.set('order', orderId)
  url.searchParams.set('token', token)
  return url.toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>
    const productId = cleanText(body.productId, 64)
    const voucherCode = cleanText(body.voucherCode, 64).toUpperCase()
    const fullName = cleanText(body.fullName, 120)
    const email = cleanText(body.email, 180).toLowerCase()
    const whatsapp = cleanText(body.whatsapp, 40)
    const background = cleanText(body.background, 200)
    const referralSource = cleanText(body.referralSource, 200)

    if (!productId || !fullName || !email || !whatsapp || !background || !referralSource) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 400 })
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: 'Format email belum valid' }, { status: 400 })
    }

    const cart = await calculateCart({
      productId,
      addonIds: body.addonIds,
      voucherCode: voucherCode || null,
    })

    const orderId = randomUUID()
    const publicStatusToken = randomUUID()
    const midtransOrderId = `MRC-${orderId}`
    const addonItems: AddonItem[] = cart.addons.map(addon => ({
      id: addon.id,
      name: addon.name,
      priceOriginal: addon.priceOriginal,
      priceDiscounted: addon.basePrice,
    }))

    const { error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: orderId,
        product_id: cart.main.id,
        product_name: cart.main.name,
        full_name: fullName,
        email,
        whatsapp,
        background,
        referral_source: referralSource,
        voucher_code: cart.voucherCode,
        price_original: cart.main.priceOriginal,
        price_discounted: cart.main.basePrice,
        addon_items: addonItems,
        voucher_discount: cart.voucherDiscount,
        total_paid: cart.total,
        status: 'pending',
        midtrans_order_id: midtransOrderId,
        payment_status: 'pending',
        fulfillment_status: 'pending',
        public_status_token: publicStatusToken,
      })

    if (insertError) {
      console.error('Checkout order insert failed')
      return NextResponse.json({ message: 'Pesanan belum berhasil dibuat' }, { status: 500 })
    }

    void supabaseAdmin.rpc('increment_checkout_clicks', { product_id_arg: cart.main.id })

    const localStatusUrl = statusUrl(req, orderId, publicStatusToken)

    if (cart.total === 0) {
      const now = new Date().toISOString()
      const { error: freeOrderError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          paid_at: now,
          payment_updated_at: now,
        })
        .eq('id', orderId)

      if (freeOrderError) {
        return NextResponse.json({ message: 'Pesanan gratis belum berhasil dikonfirmasi' }, { status: 500 })
      }

      try {
        await fulfillOrder(orderId)
      } catch {
        console.error('Free order fulfillment failed')
      }

      try {
        await notifyPaidOrder(orderId)
      } catch {
        console.error('Free order admin notification failed')
      }

      return NextResponse.json({
        orderId,
        publicStatusToken,
        snapToken: null,
        redirectUrl: null,
      })
    }

    const itemDetails: MidtransItem[] = [
      {
        id: cart.main.id.slice(0, 50),
        price: cart.main.basePrice,
        quantity: 1,
        name: cart.main.name.slice(0, 50),
        brand: 'Marcatching',
        category: 'Digital Product',
      },
      ...cart.addons.map(addon => ({
        id: addon.id.slice(0, 50),
        price: addon.basePrice,
        quantity: 1,
        name: addon.name.slice(0, 50),
        brand: 'Marcatching',
        category: 'Digital Product',
      })),
    ]

    if (cart.voucherDiscount > 0) {
      itemDetails.push({
        id: `VOUCHER-${orderId}`.slice(0, 50),
        price: -cart.voucherDiscount,
        quantity: 1,
        name: `Voucher ${cart.voucherCode || ''}`.trim().slice(0, 50),
      })
    }

    try {
      const transaction = await createSnapTransaction({
        transaction_details: {
          order_id: midtransOrderId,
          gross_amount: cart.total,
        },
        item_details: itemDetails,
        customer_details: {
          first_name: fullName.slice(0, 50),
          email,
          phone: whatsapp,
        },
        credit_card: { secure: true },
        callbacks: { finish: localStatusUrl },
      })

      const { error: tokenSaveError } = await supabaseAdmin
        .from('orders')
        .update({
          snap_token: transaction.token,
          payment_redirect_url: transaction.redirectUrl,
          payment_updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (tokenSaveError) throw tokenSaveError

      try {
        await recordCheckout({
          orderId,
          productName: cart.main.name,
          fullName,
          email,
          whatsapp,
          background,
          referralSource,
          voucherCode: cart.voucherCode,
          priceOriginal: cart.main.priceOriginal,
          priceDiscounted: cart.main.basePrice,
          addonItems,
          voucherDiscount: cart.voucherDiscount,
          totalPaid: cart.total,
          midtransOrderId,
          paymentUrl: transaction.redirectUrl,
        })
      } catch {
        console.error('Checkout Apps Script recording failed')
      }

      return NextResponse.json({
        orderId,
        publicStatusToken,
        snapToken: transaction.token,
        redirectUrl: transaction.redirectUrl,
      })
    } catch {
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'creation_failed',
          payment_updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
      return NextResponse.json({ message: 'Sesi pembayaran belum berhasil dibuat. Silakan coba lagi.' }, { status: 502 })
    }
  } catch (error) {
    if (error instanceof CommerceError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }
    console.error('Checkout request failed')
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
