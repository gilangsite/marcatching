'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import type { Campaign, CampaignBlock, Product, NavLink } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'

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

// ── Block renderer ──────────────────────────────────────────
function CampaignBlockRenderer({ block, theme }: { block: CampaignBlock, theme: 'black' | 'white' }) {
  const c = block.content
  if (block.type === 'headline') {
    const sizeMap: Record<string, string> = { hero: '2.5rem', h1: '2.5rem', h2: '1.8rem', h3: '1.4rem', sub: '1rem' }
    return (
      <div style={{
        fontSize: sizeMap[c.size || 'h2'] || '1.8rem',
        fontWeight: 800,
        marginBottom: '1rem',
        color: c.color || (theme === 'black' ? '#ffffff' : '#0d3369'),
        textAlign: (c.align as any) || 'left',
        textShadow: c.color ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
        lineHeight: 1.25,
      }}>
        {c.text}
      </div>
    )
  }
  
  if (block.type === 'text') {
    return (
      <div style={{
        fontSize: c.font_size || '1rem',
        fontWeight: c.weight === 'bold' ? 700 : c.weight === 'semibold' ? 600 : 400,
        fontStyle: c.italic ? 'italic' : 'normal',
        marginBottom: '1rem',
        lineHeight: 1.6,
        color: c.color || (theme === 'black' ? '#e2e8f0' : '#1a1a1a'),
        textAlign: (c.align as any) || 'left',
      }}>
        {(c.text || '').split('\\n').map((line: string, i: number, arr: string[]) => (
          <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
        ))}
      </div>
    )
  }
  
  if (block.type === 'image' && c.url) {
    const thumb = getDriveThumb(c.url, 'w1400-h1400')
    const aspect = c.aspect_ratio || '16:9'
    const [w, h] = aspect.split(':').map(Number)
    return (
      <div style={{ marginBottom: '1.5rem', width: '100%' }}>
        <div style={{ aspectRatio: `${w}/${h}`, overflow: 'hidden', borderRadius: 12, backgroundColor: theme === 'black' ? '#1e293b' : '#f1f5f9' }}>
          <img src={thumb || c.url} alt={c.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {c.caption && <p style={{ fontSize: '0.85rem', color: theme === 'black' ? '#94a3b8' : '#64748b', textAlign: 'center', marginTop: '0.5rem' }}>{c.caption}</p>}
      </div>
    )
  }
  
  if (block.type === 'video' && c.video_url) {
    const ytId = getYouTubeId(c.video_url)
    if (!ytId) return null
    return (
      <div style={{ marginBottom: '1.5rem', width: '100%' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12, backgroundColor: '#000' }}>
          <iframe 
            src={`https://www.youtube.com/embed/${ytId}?rel=0`} 
            title={c.caption || 'Video'} 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
          />
        </div>
        {c.caption && <p style={{ fontSize: '0.85rem', color: theme === 'black' ? '#94a3b8' : '#64748b', textAlign: 'center', marginTop: '0.5rem' }}>{c.caption}</p>}
      </div>
    )
  }
  
  if (block.type === 'button' && c.btn_text) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <a
          href={c.btn_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '16px 24px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: '1.05rem',
            textAlign: 'center',
            textDecoration: 'none',
            background: (c.btn_color && c.btn_color !== '#ffffff') ? c.btn_color : (theme === 'black' ? '#38bdf8' : '#0d3369'),
            color: (c.btn_text_color && c.btn_text_color !== '#000000') ? c.btn_text_color : '#ffffff',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, opacity 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1' }}
        >
          {c.btn_text}
        </a>
      </div>
    )
  }
  return null
}

// ── Product card renderer ─────────────────────────────────────
function CampaignProductCard({ product, isComingSoon, theme }: { product: Product; isComingSoon: boolean, theme: 'black' | 'white' }) {
  const thumb = getDriveThumb(product.image_url, 'w800-h1000')
  return (
    <Link
      href={isComingSoon ? '#' : `/product/${product.slug}`}
      onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        overflow: 'hidden',
        background: theme === 'black' ? '#111827' : '#ffffff',
        border: theme === 'black' ? '1px solid #1f2937' : '1px solid #e2e8f0',
        textDecoration: 'none',
        color: 'inherit',
        marginBottom: '1.5rem',
        boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
        transition: 'transform 0.2s',
        width: '100%',
        maxWidth: 400,
        margin: '0 auto 1.5rem'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
    >
      <div style={{ aspectRatio: '4/5', position: 'relative', overflow: 'hidden', backgroundColor: theme === 'black' ? '#1f2937' : '#f8fafc' }}>
        {thumb
          ? <img src={thumb} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: theme === 'black' ? '#374151' : '#cbd5e1', fontWeight: 800 }}>M</div>
        }
        {product.discount_percentage > 0 && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>-{product.discount_percentage}%</span>
        )}
        {isComingSoon && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#000', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Coming Soon</span>
          </div>
        )}
      </div>
      <div style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: theme === 'black' ? '#f8fafc' : '#0f172a', margin: '0 0 4px 0', lineHeight: 1.3 }}>{product.name}</h2>
        {product.sub_headline && <p style={{ fontSize: '0.8rem', color: theme === 'black' ? '#94a3b8' : '#64748b', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.sub_headline}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {product.price_before_discount > product.price_after_discount && (
              <span style={{ fontSize: '0.75rem', color: theme === 'black' ? '#64748b' : '#94a3b8', textDecoration: 'line-through' }}>{formatRp(product.price_before_discount)}</span>
            )}
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: theme === 'black' ? '#38bdf8' : '#0d3369' }}>{formatRp(product.price_after_discount)}</span>
          </div>
          {(product.checkout_clicks ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme === 'black' ? 'rgba(56,189,248,0.1)' : '#eff6ff', color: theme === 'black' ? '#38bdf8' : '#0d3369', padding: '4px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>
              <ShoppingCart size={11} />
              <span>{product.checkout_clicks}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Main Client Component ─────────────────────────────────────
export default function CampaignPublicClient({ campaign, products, navLinks }: { campaign: Campaign, products: Product[], navLinks: NavLink[] }) {
  // Index products by id for O(1) lookup
  const productsById = useMemo(() => {
    const map: Record<string, Product> = {}
    for (const p of products) map[p.id] = p
    return map
  }, [products])

  const { theme, blocks } = campaign

  return (
    <>
      <Navbar navLinks={navLinks} />
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: theme === 'black' ? '#0a0a0a' : '#ffffff',
        color: theme === 'black' ? '#ffffff' : '#1a1a1a',
        fontFamily: 'var(--font-dmsans), sans-serif',
        padding: '60px 24px 100px',
        transition: 'background-color 0.3s'
      }}>
        <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(!blocks || blocks.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: theme === 'black' ? '#475569' : '#94a3b8' }}>
              Campaign ini belum memiliki konten.
            </div>
          )}

          {/* Render Blocks in Order */}
          {blocks?.map(b => {
            if (b.type === 'product') {
              const p = productsById[b.content.product_id || '']
              if (!p) return null
              const isComingSoon = b.content.store_status === 'coming_soon' || !!p.is_coming_soon
              return <CampaignProductCard key={b.id} product={p} isComingSoon={isComingSoon} theme={theme} />
            }
            return <CampaignBlockRenderer key={b.id} block={b} theme={theme} />
          })}
        </div>
      </div>
    </>
  )
}
