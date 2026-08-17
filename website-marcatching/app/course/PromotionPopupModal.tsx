'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { PromotionWithProduct } from '@/lib/supabaseClient'
import { usePromotionCountdown } from '@/lib/usePromotionCountdown'

interface PromotionPopupModalProps {
  isOpen: boolean
  promotion: PromotionWithProduct | null
  onClose: () => void
  onExpire: () => void
}

function formatRp(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

function imageUrl(url: string) {
  return url.includes('drive.google.com/uc')
    ? `${url.replace(/uc\?export=view&id=/, 'thumbnail?id=')}&sz=w900-h1500`
    : url
}

export function PromotionPopupModal({ isOpen, promotion, onClose, onExpire }: PromotionPopupModalProps) {
  const router = useRouter()
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 4, 7, 0.85)', backdropFilter: 'blur(8px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              background: '#111111',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              width: '100%',
              maxWidth: promotion.product.image_url ? '720px' : '480px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'grid',
              gridTemplateColumns: promotion.product.image_url ? 'minmax(140px, 3fr) minmax(0, 5fr)' : '1fr',
            }}
          >
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, background: 'rgba(255,255,255,0.12)', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
            {promotion.product.image_url && (
              <div style={{ position: 'relative', overflow: 'hidden', background: '#071019' }}>
                {/* Product cover URLs are administered content and can use providers outside Next Image allowlists. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl(promotion.product.image_url)} alt={promotion.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {promotion.product.discount_percentage > 0 && (
                  <span style={{ position: 'absolute', top: 12, left: 12, padding: '4px 12px', borderRadius: 999, background: '#dc2626', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800 }}>
                    -{promotion.product.discount_percentage}%
                  </span>
                )}
              </div>
            )}
            <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#8cc6ff', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <Sparkles size={13} /> Promo
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', margin: '10px 0 8px' }}>{promotion.headline}</h2>
              {promotion.description && <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 16px', lineHeight: 1.5 }}>{promotion.description}</p>}
              {countdown && !countdown.expired && (
                <div style={{ color: '#8cc6ff', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 16px' }}>
                  {countdown.days} hari, {countdown.hours} jam, {countdown.minutes} menit, {countdown.seconds} detik
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 24 }}>
                {promotion.product.discount_percentage > 0 && (
                  <span style={{ color: '#64748b', textDecoration: 'line-through', fontSize: '0.9rem' }}>{formatRp(promotion.product.price_before_discount)}</span>
                )}
                <strong style={{ color: '#f8fafc', fontSize: '1.3rem' }}>{formatRp(promotion.product.price_after_discount)}</strong>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => router.push(`/product/${promotion.product.slug}/checkout`)}
                  style={{ flex: 1, background: '#f8fafc', color: '#0f172a', fontWeight: 700, padding: '12px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap' }}
                >
                  Checkout Product <ArrowRight size={16} />
                </button>
                <button
                  onClick={onClose}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', fontWeight: 600, padding: '12px 20px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
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
