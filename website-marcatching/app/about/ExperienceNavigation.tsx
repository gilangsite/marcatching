'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { NavLink } from '@/lib/supabaseClient'
import { useExperience } from './ExperienceStore'
import styles from './ExperienceNavigation.module.css'

const primaryLinks = [
  { href: '#problem', label: 'Why Marcatching', section: 'problem' },
  { href: '#build', label: 'Core System', section: 'build' },
  { href: '#ecosystem', label: 'Ecosystem', section: 'ecosystem' },
  { href: '#paths', label: 'For You', section: 'paths' },
] as const

export default function ExperienceNavigation({ navLinks, ctaUrl }: { navLinks: NavLink[]; ctaUrl: string }) {
  const [open, setOpen] = useState(false)
  const { pageProgress, activeSection } = useExperience()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <nav className={`${styles.nav} ${pageProgress > 0.012 ? styles.scrolled : ''} ${open ? styles.menuOpen : ''}`} aria-label="Primary navigation">
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="Marcatching home" onClick={() => setOpen(false)}>
          <Image src="/logo-type-white.png" alt="Marcatching" width={160} height={42} priority />
        </Link>

        <div className={styles.desktopLinks}>
          {primaryLinks.map((item) => (
            <a key={item.href} href={item.href} className={`${styles.link} ${activeSection === item.section ? styles.linkActive : ''}`} aria-current={activeSection === item.section ? 'location' : undefined}>{item.label}</a>
          ))}
          <Link href={ctaUrl} className={styles.navCta}>Explore Store</Link>
        </div>

        <button type="button" className={styles.menuButton} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="experience-mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}><span /></button>

        <div className={styles.mobilePanel} id="experience-mobile-menu" aria-hidden={!open}>
          <div className={styles.mobilePrimary}>
            {primaryLinks.map((item) => <a key={item.href} href={item.href} className={styles.mobileLink} onClick={() => setOpen(false)}>{item.label}</a>)}
            <Link href={ctaUrl} className={styles.mobileLink} onClick={() => setOpen(false)}>Explore Store</Link>
          </div>
          <div className={styles.mobileMeta}>
            {navLinks.filter((item) => item.url).map((item) => <Link key={item.id} href={item.url ?? '/'} onClick={() => setOpen(false)}>{item.title}</Link>)}
          </div>
        </div>
      </div>
    </nav>
  )
}
