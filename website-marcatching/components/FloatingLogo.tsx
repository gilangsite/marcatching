'use client'

import Image from 'next/image'
import styles from './FloatingLogo.module.css'

export default function FloatingLogo() {
  return (
    <div className={styles.floating}>
      <Image
        src="/logo-shape-white.png"
        alt="Marcatching"
        width={36}
        height={36}
        style={{ objectFit: 'contain', width: '36px', height: '36px' }}
      />
    </div>
  )
}
