'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { NavLink } from '@/lib/supabaseClient'
import styles from './Navbar.module.css'

type NavbarProps = {
  navLinks?: NavLink[]
  variant?: 'dark' | 'light'
}

export default function Navbar({ variant = 'dark' }: NavbarProps) {
  return (
    <nav className={`${styles.navbar} ${variant === 'light' ? styles.navbarLight : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Image
            src={variant === 'light' ? '/logo-type-navy.png' : '/logo-type-white.png'}
            alt="Marcatching"
            width={140}
            height={36}
            priority
            style={{ objectFit: 'contain', height: '32px', width: 'auto' }}
          />
        </Link>
      </div>
    </nav>
  )
}
