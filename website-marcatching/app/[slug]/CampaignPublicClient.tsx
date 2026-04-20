'use client'

import React, { useMemo } from 'react'
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

// ── Global styles injected once ──────────────────────────────
const PAGE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');

/* Sparkle orbs - very low opacity decorative movement */
@keyframes orbDrift1 {
  0%   { transform: translate(0px, 0px) scale(1); }
  33%  { transform: translate(60px, -40px) scale(1.1); }
  66%  { transform: translate(-40px, 30px) scale(0.95); }
  100% { transform: translate(0px, 0px) scale(1); }
}
@keyframes orbDrift2 {
  0%   { transform: translate(0px, 0px) scale(1); }
  40%  { transform: translate(-70px, 50px) scale(1.15); }
  80%  { transform: translate(50px, -30px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
@keyframes orbDrift3 {
  0%   { transform: translate(0px, 0px) scale(1); }
  50%  { transform: translate(40px, 60px) scale(1.05); }
  100% { transform: translate(0px, 0px) scale(1); }
}

/* Button hover */
.camp-btn {
  transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease !important;
}
.camp-btn:hover {
  transform: translateY(-3px) scale(1.015) !important;
  box-shadow: 0 14px 40px rgba(0,0,0,0.18) !important;
}

/* Product card hover */
.camp-card {
  transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease !important;
}
.camp-card:hover {
  transform: translateY(-6px) !important;
  box-shadow: 0 20px 56px rgba(0,0,0,0.1) !important;
}
`

// ── Subtle sparkle background ─────────────────────────────────
function SparkleBackground({ theme }: { theme: 'black' | 'white' }) {
  if (theme === 'black') {
    // Dark: subtle blue/indigo orbs, very low opacity
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', background: '#050911' }}>
        <div style={{
          position: 'absolute', width: 600, height: 600,
          borderRadius: '50%', top: '-10%', left: '-15%',
          background: 'radial-gradient(circle, rgba(13,51,105,0.35) 0%, transparent 70%)',
          filter: 'blur(60px)', animation: 'orbDrift1 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500,
          borderRadius: '50%', bottom: '5%', right: '-10%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          filter: 'blur(80px)', animation: 'orbDrift2 22s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 350, height: 350,
          borderRadius: '50%', top: '40%', left: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)', animation: 'orbDrift3 15s ease-in-out infinite',
        }} />
      </div>
    )
  }
  // Light: pure white bg with barely-visible soft color orbs drifting
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', background: '#ffffff' }}>
      <div style={{
        position: 'absolute', width: 700, height: 700,
        borderRadius: '50%', top: '-20%', left: '-20%',
        background: 'radial-gradient(circle, rgba(219,234,254,0.55) 0%, transparent 65%)',
        filter: 'blur(80px)', animation: 'orbDrift1 20s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500,
        borderRadius: '50%', bottom: '0%', right: '-15%',
        background: 'radial-gradient(circle, rgba(254,243,199,0.45) 0%, transparent 65%)',
        filter: 'blur(90px)', animation: 'orbDrift2 25s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%', top: '50%', left: '55%',
        background: 'radial-gradient(circle, rgba(237,233,254,0.35) 0%, transparent 65%)',
        filter: 'blur(70px)', animation: 'orbDrift3 17s ease-in-out infinite',
      }} />
    </div>
  )
}

// ── Block renderer ───────────────────────────────────────────
function CampaignBlockRenderer({ block, theme }: { block: CampaignBlock, theme: 'black' | 'white' }) {
  const c = block.content

  if (block.type === 'headline') {
    const sizeMap: Record<string, string> = {
      h1: 'clamp(2.1rem, 7vw, 3.2rem)',
      h2: 'clamp(1.6rem, 5.5vw, 2.4rem)',
      h3: 'clamp(1.2rem, 4vw, 1.7rem)',
      sub: '1.1rem'
    }
    // Use the user-set color, fall back to theme default
    const textColor = c.color || (theme === 'black' ? '#ffffff' : '#0f172a')
    // Elegant text-shadow under/below — subtle, not colored
    const shadowColor = theme === 'black' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)'
    return (
      <div style={{
        fontSize: sizeMap[c.size || 'h2'] || sizeMap.h2,
        fontWeight: 900,
        marginBottom: '1.2rem',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '-0.03em',
        lineHeight: 1.15,
        textAlign: (c.align as any) || 'left',
        color: textColor,
        textShadow: `0 2px 12px ${shadowColor}, 0 1px 2px ${shadowColor}`,
      }}>
        <div dangerouslySetInnerHTML={{ __html: c.text || '' }} />
      </div>
    )
  }

  if (block.type === 'text') {
    const textColor = c.color || (theme === 'black' ? '#d1d5db' : '#374151')
    return (
      <div style={{
        fontSize: c.font_size || '1.05rem',
        fontWeight: c.weight === 'bold' ? 700 : c.weight === 'semibold' ? 600 : 400,
        fontStyle: c.italic ? 'italic' : 'normal',
        marginBottom: '1.2rem',
        lineHeight: 1.75,
        color: textColor,
        textAlign: (c.align as any) || 'left',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div dangerouslySetInnerHTML={{ __html: c.text || '' }} />
      </div>
    )
  }

  if (block.type === 'image' && c.url) {
    const thumb = getDriveThumb(c.url, 'w1400-h1400')
    const isOriginal = c.aspect_ratio === 'original' || !c.aspect_ratio
    const aspect = (c.aspect_ratio && String(c.aspect_ratio) !== 'original') ? String(c.aspect_ratio) : '16:9'
    const [w, h] = aspect.split(':').map(Number)
    
    const anyC = c as any
    // Default conditions if properties missing
    const hasShadow = anyC.has_shadow ?? true;
    const hasBorder = anyC.has_border ?? false;
    const redirectUrl = anyC.redirect_url;

    const ImageWrapper = redirectUrl ? 'a' : 'div';
    const wrapperProps = redirectUrl ? { 
      href: redirectUrl, 
      target: '_blank', 
      rel: 'noopener noreferrer',
      style: { display: 'block', marginBottom: '1.5rem', width: '100%', textDecoration: 'none' } 
    } : {
      style: { marginBottom: '1.5rem', width: '100%' }
    };

    return (
      <ImageWrapper {...wrapperProps}>
        <div style={{
          ...(isOriginal ? { width: '100%' } : { aspectRatio: `${w}/${h}` }),
          overflow: 'hidden',
          borderRadius: 16,
          backgroundColor: theme === 'black' ? '#1e293b' : '#f1f5f9',
          boxShadow: hasShadow 
            ? (theme === 'black' ? '0 8px 32px rgba(0,0,0,0.45)' : '0 6px 24px rgba(0,0,0,0.07)')
            : 'none',
          border: hasBorder
            ? (theme === 'black' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)')
            : 'none',
        }}>
          <img
            src={thumb || c.url}
            alt={c.caption || ''}
            style={{ width: '100%', height: isOriginal ? 'auto' : '100%', objectFit: isOriginal ? 'contain' : 'cover', display: 'block' }}
          />
        </div>
        {c.caption && <p style={{ fontSize: '0.8rem', color: theme === 'black' ? '#6b7280' : '#9ca3af', textAlign: 'center', marginTop: '0.5rem', fontFamily: "'DM Sans', sans-serif" }}>{c.caption}</p>}
      </ImageWrapper>
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
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?rel=0`}
            title={c.caption || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
        {c.caption && <p style={{ fontSize: '0.8rem', color: theme === 'black' ? '#6b7280' : '#9ca3af', textAlign: 'center', marginTop: '0.5rem', fontFamily: "'DM Sans', sans-serif" }}>{c.caption}</p>}
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
          className="camp-btn"
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
            boxShadow: theme === 'black'
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 4px 20px rgba(13,51,105,0.18)',
          }}
        >
          {c.btn_text}
        </a>
      </div>
    )
  }
  return null
}

