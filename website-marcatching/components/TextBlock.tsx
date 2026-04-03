import React from 'react'
import type { Link } from '@/lib/supabaseClient'
import styles from './TextBlock.module.css'

export default function TextBlock({ link }: { link: Link }) {
  return (
    <div 
      className={styles.textBlock} 
      style={{
        color: link.text_color || '#1A1A1A',
        fontSize: link.text_size || '1rem',
        textAlign: (link.text_align as 'left' | 'center' | 'right' | 'justify') || 'center',
        fontWeight: link.text_bold ? 'bold' : 'normal',
        fontStyle: link.text_italic ? 'italic' : 'normal',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word'
      }}
    >
      {link.title}
    </div>
  )
}
