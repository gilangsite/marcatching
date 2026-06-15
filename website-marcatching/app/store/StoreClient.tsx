'use client'

import { useState, useRef, useMemo, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BadgePercent, CreditCard, PackageCheck, Search, ShoppingBag, ShoppingCart, X } from 'lucide-react'
import type { NavLink, StorePageBlock, Product, ProductCategory } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VideoEmbed from '@/components/VideoEmbed'
import styles from './store.module.css'

// ── Helpers ──────────────────────────────────────────────────
function getDriveThumb(url: string | null | undefined, size = 'w800-h1000') {
  if (!url) return null
  if (url.includes('drive.google.com/uc')) {
    const m = url.match(/id=([^&]+)/)
    if (m?.[1]) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=${size}`
  }
  return url
}

function formatRp(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

function getTextAlign(align: string | undefined): CSSProperties['textAlign'] {
  if (align === 'center' || align === 'right' || align === 'left' || align === 'justify') return align
  return 'left'
}

function getJustifyContent(align: string | undefined): CSSProperties['justifyContent'] {
  if (align === 'left') return 'flex-start'
  if (align === 'right') return 'flex-end'
  return 'center'
}

// ── Block renderer: content types ────────────────────────────
function ContentBlockRenderer({ block }: { block: StorePageBlock }) {
  const c = block.content
  if (block.type === 'headline') {
    const sizeMap: Record<string, string> = { hero: '2.5rem', h1: '2rem', h2: '1.5rem', h3: '1.25rem', sub: '1rem' }
    return (
      <div className={styles.blockHeadline} style={{
        fontSize: sizeMap[c.size || 'h2'] || '1.5rem',
        textAlign: getTextAlign(c.align),
      }} dangerouslySetInnerHTML={{ __html: c.text || '' }} />
    )
  }
  if (block.type === 'text') {
    return (
      <div className={styles.blockText} style={{
        fontSize: c.font_size || '1rem',
        fontWeight: c.weight === 'bold' ? 700 : c.weight === 'semibold' ? 600 : 400,
        fontStyle: c.italic ? 'italic' : 'normal',
        color: c.color === '#0d3369' ? '#0d3369' : '#475569',
        textAlign: getTextAlign(c.align),
      }} dangerouslySetInnerHTML={{ __html: c.text || '' }} />
    )
  }
  if (block.type === 'image' && c.url) {
    const thumb = getDriveThumb(c.url, 'w1400-h1400')
    const [w, h] = (c.aspect_ratio || '16:9').split(':').map(Number)
    return (
      <div className={styles.blockImage}>
        <div style={{ aspectRatio: `${w}/${h}`, overflow: 'hidden', borderRadius: 12, position: 'relative' }}>
          <Image
            src={thumb || c.url}
            alt={c.caption || ''}
            fill
            className={styles.blockImageActual}
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 700px) 100vw, 700px"
          />
        </div>
        {c.caption && <p className={styles.blockCaption}>{c.caption}</p>}
      </div>
    )
  }
  if (block.type === 'video' && c.video_url) {
    return (
      <div className={styles.blockVideo}>
        <VideoEmbed url={c.video_url} title={c.caption || 'Video'} />
        {c.caption && <p className={styles.blockCaption}>{c.caption}</p>}
      </div>
    )
  }
  if (block.type === 'button' && c.btn_text) {
    return (
      <div style={{ display: 'flex', justifyContent: getJustifyContent(c.align) }}>
        <a
          href={c.btn_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.blockBtn}
          style={{
            background: '#0d3369',
            color: '#ffffff'
          }}
        >
          {c.btn_text}
        </a>
      </div>
    )
  }
  return null
}

// ── Product card renderer ─────────────────────────────────────
function ProductCard({ product, categories, isComingSoon }: { product: Product; categories: ProductCategory[]; isComingSoon: boolean }) {
  const thumb = getDriveThumb(product.image_url, 'w800-h1000')
  const cat = categories.find(c => c.id === product.category_id)
  return (
    <Link
      href={isComingSoon ? '#' : `/product/${product.slug}`}
      className={styles.card}
      onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
    >
      <div className={styles.cardThumb}>
        {thumb
          ? (
            <Image
              src={thumb}
              alt={product.name}
              fill
              className={styles.cardThumbImg}
              sizes="(max-width: 640px) 50vw, 300px"
            />
          )
          : <div className={styles.cardThumbPlaceholder}><span>M</span></div>
        }
        {product.discount_percentage > 0 && (
          <span className={styles.cardDiscountBadge}>-{product.discount_percentage}%</span>
        )}
        {cat && <span className={styles.cardCatBadge}>{cat.name}</span>}
        {isComingSoon && (
          <div className={styles.comingSoonOverlay}>
            <span className={styles.comingSoonBadge}>Coming Soon</span>
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        <h2 className={styles.cardName}>{product.name}</h2>
        {product.sub_headline && <p className={styles.cardSub}>{product.sub_headline}</p>}
        <div className={styles.cardFooter}>
          <div className={styles.cardPrice}>
            <span className={styles.cardPriceActual}>{formatRp(product.price_after_discount)}</span>
            {product.price_before_discount > product.price_after_discount && (
              <span className={styles.cardPriceOld}>{formatRp(product.price_before_discount)}</span>
            )}
          </div>
          {(product.checkout_clicks ?? 0) > 0 && (
            <div className={styles.cardCheckouts}>
              <ShoppingCart size={12} />
              <span>{product.checkout_clicks}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Main Client Component ─────────────────────────────────────
export default function StoreClient({
  navLinks, blocks, products, categories,
}: {
  navLinks: NavLink[]
  blocks: StorePageBlock[]
  products: Product[]
  categories: ProductCategory[]
}) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [discountOnly, setDiscountOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Index products by id for O(1) lookup
  const productsById = useMemo(() => {
    const map: Record<string, Product> = {}
    for (const p of products) map[p.id] = p
    return map
  }, [products])

  // Collect product blocks for category filter pills (only unique categories from visible products)
  const productBlocks = useMemo(() =>
    blocks.filter(b => b.type === 'product' && b.is_active && b.content.store_status !== 'hidden'),
    [blocks]
  )

  // Check if a product block passes current filter
  function passesFilter(block: StorePageBlock): boolean {
    const p = productsById[block.content.product_id || '']
    if (!p) return false
    const matchCat = activeCategory === 'all' || p.category_id === activeCategory
    const matchDiscount = !discountOnly || p.discount_percentage > 0
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sub_headline || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchDiscount && matchSearch
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
  }

  function clearSearch() {
    setSearch(''); setSearchInput('')
    searchRef.current?.focus()
  }

  const firstAvailableProduct = productBlocks
    .map(b => ({ block: b, product: productsById[b.content.product_id || ''] }))
    .find(({ block, product }) => product && !product.is_coming_soon && block.content.store_status !== 'coming_soon')
    ?.product
  const discountCount = productBlocks.filter(b => {
    const p = productsById[b.content.product_id || '']
    return p && p.discount_percentage > 0
  }).length
  const checkoutCount = productBlocks.reduce((total, b) => {
    const p = productsById[b.content.product_id || '']
    return total + (p?.checkout_clicks ?? 0)
  }, 0)
  const isFiltering = search || activeCategory !== 'all' || discountOnly

  return (
    <>
      <Navbar navLinks={navLinks} variant="light" />

      <main className={styles.main}>
        {/* Category Filter Bar (only show if there are product blocks) */}
        {productBlocks.length > 0 && (
          <div className={styles.filterBar}>
            <div className={styles.filterBarInner}>
              <div className={styles.catPills}>
                <button className={`${styles.catPill} ${activeCategory === 'all' ? styles.catPillActive : ''}`} onClick={() => setActiveCategory('all')}>All</button>
                {categories.map(cat => (
                  <button key={cat.id} className={`${styles.catPill} ${activeCategory === cat.id ? styles.catPillActive : ''}`} onClick={() => setActiveCategory(cat.id)}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {productBlocks.length > 0 && (
          <nav className={styles.shopNav} aria-label="Store shortcuts">
            <button
              type="button"
              className={styles.shopNavItem}
              onClick={() => {
                setActiveCategory('all')
                setDiscountOnly(false)
                setSearch('')
                setSearchInput('')
              }}
            >
              <ShoppingBag size={18} />
              <span>Produk</span>
              <strong>{productBlocks.length}</strong>
            </button>
            <button
              type="button"
              className={`${styles.shopNavItem} ${discountOnly ? styles.shopNavItemActive : ''}`}
              onClick={() => setDiscountOnly(v => !v)}
            >
              <BadgePercent size={18} />
              <span>Diskon</span>
              <strong>{discountCount}</strong>
            </button>
            <button type="button" className={styles.shopNavItem} onClick={() => searchRef.current?.focus()}>
              <ShoppingCart size={18} />
              <span>Keranjang</span>
              <strong>{checkoutCount}</strong>
            </button>
            {firstAvailableProduct ? (
              <Link className={styles.shopNavItem} href={`/product/${firstAvailableProduct.slug}`}>
                <CreditCard size={18} />
                <span>Checkout</span>
                <strong>Start</strong>
              </Link>
            ) : (
              <button type="button" className={styles.shopNavItem} onClick={() => searchRef.current?.focus()}>
                <PackageCheck size={18} />
                <span>Checkout</span>
                <strong>Soon</strong>
              </button>
            )}
          </nav>
        )}

        {/* Unified block + product rendering */}
        <div className={styles.pageBlocks}>
          {blocks.length === 0 && (
            <div className={styles.emptyState}>
              <p>Belum ada konten.</p>
            </div>
          )}

          {/* When filtering (search or category), show only matching product cards in a grid */}
          {isFiltering ? (
            <>
              {/* Always show content blocks even when filtering */}
              {blocks.filter(b => b.type !== 'product' && b.is_active).map(block => (
                <ContentBlockRenderer key={block.id} block={block} />
              ))}
              {/* Filtered product grid */}
              <div className={styles.grid}>
                {productBlocks
                  .filter(b => passesFilter(b))
                  .map(b => {
                    const p = productsById[b.content.product_id || '']
                    if (!p) return null
                    return <ProductCard key={b.id} product={p} categories={categories} isComingSoon={b.content.store_status === 'coming_soon' || !!p.is_coming_soon} />
                  })}
              </div>
              {productBlocks.filter(b => passesFilter(b)).length === 0 && (
                <div className={styles.emptyState}>
                  <p>Belum ada produk{search ? ` untuk "${search}"` : ''} tersedia.</p>
                  {search && <button className={styles.clearSearch} onClick={clearSearch}>Hapus pencarian</button>}
                </div>
              )}
            </>
          ) : (
            /* Normal mode: blocks render in order, each product block renders as its own card inline */
            <>
              {/* Group consecutive product blocks into grids, content blocks render normally */}
              {(() => {
                const rendered: React.ReactNode[] = []
                let productGridRendered = false
                let i = 0
                while (i < blocks.length) {
                  const b = blocks[i]
                  if (!b.is_active || b.content.store_status === 'hidden') { i++; continue }

                  if (b.type === 'product') {
                    if (!productGridRendered) {
                      productGridRendered = true
                      rendered.push(
                      <div key="products-grid" className={styles.grid}>
                        {productBlocks.map(pb => {
                          const p = productsById[pb.content.product_id || '']
                          if (!p) return null
                          return <ProductCard key={pb.id} product={p} categories={categories} isComingSoon={pb.content.store_status === 'coming_soon' || !!p.is_coming_soon} />
                        })}
                      </div>
                      )
                    }
                    i++
                  } else {
                    rendered.push(<ContentBlockRenderer key={b.id} block={b} />)
                    i++
                  }
                }
                return rendered
              })()}
            </>
          )}
        </div>
      </main>

      {/* Bottom Search */}
      <div className={styles.bottomSearchBar}>
        <form className={styles.bottomSearchForm} onSubmit={handleSearch}>
          <Search size={16} className={styles.bottomSearchIcon} />
          <input
            ref={searchRef}
            className={styles.bottomSearchInput}
            placeholder="Cari produk..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button type="button" className={styles.bottomSearchClear} onClick={clearSearch}><X size={14} /></button>
          )}
          <button type="submit" className={styles.bottomSearchBtn}>Cari</button>
        </form>
      </div>

      <Footer variant="light" />
    </>
  )
}
