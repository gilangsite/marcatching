'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import type { PromotionProductSummary } from '@/lib/supabaseClient'
import styles from './course.module.css'

function formatRp(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

function imageUrl(url: string) {
  return url.includes('drive.google.com/uc')
    ? `${url.replace(/uc\?export=view&id=/, 'thumbnail?id=')}&sz=w900-h1500`
    : url
}

export default function PromotionProductCard({ product }: { product: PromotionProductSummary }) {
  const router = useRouter()

  return (
    <div className={styles.promotionProductCard}>
      {product.image_url && (
        <div className={styles.promotionProductVisual}>
          {/* Product cover URLs are administered content and can use providers outside Next Image allowlists. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl(product.image_url)} alt={product.name} />
          {product.discount_percentage > 0 && (
            <span className={styles.promotionProductBadge}>-{product.discount_percentage}%</span>
          )}
        </div>
      )}
      <div className={styles.promotionProductBody}>
        <h3 className={styles.promotionProductName}>{product.name}</h3>
        <div className={styles.promotionProductPricing}>
          {product.discount_percentage > 0 && (
            <span className={styles.promotionProductOldPrice}>{formatRp(product.price_before_discount)}</span>
          )}
          <strong>{formatRp(product.price_after_discount)}</strong>
        </div>
        <button className={styles.promotionProductCheckout} onClick={() => router.push(`/product/${product.slug}/checkout`)}>
          Checkout <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
