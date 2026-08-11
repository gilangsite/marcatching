import { NextRequest, NextResponse } from 'next/server'
import { hasValidAdminSession } from '@/lib/adminSession'
import { sendCourseAccessEmail } from '@/lib/courseEmail'
import type { AddonItem } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  if (!await hasValidAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as Record<string, unknown>
    const email = typeof body.email === 'string' ? body.email : ''
    const fullName = typeof body.fullName === 'string' ? body.fullName : ''
    const productName = typeof body.productName === 'string' ? body.productName : ''
    const orderId = typeof body.orderId === 'string' ? body.orderId : ''
    const addonItems = Array.isArray(body.addonItems) ? body.addonItems as AddonItem[] : []
    const allProducts = Array.isArray(body.allProducts) ? body.allProducts as Array<Record<string, unknown>> : []

    if (!email || !fullName || !productName || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await sendCourseAccessEmail({
      email,
      fullName,
      productName,
      orderId,
      priceOriginal: Number(allProducts[0]?.priceOriginal) || 0,
      priceDiscounted: Number(allProducts[0]?.priceDiscounted) || 0,
      addonItems,
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send course access email' }, { status: 500 })
  }
}
