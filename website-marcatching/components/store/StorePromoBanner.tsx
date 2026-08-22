'use client'

import { X, Sparkles } from 'lucide-react'
import type { PromotionWithProducts } from '@/lib/supabaseClient'
import { usePromotionCountdown } from '@/lib/usePromotionCountdown'
import PromotionProductCard from './PromotionProductCard'
import styles from '@/app/store/store.module.css'

export default function StorePromoBanner({
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
    <section className={styles.promoBanner}>
      <button className={styles.promoBannerClose} onClick={onClose} aria-label="Tutup promosi"><X size={16} /></button>
      <div className={styles.promoBannerHeader}>
        <span className={styles.promoBannerKicker}><Sparkles size={13} /> Promo</span>
        <h2>{promotion.headline}</h2>
        {promotion.description && <p>{promotion.description}</p>}
        {countdown && !countdown.expired && (
          <div className={styles.promoBannerCountdown}>
            {countdown.days} hari, {countdown.hours} jam, {countdown.minutes} menit, {countdown.seconds} detik
          </div>
        )}
      </div>
      {promotion.products.length > 0 && (
        <div className={styles.promoProductGrid}>
          {promotion.products.map(product => (
            <PromotionProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      <div className={styles.promoBannerFooter}>
        <button className={styles.promoBannerCloseBtn} onClick={onClose}>Close Promotion</button>
      </div>
    </section>
  )
}
