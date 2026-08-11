import 'server-only'

import { createHash, timingSafeEqual } from 'node:crypto'

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded'

export type MidtransItem = {
  id: string
  price: number
  quantity: number
  name: string
  brand?: string
  category?: string
}

export type CreateSnapPayload = {
  transaction_details: {
    order_id: string
    gross_amount: number
  }
  item_details: MidtransItem[]
  customer_details: {
    first_name: string
    email: string
    phone: string
  }
  credit_card: { secure: boolean }
  callbacks?: { finish: string }
}

type SnapTransactionResponse = {
  token?: string
  redirect_url?: string
}

function getServerKey() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY is not configured')
  return serverKey
}

function isProduction() {
  return process.env.NEXT_PUBLIC_MIDTRANS_ENV === 'production'
}

export function getSnapScriptUrl() {
  return isProduction()
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'
}

function getSnapTransactionUrl() {
  return isProduction()
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'
}

export async function createSnapTransaction(payload: CreateSnapPayload) {
  const authorization = Buffer.from(`${getServerKey()}:`).toString('base64')
  const response = await fetch(getSnapTransactionUrl(), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${authorization}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  if (!response.ok) {
    console.error('Midtrans transaction creation failed with status', response.status)
    throw new Error('Midtrans transaction creation failed')
  }

  const data = await response.json() as SnapTransactionResponse
  if (!data.token || !data.redirect_url) {
    throw new Error('Midtrans returned an incomplete transaction response')
  }

  return { token: data.token, redirectUrl: data.redirect_url }
}

export function verifyMidtransSignature(input: {
  orderId: string
  statusCode: string
  grossAmount: string
  signatureKey: string
}) {
  const expected = createHash('sha512')
    .update(`${input.orderId}${input.statusCode}${input.grossAmount}${getServerKey()}`)
    .digest('hex')

  const expectedBuffer = Buffer.from(expected, 'utf8')
  const receivedBuffer = Buffer.from(input.signatureKey, 'utf8')
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer)
}

export function normalizeMidtransStatus(transactionStatus: string, fraudStatus?: string | null): PaymentStatus | null {
  if (transactionStatus === 'settlement') return 'paid'
  if (transactionStatus === 'capture') return fraudStatus === 'accept' ? 'paid' : 'pending'
  if (transactionStatus === 'pending') return 'pending'
  if (transactionStatus === 'deny' || transactionStatus === 'cancel') return 'failed'
  if (transactionStatus === 'expire') return 'expired'
  if (transactionStatus === 'refund' || transactionStatus === 'partial_refund') return 'refunded'
  return null
}
