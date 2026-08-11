import 'server-only'

import type { AddonItem } from '@/lib/supabaseClient'

const FALLBACK_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'

function getAppsScriptUrl() {
  return process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || FALLBACK_APPS_SCRIPT_URL
}

async function postToAppsScript(payload: Record<string, unknown>) {
  const response = await fetch(getAppsScriptUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload),
    redirect: 'follow',
    cache: 'no-store',
  })

  if (!response.ok) throw new Error('Apps Script request failed')
  return response.text()
}

export async function sendCourseAccessEmail(input: {
  email: string
  fullName: string
  productName: string
  orderId: string
  priceOriginal: number
  priceDiscounted: number
  addonItems: AddonItem[]
}) {
  const allProducts = [
    {
      name: input.productName,
      priceOriginal: input.priceOriginal,
      priceDiscounted: input.priceDiscounted,
    },
    ...input.addonItems.map(addon => ({
      name: addon.name,
      priceOriginal: addon.priceOriginal,
      priceDiscounted: addon.priceDiscounted,
    })),
  ]

  const responseText = await postToAppsScript({
    action: 'sendCourseEmail',
    email: input.email,
    fullName: input.fullName,
    productName: input.productName,
    orderId: input.orderId,
    allProducts,
    addonItems: input.addonItems,
  })

  let result: { status?: string; message?: string }
  try {
    result = JSON.parse(responseText) as { status?: string; message?: string }
  } catch {
    throw new Error('Apps Script returned an invalid email response')
  }

  if (result.status !== 'success') {
    throw new Error(result.message || 'Course access email failed')
  }
}

export type CheckoutNotificationInput = {
  orderId: string
  productName: string
  fullName: string
  email: string
  whatsapp: string
  background: string
  referralSource: string
  voucherCode: string | null
  priceOriginal: number
  priceDiscounted: number
  addonItems: AddonItem[]
  voucherDiscount: number
  totalPaid: number
  paidAt?: string | null
  paymentType?: string | null
  midtransOrderId?: string | null
  midtransTransactionId?: string | null
}

function checkoutNotificationPayload(input: CheckoutNotificationInput) {
  const addonTotal = input.addonItems.reduce((sum, item) => sum + item.priceDiscounted, 0)
  const allProducts = [
    { name: input.productName, priceOriginal: input.priceOriginal, priceDiscounted: input.priceDiscounted },
    ...input.addonItems.map(item => ({
      name: item.name,
      priceOriginal: item.priceOriginal,
      priceDiscounted: item.priceDiscounted,
    })),
  ]

  return {
    orderId: input.orderId,
    productName: input.productName,
    fullName: input.fullName,
    email: input.email,
    whatsapp: input.whatsapp,
    background: input.background,
    referralSource: input.referralSource,
    voucherCode: input.voucherCode || '',
    priceOriginal: input.priceOriginal,
    priceDiscounted: input.priceDiscounted,
    addonItems: input.addonItems,
    addonTotal,
    allProducts,
    voucherDiscount: input.voucherDiscount,
    totalPaid: input.totalPaid,
    paidAt: input.paidAt || '',
    paymentType: input.paymentType || '',
    midtransOrderId: input.midtransOrderId || '',
    midtransTransactionId: input.midtransTransactionId || '',
  }
}

export async function recordCheckout(input: CheckoutNotificationInput) {
  await postToAppsScript({
    action: 'checkout',
    ...checkoutNotificationPayload(input),
    status: 'pending',
  })
}

export async function notifyPaidCheckout(input: CheckoutNotificationInput) {
  const paymentSecret = process.env.APPS_SCRIPT_PAYMENT_SECRET
  if (!paymentSecret) throw new Error('Apps Script payment secret is not configured')

  const responseText = await postToAppsScript({
    action: 'paymentPaid',
    ...checkoutNotificationPayload(input),
    status: 'paid',
    paymentSecret,
  })

  let result: { status?: string; message?: string }
  try {
    result = JSON.parse(responseText) as { status?: string; message?: string }
  } catch {
    throw new Error('Apps Script returned an invalid paid-order response')
  }

  if (result.status !== 'success') {
    throw new Error(result.message || 'Paid-order admin notification failed')
  }
}
