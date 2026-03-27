'use client'

import { motion } from 'framer-motion'
import {
  Globe,
  Music2,
  Link as LinkIcon,
  Mail,
  Phone,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Camera,
  Video
} from 'lucide-react'
import type { Link } from '@/lib/supabaseClient'
import styles from './ButtonCard.module.css'

const ICON_MAP: Record<string, React.ElementType> = {
  Globe,
  Instagram: Camera,
  Video,
  Music2,
  Link: LinkIcon,
  Mail,
  Phone,
  ShoppingBag,
  ExternalLink,
}

interface ButtonCardProps {
  link: Link
  index?: number
}

export default function ButtonCard({ link, index = 0 }: ButtonCardProps) {
  const IconComponent = ICON_MAP[link.icon] ?? LinkIcon
  const isComingSoon = link.status === 'coming_soon'

  const content = (
    <div className={`${styles.card} ${isComingSoon ? styles.disabled : ''}`}>
      <div className={styles.iconWrap}>
        <IconComponent size={20} strokeWidth={1.75} />
      </div>
      <div className={styles.textWrap}>
        <span className={styles.title}>{link.title}</span>
        {isComingSoon && (
          <span className={styles.badge}>Coming Soon</span>
        )}
      </div>
      {!isComingSoon && (
        <div className={styles.arrow}>
          <ChevronRight size={18} strokeWidth={2} />
        </div>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {isComingSoon ? (
        <div className={styles.wrapper} aria-disabled="true">
          {content}
        </div>
      ) : (
        <a
          href={link.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.wrapper}
        >
          {content}
        </a>
      )}
    </motion.div>
  )
}
