import { NextRequest, NextResponse } from 'next/server'
import { hasValidAdminSession } from '@/lib/adminSession'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const FINANCE_SCRIPT_FALLBACK = 'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'
const MIDTRANS_FINANCE_PREFIX = 'MIDTRANS-'

type FinanceRow = {
  id: string
  nominal: number
  [key: string]: unknown
}

type ScriptResult = {
  status?: string
  message?: string
  rows?: FinanceRow[]
  [key: string]: unknown
}

function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}

function financeScriptUrl() {
  return process.env.FINANCE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || FINANCE_SCRIPT_FALLBACK
}

async function proxyToScript(body: Record<string, unknown>): Promise<ScriptResult> {
  try {
    const res = await fetch(financeScriptUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'follow',
      cache: 'no-store',
    })

    const text = await res.text()
    if (!res.ok) throw new Error(`Finance Apps Script failed with ${res.status}`)

    try {
      const result = JSON.parse(text) as ScriptResult
      if (result.status !== 'success') throw new Error(result.message || 'Finance Apps Script action failed')
      return result
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error('Finance Apps Script returned invalid JSON')
      throw error
    }
  } catch (err) {
    console.error('Finance Apps Script proxy failed', err)
    throw err
  }
}

async function reconcileMidtransIncome(rows: FinanceRow[]) {
  const midtransOrderIds = [...new Set(rows
    .map(row => String(row.id || ''))
    .filter(id => id.startsWith(MIDTRANS_FINANCE_PREFIX))
    .map(id => id.slice(MIDTRANS_FINANCE_PREFIX.length))
    .filter(Boolean))]

  if (!midtransOrderIds.length) return { rows, reconciledRows: 0, repairs: [] as Array<{ id: string; nominal: number }> }

  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('midtrans_order_id,total_paid,payment_status')
    .in('midtrans_order_id', midtransOrderIds)
  if (error) throw new Error('Finance order reconciliation failed')

  const paidAmountByOrder = new Map((orders || [])
    .filter(order => order.payment_status === 'paid')
    .map(order => [String(order.midtrans_order_id), Number(order.total_paid) || 0]))
  let reconciledRows = 0
  const repairs: Array<{ id: string; nominal: number }> = []
  const reconciled = rows.map(row => {
    const id = String(row.id || '')
    if (!id.startsWith(MIDTRANS_FINANCE_PREFIX)) return row
    const authoritative = paidAmountByOrder.get(id.slice(MIDTRANS_FINANCE_PREFIX.length))
    if (authoritative === undefined || authoritative === Number(row.nominal)) return row
    reconciledRows += 1
    repairs.push({ id, nominal: authoritative })
    return { ...row, nominal: authoritative }
  })

  return { rows: reconciled, reconciledRows, repairs }
}

// GET /api/finance?type=income|cost
export async function GET(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return unauthorized()
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'income'
  if (!['income', 'cost'].includes(type)) {
    return NextResponse.json({ status: 'error', rows: [], message: 'Finance type tidak valid' }, { status: 400 })
  }
  try {
    const data = await proxyToScript({ action: 'financeRead', sheetType: type })
    if (type === 'income') {
      const reconciliation = await reconcileMidtransIncome(Array.isArray(data.rows) ? data.rows : [])
      return NextResponse.json({ ...data, ...reconciliation }, { headers: { 'Cache-Control': 'no-store' } })
    }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return NextResponse.json({ status: 'error', rows: [], message: String(err) }, { status: 500 })
  }
}

// POST /api/finance  { sheetType, date, nominal, category, item, details, billing, status }
export async function POST(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return unauthorized()
  const body = await req.json() as Record<string, unknown>
  try {
    if (body.action === 'reconcile_midtrans') {
      const paymentSecret = process.env.APPS_SCRIPT_PAYMENT_SECRET
      if (!paymentSecret) throw new Error('Apps Script payment secret is not configured')
      const current = await proxyToScript({ action: 'financeRead', sheetType: 'income' })
      const reconciliation = await reconcileMidtransIncome(Array.isArray(current.rows) ? current.rows : [])
      if (!reconciliation.repairs.length) {
        return NextResponse.json({ status: 'success', repaired: 0 })
      }
      const result = await proxyToScript({
        action: 'financeReconcileMidtransV2',
        paymentSecret,
        repairs: reconciliation.repairs,
      })
      return NextResponse.json({ ...result, repaired: reconciliation.repairs.length })
    }
    const data = await proxyToScript({ ...body, action: 'financeAdd' })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ status: 'error', message: String(err) }, { status: 500 })
  }
}

// PATCH /api/finance  { sheetType, id, date, nominal, category, item, details, billing, status }
export async function PATCH(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return unauthorized()
  const body = await req.json() as Record<string, unknown>
  try {
    const data = await proxyToScript({ ...body, action: 'financeUpdate' })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ status: 'error', message: String(err) }, { status: 500 })
  }
}

// DELETE /api/finance  { sheetType, id }
export async function DELETE(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return unauthorized()
  const body = await req.json() as Record<string, unknown>
  try {
    const data = await proxyToScript({ ...body, action: 'financeDelete' })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ status: 'error', message: String(err) }, { status: 500 })
  }
}
