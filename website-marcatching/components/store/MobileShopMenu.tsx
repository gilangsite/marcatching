'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BadgePercent, ChevronRight, CreditCard, Menu, ShoppingCart, X } from 'lucide-react'
import type { ProductCategory } from '@/lib/supabaseClient'
import styles from './MobileShopMenu.module.css'

export default function MobileShopMenu({
  categories,
  activeCategory,
  onSelectCategory,
  productCount,
  appliedVoucherActive,
  voucherProductCount,
  onOpenVoucher,
  cartCount,
  onOpenCart,
  canCheckout,
  onCheckout,
  cartBumpNonce,
}: {
  categories: ProductCategory[]
  activeCategory: string
  onSelectCategory: (categoryId: string) => void
  productCount: number
  appliedVoucherActive: boolean
  voucherProductCount: number
  onOpenVoucher: () => void
  cartCount: number
  onOpenCart: () => void
  canCheckout: boolean
  onCheckout: () => void
  cartBumpNonce: number
}) {
  const [open, setOpen] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
        setShowCategories(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function closeMenu() {
    setOpen(false)
    setShowCategories(false)
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        data-cart-flight-target="true"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu toko"
        onClick={() => setOpen(v => !v)}
      >
        <motion.span
          key={cartBumpNonce}
          className={styles.triggerIconWrap}
          animate={{ scale: [1, 1.22, 0.94, 1.08, 1], rotate: [0, -14, 11, -5, 0] }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </motion.span>
        {cartCount > 0 && <span className={styles.triggerBadge}>{cartCount}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="menu" aria-label="Menu toko">
          {!showCategories ? (
            <>
              <button type="button" className={styles.panelItem} role="menuitem" onClick={() => setShowCategories(true)}>
                <span>Kategori</span>
                <ChevronRight size={15} />
              </button>
              <button type="button" className={styles.panelItem} role="menuitem" onClick={() => { onOpenVoucher(); closeMenu() }}>
                <span className={styles.panelItemLabel}><BadgePercent size={16} /> Voucher Code</span>
                {appliedVoucherActive && <strong>{voucherProductCount}</strong>}
              </button>
              <button type="button" className={styles.panelItem} role="menuitem" onClick={() => { onOpenCart(); closeMenu() }}>
                <span className={styles.panelItemLabel}><ShoppingCart size={16} /> Keranjang</span>
                <strong>{cartCount}</strong>
              </button>
              <button type="button" className={styles.panelItem} role="menuitem" disabled={!canCheckout} onClick={() => { onCheckout(); closeMenu() }}>
                <span className={styles.panelItemLabel}><CreditCard size={16} /> Checkout</span>
              </button>
            </>
          ) : (
            <>
              <button type="button" className={styles.panelBack} onClick={() => setShowCategories(false)}>
                <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Kembali
              </button>
              <button
                type="button"
                className={`${styles.panelItem} ${activeCategory === 'all' ? styles.panelItemActive : ''}`}
                role="menuitem"
                onClick={() => { onSelectCategory('all'); closeMenu() }}
              >
                <span>All ({productCount})</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.panelItem} ${activeCategory === cat.id ? styles.panelItemActive : ''}`}
                  role="menuitem"
                  onClick={() => { onSelectCategory(cat.id); closeMenu() }}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
