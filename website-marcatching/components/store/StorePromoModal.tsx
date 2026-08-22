'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import type { PromotionWithProducts } from '@/lib/supabaseClient'
import { usePromotionCountdown } from '@/lib/usePromotionCountdown'
import PromotionProductCard from './PromotionProductCard'
import styles from './StorePromoModal.module.css'

interface StorePromoModalProps {
  isOpen: boolean
  promotion: PromotionWithProducts | null
  onClose: () => void
  onExpire: () => void
}

export default function StorePromoModal({ isOpen, promotion, onClose, onExpire }: StorePromoModalProps) {
  const countdown = usePromotionCountdown(promotion?.ends_at ?? null, onExpire)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!promotion) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={styles.backdrop}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={styles.card}
          >
            <button onClick={onClose} className={styles.closeBtn}>
              <X size={18} />
            </button>
            <div className={styles.header}>
              <span className={styles.kicker}>
                <Sparkles size={13} /> Promo
              </span>
              <h2 className={styles.headline}>{promotion.headline}</h2>
              {promotion.description && <p className={styles.description}>{promotion.description}</p>}
              {countdown && !countdown.expired && (
                <div className={styles.countdown}>
                  {countdown.days} hari, {countdown.hours} jam, {countdown.minutes} menit, {countdown.seconds} detik
                </div>
              )}
            </div>
            {promotion.products.length > 0 && (
              <div className={styles.productGrid}>
                {promotion.products.map(product => (
                  <PromotionProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <div className={styles.footer}>
              <button onClick={onClose} className={styles.closeActionBtn}>
                Close Promotion
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
