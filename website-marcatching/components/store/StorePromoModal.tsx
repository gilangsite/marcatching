'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Sparkles } from 'lucide-react'
import type { PromotionWithProduct } from '@/lib/supabaseClient'
import { usePromotionCountdown } from '@/lib/usePromotionCountdown'

interface StorePromoModalProps {
  isOpen: boolean
  promotion: PromotionWithProduct | null
  onClose: () => void
  onExpire: () => void
}

function formatRp(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

function getDriveThumb(url: string | null | undefined, size = 'w1400-h1400') {
  if (!url) return null
  if (url.includes('drive.google.com/uc')) {
    const m = url.match(/id=([^&]+)/)
    if (m?.[1]) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=${size}`
  }
  return url
}

export default function StorePromoModal({ isOpen, promotion, onClose, onExpire }: StorePromoModalProps) {
  const countdown = usePromotionCountdown(promotion?.ends_at ?? null, onExpire)
  const thumb = promotion ? getDriveThumb(promotion.product.image_url) : null

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!promotion) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              width: '100%',
              maxWidth: thumb ? '720px' : '480px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              display: 'grid',
              gridTemplateColumns: thumb ? 'minmax(140px, 3fr) minmax(0, 5fr)' : '1fr',
            }}
          >
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, background: '#ffffff', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)' }}
            >
              <X size={18} />
            </button>
            {thumb && (
              <div style={{ position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>
                <Image src={thumb} alt={promotion.product.name} fill style={{ objectFit: 'cover' }} sizes="288px" />
                {promotion.product.discount_percentage > 0 && (
                  <span style={{ position: 'absolute', top: 12, left: 12, padding: '4px 12px', borderRadius: 999, background: '#dc2626', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700 }}>
                    -{promotion.product.discount_percentage}%
                  </span>
                )}
              </div>
            )}
            <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0d3369', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <Sparkles size={13} /> Promo
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0d3369', margin: '10px 0 8px' }}>{promotion.headline}</h2>
              {promotion.description && <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 16px', lineHeight: 1.5 }}>{promotion.description}</p>}
              {countdown && !countdown.expired && (
                <div style={{ color: '#0d3369', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 16px' }}>
                  {countdown.days} hari, {countdown.hours} jam, {countdown.minutes} menit, {countdown.seconds} detik
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 24 }}>
                {promotion.product.discount_percentage > 0 && (
                  <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '0.9rem' }}>{formatRp(promotion.product.price_before_discount)}</span>
                )}
                <strong style={{ color: '#0d3369', fontSize: '1.3rem' }}>{formatRp(promotion.product.price_after_discount)}</strong>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a
                  href={`/product/${promotion.product.slug}/checkout`}
                  style={{ flex: 1, background: '#0d3369', color: '#ffffff', fontWeight: 700, padding: '12px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  Checkout Product <ArrowRight size={16} />
                </a>
                <button
                  onClick={onClose}
                  style={{ background: '#f1f5f9', color: '#64748b', fontWeight: 600, padding: '12px 20px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
                >
                  Close Promotion
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
