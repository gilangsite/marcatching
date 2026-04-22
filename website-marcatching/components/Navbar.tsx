'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Menu, X, Camera as Instagram, Music2, Globe, Video,
  Mail, Link as LinkIcon, ShoppingBag, ExternalLink
} from 'lucide-react'
import type { NavLink } from '@/lib/supabaseClient'
import styles from './Navbar.module.css'

const ICON_MAP: Record<string, React.ElementType> = {
  Globe, Instagram, Video, Music2, Mail, Link: LinkIcon,
  ShoppingBag, ExternalLink,
}

export default function Navbar({ navLinks = [] }: { navLinks?: NavLink[] }) {
  const [isOpen, setIsOpen] = useState(false)

  // Filter to only active items
  const activeLinks = navLinks.filter(l => l.is_active)

  return (
    <nav className={styles.navbar}>
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
              {activeLinks.length > 0 ? (
                activeLinks.map(link => {
                  const IconComp = ICON_MAP[link.icon] ?? Globe
                  const hasBtn = !!link.btn_color
                  const isInternal = link.url?.startsWith('/') && !link.url?.startsWith('//')

                  if (isInternal) {
                    return (
                      <Link
                        key={link.id}
                        href={link.url || '#'}
                        className={hasBtn ? styles.dropdownItemBtn : styles.dropdownItem}
                        style={{
                          color: link.text_color || '#ffffff',
                          ...(hasBtn ? { background: link.btn_color! } : {}),
                        }}
                        onClick={() => setIsOpen(false)}
                      >
                        <IconComp size={20} />
                        <span>{link.title}</span>
                      </Link>
                    )
                  }

                  return (
                    <a
                      key={link.id}
                      href={link.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={hasBtn ? styles.dropdownItemBtn : styles.dropdownItem}
                      style={{
                        color: link.text_color || '#ffffff',
                        ...(hasBtn ? { background: link.btn_color! } : {}),
                      }}
                    >
                      <IconComp size={20} />
                      <span>{link.title}</span>
                    </a>
                  )
                })
              ) : (
                <span className={styles.dropdownEmpty}>No links available</span>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
