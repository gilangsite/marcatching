import { NextRequest, NextResponse } from 'next/server'
import { calculateCart, CommerceError } from '@/lib/commerce'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
    const productIds = Array.isArray(body.productIds)
      ? body.productIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : []

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Kode voucher tidak boleh kosong' }, { status: 400 })
    }
    if (productIds.length === 0) {
      return NextResponse.json({ valid: false, message: 'Pilih produk terlebih dahulu' }, { status: 400 })
    }

    const cart = await calculateCart({
      productId: productIds[0],
      addonIds: productIds.slice(1),
      voucherCode: code,
    })
    const eligibleProductCount = Object.values(cart.perProductDiscounts)
      .filter(discount => discount > 0).length

    return NextResponse.json({
      valid: true,
      code: cart.voucherCode,
      totalDiscount: cart.voucherDiscount,
      discounts: cart.perProductDiscounts,
      eligibleProductCount,
      message: `Voucher berhasil diterapkan ke ${eligibleProductCount} produk.`,
    })
  } catch (error) {
    if (error instanceof CommerceError) {
      return NextResponse.json({ valid: false, message: error.message }, { status: error.status >= 500 ? 500 : 200 })
    }
    return NextResponse.json({ valid: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
