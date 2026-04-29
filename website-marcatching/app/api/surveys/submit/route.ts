import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'

// POST /api/surveys/submit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { surveyId, surveyTitle, fullName, email, whatsapp, answers } = body

    if (!surveyId || !surveyTitle || !fullName) {
      return NextResponse.json({ error: 'surveyId, surveyTitle, and fullName are required' }, { status: 400 })
    }

    const payload = JSON.stringify({
      action: 'surveySubmit',
      surveyId,
      surveyTitle,
      fullName,
      email: email || '',
      whatsapp: whatsapp || '',
      answers: answers || [],
      submittedAt: new Date().toISOString(),
    })

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: payload,
      redirect: 'follow',
    })

    const text = await res.text()
    console.log('Survey submit GAS response:', text)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Survey submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
