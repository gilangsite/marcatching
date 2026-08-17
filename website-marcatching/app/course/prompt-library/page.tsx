'use client'

import { BookOpen } from 'lucide-react'
import { PromptLibraryBrowser } from '@/components/prompt-library/PromptLibraryBrowser'
import styles from './prompt-library.module.css'

export default function CoursePromptLibraryPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.eyebrow}><BookOpen size={13} /> Prompt Library</span>
        <h1>Copy prompt siap pakai</h1>
        <p>Brand Memory kamu otomatis terhubung di sini — nggak perlu login ulang atau isi field manual.</p>
      </div>
      <PromptLibraryBrowser />
    </div>
  )
}
