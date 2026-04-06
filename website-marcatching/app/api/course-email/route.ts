import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyPgS7ktSmOj_-0gFlCtDU4jiV8h8beSCFjULJsfLuEtEeZwRFMOHNb4Ehao1wI_Xji/exec'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, fullName, productName, orderId, allProducts, addonItems } = body

    if (!email || !fullName || !productName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payload = JSON.stringify({
      action: 'sendCourseEmail',
      email,
      fullName,
      productName,
      orderId,
      allProducts: allProducts || [{ name: productName, priceOriginal: 0, priceDiscounted: 0 }],
      addonItems: addonItems || [],
    })

    // Apps Script Web App requires redirect:follow — Vercel server fetch doesn't auto-follow POST redirects
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: payload,
      redirect: 'follow',
    })

    const responseText = await res.text()
    console.log('Apps Script sendCourseEmail response:', responseText)

    let data: { status?: string; message?: string }
    try {
      data = JSON.parse(responseText)
    } catch {
      // Apps Script returned non-JSON (e.g. redirect to login) — treat as error
      console.error('Apps Script non-JSON response:', responseText)
      return NextResponse.json({ error: 'Apps Script returned unexpected response: ' + responseText.slice(0, 200) }, { status: 500 })
    }

    if (data.status !== 'success') {
      return NextResponse.json({ error: data.message || 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('course-email error:', err)
    return NextResponse.json({ error: 'Internal server error: ' + String(err) }, { status: 500 })
  }
}
