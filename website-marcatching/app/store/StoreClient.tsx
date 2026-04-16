'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Search, X, ShoppingCart } from 'lucide-react'
import type { NavLink, StorePageBlock, StoreProduct, ProductCategory } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
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

function getYouTubeId(url: string): string | null {
  const patterns = [/[?&]v=([^&]+)/, /youtu\.be\/([^?]+)/, /youtube\.com\/embed\/([^?]+)/]
  for (const p of patterns) { const m = url.match(p); if (m?.[1]) return m[1] }
  return null
}

// ── Block renderer ────────────────────────────────────────────
function PageBlockRenderer({ block }: { block: StorePageBlock }) {
  const c = block.content
  if (block.type === 'headline') {
    const sizeMap: Record<string, string> = { hero: '2.5rem', h1: '2rem', h2: '1.5rem', h3: '1.25rem', sub: '1rem' }
    return (
      <div className={styles.blockHeadline} style={{
        fontSize: sizeMap[c.size || 'h2'] || '1.5rem',
        color: c.color || '#ffffff',
        textAlign: (c.align as any) || 'left',
      }}>
        {c.text}
      </div>
    )
  }
  if (block.type === 'text') {
    return (
      <div className={styles.blockText} style={{
        fontSize: c.font_size || '1rem',
        fontWeight: c.weight === 'bold' ? 700 : c.weight === 'semibold' ? 600 : 400,
        fontStyle: c.italic ? 'italic' : 'normal',
        color: c.color || 'rgba(255,255,255,0.85)',
        textAlign: (c.align as any) || 'left',
      }}>
        {(c.text || '').split('\n').map((line, i, arr) => (
          <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
        ))}
      </div>
    )
  }
  if (block.type === 'image' && c.url) {
    const thumb = getDriveThumb(c.url, 'w1400-h1400')
    const [w, h] = (c.aspect_ratio || '16:9').split(':').map(Number)
    return (
      <div className={styles.blockImage}>
        <div style={{ aspectRatio: `${w}/${h}`, overflow: 'hidden', borderRadius: 12 }}>
          <img src={thumb || c.url} alt={c.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {c.caption && <p className={styles.blockCaption}>{c.caption}</p>}
      </div>
    )
  }
  if (block.type === 'video' && c.video_url) {
    const ytId = getYouTubeId(c.video_url)
    if (!ytId) return null
    return (
      <div className={styles.blockVideo}>
        <div className={styles.blockVideoWrap}>
          <iframe src={`https://www.youtube.com/embed/${ytId}`} title={c.caption || 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className={styles.blockVideoFrame} />
        </div>
        {c.caption && <p className={styles.blockCaption}>{c.caption}</p>}
      </div>
    )
  }
  if (block.type === 'button' && c.btn_text) {
    return (
      <div style={{ display: 'flex', justifyContent: (c.align as any) || 'center' }}>
        <a
          href={c.btn_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.blockBtn}
          style={{ background: c.btn_color || '#ffffff', color: c.btn_text_color || '#000000' }}
        >
          {c.btn_text}
        </a>
      </div>
    )
  }
  return null
}

// ── Main Client Component ─────────────────────────────────────
export default function StoreClient({
  navLinks, blocks, storeProducts, categories,
}: {
  navLinks: NavLink[]
  blocks: StorePageBlock[]
  storeProducts: StoreProduct[]
  categories: ProductCategory[]
}) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Filter products
  const filtered = storeProducts.filter(sp => {
    const p = sp.products
    if (!p) return false
    const matchCat = activeCategory === 'all' || p.category_id === activeCategory
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sub_headline || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
  }

  function clearSearch() {
    setSearch(''); setSearchInput('')
    searchRef.current?.focus()
  }

  return (
    <>
      <Navbar navLinks={navLinks} />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.heroTag}>Marcatching</p>
            <h1 className={styles.heroTitle}>Store</h1>
            <p className={styles.heroDesc}>Temukan semua produk & course Marcatching untuk tingkatkan skill marketing kamu.</p>
          </div>
        </section>

        {/* Page Blocks */}
        {blocks.length > 0 && (
          <div className={styles.pageBlocks}>
            {blocks.map(block => <PageBlockRenderer key={block.id} block={block} />)}
          </div>
        )}

        {/* Filter Bar */}
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

        {/* Product Grid */}
        <section className={styles.gridSection}>
          <div className={styles.gridWrap}>
            {filtered.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Belum ada produk{search ? ` untuk "${search}"` : ''} tersedia.</p>
                {search && <button className={styles.clearSearch} onClick={clearSearch}>Hapus pencarian</button>}
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map(sp => {
                  const p = sp.products!
                  const thumb = getDriveThumb(p.image_url, 'w800-h1000')
                  const cat = categories.find(c => c.id === p.category_id)
                  const isComingSoon = sp.store_status === 'coming_soon'
                  return (
                    <Link
                      key={sp.id}
                      href={isComingSoon ? '#' : `/product/${p.slug}`}
                      className={styles.card}
                      onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
                    >
                      <div className={styles.cardThumb}>
                        {thumb
                          ? <img src={thumb} alt={p.name} className={styles.cardThumbImg} />
                          : <div className={styles.cardThumbPlaceholder}><span>M</span></div>
                        }
                        {p.discount_percentage > 0 && (
                          <span className={styles.cardDiscountBadge}>-{p.discount_percentage}%</span>
                        )}
                        {cat && <span className={styles.cardCatBadge}>{cat.name}</span>}
                        {isComingSoon && (
                          <div className={styles.comingSoonOverlay}>
                            <span className={styles.comingSoonBadge}>Coming Soon</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.cardBody}>
                        <h2 className={styles.cardName}>{p.name}</h2>
                        {p.sub_headline && <p className={styles.cardSub}>{p.sub_headline}</p>}
                        <div className={styles.cardFooter}>
                          <div className={styles.cardPrice}>
                            <span className={styles.cardPriceActual}>{formatRp(p.price_after_discount)}</span>
                            {p.price_before_discount > p.price_after_discount && (
                              <span className={styles.cardPriceOld}>{formatRp(p.price_before_discount)}</span>
                            )}
                          </div>
                          {p.checkout_clicks > 0 && (
                            <div className={styles.cardCheckouts}>
                              <ShoppingCart size={12} />
                              <span>{p.checkout_clicks}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
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

      <Footer />
    </>
  )
}
