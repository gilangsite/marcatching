'use client'

import { useRouter } from 'next/navigation'
import { X, ArrowRight, Sparkles } from 'lucide-react'
import type { PromotionWithProduct } from '@/lib/supabaseClient'
import { usePromotionCountdown } from '@/lib/usePromotionCountdown'
import styles from './course.module.css'

function formatRp(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

function imageUrl(url: string) {
  return url.includes('drive.google.com/uc')
    ? `${url.replace(/uc\?export=view&id=/, 'thumbnail?id=')}&sz=w900-h1500`
    : url
}

export default function PromotionSection({
  promotion,
  onClose,
  onExpire,
}: {
  promotion: PromotionWithProduct
  onClose: () => void
  onExpire: () => void
}) {
  const router = useRouter()
  const countdown = usePromotionCountdown(promotion.ends_at, onExpire)

  return (
    <section className={styles.promotionSection}>
      <button className={styles.promotionClose} onClick={onClose} aria-label="Tutup promosi"><X size={16} /></button>
      {promotion.product.image_url && (
        <div className={styles.promotionVisual}>
          {/* Product cover URLs are administered content and can use providers outside Next Image allowlists. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl(promotion.product.image_url)} alt={promotion.product.name} />
          {promotion.product.discount_percentage > 0 && (
            <span className={styles.promotionDiscountBadge}>-{promotion.product.discount_percentage}%</span>
          )}
        </div>
      )}
      <div className={styles.promotionCopy}>
        <span className={styles.cardKicker}><Sparkles size={13} /> Promo</span>
        <h2>{promotion.headline}</h2>
        {promotion.description && <p>{promotion.description}</p>}
        {countdown && !countdown.expired && (
          <div className={styles.promotionCountdown}>
            {countdown.days} hari, {countdown.hours} jam, {countdown.minutes} menit, {countdown.seconds} detik
          </div>
        )}
        <div className={styles.promotionPricing}>
          {promotion.product.discount_percentage > 0 && (
            <span className={styles.promotionOldPrice}>{formatRp(promotion.product.price_before_discount)}</span>
          )}
          <strong>{formatRp(promotion.product.price_after_discount)}</strong>
        </div>
      </div>
      <div className={styles.promotionActions}>
        <button className={styles.primaryButton} onClick={() => router.push(`/product/${promotion.product.slug}/checkout`)}>
          Checkout Product <ArrowRight size={16} />
        </button>
        <button className={styles.secondaryButton} onClick={onClose}>Close Promotion</button>
      </div>
    </section>
  )
}
