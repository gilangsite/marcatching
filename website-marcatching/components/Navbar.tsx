'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import type { NavLink } from '@/lib/supabaseClient'
import styles from './Navbar.module.css'

type NavbarAccount = {
  email: string | null
  onLoginClick: () => void
  onLogoutClick: () => void
}

type NavbarProps = {
  navLinks?: NavLink[]
  variant?: 'dark' | 'light'
  // Optional account slot — only rendered when passed, so other Navbar consumers
  // (article pages, campaign pages, etc.) are unaffected.
  account?: NavbarAccount
}

export default function Navbar({ variant = 'dark', account }: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className={`${styles.navbar} ${variant === 'light' ? styles.navbarLight : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo-type-white.png"
            alt="Marcatching"
            width={140}
            height={36}
            priority
            style={{ objectFit: 'contain', height: '32px', width: 'auto' }}
          />
        </Link>
        {account && (
          <div className={styles.dropdownWrap} ref={menuRef}>
            {account.email ? (
              <>
                <button type="button" className={styles.accountAvatarBtn} onClick={() => setShowMenu(v => !v)} aria-label="Akun">
                  {account.email.charAt(0).toUpperCase()}
                </button>
                {showMenu && (
                  <div className={styles.dropdownMenu}>
                    <span className={styles.dropdownEmail}>{account.email}</span>
                    <button type="button" className={styles.dropdownItemBtn} onClick={() => { setShowMenu(false); account.onLogoutClick() }}>
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button type="button" className={styles.accountLoginBtn} onClick={account.onLoginClick}>Masuk</button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
