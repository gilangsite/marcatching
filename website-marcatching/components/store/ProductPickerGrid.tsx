'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Search, ShoppingBag } from 'lucide-react'
import { supabase, type Product, type ProductCategory } from '@/lib/supabaseClient'
import styles from './ProductPickerGrid.module.css'

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

interface ProductPickerGridProps {
  /** When set, results are locked to this product_categories.slug and the category filter UI is hidden. */
  lockedCategorySlug?: string
  emptyLabel?: string
  /** Cap on the scrollable grid area (e.g. inside a modal). Pass 'none' to let it flow with the page instead. */
  maxHeight?: string
}

export function ProductPickerGrid({ lockedCategorySlug, emptyLabel, maxHeight = '55vh' }: ProductPickerGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    let mounted = true
    async function load() {
      const [{ data: productRows }, { data: categoryRows }] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('product_categories').select('*').order('order_index'),
      ])
      if (!mounted) return
      setProducts((productRows || []) as Product[])
      setCategories((categoryRows || []) as ProductCategory[])
      setLoading(false)
    }
    void load()
    return () => { mounted = false }
  }, [])

  const lockedCategory = useMemo(
    () => (lockedCategorySlug ? categories.find(cat => cat.slug === lockedCategorySlug) : undefined),
    [categories, lockedCategorySlug]
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter(product => {
      const matchesCategory = lockedCategorySlug
        ? product.category_id === lockedCategory?.id
        : activeCategory === 'all' || product.category_id === activeCategory
      const matchesSearch = !query
        || product.name.toLowerCase().includes(query)
        || (product.sub_headline || '').toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [products, search, activeCategory, lockedCategorySlug, lockedCategory])

  function goToCheckout(product: Product) {
    if (product.is_coming_soon) return
    window.location.href = `/product/${product.slug}/checkout`
  }

  const showEmptyLockedState = lockedCategorySlug && !loading && !lockedCategory

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>

        {!lockedCategorySlug && categories.length > 0 && (
          <div className={styles.categoryRow}>
            <button
              type="button"
              className={`${styles.categoryChip} ${activeCategory === 'all' ? styles.categoryChipActive : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryChip} ${activeCategory === cat.id ? styles.categoryChipActive : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.gridScroll} style={maxHeight === 'none' ? { maxHeight: 'none', overflow: 'visible' } : { maxHeight }}>
        {loading ? (
          <div className={styles.emptyState}>Memuat produk...</div>
        ) : showEmptyLockedState ? (
          <div className={styles.emptyState}>
            Kategori &quot;{lockedCategorySlug}&quot; belum dibuat di Product Categories.
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>{emptyLabel || 'Belum ada produk yang cocok.'}</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(product => {
              const thumb = getDriveThumb(product.image_url)
              const cat = categories.find(c => c.id === product.category_id)
              const hasDiscount = product.price_before_discount > product.price_after_discount
              return (
                <button
                  key={product.id}
                  type="button"
                  className={styles.card}
                  disabled={product.is_coming_soon}
                  onClick={() => goToCheckout(product)}
                >
                  <div className={styles.cardThumb}>
                    {thumb ? (
                      <Image src={thumb} alt={product.name} fill className={styles.cardThumbImg} sizes="220px" />
                    ) : (
                      <div className={styles.cardThumbPlaceholder}><ShoppingBag size={22} /></div>
                    )}
                    {cat && !lockedCategorySlug && <span className={styles.cardCatBadge}>{cat.name}</span>}
                    {product.is_coming_soon && <span className={styles.cardSoonBadge}>Coming Soon</span>}
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardName}>{product.name}</h3>
                    {product.sub_headline && <p className={styles.cardSub}>{product.sub_headline}</p>}
                    <div className={styles.cardPriceRow}>
                      <span className={styles.cardPrice}>{formatRp(product.price_after_discount)}</span>
                      {hasDiscount && <span className={styles.cardPriceOld}>{formatRp(product.price_before_discount)}</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
