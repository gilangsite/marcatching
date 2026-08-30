'use client'

import { ShoppingBag } from 'lucide-react'
import { ProductPickerGrid } from '@/components/store/ProductPickerGrid'
import styles from './store.module.css'

export default function CourseStorePage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.eyebrow}><ShoppingBag size={13} /> Store</span>
        <h1>Semua Produk Marcatching</h1>
        <p>Cari dan beli produk langsung dari sini. Klik salah satu produk untuk lanjut ke checkout.</p>
      </div>
      <div className={styles.body}>
        <ProductPickerGrid maxHeight="none" displayMode="store" />
      </div>
    </div>
  )
}
