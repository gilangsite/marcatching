'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Calendar, Tag, X, ShoppingCart, ArrowLeft, ExternalLink } from 'lucide-react'
import type { Article, ArticleBlock, Product, NavLink } from '@/lib/supabaseClient'
import styles from './page.module.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VideoEmbed from '@/components/VideoEmbed'

// ── Helpers ──────────────────────────────────────────────────
function getDriveThumb(url: string | null | undefined, size = 'w1200-h900') {
  if (!url) return null
  if (url.includes('drive.google.com/uc')) {
    const m = url.match(/id=([^&]+)/)
    if (m?.[1]) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=${size}`
  }
  return url
}

function formatDate(str: string | null) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m?.[1]) return m[1]
  }
  return null
}

const HEADLINE_SIZES: Record<string, string> = {
  hero: '2.5rem',
  h1: '2rem',
  h2: '1.5rem',
  h3: '1.25rem',
  sub: '1rem',
}

const WEIGHT_MAP: Record<string, number> = {
  normal: 400,
  semibold: 600,
  bold: 700,
}

function getMappedFont(fontValue: string | null | undefined, defaultFont: string) {
  if (!fontValue) return defaultFont
  if (fontValue === 'Montserrat') return "'Montserrat', sans-serif"
  if (fontValue === 'DM Sans') return "'DM Sans', sans-serif"
  if (fontValue === 'serif') return "'Times New Roman', Times, serif"
  if (fontValue === 'monospace') return "'Courier New', Courier, monospace"
  return fontValue
}

// ── Components ───────────────────────────────────────────────
function ProductPopup({ product, onClose }: { product: Product; onClose: () => void }) {
  const thumb = getDriveThumb(product.image_url, 'w600-h750')
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popup} onClick={e => e.stopPropagation()}>
        <button className={styles.popupClose} onClick={onClose}><X size={18} /></button>
        {thumb && (
          <div className={styles.popupImgWrap} style={{ position: 'relative' }}>
            <Image
              src={thumb}
              alt={product.name}
              fill
              className={styles.popupImg}
              style={{ objectFit: 'cover' }}
            />
            {product.discount_percentage > 0 && (
              <span className={styles.popupDiscount}>-{product.discount_percentage}%</span>
            )}
          </div>
        )}
        <div className={styles.popupBody}>
          <h3 className={styles.popupTitle}>{product.name}</h3>
          {product.sub_headline && <p className={styles.popupSub}>{product.sub_headline}</p>}
          <div className={styles.popupPricing}>
            {product.price_before_discount > product.price_after_discount && (
              <span className={styles.popupPriceBefore}>Rp {product.price_before_discount.toLocaleString('id-ID')}</span>
            )}
            <span className={styles.popupPriceAfter}>Rp {product.price_after_discount.toLocaleString('id-ID')}</span>
          </div>
          <Link href={`/product/${product.slug}`} className={styles.popupBtn}>
            <ShoppingCart size={16} /> Lihat & Beli
          </Link>
        </div>
      </div>
    </div>
  )
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>
}

function ArticleBlockRenderer({ block, products, onOpenProduct }: { block: ArticleBlock; products: Product[]; onOpenProduct: (p: Product) => void }) {
  if (block.type === 'headline') {
    const font = getMappedFont(block.font_family, "'DM Sans', sans-serif")
    return <div className={styles.blockHeadline} style={{ fontSize: HEADLINE_SIZES[block.size] || '1.5rem', color: block.color || '#ffffff', textAlign: block.align as any || 'left', fontFamily: font }} dangerouslySetInnerHTML={{ __html: block.text || '' }} />
  }
  if (block.type === 'text') {
    const font = getMappedFont(block.font_family, "'DM Sans', sans-serif")
    return (
      <div className={styles.blockText} style={{ fontSize: block.size || '1rem', fontWeight: WEIGHT_MAP[block.weight || 'normal'], fontStyle: block.italic ? 'italic' : 'normal', color: block.color || 'rgba(255,255,255,0.85)', textAlign: block.align as any || 'left', fontFamily: font }} dangerouslySetInnerHTML={{ __html: block.text || '' }} />
    )
  }
  if (block.type === 'image') {
    const thumb = getDriveThumb(block.url, 'w1600-h1600')
    const [w, h] = block.aspect_ratio.split(':').map(Number)
    return (
      <div className={styles.blockImage}>
        <div style={{ aspectRatio: `${w}/${h}`, overflow: 'hidden', borderRadius: 12, position: 'relative' }}>
          <Image
            src={thumb || block.url}
            alt={block.caption || ''}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
        {block.caption && <p className={styles.blockImageCaption}>{block.caption}</p>}
      </div>
    )
  }
  if (block.type === 'video') {
    return (
      <div className={styles.blockVideo}>
        <div className={styles.blockVideoWrap}>
          <VideoEmbed url={block.url} title={block.caption || 'Video'} />
        </div>
        {block.caption && <p className={styles.blockImageCaption}>{block.caption}</p>}
      </div>
    )
  }
  if (block.type === 'product') {
    const product = products.find(p => p.id === block.product_id)
    if (!product) return null
    const thumb = getDriveThumb(product.image_url, 'w600-h1000')
    return (
      <div className={styles.blockProduct} onClick={() => onOpenProduct(product)}>
        <div className={styles.blockProductInner}>
          {thumb && (
            <div className={styles.blockProductThumb} style={{ position: 'relative' }}>
              <Image
                src={thumb}
                alt={product.name}
                fill
                className={styles.blockProductImg}
                style={{ objectFit: 'cover' }}
              />
              {product.discount_percentage > 0 && <span className={styles.blockProductBadge}>-{product.discount_percentage}%</span>}
            </div>
          )}
          <div className={styles.blockProductInfo}>
            <div className={styles.blockProductLabel}>Produk Marcatching</div>
            <div className={styles.blockProductName}>{product.name}</div>
            {product.sub_headline && <div className={styles.blockProductSub}>{product.sub_headline}</div>}
            <div className={styles.blockProductPrice}>
              {product.price_before_discount > product.price_after_discount && (
                <span className={styles.blockProductPriceBefore}>Rp {product.price_before_discount.toLocaleString('id-ID')}</span>
              )}
              <span className={styles.blockProductPriceAfter}>Rp {product.price_after_discount.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className={styles.blockProductCta}><ExternalLink size={16} /><span>Lihat</span></div>
        </div>
      </div>
    )
  }
  return null
}

export default function ArticleClient({ article, products, navbarLinks }: { article: Article; products: Product[]; navbarLinks: NavLink[] }) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)

  // Increment view count on mount
  useEffect(() => {
    fetch(`/api/articles/${article.slug}`).catch(() => {})
  }, [article.slug])

  const author = (article as any).article_authors
  const category = (article as any).article_categories

  return (
    <>
      <Navbar navLinks={navbarLinks} />
      <ReadingProgress />

      <main className={styles.main}>
        <article className={styles.article}>
          <Link href="/article" className={styles.backLink}><ArrowLeft size={15} /> Articles</Link>
          {category && <div className={styles.articleCat}><Tag size={11} /> {category.name}</div>}
          <h1 className={styles.articleTitle}>{article.title}</h1>

          <div className={styles.articleMeta}>
            {author && (
              <div className={styles.authorRow}>
                {author.photo_url ? (
                  <div className={styles.authorAvatar} style={{ position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={getDriveThumb(author.photo_url, 'w80-h80') || ''}
                      alt={author.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div className={styles.authorAvatarPlaceholder}>{author.name[0]}</div>
                )}
                <div>
                  <div className={styles.authorName}>{author.name}</div>
                  <div className={styles.authorMeta}><Calendar size={11} />{formatDate(article.published_at)}<span className={styles.metaDot} /><Eye size={11} />{article.view_count} views</div>
                </div>
              </div>
            )}
            {!author && (
              <div className={styles.articleMetaSimple}><Calendar size={12} /> {formatDate(article.published_at)}<span className={styles.metaDot} /><Eye size={12} /> {article.view_count} views</div>
            )}
          </div>

          <div className={styles.divider} />
          <div className={styles.content}>
            {Array.isArray(article.content) && article.content.map((block: ArticleBlock) => (
              <ArticleBlockRenderer key={block.id} block={block} products={products} onOpenProduct={setActiveProduct} />
            ))}
          </div>

          {author && (
            <div className={styles.authorFooter}>
              {author.photo_url ? (
                <div className={styles.authorFooterAvatar} style={{ position: 'relative', overflow: 'hidden' }}>
                  <Image
                    src={getDriveThumb(author.photo_url, 'w160-h160') || ''}
                    alt={author.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className={styles.authorAvatarLgPlaceholder}>{author.name[0]}</div>
              )}
              <div><div className={styles.authorFooterLabel}>Ditulis oleh</div><div className={styles.authorFooterName}>{author.name}</div></div>
            </div>
          )}

          <div className={styles.articleEnd}><Link href="/article" className={styles.backBtnLg}><ArrowLeft size={16} /> Kembali ke Articles</Link></div>
        </article>
      </main>

      {activeProduct && <ProductPopup product={activeProduct} onClose={() => setActiveProduct(null)} />}
      <Footer />
    </>
  )
}
