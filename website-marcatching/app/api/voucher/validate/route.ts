import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, productPrice } = body

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Kode voucher tidak boleh kosong' }, { status: 400 })
    }

    const { data: voucher, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single()

    if (error || !voucher) {
      return NextResponse.json({ valid: false, message: 'Kode voucher tidak valid atau sudah tidak aktif' })
    }

    // Calculate discount
    let discountAmount = 0
    if (voucher.discount_type === 'percentage') {
      discountAmount = Math.round((productPrice || 0) * voucher.discount_value / 100)
    } else {
      discountAmount = voucher.discount_value
    }

    return NextResponse.json({
      valid: true,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      discount_amount: discountAmount,
      message: `Voucher berhasil! Diskon ${voucher.discount_type === 'percentage' ? voucher.discount_value + '%' : 'Rp ' + voucher.discount_value.toLocaleString('id-ID')}`
    })

  } catch {
    return NextResponse.json({ valid: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
