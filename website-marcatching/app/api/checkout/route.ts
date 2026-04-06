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

    // 2. Grant course_access_emails for main product
    if (productId) {
      await supabase.from('course_access_emails').upsert({
        email,
        product_id: productId,
        order_id: order.id,
      }, { onConflict: 'email,product_id' })
    }

    // 3. Grant course_access_emails for each add-on
    for (const addon of addons) {
      if (addon.id) {
        await supabase.from('course_access_emails').upsert({
          email,
          product_id: addon.id,
          order_id: order.id,
        }, { onConflict: 'email,product_id' })
      }
    }

    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
      'https://script.google.com/macros/s/AKfycbwANc8E0UDnlAirU98ynu2JJrf6zCLQCsDZuF9N0ecCB-MbO23GXVNFHFRSb0WlvCiE/exec'

    // Build combined product list for emails
    const allProducts = [
      { name: productName, priceOriginal: priceOriginal || 0, priceDiscounted: priceDiscounted || 0 },
      ...addons.map(a => ({ name: a.name, priceOriginal: a.priceOriginal, priceDiscounted: a.priceDiscounted })),
    ]

    // 4. Send checkout data to Google Sheets + Confirmation Email
    try {
      await fetch(appScriptUrl, {
        method: 'POST',
        body: JSON.stringify({
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
        }),
      })
    } catch (sheetErr) {
      console.error('Apps Script checkout error:', sheetErr)
    }

    // 5. Send admin notification email
    try {
      await fetch(appScriptUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'notifyAdmin',
          orderId: order.id,
          productName,
          fullName,
          email,
          whatsapp,
          voucherCode: voucherCode || '',
          priceOriginal: priceOriginal || 0,
          priceDiscounted: priceDiscounted || 0,
          addonItems: addons,
          addonTotal: addonTotal || 0,
          allProducts,
          voucherDiscount: voucherDiscount || 0,
          totalPaid: totalPaid || 0,
        }),
      })
    } catch (adminNotifyErr) {
      console.error('Admin notify error:', adminNotifyErr)
    }

    // 6. Build WhatsApp redirect URL — list all products
    const allProductNames = [productName, ...addons.map(a => a.name)].join(', ')
    const waNumber = '62895412747584'
    const waMessage = encodeURIComponent(
      `Halo Marcatching, aku "${fullName}" baru aja check out "${allProductNames}", dan sudah melakukan pembayaran, aku tunggu konfirmasinya, ya! Terima kasih.`
    )
    const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`

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
