'use client'

import { useState, useRef, useMemo, useEffect, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BadgePercent, ChevronDown, CreditCard, PackageCheck, Search, ShoppingBag, ShoppingCart, X } from 'lucide-react'
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

type AppliedVoucher = {
  code: string
  discounts: Record<string, number>
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
function ProductCard({
  product,
  categories,
  isComingSoon,
  voucherDiscount,
  isInCart,
  onAddToCart,
}: {
  product: Product
  categories: ProductCategory[]
  isComingSoon: boolean
  voucherDiscount: number
  isInCart: boolean
  onAddToCart: (product: Product) => void
}) {
  const thumb = getDriveThumb(product.image_url, 'w800-h1000')
  const cat = categories.find(c => c.id === product.category_id)
  const voucherPrice = Math.max(0, product.price_after_discount - voucherDiscount)
  const oldPrice = voucherDiscount > 0
    ? product.price_after_discount
    : product.price_before_discount > product.price_after_discount
      ? product.price_before_discount
      : null

  return (
    <article className={styles.card}>
      <Link
        href={isComingSoon ? '#' : `/product/${product.slug}`}
        className={styles.cardThumb}
        onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
      >
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
          {voucherDiscount > 0 ? (
            <span className={styles.cardDiscountBadge}>Voucher</span>
          ) : product.discount_percentage > 0 && (
            <span className={styles.cardDiscountBadge}>-{product.discount_percentage}%</span>
          )}
          {cat && <span className={styles.cardCatBadge}>{cat.name}</span>}
          {isComingSoon && (
            <div className={styles.comingSoonOverlay}>
              <span className={styles.comingSoonBadge}>Coming Soon</span>
            </div>
          )}
      </Link>
      <div className={styles.cardBody}>
        <Link href={isComingSoon ? '#' : `/product/${product.slug}`} onClick={isComingSoon ? (e) => e.preventDefault() : undefined}>
          <h2 className={styles.cardName}>{product.name}</h2>
        </Link>
        {product.sub_headline && <p className={styles.cardSub}>{product.sub_headline}</p>}
        <div className={styles.cardFooter}>
          <div className={styles.cardPrice}>
            <span className={styles.cardPriceActual}>{formatRp(voucherPrice)}</span>
            {oldPrice !== null && <span className={styles.cardPriceOld}>{formatRp(oldPrice)}</span>}
          </div>
          {(product.checkout_clicks ?? 0) > 0 && (
            <div className={styles.cardCheckouts}>
              <ShoppingCart size={12} />
              <span>{product.checkout_clicks}</span>
            </div>
          )}
        </div>
        <div className={styles.cardActions}>
          <Link
            href={isComingSoon ? '#' : `/product/${product.slug}`}
            className={styles.cardDetailBtn}
            onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
          >
            Detail
          </Link>
          <button
            type="button"
            className={styles.cardCartBtn}
            disabled={isComingSoon || isInCart}
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart size={14} />
            {isComingSoon ? 'Soon' : isInCart ? 'Di Cart' : 'Cart'}
          </button>
        </div>
      </div>
    </article>
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
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showVoucherSheet, setShowVoucherSheet] = useState(false)
  const [showCartSheet, setShowCartSheet] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [voucherInput, setVoucherInput] = useState('')
  const [voucherChecking, setVoucherChecking] = useState(false)
  const [voucherMsg, setVoucherMsg] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null)
  const [cartIds, setCartIds] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const categoryMenuRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setShowCategoryMenu(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Check if a product block passes current filter
  function passesFilter(block: StorePageBlock): boolean {
    const p = productsById[block.content.product_id || '']
    if (!p) return false
    const matchCat = activeCategory === 'all' || p.category_id === activeCategory
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sub_headline || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
  }

  function clearSearch() {
    setSearch(''); setSearchInput('')
    searchRef.current?.focus()
  }

  function getVoucherDiscount(product: Product) {
    return Math.min(product.price_after_discount, appliedVoucher?.discounts[product.id] ?? 0)
  }

  function getDisplayPrice(product: Product) {
    return Math.max(0, product.price_after_discount - getVoucherDiscount(product))
  }

  function handleAddToCart(product: Product) {
    setCartIds(prev => prev.includes(product.id) ? prev : [...prev, product.id])
  }

  function handleRemoveFromCart(productId: string) {
    setCartIds(prev => prev.filter(id => id !== productId))
  }

  async function handleApplyVoucher() {
    const code = voucherInput.trim().toUpperCase()
    if (!code) return
    setVoucherChecking(true)
    setVoucherMsg('')

    const checks = await Promise.all(productBlocks.map(async block => {
      const product = productsById[block.content.product_id || '']
      if (!product) return null
      try {
        const res = await fetch('/api/voucher/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            productPrice: product.price_after_discount,
            productId: product.id,
          }),
        })
        const data = await res.json()
        if (!data.valid || !data.discount_amount) return null
        return { productId: product.id, discount: Math.min(product.price_after_discount, Number(data.discount_amount) || 0) }
      } catch {
        return null
      }
    }))

    const discounts = checks.reduce<Record<string, number>>((acc, item) => {
      if (item && item.discount > 0) acc[item.productId] = item.discount
      return acc
    }, {})

    const eligibleCount = Object.keys(discounts).length
    if (eligibleCount > 0) {
      setAppliedVoucher({ code, discounts })
      setVoucherMsg(`Voucher ${code} aktif untuk ${eligibleCount} produk.`)
    } else {
      setAppliedVoucher(null)
      setVoucherMsg('Kode voucher tidak valid atau tidak berlaku untuk produk di store ini.')
    }
    setVoucherChecking(false)
  }

  function clearVoucher() {
    setAppliedVoucher(null)
    setVoucherInput('')
    setVoucherMsg('')
  }

  const firstAvailableProduct = productBlocks
    .map(b => ({ block: b, product: productsById[b.content.product_id || ''] }))
    .find(({ block, product }) => product && !product.is_coming_soon && block.content.store_status !== 'coming_soon')
    ?.product
  const voucherProductCount = appliedVoucher ? Object.keys(appliedVoucher.discounts).length : 0
  const cartProducts = cartIds
    .map(id => productsById[id])
    .filter((product): product is Product => Boolean(product) && !product.is_coming_soon)
  const cartTotal = cartProducts.reduce((total, product) => total + getDisplayPrice(product), 0)
  const isFiltering = search || activeCategory !== 'all'

  function selectCategory(categoryId: string) {
    setActiveCategory(categoryId)
    setShowCategoryMenu(false)
  }

  function handleCheckoutCart() {
    if (cartProducts.length === 0) {
      setShowCartSheet(true)
      return
    }

    const mainProduct = appliedVoucher
      ? cartProducts.find(product => getVoucherDiscount(product) > 0) || cartProducts[0]
      : cartProducts[0]
    const addonIds = cartProducts.filter(product => product.id !== mainProduct.id).map(product => product.id)
    const params = new URLSearchParams()
    if (addonIds.length > 0) params.set('addons', addonIds.join(','))
    if (appliedVoucher) params.set('voucher', appliedVoucher.code)
    const query = params.toString()
    window.location.assign(`/product/${mainProduct.slug}/checkout${query ? `?${query}` : ''}`)
  }

  return (
    <>
      <Navbar navLinks={navLinks} variant="light" />

      <main className={styles.main}>
        {productBlocks.length > 0 && (
          <nav className={styles.shopNav} aria-label="Store shortcuts">
            <div className={styles.categoryMenuWrap} ref={categoryMenuRef}>
              <button
                type="button"
                className={`${styles.categoryMenuBtn} ${activeCategory !== 'all' ? styles.categoryMenuBtnActive : ''}`}
                aria-expanded={showCategoryMenu}
                aria-haspopup="menu"
                onClick={() => setShowCategoryMenu(prev => !prev)}
              >
                <PackageCheck size={15} className={styles.categoryMenuIcon} />
                <span className={styles.categoryMenuLabel}>Categories</span>
                <ChevronDown size={15} className={`${styles.categoryMenuChevron} ${showCategoryMenu ? styles.categoryMenuChevronOpen : ''}`} />
              </button>
              {showCategoryMenu && (
                <div className={styles.categoryDropdown} role="menu" aria-label="Product categories">
                  <button
                    type="button"
                    className={`${styles.categoryDropdownItem} ${activeCategory === 'all' ? styles.categoryDropdownItemActive : ''}`}
                    role="menuitem"
                    onClick={() => selectCategory('all')}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.categoryDropdownItem} ${activeCategory === cat.id ? styles.categoryDropdownItemActive : ''}`}
                      role="menuitem"
                      onClick={() => selectCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className={styles.shopNavItem}
              aria-label={`Lihat semua produk, ${productBlocks.length} produk`}
              title="Produk"
              onClick={() => {
                setActiveCategory('all')
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
              className={`${styles.shopNavItem} ${appliedVoucher ? styles.shopNavItemActive : ''}`}
              aria-label={appliedVoucher ? `Voucher aktif untuk ${voucherProductCount} produk` : 'Masukkan voucher code'}
              title="Voucher Code"
              onClick={() => setShowVoucherSheet(true)}
            >
              <BadgePercent size={18} />
              <span>Voucher Code</span>
              <strong>{appliedVoucher ? voucherProductCount : ''}</strong>
            </button>
            <button
              type="button"
              className={styles.shopNavItem}
              aria-label={`Buka keranjang, ${cartProducts.length} item`}
              title="Keranjang"
              onClick={() => setShowCartSheet(true)}
            >
              <ShoppingCart size={18} />
              <span>Keranjang</span>
              <strong>{cartProducts.length}</strong>
            </button>
            {firstAvailableProduct ? (
              <button
                type="button"
                className={styles.shopNavItem}
                aria-label={cartProducts.length > 0 ? `Checkout cart, total ${formatRp(cartTotal)}` : 'Checkout cart'}
                title="Checkout"
                onClick={handleCheckoutCart}
              >
                <CreditCard size={18} />
                <span>Checkout</span>
                <strong>{cartProducts.length > 0 ? cartProducts.length : ''}</strong>
              </button>
            ) : (
              <button
                type="button"
                className={styles.shopNavItem}
                aria-label="Checkout belum tersedia"
                title="Checkout"
                onClick={() => searchRef.current?.focus()}
              >
                <PackageCheck size={18} />
                <span>Checkout</span>
                <strong />
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
                    return (
                      <ProductCard
                        key={b.id}
                        product={p}
                        categories={categories}
                        isComingSoon={b.content.store_status === 'coming_soon' || !!p.is_coming_soon}
                        voucherDiscount={getVoucherDiscount(p)}
                        isInCart={cartIds.includes(p.id)}
                        onAddToCart={handleAddToCart}
                      />
                    )
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
                          return (
                            <ProductCard
                              key={pb.id}
                              product={p}
                              categories={categories}
                              isComingSoon={pb.content.store_status === 'coming_soon' || !!p.is_coming_soon}
                              voucherDiscount={getVoucherDiscount(p)}
                              isInCart={cartIds.includes(p.id)}
                              onAddToCart={handleAddToCart}
                            />
                          )
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

      {showVoucherSheet && (
        <div className={styles.sheetOverlay} onClick={() => setShowVoucherSheet(false)}>
          <aside className={styles.storeSheet} onClick={e => e.stopPropagation()} aria-label="Voucher code">
            <div className={styles.sheetHeader}>
              <div>
                <p className={styles.sheetEyebrow}>Voucher Code</p>
                <h2 className={styles.sheetTitle}>Masukkan kode voucher</h2>
              </div>
              <button type="button" className={styles.sheetClose} onClick={() => setShowVoucherSheet(false)} aria-label="Tutup voucher">
                <X size={18} />
              </button>
            </div>

            <div className={styles.voucherApplyBox}>
              <input
                className={styles.voucherSheetInput}
                placeholder="Contoh: MARCATCHING"
                value={voucherInput}
                onChange={e => setVoucherInput(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                className={styles.voucherSheetBtn}
                onClick={handleApplyVoucher}
                disabled={voucherChecking || !voucherInput.trim()}
              >
                {voucherChecking ? 'Checking...' : 'Apply'}
              </button>
            </div>

            {voucherMsg && <p className={styles.sheetMessage}>{voucherMsg}</p>}

            {appliedVoucher && (
              <div className={styles.appliedVoucherBox}>
                <div>
                  <span>Voucher aktif</span>
                  <strong>{appliedVoucher.code}</strong>
                </div>
                <button type="button" onClick={clearVoucher}>Hapus</button>
              </div>
            )}

            <div className={styles.sheetProductList}>
              {productBlocks.map(block => {
                const product = productsById[block.content.product_id || '']
                if (!product) return null
                const discount = getVoucherDiscount(product)
                return (
                  <div key={block.id} className={`${styles.sheetProductRow} ${discount > 0 ? styles.sheetProductRowActive : ''}`}>
                    <div>
                      <strong>{product.name}</strong>
                      <span>{discount > 0 ? `Harga voucher ${formatRp(getDisplayPrice(product))}` : 'Menunggu voucher yang berlaku'}</span>
                    </div>
                    <p>{discount > 0 ? `-${formatRp(discount)}` : formatRp(product.price_after_discount)}</p>
                  </div>
                )
              })}
            </div>
          </aside>
        </div>
      )}

      {showCartSheet && (
        <div className={styles.sheetOverlay} onClick={() => setShowCartSheet(false)}>
          <aside className={styles.storeSheet} onClick={e => e.stopPropagation()} aria-label="Keranjang">
            <div className={styles.sheetHeader}>
              <div>
                <p className={styles.sheetEyebrow}>Keranjang</p>
                <h2 className={styles.sheetTitle}>{cartProducts.length} produk dipilih</h2>
              </div>
              <button type="button" className={styles.sheetClose} onClick={() => setShowCartSheet(false)} aria-label="Tutup keranjang">
                <X size={18} />
              </button>
            </div>

            <div className={styles.cartList}>
              {cartProducts.length === 0 ? (
                <div className={styles.cartEmpty}>
                  <ShoppingCart size={28} />
                  <p>Keranjang masih kosong.</p>
                  <span>Tambahkan produk dari list store dulu sebelum checkout.</span>
                </div>
              ) : cartProducts.map(product => {
                const thumb = getDriveThumb(product.image_url, 'w240-h300')
                const discount = getVoucherDiscount(product)
                return (
                  <div key={product.id} className={styles.cartRow}>
                    <div className={styles.cartThumb}>
                      {thumb ? (
                        <Image src={thumb} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="64px" />
                      ) : (
                        <span>M</span>
                      )}
                    </div>
                    <div className={styles.cartInfo}>
                      <strong>{product.name}</strong>
                      <span>{discount > 0 ? `Voucher ${appliedVoucher?.code}` : 'Ready checkout'}</span>
                    </div>
                    <div className={styles.cartPrice}>
                      <strong>{formatRp(getDisplayPrice(product))}</strong>
                      {discount > 0 && <span>{formatRp(product.price_after_discount)}</span>}
                    </div>
                    <button type="button" className={styles.cartRemove} onClick={() => handleRemoveFromCart(product.id)} aria-label={`Hapus ${product.name}`}>
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
            </div>

            <div className={styles.cartSummary}>
              <div>
                <span>Total</span>
                <strong>{formatRp(cartTotal)}</strong>
              </div>
              <button type="button" className={styles.cartCheckoutBtn} onClick={handleCheckoutCart} disabled={cartProducts.length === 0}>
                Checkout Cart
              </button>
            </div>
          </aside>
        </div>
      )}

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
