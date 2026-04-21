import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || ''

async function proxyToScript(body: object) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  return res.json()
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
