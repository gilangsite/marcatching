import { NextRequest, NextResponse } from 'next/server'
import { fulfillOrder, notifyPaidOrder } from '@/lib/commerce'
import { normalizeMidtransStatus, verifyMidtransSignature } from '@/lib/midtrans'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function stringField(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>
    const orderId = stringField(body.order_id)
    const statusCode = stringField(body.status_code)
    const grossAmount = stringField(body.gross_amount)
    const signatureKey = stringField(body.signature_key)
    const transactionStatus = stringField(body.transaction_status)
    const fraudStatus = stringField(body.fraud_status) || null

    if (!orderId || !statusCode || !grossAmount || !signatureKey || !transactionStatus) {
      return NextResponse.json({ message: 'Invalid notification' }, { status: 400 })
    }

    if (!verifyMidtransSignature({ orderId, statusCode, grossAmount, signatureKey })) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
    }

    if (orderId.startsWith('payment_notif_test_')) {
      return NextResponse.json({ received: true, test: true })
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, total_paid, payment_status, status, fulfillment_status, paid_at')
      .eq('midtrans_order_id', orderId)
      .maybeSingle()

    if (orderError || !order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    const receivedAmount = Number(grossAmount)
    if (!Number.isFinite(receivedAmount) || Math.abs(receivedAmount - Number(order.total_paid)) > 0.001) {
      return NextResponse.json({ message: 'Amount mismatch' }, { status: 400 })
    }

    const paymentStatus = normalizeMidtransStatus(transactionStatus, fraudStatus)
    if (!paymentStatus) {
      return NextResponse.json({ received: true, ignored: true })
    }

    const now = new Date().toISOString()
    const updatePayload: Record<string, unknown> = {
      payment_status: paymentStatus,
      midtrans_transaction_id: stringField(body.transaction_id) || null,
      payment_type: stringField(body.payment_type) || null,
      fraud_status: fraudStatus,
      payment_updated_at: now,
    }

    if (paymentStatus === 'paid') {
      updatePayload.status = 'confirmed'
      updatePayload.paid_at = order.paid_at || now
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id)

    if (updateError) {
      return NextResponse.json({ message: 'Order update failed' }, { status: 500 })
    }

    if (paymentStatus === 'paid') {
      try {
        await fulfillOrder(order.id)
      } catch {
        console.error('Paid order fulfillment failed')
        return NextResponse.json({ message: 'Fulfillment failed' }, { status: 500 })
      }
      try {
        await notifyPaidOrder(order.id)
      } catch {
        console.error('Paid order admin notification failed')
        return NextResponse.json({ message: 'Admin notification failed' }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  } catch {
    console.error('Midtrans notification processing failed')
    return NextResponse.json({ message: 'Notification processing failed' }, { status: 500 })
  }
}
