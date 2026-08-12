'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock3, Download, RefreshCw, XCircle } from 'lucide-react'
import styles from './status.module.css'

type OrderStatus = {
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'creation_failed' | 'legacy_confirmed'
  status: string
  amount: number
  productNames: string[]
  paidAt: string | null
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`
}

export default function PaymentStatusClient({
  orderId,
  publicStatusToken,
}: {
  orderId: string
  publicStatusToken: string
}) {
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pollCount = useRef(0)

  const loadStatus = useCallback(async () => {
    if (!orderId || !publicStatusToken) {
      setError('Informasi order tidak lengkap.')
      setLoading(false)
      return null
    }

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}/status?token=${encodeURIComponent(publicStatusToken)}`,
        { cache: 'no-store' },
      )
      const data = await response.json() as OrderStatus & { message?: string }
      if (!response.ok) throw new Error(data.message || 'Order tidak ditemukan')
      setOrder(data)
      setError('')
      return data
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Status pembayaran belum dapat dimuat.')
      return null
    } finally {
      setLoading(false)
    }
  }, [orderId, publicStatusToken])

  useEffect(() => {
    let cancelled = false
    let timer: number | undefined

    async function poll() {
      const current = await loadStatus()
      if (cancelled || !current || current.paymentStatus !== 'pending' || pollCount.current >= 12) return
      pollCount.current += 1
      timer = window.setTimeout(poll, 3000)
    }

    void poll()
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [loadStatus])

  const paymentStatus = order?.paymentStatus
  const isPaid = paymentStatus === 'paid' || paymentStatus === 'legacy_confirmed'
  const isPending = paymentStatus === 'pending'
  const isExpired = paymentStatus === 'expired'
  const isRefunded = paymentStatus === 'refunded'

  const title = isPaid
    ? 'Pembayaran berhasil'
    : isPending
      ? 'Menunggu pembayaran'
      : isExpired
        ? 'Pembayaran kedaluwarsa'
        : isRefunded
          ? 'Pembayaran direfund'
          : 'Pembayaran belum berhasil'

  const description = isPaid
    ? 'Pembayaran sudah terverifikasi. Akses course sedang atau sudah disiapkan untuk email checkout kamu.'
    : isPending
      ? 'Kami sedang menunggu konfirmasi pembayaran dari Midtrans. Status akan diperbarui otomatis.'
      : isExpired
        ? 'Sesi pembayaran telah berakhir. Kembali ke store untuk membuat checkout baru.'
        : isRefunded
          ? 'Transaksi tercatat sebagai refund. Hubungi tim Marcatching jika membutuhkan bantuan.'
          : 'Transaksi belum dapat diselesaikan. Kamu dapat kembali ke store dan mencoba checkout lagi.'

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={`${styles.iconWrap} ${isPaid ? styles.success : isPending ? styles.pending : styles.failed}`}>
          {isPaid ? <CheckCircle2 size={34} /> : isPending ? <Clock3 size={34} /> : <XCircle size={34} />}
        </div>

        {loading ? (
          <>
            <p className={styles.eyebrow}>Marcatching Payment</p>
            <h1>Memeriksa pembayaran...</h1>
          </>
        ) : (
          <>
            <p className={styles.eyebrow}>Marcatching Payment</p>
            <h1>{error || title}</h1>
            <p className={styles.description}>{error || description}</p>
          </>
        )}

        {order && (
          <div className={styles.summary}>
            <div>
              <span>Produk</span>
              <strong>{order.productNames.join(', ')}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatRupiah(order.amount)}</strong>
            </div>
            {order.paidAt && (
              <div>
                <span>Dibayar</span>
                <strong>{new Date(order.paidAt).toLocaleString('id-ID')}</strong>
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          {isPaid ? (
            <>
              <Link href="/course/login" className={styles.primaryAction}>Masuk ke Course</Link>
              <a
                href={`/api/orders/${encodeURIComponent(orderId)}/receipt?token=${encodeURIComponent(publicStatusToken)}`}
                className={styles.secondaryAction}
                download
              >
                <Download size={16} /> Download Receipt
              </a>
            </>
          ) : (
            <Link href="/store" className={styles.primaryAction}>Kembali ke Store</Link>
          )}
          {!isPaid && (
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => {
                pollCount.current = 0
                setLoading(true)
                void loadStatus()
              }}
            >
              <RefreshCw size={15} /> Refresh Status
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