// ── Product card ─────────────────────────────────────────────
function CampaignProductCard({ product, isComingSoon, theme }: { product: Product; isComingSoon: boolean, theme: 'black' | 'white' }) {
  const thumb = getDriveThumb(product.image_url, 'w800-h1000')
  return (
    <Link
      href={isComingSoon ? '#' : `/product/${product.slug}`}
      onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
      className="camp-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 20,
        overflow: 'hidden',
        background: theme === 'black'
          ? 'linear-gradient(145deg, #111827, #1a2336)'
          : '#ffffff',
        border: theme === 'black'
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid rgba(0,0,0,0.06)',
        textDecoration: 'none',
        color: 'inherit',
        marginBottom: '1.5rem',
        boxShadow: theme === 'black'
          ? '0 4px 24px rgba(0,0,0,0.45)'
          : '0 4px 20px rgba(0,0,0,0.05)',
        fontFamily: "'DM Sans', sans-serif",
        width: '100%',
      }}
    >
      <div style={{ aspectRatio: '4/5', position: 'relative', overflow: 'hidden', backgroundColor: theme === 'black' ? '#1f2937' : '#f8fafc' }}>
        {thumb
          ? <img src={thumb} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800, color: theme === 'black' ? '#374151' : '#d1d5db' }}>M</div>
        }
        {product.discount_percentage > 0 && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 800 }}>-{product.discount_percentage}%</span>
        )}
        {isComingSoon && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#0f172a', color: '#fff', padding: '8px 16px', borderRadius: 24, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Coming Soon</span>
          </div>
        )}
      </div>
      <div style={{ padding: '18px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: theme === 'black' ? '#f9fafb' : '#0f172a', margin: '0 0 4px 0', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{product.name}</h2>
        {product.sub_headline && <p style={{ fontSize: '0.82rem', color: theme === 'black' ? '#9ca3af' : '#6b7280', margin: '0 0 14px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{product.sub_headline}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 12, borderTop: theme === 'black' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {product.price_before_discount > product.price_after_discount && (
              <span style={{ fontSize: '0.72rem', color: theme === 'black' ? '#6b7280' : '#94a3b8', textDecoration: 'line-through' }}>{formatRp(product.price_before_discount)}</span>
            )}
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: theme === 'black' ? '#38bdf8' : '#0d3369' }}>{formatRp(product.price_after_discount)}</span>
          </div>
          {(product.checkout_clicks ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme === 'black' ? 'rgba(56,189,248,0.1)' : '#eff6ff', color: theme === 'black' ? '#38bdf8' : '#0d3369', padding: '5px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 }}>
              <ShoppingCart size={11} />
              <span>{product.checkout_clicks}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Main ─────────────────────────────────────────────────────
export default function CampaignPublicClient({ campaign, products, navLinks }: { campaign: Campaign, products: Product[], navLinks: NavLink[] }) {
  const productsById = useMemo(() => {
    const map: Record<string, Product> = {}
    for (const p of products) map[p.id] = p
    return map
  }, [products])

  const { theme, blocks } = campaign

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />
      {/* Fixed sparkle background behind everything */}
      <SparkleBackground theme={theme} />

      {/* Page content above background */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar navLinks={navLinks} />
        <div style={{
          color: theme === 'black' ? '#f9fafb' : '#0f172a',
          padding: 'calc(76px + env(safe-area-inset-top, 12px)) 24px 100px',
        }}>
          <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(!blocks || blocks.length === 0) && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: theme === 'black' ? '#6b7280' : '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}>
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
