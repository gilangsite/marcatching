'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, X, Check, Megaphone, StopCircle } from 'lucide-react'
import type { Product, PromotionWithProduct } from '@/lib/supabaseClient'
import styles from './admin.module.css'
import { showAdminToast } from './page'

type PromotionForm = {
  headline: string
  description: string
  product_id: string
  status: 'on_going' | 'off'
  ends_at: string
}

const EMPTY_FORM: PromotionForm = { headline: '', description: '', product_id: '', status: 'off', ends_at: '' }

function formatRp(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function PromotionsTab({ products }: { products: Product[] }) {
  const [promotions, setPromotions] = useState<PromotionWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PromotionWithProduct | null>(null)
  const [form, setForm] = useState<PromotionForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectableProducts = products.filter(p => !p.is_coming_soon)

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/promotions', { cache: 'no-store' })
      const payload = await res.json()
      setPromotions(payload.data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  function openEdit(promotion: PromotionWithProduct) {
    setEditing(promotion)
    setForm({
      headline: promotion.headline,
      description: promotion.description || '',
      product_id: promotion.product_id,
      status: promotion.status,
      ends_at: promotion.ends_at ? toLocalInputValue(promotion.ends_at) : '',
    })
    setError('')
    setShowForm(true)
  }

  async function saveForm(e: FormEvent) {
    e.preventDefault()
    if (!form.headline.trim() || !form.product_id) { setError('Headline dan produk wajib diisi'); return }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_promotion',
          id: editing?.id,
          promotion: {
            headline: form.headline,
            description: form.description,
            product_id: form.product_id,
            status: form.status,
            ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
          },
        }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.message || 'Gagal menyimpan promotion')
      setShowForm(false)
      showAdminToast(editing ? 'Promotion diperbarui' : 'Promotion berhasil dibuat')
      void load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan promotion')
    }
    setSaving(false)
  }

  async function stopPromotion(promotion: PromotionWithProduct) {
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_promotion',
          id: promotion.id,
          promotion: {
            headline: promotion.headline,
            description: promotion.description,
            product_id: promotion.product_id,
            status: 'off',
            ends_at: promotion.ends_at,
          },
        }),
      })
      if (!res.ok) throw new Error('Gagal menghentikan promotion')
      showAdminToast('Promotion dihentikan')
      void load()
    } catch (err) {
      showAdminToast(err instanceof Error ? err.message : 'Gagal menghentikan promotion', 'error')
    }
  }

  async function deletePromotion(promotion: PromotionWithProduct) {
    if (!confirm(`Hapus promotion "${promotion.headline}"?`)) return
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_promotion', id: promotion.id }),
      })
      if (!res.ok) throw new Error('Gagal menghapus promotion')
      showAdminToast('Promotion dihapus')
      void load()
    } catch (err) {
      showAdminToast(err instanceof Error ? err.message : 'Gagal menghapus promotion', 'error')
    }
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.contentHeader}>
        <div>
          <h1 className={styles.contentTitle}>Promotions</h1>
          <p className={styles.contentDesc}>Kelola promosi yang tampil di course dashboard dan /store</p>
        </div>
        <button className="btn btn-navy" onClick={openAdd}><Plus size={16} /> Tambah Promotion</button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <h2 className={styles.formTitle}>{editing ? 'Edit Promotion' : 'Tambah Promotion Baru'}</h2>
            <button onClick={() => setShowForm(false)} className={styles.closeBtn}><X size={18} /></button>
          </div>
          <form onSubmit={saveForm} className={styles.form}>
            <div className="form-group">
              <label className="label">Headline *</label>
              <input className="input" placeholder="cth: Diskon spesial minggu ini" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">Deskripsi Singkat</label>
              <textarea className="input" rows={3} placeholder="Deskripsi singkat promosi..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">Produk *</label>
              <select className="select" value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
                <option value="">— Pilih Produk —</option>
                {selectableProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({formatRp(p.price_after_discount)})</option>)}
              </select>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0' }}>Harga & diskon otomatis ikut produk. Produk &quot;Coming Soon&quot; tidak muncul di daftar ini.</p>
            </div>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'on_going' | 'off' }))}>
                  <option value="off">Off</option>
                  <option value="on_going">On Going</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Berakhir Pada (opsional)</label>
                <input className="input" type="datetime-local" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} />
              </div>
            </div>
            {form.status === 'on_going' && (
              <p style={{ fontSize: '0.8rem', color: '#b45309', margin: 0 }}>Mengaktifkan promosi ini akan otomatis mematikan promosi &quot;on going&quot; lain yang sedang berjalan.</p>
            )}
            {error && <p className={styles.formError}>{error}</p>}
            <div className={styles.spacer} />
            <div className={styles.fixedActions}>
              <button type="button" className="btn btn-ghost" style={{ padding: '10px 24px' }} onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn btn-navy" style={{ padding: '10px 24px', fontWeight: 700 }} disabled={saving}>{saving ? 'Menyimpan...' : <><Check size={16} /> Simpan Promotion</>}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className={styles.loading}>Memuat...</div> : promotions.length === 0 ? (
        <div className={styles.emptyState}>Belum ada promotion.</div>
      ) : (
        <div className={styles.linksList}>
          {promotions.map(promotion => (
            <div key={promotion.id} className={styles.linkRow}>
              <div className={styles.linkIcon}><Megaphone size={18} /></div>
              <div className={styles.linkInfo} style={{ cursor: 'pointer' }} onClick={() => openEdit(promotion)}>
                <span className={styles.linkTitle}>{promotion.headline}</span>
                <span className={styles.linkUrl}>
                  {promotion.status === 'on_going' ? <span className={styles.statusActive}>On Going</span> : <span className={styles.statusSoon}>Off</span>}
                  {' · '}{promotion.product?.name || 'Produk tidak ditemukan'}
                  {' · '}{promotion.ends_at ? `Berakhir ${new Date(promotion.ends_at).toLocaleString('id-ID')}` : 'Tanpa batas waktu'}
                </span>
              </div>
              <div className={styles.linkActions}>
                {promotion.status === 'on_going' && (
                  <button className={styles.editBtn} title="Stop" onClick={() => stopPromotion(promotion)}><StopCircle size={15} /></button>
                )}
                <button className={styles.editBtn} title="Edit" onClick={() => openEdit(promotion)}><Pencil size={15} /></button>
                <button className={styles.deleteBtn} title="Hapus" onClick={() => deletePromotion(promotion)}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
