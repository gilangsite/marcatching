'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/lib/supabaseClient'
import styles from './product.module.css'

function formatRupiah(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID')
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [descOpen, setDescOpen] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (!error && data) {
        setProduct(data as Product)
      }
      setLoading(false)
    }
    fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <div className={styles.productPage}>
        <div className={styles.notFound}>
          <p style={{ color: '#64748b' }}>Memuat...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.productPage}>
        <div className={styles.notFound}>
          <h1 className={styles.notFoundTitle}>Produk Tidak Ditemukan</h1>
          <p className={styles.notFoundDesc}>Produk yang kamu cari tidak tersedia atau sudah tidak aktif.</p>
          <a href="/" className={styles.backLink}>
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
            Kembali ke Beranda
          </a>
        </div>
      </div>
    )
  }

  const features: string[] = Array.isArray(product.features) ? product.features : []

  // Build poster preview URL
  let posterUrl = product.image_url || ''
  if (posterUrl && posterUrl.includes('drive.google.com/uc')) {
    const match = posterUrl.match(/id=([^&]+)/)
    if (match && match[1]) {
      posterUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600-h2000`
    }
  }

  return (
    <div className={styles.productPage}>
      <div className={styles.splitLayout}>
        {/* Left: Poster */}
        <div className={styles.posterSide}>
          {posterUrl ? (
            <img src={posterUrl} alt={product.name} className={styles.posterImage} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.2rem' }}>
              No Image
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className={styles.contentSide}>
          <h1 className={styles.productName}>{product.name}</h1>
          {product.sub_headline && (
            <p className={styles.subHeadline}>{product.sub_headline}</p>
          )}

          {/* Pricing */}
          <div className={styles.priceWrap}>
            {product.price_before_discount > 0 && product.price_before_discount !== product.price_after_discount && (
              <span className={styles.priceStrikethrough}>
                {formatRupiah(product.price_before_discount)}
              </span>
            )}
            <span className={styles.priceActual}>
              {formatRupiah(product.price_after_discount)}
            </span>
            {product.discount_percentage > 0 && (
              <span className={styles.discountBadge}>
                -{product.discount_percentage}%
              </span>
            )}
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className={styles.featuresSection}>
              <p className={styles.featuresTitle}>Yang Kamu Dapatkan</p>
              {features.map((feat, i) => (
                <div key={i} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description Dropdown */}
          {product.description && (
            <>
              <button
                className={styles.descriptionToggle}
                onClick={() => setDescOpen(!descOpen)}
              >
                Read Full Detail Product
                <ChevronDown
                  size={18}
                  className={`${styles.descriptionToggleIcon} ${descOpen ? styles.descriptionToggleIconOpen : ''}`}
                />
              </button>
              {descOpen && (
                <div className={styles.descriptionContent}>
                  {product.description}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className={styles.fixedCTA}>
        <button
          className={styles.ctaButton}
          onClick={() => router.push(`/product/${slug}/checkout`)}
        >
          Get Offer
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
