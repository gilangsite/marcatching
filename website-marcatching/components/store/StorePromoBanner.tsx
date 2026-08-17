'use client'

import Image from 'next/image'
import { X, ArrowRight, Sparkles } from 'lucide-react'
import type { PromotionWithProduct } from '@/lib/supabaseClient'
import { usePromotionCountdown } from '@/lib/usePromotionCountdown'
import styles from '@/app/store/store.module.css'

function formatRp(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

function getDriveThumb(url: string | null | undefined, size = 'w800-h1000') {
  if (!url) return null
  if (url.includes('drive.google.com/uc')) {
    const m = url.match(/id=([^&]+)/)
    if (m?.[1]) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=${size}`
  }
  return url
}

export default function StorePromoBanner({
  promotion,
  onClose,
  onExpire,
}: {
  promotion: PromotionWithProduct
  onClose: () => void
  onExpire: () => void
}) {
  const countdown = usePromotionCountdown(promotion.ends_at, onExpire)
  const thumb = getDriveThumb(promotion.product.image_url)

  return (
    <section className={styles.promoBanner}>
      <button className={styles.promoBannerClose} onClick={onClose} aria-label="Tutup promosi"><X size={16} /></button>
      {thumb && (
        <div className={styles.promoBannerVisual}>
          <Image src={thumb} alt={promotion.product.name} fill className={styles.promoBannerVisualImg} sizes="112px" />
          {promotion.product.discount_percentage > 0 && (
            <span className={styles.promoBannerDiscountBadge}>-{promotion.product.discount_percentage}%</span>
          )}
        </div>
      )}
      <div className={styles.promoBannerCopy}>
        <span className={styles.promoBannerKicker}><Sparkles size={13} /> Promo</span>
        <h2>{promotion.headline}</h2>
        {promotion.description && <p>{promotion.description}</p>}
        {countdown && !countdown.expired && (
          <div className={styles.promoBannerCountdown}>
            {countdown.days} hari, {countdown.hours} jam, {countdown.minutes} menit, {countdown.seconds} detik
          </div>
        )}
        <div className={styles.promoBannerPricing}>
          {promotion.product.discount_percentage > 0 && (
            <span className={styles.promoBannerOldPrice}>{formatRp(promotion.product.price_before_discount)}</span>
          )}
          <strong>{formatRp(promotion.product.price_after_discount)}</strong>
        </div>
      </div>
      <div className={styles.promoBannerActions}>
        <a className={styles.promoBannerCheckoutBtn} href={`/product/${promotion.product.slug}/checkout`}>
          Checkout Product <ArrowRight size={16} />
        </a>
        <button className={styles.promoBannerCloseBtn} onClick={onClose}>Close Promotion</button>
      </div>
    </section>
  )
}
