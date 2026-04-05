import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyc5FDReHAFo7r_Bj62kzBoJZHKF75xaJwuuiU-6n4G24WrjylHmijOJm5OcazNJU1i/exec'

export async function POST(req: NextRequest) {
  try {
    const { email, fullName, productName, orderId } = await req.json()

    if (!email || !fullName || !productName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Send email via Google Apps Script
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'sendCourseEmail',
        email,
        fullName,
        productName,
        orderId,
      }),
    })

    const data = await res.json()

    if (data.status !== 'success') {
      return NextResponse.json({ error: data.message || 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('course-email error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
