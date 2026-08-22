'use client'

import { X, Sparkles } from 'lucide-react'
import type { PromotionWithProducts } from '@/lib/supabaseClient'
import { usePromotionCountdown } from '@/lib/usePromotionCountdown'
import PromotionProductCard from './PromotionProductCard'
import styles from './course.module.css'

export default function PromotionSection({
  promotion,
  onClose,
  onExpire,
}: {
  promotion: PromotionWithProducts
  onClose: () => void
  onExpire: () => void
}) {
  const countdown = usePromotionCountdown(promotion.ends_at, onExpire)

  return (
    <section className={styles.promotionSection}>
      <button className={styles.promotionClose} onClick={onClose} aria-label="Tutup promosi"><X size={16} /></button>
      <div className={styles.promotionHeader}>
        <span className={styles.cardKicker}><Sparkles size={13} /> Promo</span>
        <h2>{promotion.headline}</h2>
        {promotion.description && <p>{promotion.description}</p>}
        {countdown && !countdown.expired && (
          <div className={styles.promotionCountdown}>
            {countdown.days} hari, {countdown.hours} jam, {countdown.minutes} menit, {countdown.seconds} detik
          </div>
        )}
      </div>
      {promotion.products.length > 0 && (
        <div className={styles.promotionProductGrid}>
          {promotion.products.map(product => (
            <PromotionProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      <div className={styles.promotionFooter}>
        <button className={styles.secondaryButton} onClick={onClose}>Close Promotion</button>
      </div>
    </section>
  )
}
