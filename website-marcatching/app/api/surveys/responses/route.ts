import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const surveyTitle = searchParams.get('surveyTitle')

  if (!surveyTitle) {
    return NextResponse.json({ error: 'surveyTitle is required' }, { status: 400 })
  }

  try {
    const payload = JSON.stringify({
      action: 'surveyRead',
      surveyTitle
    })

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: payload,
      redirect: 'follow',
      cache: 'no-store'
    })

    const text = await res.text()
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse GAS response:', text);
      return NextResponse.json({ error: 'Invalid response from Apps Script' }, { status: 500 });
    }

    if (data.status === 'success') {
      return NextResponse.json(data.data || []);
    } else {
      return NextResponse.json({ error: data.message || 'Error fetching data' }, { status: 400 });
    }
  } catch (err) {
    console.error('Survey read error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
