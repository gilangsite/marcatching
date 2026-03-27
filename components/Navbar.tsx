'use client'

import Image from 'next/image'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <Image
            src="/logo-type-navy.png"
            alt="Marcatching"
            width={140}
            height={36}
            priority
            style={{ objectFit: 'contain', height: '32px', width: 'auto' }}
          />
        </div>
        <button className={`btn btn-outline ${styles.cta}`} disabled>
          Explore Website
        </button>
      </div>
    </nav>
  )
}
