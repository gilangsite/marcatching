import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      productId, productName, fullName, email, whatsapp,
      background, referralSource, voucherCode,
      priceOriginal, priceDiscounted, voucherDiscount, totalPaid,
    } = body

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

    // 2. Send checkout data to Google Sheets + Email via Apps Script
    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz9ieB6Tvnz6EBhUh-E2JSHbgL5Nxen7r50VgsGnycH3teRo5uWLCsST-x6I2NdV3Ku/exec'
    
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
          voucherDiscount: voucherDiscount || 0,
          totalPaid: totalPaid || 0,
          status: 'pending',
        }),
      })
    } catch (sheetErr) {
      console.error('Apps Script error:', sheetErr)
      // Don't fail the whole request if sheets/email fails
    }

    // 3. Build WhatsApp redirect URL
    const waNumber = '62895412747584' // 0895412747584 → 62...
    const waMessage = encodeURIComponent(
      `Halo Marcatching, aku "${fullName}" baru aja check out "${productName}", dan sudah melakukan pembayaran, aku tunggu konfirmasinya, ya! Terima kasih.`
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
