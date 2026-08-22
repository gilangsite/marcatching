'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { PromotionProductSummary } from '@/lib/supabaseClient'
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

export default function PromotionProductCard({ product }: { product: PromotionProductSummary }) {
  const thumb = getDriveThumb(product.image_url)

  return (
    <div className={styles.promoProductCard}>
      {thumb && (
        <div className={styles.promoProductVisual}>
          <Image src={thumb} alt={product.name} fill className={styles.promoProductVisualImg} sizes="200px" />
          {product.discount_percentage > 0 && (
            <span className={styles.promoProductBadge}>-{product.discount_percentage}%</span>
          )}
        </div>
      )}
      <div className={styles.promoProductBody}>
        <h3 className={styles.promoProductName}>{product.name}</h3>
        <div className={styles.promoProductPricing}>
          {product.discount_percentage > 0 && (
            <span className={styles.promoProductOldPrice}>{formatRp(product.price_before_discount)}</span>
          )}
          <strong>{formatRp(product.price_after_discount)}</strong>
        </div>
        <a className={styles.promoProductCheckout} href={`/product/${product.slug}/checkout`}>
          Checkout <ArrowRight size={14} />
        </a>
      </div>
    </div>
  )
}
