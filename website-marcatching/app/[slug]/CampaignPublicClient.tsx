'use client'

import React, { useMemo, useRef } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import type { Campaign, CampaignBlock, Product, NavLink } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'

// ── Helpers ──────────────────────────────────────────────────
function getDriveThumb(url: string | null | undefined, size = 'w1400-h1400') {
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

// ── Gradient animations CSS injected once ──────────────────
const GRADIENT_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes gradientShiftDark {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes btnPulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
  50% { box-shadow: 0 6px 32px rgba(0,0,0,0.25); }
}
.campaign-btn {
  transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, opacity 0.2s ease !important;
  animation: btnPulse 3s ease-in-out infinite;
}
.campaign-btn:hover {
  transform: translateY(-3px) scale(1.02) !important;
  box-shadow: 0 10px 40px rgba(0,0,0,0.22) !important;
  animation: none;
}
.campaign-headline-grad {
  background: linear-gradient(135deg, #0d3369 0%, #3b82f6 50%, #0d3369 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 6s ease infinite;
}
.campaign-headline-grad-light {
  background: linear-gradient(135deg, #f97316 0%, #fbbf24 40%, #ef4444 70%, #f97316 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 6s ease infinite;
}
.campaign-product-card {
  transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease !important;
}
.campaign-product-card:hover {
  transform: translateY(-6px) scale(1.01) !important;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
}
`

// ── Block renderer ──────────────────────────────────────────
function CampaignBlockRenderer({ block, theme }: { block: CampaignBlock, theme: 'black' | 'white' }) {
  const c = block.content
  if (block.type === 'headline') {
    const sizeMap: Record<string, string> = {
      h1: 'clamp(2.2rem, 8vw, 3.5rem)',
      h2: 'clamp(1.7rem, 6vw, 2.5rem)',
      h3: 'clamp(1.3rem, 4vw, 1.8rem)',
      sub: '1.1rem'
    }
    const hasCustomColor = c.color && c.color !== '#ffffff' && c.color !== '#000000' && c.color !== '#0d3369'
    return (
      <div style={{
        fontSize: sizeMap[c.size || 'h2'] || sizeMap.h2,
        fontWeight: 900,
        marginBottom: '1.2rem',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '-0.03em',
        lineHeight: 1.15,
        textAlign: (c.align as any) || 'left',
        color: hasCustomColor ? c.color : undefined,
        textShadow: hasCustomColor ? '0 2px 8px rgba(0,0,0,0.12)' : undefined,
      }}
        className={!hasCustomColor ? (theme === 'black' ? 'campaign-headline-grad' : 'campaign-headline-grad-light') : undefined}
      >
        {c.text}
      </div>
    )
  }

  if (block.type === 'text') {
    return (
      <div style={{
        fontSize: c.font_size || '1.05rem',
        fontWeight: c.weight === 'bold' ? 700 : c.weight === 'semibold' ? 600 : 400,
        fontStyle: c.italic ? 'italic' : 'normal',
        marginBottom: '1.2rem',
        lineHeight: 1.75,
        color: c.color || (theme === 'black' ? '#d1d5db' : '#374151'),
        textAlign: (c.align as any) || 'left',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {(c.text || '').split('\\n').map((line: string, i: number, arr: string[]) => (
          <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
        ))}
      </div>
    )
  }

  if (block.type === 'image' && c.url) {
    const thumb = getDriveThumb(c.url, 'w1400-h1400')
    const isOriginal = c.aspect_ratio === 'original'
    const aspect = (c.aspect_ratio && c.aspect_ratio !== 'original') ? c.aspect_ratio : '16:9'
    const [w, h] = aspect.split(':').map(Number)
    return (
      <div style={{ marginBottom: '1.5rem', width: '100%' }}>
        <div style={{
          ...(isOriginal ? { width: '100%' } : { aspectRatio: `${w}/${h}` }),
          overflow: 'hidden',
          borderRadius: 16,
          backgroundColor: theme === 'black' ? '#1e293b' : '#f1f5f9',
          boxShadow: theme === 'black' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.07)',
        }}>
          <img
            src={thumb || c.url}
            alt={c.caption || ''}
            style={{ width: '100%', height: isOriginal ? 'auto' : '100%', objectFit: isOriginal ? 'contain' : 'cover', display: 'block' }}
          />
        </div>
        {c.caption && <p style={{ fontSize: '0.82rem', color: theme === 'black' ? '#6b7280' : '#9ca3af', textAlign: 'center', marginTop: '0.5rem', fontFamily: "'DM Sans', sans-serif" }}>{c.caption}</p>}
      </div>
    )
  }

  if (block.type === 'video' && c.video_url) {
    const ytId = getYouTubeId(c.video_url)
    if (!ytId) return null
    return (
      <div style={{ marginBottom: '1.5rem', width: '100%' }}>
        <div style={{
          position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden',
          borderRadius: 16, backgroundColor: '#000',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?rel=0`}
            title={c.caption || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
        {c.caption && <p style={{ fontSize: '0.82rem', color: theme === 'black' ? '#6b7280' : '#9ca3af', textAlign: 'center', marginTop: '0.5rem', fontFamily: "'DM Sans', sans-serif" }}>{c.caption}</p>}
      </div>
    )
  }

  if (block.type === 'button' && c.btn_text) {
    const defaultBg = theme === 'black'
      ? 'linear-gradient(135deg, #0d3369 0%, #1d4ed8 100%)'
      : 'linear-gradient(135deg, #0d3369 0%, #1d4ed8 100%)'
    const bg = (c.btn_color && c.btn_color !== '#ffffff') ? c.btn_color : defaultBg
    const textCol = (c.btn_text_color && c.btn_text_color !== '#000000') ? c.btn_text_color : '#ffffff'
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <a
          href={c.btn_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="campaign-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '18px 32px',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: '1.05rem',
            letterSpacing: '0.01em',
            textAlign: 'center',
            textDecoration: 'none',
            background: bg,
            color: textCol,
            fontFamily: "'DM Sans', sans-serif",
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
function CampaignProductCard({ product, isComingSoon, theme }: { product: Product; isComingSoon: boolean, theme: 'black' | 'white' }) {
  const thumb = getDriveThumb(product.image_url, 'w800-h1000')
  return (
    <Link
      href={isComingSoon ? '#' : `/product/${product.slug}`}
      onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
      className="campaign-product-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 20,
        overflow: 'hidden',
        background: theme === 'black'
          ? 'linear-gradient(145deg, #111827, #1f2937)'
          : 'linear-gradient(145deg, #ffffff, #f8fafc)',
        border: theme === 'black' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        textDecoration: 'none',
        color: 'inherit',
        marginBottom: '1.5rem',
        boxShadow: theme === 'black'
          ? '0 4px 20px rgba(0,0,0,0.5)'
          : '0 4px 24px rgba(0,0,0,0.06)',
        width: '100%',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ aspectRatio: '4/5', position: 'relative', overflow: 'hidden', backgroundColor: theme === 'black' ? '#1f2937' : '#f1f5f9' }}>
        {thumb
          ? <img src={thumb} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800, color: theme === 'black' ? '#374151' : '#d1d5db' }}>M</div>
        }
        {product.discount_percentage > 0 && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em' }}>-{product.discount_percentage}%</span>
        )}
        {isComingSoon && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#000', color: '#fff', padding: '8px 16px', borderRadius: 24, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Coming Soon</span>
          </div>
        )}
      </div>
      <div style={{ padding: '18px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: theme === 'black' ? '#f9fafb' : '#111827', margin: '0 0 4px 0', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{product.name}</h2>
        {product.sub_headline && <p style={{ fontSize: '0.82rem', color: theme === 'black' ? '#9ca3af' : '#6b7280', margin: '0 0 14px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{product.sub_headline}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 12, borderTop: theme === 'black' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {product.price_before_discount > product.price_after_discount && (
              <span style={{ fontSize: '0.72rem', color: theme === 'black' ? '#6b7280' : '#9ca3af', textDecoration: 'line-through' }}>{formatRp(product.price_before_discount)}</span>
            )}
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: theme === 'black' ? '#38bdf8' : '#0d3369' }}>{formatRp(product.price_after_discount)}</span>
          </div>
          {(product.checkout_clicks ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme === 'black' ? 'rgba(56,189,248,0.1)' : '#eff6ff', color: theme === 'black' ? '#38bdf8' : '#0d3369', padding: '4px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 }}>
              <ShoppingCart size={11} />
              <span>{product.checkout_clicks}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Animated mesh gradient background ────────────────────────
function CampaignBackground({ theme }: { theme: 'black' | 'white' }) {
  if (theme === 'black') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(135deg, #030712 0%, #0a1628 40%, #0d2348 70%, #030712 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShiftDark 15s ease infinite',
      }} />
    )
  }
  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 25%, #fef3c7 50%, #fff7ed 75%, #ffedd5 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 12s ease infinite',
      }} />
      <div style={{
        position: 'fixed',
        bottom: -100, left: '5%', right: '5%', height: 500,
        zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 30% 100%, rgba(251,191,36,0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 100%, rgba(249,115,22,0.25) 0%, transparent 60%)',
        filter: 'blur(60px)',
        animation: 'gradientShift 10s ease-in-out infinite alternate',
      }} />
    </>
  )
}

// ── Main Client Component ─────────────────────────────────────
export default function CampaignPublicClient({ campaign, products, navLinks }: { campaign: Campaign, products: Product[], navLinks: NavLink[] }) {
  const productsById = useMemo(() => {
    const map: Record<string, Product> = {}
    for (const p of products) map[p.id] = p
    return map
  }, [products])

  const { theme, blocks } = campaign

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GRADIENT_STYLE }} />
      <CampaignBackground theme={theme} />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar navLinks={navLinks} />
        <div style={{
          color: theme === 'black' ? '#f9fafb' : '#111827',
          padding: 'calc(80px + env(safe-area-inset-top, 16px)) 24px 100px',
        }}>
          <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {(!blocks || blocks.length === 0) && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: theme === 'black' ? '#6b7280' : '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
                Campaign ini belum memiliki konten.
              </div>
            )}
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
      </div>
    </>
  )
}
