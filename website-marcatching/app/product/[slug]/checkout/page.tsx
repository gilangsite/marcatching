'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Copy, Check, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/lib/supabaseClient'
import styles from './checkout.module.css'

function formatRupiah(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID')
}

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

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

  // Payment modal
  const [showPayment, setShowPayment] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (!error && data) {
        setProduct(data as Product)
      }
      setLoading(false)
    }
    fetchProduct()
  }, [slug])

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
          <a href="/" style={{ color: '#0d3369', textDecoration: 'underline' }}>Kembali ke beranda</a>
        </div>
      </div>
    )
  }

  // Price calculations
  const priceOriginal = product.price_before_discount || 0
  const priceDiscounted = product.price_after_discount || 0
  const totalPaid = Math.max(0, priceDiscounted - voucherDiscount)

  // Build poster URL
  let posterUrl = product.image_url || ''
  if (posterUrl && posterUrl.includes('drive.google.com/uc')) {
    const match = posterUrl.match(/id=([^&]+)/)
    if (match && match[1]) {
      posterUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600-h2000`
    }
  }

  // Validate voucher
  async function handleValidateVoucher() {
    if (!voucherCode.trim()) return
    setVoucherChecking(true)
    setVoucherMsg('')

    try {
      const res = await fetch('/api/voucher/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.trim(), productPrice: priceDiscounted }),
      })
      const data = await res.json()

      if (data.valid) {
        setVoucherValid(true)
        setVoucherDiscount(data.discount_amount)
        setVoucherMsg(data.message)
      } else {
        setVoucherValid(false)
        setVoucherDiscount(0)
        setVoucherMsg(data.message)
      }
    } catch {
      setVoucherMsg('Gagal memvalidasi voucher')
      setVoucherValid(false)
    }
    setVoucherChecking(false)
  }

  // Validate form & show payment
  function handleCheckout() {
    setFormError('')

    if (!fullName.trim()) { setFormError('Nama Lengkap wajib diisi'); return }
    if (!email.trim()) { setFormError('Email Aktif wajib diisi'); return }
    if (!whatsapp.trim()) { setFormError('Nomor WA wajib diisi'); return }
    if (!background) { setFormError('Background wajib dipilih'); return }
    if (!referralSource) { setFormError('Sumber informasi wajib dipilih'); return }
    if (background === 'Other' && !backgroundOther.trim()) { setFormError('Mohon isi background kamu'); return }
    if (referralSource === 'Referral' && !referralName.trim()) { setFormError('Mohon isi nama referral'); return }

    setShowPayment(true)
  }

  // Copy account number
  function handleCopy() {
    navigator.clipboard.writeText('6030485643')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Submit payment
  async function handlePaid() {
    setSubmitting(true)

    const bgFinal = background === 'Other' ? `Other: ${backgroundOther}` : background
    const refFinal = referralSource === 'Referral' ? `Referral: ${referralName}` : referralSource

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product!.id,
          productName: product!.name,
          fullName: fullName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          background: bgFinal,
          referralSource: refFinal,
          voucherCode: voucherValid ? voucherCode.trim().toUpperCase() : '',
          priceOriginal,
          priceDiscounted,
          voucherDiscount,
          totalPaid,
        }),
      })
      const data = await res.json()

      if (data.success && data.whatsappUrl) {
        window.location.href = data.whatsappUrl
      } else {
        setFormError(data.message || 'Terjadi kesalahan saat checkout')
        setShowPayment(false)
      }
    } catch {
      setFormError('Terjadi kesalahan jaringan')
      setShowPayment(false)
    }
    setSubmitting(false)
  }

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.splitLayout}>
        {/* Left: Poster (desktop only, hidden on mobile via CSS) */}
        <div className={styles.posterSide}>
          {posterUrl ? (
            <img src={posterUrl} alt={product.name} className={styles.posterImage} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
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
            <p className={styles.productSummaryLabel}>Product Name</p>
            <p className={styles.productSummaryName}>{product.name}</p>

            {priceOriginal > 0 && priceOriginal !== priceDiscounted && (
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Harga Normal</span>
                <span className={styles.priceStrike}>{formatRupiah(priceOriginal)}</span>
              </div>
            )}
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Harga Diskon</span>
              <span className={styles.priceValue}>{formatRupiah(priceDiscounted)}</span>
            </div>
            {voucherDiscount > 0 && (
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Potongan Voucher</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>-{formatRupiah(voucherDiscount)}</span>
              </div>
            )}
            <div className={styles.divider} />
            <div className={styles.priceRow}>
              <span className={styles.priceLabel} style={{ fontWeight: 700, color: '#0d3369' }}>Total Bayar</span>
              <span className={styles.priceHighlight}>{formatRupiah(totalPaid)}</span>
            </div>
          </div>

          {/* Voucher */}
          <div className={styles.voucherSection}>
            <p className={styles.voucherLabel}>Punya Kode Voucher?</p>
            <div className={styles.voucherInputWrap}>
              <input
                className={styles.voucherInput}
                placeholder="Masukkan kode voucher"
                value={voucherCode}
                onChange={e => setVoucherCode(e.target.value.toUpperCase())}
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
              <select className={styles.formSelect} value={background} onChange={e => setBackground(e.target.value)}>
                <option value="">Pilih background kamu</option>
                <option value="Siswa/Mahasiswa">Siswa/Mahasiswa</option>
                <option value="Content Creator/KOL">Content Creator/KOL</option>
                <option value="Entrepreneur">Entrepreneur</option>
                <option value="Employee">Employee</option>
                <option value="Other">Other</option>
              </select>
              {background === 'Other' && (
                <input className={styles.formInput} placeholder="Ketik background kamu" value={backgroundOther} onChange={e => setBackgroundOther(e.target.value)} style={{ marginTop: 8 }} />
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tau Product ini dari Mana? *</label>
              <select className={styles.formSelect} value={referralSource} onChange={e => setReferralSource(e.target.value)}>
                <option value="">Pilih sumber</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
              </select>
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
        <button className={styles.ctaButton} onClick={handleCheckout}>
          Checkout Product
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className={styles.modalOverlay} onClick={() => !submitting && setShowPayment(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detail Transfer</h2>
              <p className={styles.modalSubtitle}>Transfer ke rekening berikut untuk menyelesaikan pembelian</p>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.bankInfo}>
                <p className={styles.bankAccount}>6030485643</p>
                <p className={styles.bankName}>BCA — Gilang Ramadhan</p>
                <button className={styles.copyBtn} onClick={handleCopy}>
                  {copied ? <><Check size={14} /> Tersalin!</> : <><Copy size={14} /> Salin Nomor</>}
                </button>
              </div>

              <div className={styles.paymentBreakdown}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Jumlah yang harus di Transfer</p>

                {priceOriginal > 0 && priceOriginal !== priceDiscounted && (
                  <div className={styles.breakdownRow}>
                    <span className={styles.breakdownLabel}>Harga Normal</span>
                    <span style={{ textDecoration: 'line-through', color: '#dc2626' }}>{formatRupiah(priceOriginal)}</span>
                  </div>
                )}
                <div className={styles.breakdownRow}>
                  <span className={styles.breakdownLabel}>Harga Diskon</span>
                  <span className={styles.breakdownValue}>{formatRupiah(priceDiscounted)}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className={styles.breakdownRow}>
                    <span className={styles.breakdownLabel}>Potongan Voucher</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>-{formatRupiah(voucherDiscount)}</span>
                  </div>
                )}

                <div className={`${styles.breakdownRow} ${styles.breakdownTotal}`}>
                  <span className={styles.breakdownTotalLabel}>Harga yang Perlu Dibayar</span>
                  <span className={styles.breakdownTotalValue}>{formatRupiah(totalPaid)}</span>
                </div>
              </div>

              <p className={styles.paymentNote}>
                Pastikan kamu sudah melakukan Payment via Transfer ke Rekening diatas untuk melanjutkan sesi Checkout Product. Jika sudah klik tombol dibawah.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.payBtn} onClick={handlePaid} disabled={submitting}>
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Memproses...</> : 'Sudah Bayar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
