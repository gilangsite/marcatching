import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import type { AddonItem } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      productId, productName, fullName, email, whatsapp,
      background, referralSource, voucherCode,
      priceOriginal, priceDiscounted, addonItems, addonTotal,
      voucherDiscount, totalPaid,
    } = body

    const addons: AddonItem[] = Array.isArray(addonItems) ? addonItems : []

    // Validate required fields
    if (!fullName || !email || !whatsapp || !productName) {
      return NextResponse.json({ success: false, message: 'Semua field wajib diisi' }, { status: 400 })
    }

    // 1. Insert order into Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        product_id: productId || null,
        product_name: productName,
        full_name: fullName,
        email,
        whatsapp,
        background: background || null,
        referral_source: referralSource || null,
        voucher_code: voucherCode || null,
        price_original: priceOriginal || 0,
        price_discounted: priceDiscounted || 0,
        addon_items: addons.length > 0 ? addons : [],
        voucher_discount: voucherDiscount || 0,
        total_paid: totalPaid || 0,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order insert error:', orderError)
      return NextResponse.json({ success: false, message: 'Gagal menyimpan pesanan: ' + orderError.message }, { status: 500 })
    }

    // NOTE: course_access_emails is NOT inserted here at checkout.
    // Access is only granted when admin confirms the order (toggleOrderStatus in admin page).
    // This prevents users from registering/activating their course account before payment is confirmed.

    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
      'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'

    // Build combined product list for emails
    const allProducts = [
      { name: productName, priceOriginal: priceOriginal || 0, priceDiscounted: priceDiscounted || 0 },
      ...addons.map(a => ({ name: a.name, priceOriginal: a.priceOriginal, priceDiscounted: a.priceDiscounted })),
    ]

    // 2. Send checkout data to Google Sheets + Confirmation Email + Admin Notification
    try {
      const payload = JSON.stringify({
        action: 'checkout',
        orderId: order.id,
        productName,
        fullName,
        email,
        whatsapp,
        background: background || '',
        referralSource: referralSource || '',
        voucherCode: voucherCode || '',
        priceOriginal: priceOriginal || 0,
        priceDiscounted: priceDiscounted || 0,
        addonItems: addons,
        addonTotal: addonTotal || 0,
        allProducts,
        voucherDiscount: voucherDiscount || 0,
        totalPaid: totalPaid || 0,
        status: 'pending',
      })
      const gsRes = await fetch(appScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: payload,
        redirect: 'follow',
      })
      const gsData = await gsRes.text()
      console.log('Apps Script Checkout Response:', gsData)
    } catch (sheetErr) {
      console.error('Apps Script checkout fetch error:', sheetErr)
    }

    // 3. Build WhatsApp redirect URL
    const productNamesArray = [productName, ...addons.map(a => a.name)]
    const waNumber = '62895412747584'
    let waText: string

    if (productNamesArray.length === 1) {
      // Single product — no numbered list
      waText = `Halo Marcatching, aku ${fullName} baru aja check out ${productNamesArray[0]} dan sudah melakukan pembayaran, aku tunggu konfirmasinya, ya! Terima kasih.`
    } else {
      // Multiple products — numbered list
      const numberedList = productNamesArray.map((name, i) => `${i + 1}. ${name}`).join('\n')
      waText = `Halo Marcatching, aku ${fullName} baru aja check out :\n\n${numberedList}\n\ndan sudah melakukan pembayaran, aku tunggu konfirmasinya, ya! Terima kasih.`
    }

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`

    return NextResponse.json({
      success: true,
      orderId: order.id,
      whatsappUrl: waUrl,
    })

  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
