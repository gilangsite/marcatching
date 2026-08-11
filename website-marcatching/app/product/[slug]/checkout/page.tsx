'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowLeft, ArrowRight, Loader2, ShoppingCart, Plus, X, Search, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Product, AddonItem } from '@/lib/supabaseClient'
import styles from './checkout.module.css'

function formatRupiah(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID')
}

type ActivePayment = {
  orderId: string
  publicStatusToken: string
  snapToken: string
}

const midtransEnvironment = process.env.NEXT_PUBLIC_MIDTRANS_ENV === 'production' ? 'production' : 'sandbox'
const snapScriptUrl = midtransEnvironment === 'production'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

function CustomSelect({
  value, onChange, options, placeholder, ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  ariaLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number }>({ left: 0, width: 0 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function updatePosition() {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const estimatedHeight = Math.min(260, options.length * 45 + 8)
      const spaceBelow = window.innerHeight - rect.bottom
      const openUp = spaceBelow < estimatedHeight + 12 && rect.top > estimatedHeight
      setPos({
        left: rect.left,
        width: rect.width,
        top: openUp ? undefined : rect.bottom + 6,
        bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
      })
    }
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, options.length])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (wrapRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div className={styles.customSelectWrap} ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        className={`${styles.customSelectTrigger} ${open ? styles.customSelectTriggerOpen : ''}`}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className={selected ? undefined : styles.customSelectPlaceholder}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={`${styles.customSelectChevron} ${open ? styles.customSelectChevronOpen : ''}`} />
      </button>
      {open && createPortal(
        <div
          ref={panelRef}
          className={styles.customSelectPanel}
          style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.customSelectOption} ${opt.value === value ? styles.customSelectOptionActive : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  // Add-on etalase
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [selectedAddons, setSelectedAddons] = useState<AddonItem[]>([])
  const [addonSearchQuery, setAddonSearchQuery] = useState('')
  const [addonDropdownOpen, setAddonDropdownOpen] = useState(false)
  const addonDropdownRef = useRef<HTMLDivElement>(null)

  // Form fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [background, setBackground] = useState('')
  const [backgroundOther, setBackgroundOther] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [referralName, setReferralName] = useState('')

  // Voucher
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [voucherMsg, setVoucherMsg] = useState('')
  const [voucherValid, setVoucherValid] = useState(false)
  const [voucherChecking, setVoucherChecking] = useState(false)

  // Payment
  const [snapReady, setSnapReady] = useState(false)
  const [activePayment, setActivePayment] = useState<ActivePayment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    async function fetchData() {
      const query = new URLSearchParams(window.location.search)
      const initialAddonIds = (query.get('addons') || '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean)
      const initialVoucher = query.get('voucher')?.trim().toUpperCase() || ''

      // Fetch main product
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (!prodError && prodData) {
        if (prodData.is_coming_soon) {
          router.replace(`/product/${slug}`)
          return
        }

        // Fetch all other active products for add-on
        const { data: allProds } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .neq('slug', slug)
          .order('name', { ascending: true })

        if (allProds) {
          const addonProducts = allProds as Product[]
          setAvailableProducts(addonProducts)

          if (initialAddonIds.length > 0) {
            setSelectedAddons(addonProducts
              .filter(p => initialAddonIds.includes(p.id) && !p.is_coming_soon)
              .map(p => ({
                id: p.id,
                name: p.name,
                priceOriginal: p.price_before_discount,
                priceDiscounted: p.price_after_discount,
              }))
            )
          }
        }

        if (initialVoucher) setVoucherCode(initialVoucher)
        setProduct(prodData as Product)
      }
      setLoading(false)
    }
    fetchData()
  }, [slug, router])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (addonDropdownRef.current && !addonDropdownRef.current.contains(e.target as Node)) {
        setAddonDropdownOpen(false)
        setAddonSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className={styles.checkoutPage}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b' }}>
          Memuat...
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.checkoutPage}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b', gap: 16, padding: 24 }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d3369' }}>Produk tidak ditemukan</p>
          <Link href="/" style={{ color: '#0d3369', textDecoration: 'underline' }}>Kembali ke beranda</Link>
        </div>
      </div>
    )
  }

  // Price calculations
  const priceOriginal = product.price_before_discount || 0
  const priceDiscounted = product.price_after_discount || 0
  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.priceDiscounted, 0)
  const subtotalBeforeVoucher = priceDiscounted + addonTotal
  const totalPaid = Math.max(0, subtotalBeforeVoucher - voucherDiscount)
  const productDiscount = Math.max(0, priceOriginal - priceDiscounted)
  const addonDiscount = selectedAddons.reduce(
    (sum, addon) => sum + Math.max(0, addon.priceOriginal - addon.priceDiscounted),
    0,
  )
  const totalSavings = productDiscount + addonDiscount + voucherDiscount
  const productDiscountPercent = priceOriginal > 0
    ? Math.round((productDiscount / priceOriginal) * 100)
    : 0

  // Build poster URL
  let posterUrl = product.image_url || ''
  if (posterUrl && posterUrl.includes('drive.google.com/uc')) {
    const match = posterUrl.match(/id=([^&]+)/)
    if (match && match[1]) {
      posterUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600-h2000`
    }
  }

  // Filtered add-on products (exclude already selected and coming soon)
  const selectedIds = selectedAddons.map(a => a.id)
  const filteredProducts = availableProducts.filter(p => {
    if (p.is_coming_soon) return false;
    const notSelected = !selectedIds.includes(p.id)
    const matchesSearch = addonSearchQuery === '' ||
      p.name.toLowerCase().includes(addonSearchQuery.toLowerCase())
    return notSelected && matchesSearch
  })

  // Add addon
  function handleAddAddon(p: Product) {
    setSelectedAddons(prev => [...prev, {
      id: p.id,
      name: p.name,
      priceOriginal: p.price_before_discount,
      priceDiscounted: p.price_after_discount,
    }])
    setAddonDropdownOpen(false)
    setAddonSearchQuery('')
    setActivePayment(null)
    // Reset voucher when cart changes
    if (voucherValid) {
      setVoucherValid(false)
      setVoucherDiscount(0)
      setVoucherMsg('Harga berubah, silakan terapkan ulang voucher.')
    }
  }

  // Remove addon
  function handleRemoveAddon(id: string) {
    setSelectedAddons(prev => prev.filter(a => a.id !== id))
    setActivePayment(null)
    if (voucherValid) {
      setVoucherValid(false)
      setVoucherDiscount(0)
      setVoucherMsg('Harga berubah, silakan terapkan ulang voucher.')
    }
  }

  // Voucher preview. Checkout calculates it again on the server.
  async function handleValidateVoucher() {
    if (!voucherCode.trim()) return
    setVoucherChecking(true)
    setVoucherMsg('')

    try {
      const code = voucherCode.trim().toUpperCase()
      const res = await fetch('/api/voucher/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          productIds: [product!.id, ...selectedAddons.map(addon => addon.id)],
        }),
      })
      const data = await res.json() as {
        valid?: boolean
        totalDiscount?: number
        eligibleProductCount?: number
        message?: string
      }

      if (data.valid && Number(data.totalDiscount) > 0) {
        setVoucherValid(true)
        setVoucherDiscount(Number(data.totalDiscount))
        setVoucherMsg(data.message || `Voucher berhasil diterapkan ke ${data.eligibleProductCount || 0} produk.`)
        setActivePayment(null)
      } else {
        setVoucherValid(false)
        setVoucherDiscount(0)
        setVoucherMsg(data.message || 'Voucher ini tidak berlaku untuk produk yang dipilih.')
      }
    } catch {
      setVoucherMsg('Gagal memvalidasi voucher')
      setVoucherValid(false)
    }
    setVoucherChecking(false)
  }

  function goToPaymentStatus(payment: Pick<ActivePayment, 'orderId' | 'publicStatusToken'>) {
    const query = new URLSearchParams({
      order: payment.orderId,
      token: payment.publicStatusToken,
    })
    router.push(`/payment/status?${query.toString()}`)
  }

  function openSnap(payment: ActivePayment) {
    if (!window.snap) {
      setFormError('Layanan pembayaran belum siap. Muat ulang halaman lalu coba lagi.')
      return
    }

    window.snap.pay(payment.snapToken, {
      onSuccess: () => goToPaymentStatus(payment),
      onPending: () => goToPaymentStatus(payment),
      onError: () => goToPaymentStatus(payment),
      onClose: () => {
        setFormError('Pembayaran belum selesai. Klik “Lanjutkan Pembayaran” untuk membuka kembali metode pembayaran yang sama.')
      },
    })
  }

  // Validate form, create the server-authoritative order, then open Snap.
  async function handleCheckout() {
    setFormError('')
    if (!fullName.trim()) { setFormError('Nama Lengkap wajib diisi'); return }
    if (!email.trim()) { setFormError('Email Aktif wajib diisi'); return }
    if (!whatsapp.trim()) { setFormError('Nomor WA wajib diisi'); return }
    if (!background) { setFormError('Background wajib dipilih'); return }
    if (!referralSource) { setFormError('Sumber informasi wajib dipilih'); return }
    if (background === 'Other' && !backgroundOther.trim()) { setFormError('Mohon isi background kamu'); return }
    if (referralSource === 'Referral' && !referralName.trim()) { setFormError('Mohon isi nama referral'); return }

    if (activePayment) {
      openSnap(activePayment)
      return
    }

    if (!snapReady && totalPaid > 0) {
      setFormError('Layanan pembayaran masih dimuat. Coba lagi beberapa detik.')
      return
    }

    setSubmitting(true)
    const bgFinal = background === 'Other' ? `Other: ${backgroundOther}` : background
    const refFinal = referralSource === 'Referral' ? `Referral: ${referralName}` : referralSource

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product!.id,
          addonIds: selectedAddons.map(addon => addon.id),
          voucherCode: voucherValid ? voucherCode.trim().toUpperCase() : '',
          fullName: fullName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          background: bgFinal,
          referralSource: refFinal,
        }),
      })
      const data = await res.json() as {
        message?: string
        orderId?: string
        publicStatusToken?: string
        snapToken?: string | null
      }

      if (!res.ok || !data.orderId || !data.publicStatusToken) {
        throw new Error(data.message || 'Terjadi kesalahan saat checkout')
      }

      if (!data.snapToken) {
        goToPaymentStatus({ orderId: data.orderId, publicStatusToken: data.publicStatusToken })
        return
      }

      const payment = {
        orderId: data.orderId,
        publicStatusToken: data.publicStatusToken,
        snapToken: data.snapToken,
      }
      setActivePayment(payment)
      openSnap(payment)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan jaringan'
      setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.checkoutPage}>
      <Script
        id="midtrans-snap"
        src={snapScriptUrl}
        strategy="afterInteractive"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''}
        onReady={() => setSnapReady(Boolean(window.snap))}
        onError={() => {
          setSnapReady(false)
          setFormError('Layanan pembayaran gagal dimuat. Muat ulang halaman lalu coba lagi.')
        }}
      />
      <div className={styles.splitLayout}>
        {/* Left: Poster (desktop only) */}
        <div className={styles.posterSide}>
          {posterUrl ? (
            <img src={posterUrl} alt={product.name} className={styles.posterImage} loading="lazy" />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              No Image
            </div>
          )}
        </div>

        {/* Right: Checkout Form */}
        <div className={styles.contentSide}>
          <div className={styles.checkoutHeader}>
            <button className={styles.backBtn} onClick={() => router.push(`/product/${slug}`)}>
              <ArrowLeft size={16} /> Kembali ke produk
            </button>
            <h1 className={styles.checkoutTitle}>Checkout</h1>
            <p className={styles.checkoutSubtitle}>Lengkapi data di bawah untuk melanjutkan pembelian</p>
          </div>

          {/* Product Summary */}
          <div className={styles.productSummary}>
            <p className={styles.productSummaryLabel}>Ringkasan Pembelian</p>

            {/* Main product */}
            <div className={styles.summaryProductRow}>
              <span className={styles.summaryProductName}>{product.name}</span>
              <div className={styles.summaryPrices}>
                {priceOriginal > 0 && priceOriginal !== priceDiscounted && (
                  <span className={styles.priceStrike}>{formatRupiah(priceOriginal)}</span>
                )}
                <span className={styles.priceValue}>{formatRupiah(priceDiscounted)}</span>
              </div>
            </div>

            {productDiscount > 0 && (
              <div className={styles.discountHighlight}>
                <span className={styles.discountBadge}>Hemat {productDiscountPercent}%</span>
                <span className={styles.discountAmount}>{formatRupiah(productDiscount)}</span>
              </div>
            )}

            {/* Add-on rows */}
            {selectedAddons.map(addon => (
              <div key={addon.id} className={styles.summaryProductRow}>
                <span className={styles.summaryAddonName}>+ {addon.name}</span>
                <div className={styles.summaryPrices}>
                  {addon.priceOriginal > 0 && addon.priceOriginal !== addon.priceDiscounted && (
                    <span className={styles.priceStrike}>{formatRupiah(addon.priceOriginal)}</span>
                  )}
                  <span className={styles.priceValue}>{formatRupiah(addon.priceDiscounted)}</span>
                </div>
              </div>
            ))}

            <div className={styles.divider} />

            {voucherDiscount > 0 && (
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Potongan Voucher</span>
                <span className={styles.voucherDiscountAmount}>-{formatRupiah(voucherDiscount)}</span>
              </div>
            )}
            {totalSavings > 0 && (
              <div className={styles.savingsRow}>
                <span>Total Hemat</span>
                <strong>{formatRupiah(totalSavings)}</strong>
              </div>
            )}
            <div className={styles.priceRow}>
              <span className={styles.totalLabel}>Total Bayar</span>
              <span className={styles.priceHighlight}>{formatRupiah(totalPaid)}</span>
            </div>
          </div>

          {/* ── ADD-ON ETALASE ─────────────────────────────── */}
          {availableProducts.length > 0 && (
            <div className={styles.addonSection}>
              <div className={styles.addonHeader}>
                <div className={styles.addonHeaderLeft}>
                  <div className={styles.addonIconWrap}>
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <p className={styles.addonTitle}>Tambah Course</p>
                    <p className={styles.addonSubtitle}>Hemat lebih banyak dengan tambah course lain sekarang</p>
                  </div>
                </div>
              </div>

              {/* Selected add-ons */}
              {selectedAddons.length > 0 && (
                <div className={styles.addonList}>
                  {selectedAddons.map(addon => (
                    <div key={addon.id} className={styles.addonItem}>
                      <div className={styles.addonItemInfo}>
                        <span className={styles.addonItemName}>{addon.name}</span>
                        <div className={styles.addonItemPrices}>
                          {addon.priceOriginal > 0 && addon.priceOriginal !== addon.priceDiscounted && (
                            <span className={styles.addonItemStrike}>{formatRupiah(addon.priceOriginal)}</span>
                          )}
                          <span className={styles.addonItemPrice}>{formatRupiah(addon.priceDiscounted)}</span>
                        </div>
                      </div>
                      <button
                        className={styles.addonItemRemove}
                        onClick={() => handleRemoveAddon(addon.id)}
                        title="Hapus"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Dropdown trigger */}
              <div className={styles.addonDropdownWrap} ref={addonDropdownRef}>
                <button
                  className={styles.addonDropdownTrigger}
                  onClick={() => {
                    setAddonDropdownOpen(prev => !prev)
                    setAddonSearchQuery('')
                  }}
                >
                  <Plus size={16} />
                  Pilih Course Tambahan
                  <ChevronDown
                    size={15}
                    className={`${styles.addonChevron} ${addonDropdownOpen ? styles.addonChevronOpen : ''}`}
                  />
                </button>

                {addonDropdownOpen && (
                  <div className={styles.addonDropdownPanel}>
                    {/* Search */}
                    <div className={styles.addonSearchWrap}>
                      <Search size={15} className={styles.addonSearchIcon} />
                      <input
                        className={styles.addonSearchInput}
                        placeholder="Cari course..."
                        value={addonSearchQuery}
                        onChange={e => setAddonSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Options */}
                    <div className={styles.addonDropdownList}>
                      {filteredProducts.length === 0 ? (
                        <p className={styles.addonDropdownEmpty}>
                          {addonSearchQuery ? 'Course tidak ditemukan' : 'Semua course sudah ditambahkan'}
                        </p>
                      ) : (
                        filteredProducts.map(p => (
                          <button
                            key={p.id}
                            className={styles.addonDropdownOption}
                            onClick={() => handleAddAddon(p)}
                          >
                            <div className={styles.addonOptionInfo}>
                              <span className={styles.addonOptionName}>{p.name}</span>
                              <div className={styles.addonOptionPrices}>
                                {p.price_before_discount > 0 && p.price_before_discount !== p.price_after_discount && (
                                  <span className={styles.addonOptionStrike}>{formatRupiah(p.price_before_discount)}</span>
                                )}
                                <span className={styles.addonOptionPrice}>{formatRupiah(p.price_after_discount)}</span>
                              </div>
                            </div>
                            <div className={styles.addonOptionAdd}>
                              <Plus size={14} />
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voucher */}
          <div className={styles.voucherSection}>
            <p className={styles.voucherLabel}>Punya Kode Voucher?</p>
            <div className={styles.voucherInputWrap}>
              <input
                className={styles.voucherInput}
                placeholder="Masukkan kode voucher"
                value={voucherCode}
                onChange={e => {
                  setVoucherCode(e.target.value.toUpperCase())
                  setActivePayment(null)
                }}
                disabled={voucherValid}
              />
              <button
                className={styles.voucherBtn}
                onClick={handleValidateVoucher}
                disabled={voucherChecking || voucherValid || !voucherCode.trim()}
              >
                {voucherChecking ? 'Checking...' : voucherValid ? 'Applied ✓' : 'Apply'}
              </button>
            </div>
            {voucherMsg && (
              <p className={`${styles.voucherMsg} ${voucherValid ? styles.voucherSuccess : styles.voucherError}`}>
                {voucherMsg}
              </p>
            )}
          </div>

          {/* Form */}
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nama Lengkap *</label>
              <input className={styles.formInput} placeholder="Masukkan nama lengkap" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Aktif *</label>
              <input className={styles.formInput} type="email" placeholder="email@contoh.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nomor WhatsApp *</label>
              <input className={styles.formInput} type="tel" placeholder="08xxxxxxxxxx" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Background *</label>
              <CustomSelect
                ariaLabel="Background"
                value={background}
                onChange={setBackground}
                placeholder="Pilih background kamu"
                options={[
                  { value: 'Siswa/Mahasiswa', label: 'Siswa/Mahasiswa' },
                  { value: 'Content Creator/KOL', label: 'Content Creator/KOL' },
                  { value: 'Entrepreneur', label: 'Entrepreneur' },
                  { value: 'Employee', label: 'Employee' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
              {background === 'Other' && (
                <input className={styles.formInput} placeholder="Ketik background kamu" value={backgroundOther} onChange={e => setBackgroundOther(e.target.value)} style={{ marginTop: 8 }} />
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tau Product ini dari Mana? *</label>
              <CustomSelect
                ariaLabel="Sumber informasi produk"
                value={referralSource}
                onChange={setReferralSource}
                placeholder="Pilih sumber"
                options={[
                  { value: 'TikTok', label: 'TikTok' },
                  { value: 'Instagram', label: 'Instagram' },
                  { value: 'Referral', label: 'Referral' },
                ]}
              />
              {referralSource === 'Referral' && (
                <input className={styles.formInput} placeholder="Ketik nama yang mereferensikan" value={referralName} onChange={e => setReferralName(e.target.value)} style={{ marginTop: 8 }} />
              )}
            </div>

            {formError && <p className={styles.formError}>{formError}</p>}
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className={styles.fixedCTA}>
        <button className={styles.ctaButton} onClick={handleCheckout} disabled={submitting}>
          {submitting
            ? <><Loader2 size={18} className="animate-spin" /> Memproses...</>
            : <>{activePayment ? 'Lanjutkan Pembayaran' : 'Checkout Product'}<ArrowRight size={18} strokeWidth={2.5} /></>
          }
        </button>
      </div>
    </div>
  )
}
