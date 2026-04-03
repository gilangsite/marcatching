'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, X, Camera as Instagram, Music2 } from 'lucide-react'
import type { Link } from '@/lib/supabaseClient'
import styles from './Navbar.module.css'

export default function Navbar({ links = [] }: { links?: Link[] }) {
  const [isOpen, setIsOpen] = useState(false)

  const igLink = links.find(l => l.title.toLowerCase().includes('instagram'))?.url || 'https://www.instagram.com/marcatching.id/'
  const tiktokLink = links.find(l => l.title.toLowerCase().includes('tiktok'))?.url || 'https://www.tiktok.com/@marcatching'

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <Image
            src="/logo-type-white.png"
            alt="Marcatching"
            width={140}
            height={36}
            priority
            style={{ objectFit: 'contain', height: '32px', width: 'auto' }}
          />
        </div>
        
        <div className={styles.dropdownWrap}>
          <button 
            className={styles.hamburgerBtn} 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {isOpen && (
            <div className={styles.dropdownMenu}>
              <a href={igLink} target="_blank" rel="noopener noreferrer" className={styles.dropdownItem}>
                <Instagram size={20} />
                <span>Instagram</span>
              </a>
              <a href={tiktokLink} target="_blank" rel="noopener noreferrer" className={styles.dropdownItem}>
                <Music2 size={20} />
                <span>TikTok</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
