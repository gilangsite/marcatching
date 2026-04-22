import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYB7gmDbz_bZPD6TiABrd9g95VEvZ4_psIDcm5smDGFJU52koC5scR6Bl0whF_iMLR/exec';

async function proxyToScript(body: object) {
  try {
    console.log('--- Proxing to GAS ---')
    console.log('Action:', (body as any).action)
    
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'follow', // Explicitly follow redirects
      cache: 'no-store',
    })

    const text = await res.text()
    console.log('GAS Response Status:', res.status)
    
    try {
      return JSON.parse(text)
    } catch (e) {
      console.error('GAS Response not JSON:', text)
      throw new Error(`Invalid JSON from GAS: ${text.substring(0, 100)}`)
    }
  } catch (err) {
    console.error('Proxy Error:', err)
    throw err
  }
}

// GET /api/finance?type=income|cost
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'income'
  try {
    const data = await proxyToScript({ action: 'financeRead', sheetType: type })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ status: 'error', rows: [], message: String(err) }, { status: 500 })
  }
}

// POST /api/finance  { sheetType, date, nominal, category, item, details, billing, status }
export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    const data = await proxyToScript({ action: 'financeAdd', ...body })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ status: 'error', message: String(err) }, { status: 500 })
  }
}

// PATCH /api/finance  { sheetType, id, date, nominal, category, item, details, billing, status }
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  try {
    const data = await proxyToScript({ action: 'financeUpdate', ...body })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ status: 'error', message: String(err) }, { status: 500 })
  }
}

// DELETE /api/finance  { sheetType, id }
export async function DELETE(req: NextRequest) {
  const body = await req.json()
  try {
    const data = await proxyToScript({ action: 'financeDelete', ...body })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ status: 'error', message: String(err) }, { status: 500 })
  }
}
