'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen,
  BadgePercent,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import styles from './shell.module.css'

const navigation = [
  { href: '/', label: 'Learning Home', description: 'Course dan progress', icon: LayoutDashboard },
  { href: '/workspace', label: 'Creator Workspace', description: 'Revenue operating system', icon: Sparkles },
  { href: '/prompt-library', label: 'Prompt Library', description: 'Copy prompt siap pakai', icon: BookOpen },
  { href: '/store', label: 'Store', description: 'Cari & beli produk Marcatching', icon: ShoppingBag },
  { href: '/affiliate', label: 'Affiliate', description: 'Bagikan link & dapatkan komisi', icon: BadgePercent },
]

function getDisplayName(email: string) {
  const prefix = email.split('@')[0] || 'Member'
  return prefix
    .split(/[._-]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function CourseShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || '')
    })
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [mobileOpen])

  const displayName = useMemo(() => getDisplayName(email), [email])
  const currentLabel = pathname?.startsWith('/store')
    ? 'Store'
    : pathname?.startsWith('/affiliate')
      ? 'Affiliate'
    : pathname?.startsWith('/prompt-library')
      ? 'Prompt Library'
      : pathname?.startsWith('/workspace')
        ? 'Creator Workspace'
        : pathname === '/' || pathname === '/course'
          ? 'Learning Home'
          : 'Course'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className={styles.shell}>
      <header className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setMobileOpen(true)}
          aria-label="Buka navigasi"
          aria-expanded={mobileOpen}
        >
          <Menu size={20} />
        </button>
        <Image src="/logo-type-white.png" alt="Marcatching" width={118} height={39} priority />
        <span className={styles.mobileCurrent}>{currentLabel}</span>
      </header>

      <button
        type="button"
        className={`${styles.overlay} ${mobileOpen ? styles.overlayVisible : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-label="Tutup navigasi"
        tabIndex={mobileOpen ? 0 : -1}
      />

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brandRow}>
          <Link href="/" className={styles.brandLink} aria-label="Marcatching Learning Home">
            <Image src="/logo-type-white.png" alt="Marcatching" width={145} height={48} priority />
          </Link>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.mobileClose}`}
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup navigasi"
          >
            <X size={19} />
          </button>
        </div>

        <div className={styles.workspaceLabel}>
          <span className={styles.liveDot} />
          Member workspace
        </div>

        <nav className={styles.navigation} aria-label="Navigasi course">
          <p className={styles.navigationTitle}>Workspace</p>
          {navigation.map(item => {
            const Icon = item.icon
            const active = item.href === '/'
              ? pathname === '/' || pathname === '/course'
              : pathname?.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className={styles.navIcon}><Icon size={18} /></span>
                <span className={styles.navCopy}>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                <ChevronRight size={15} className={styles.navArrow} />
              </Link>
            )
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <a className={styles.helpCard} href="mailto:gilang@marcatching.com">
            <span className={styles.helpIcon}><HelpCircle size={18} /></span>
            <span>
              <strong>Butuh bantuan?</strong>
              <small>Hubungi tim Marcatching</small>
            </span>
          </a>

          <div className={styles.profile}>
            <div className={styles.avatar}>{displayName.charAt(0) || 'M'}</div>
            <div className={styles.profileCopy}>
              <strong>{displayName}</strong>
              <small>{email || 'Memuat akun...'}</small>
            </div>
            <button type="button" className={styles.logoutButton} onClick={handleLogout} aria-label="Keluar">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  )
}
