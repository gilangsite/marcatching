'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Reorder } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check, Megaphone, StopCircle, GripVertical } from 'lucide-react'
import type { Product, PromotionWithProducts } from '@/lib/supabaseClient'
import styles from './admin.module.css'
import { showAdminToast } from './page'

type PromotionForm = {
  headline: string
  description: string
  product_ids: string[]
  status: 'on_going' | 'off'
  ends_at: string
}

const EMPTY_FORM: PromotionForm = { headline: '', description: '', product_ids: [], status: 'off', ends_at: '' }

function formatRp(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function PromotionsTab({ products }: { products: Product[] }) {
  const [promotions, setPromotions] = useState<PromotionWithProducts[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PromotionWithProducts | null>(null)
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

  function openEdit(promotion: PromotionWithProducts) {
    setEditing(promotion)
    setForm({
      headline: promotion.headline,
      description: promotion.description || '',
      product_ids: promotion.products.map(p => p.id),
      status: promotion.status,
      ends_at: promotion.ends_at ? toLocalInputValue(promotion.ends_at) : '',
    })
    setError('')
    setShowForm(true)
  }

  function toggleProduct(id: string) {
    setForm(f => ({
      ...f,
      product_ids: f.product_ids.includes(id) ? f.product_ids.filter(x => x !== id) : [...f.product_ids, id],
    }))
  }

  async function saveForm(e: FormEvent) {
    e.preventDefault()
    if (!form.headline.trim() || form.product_ids.length === 0) { setError('Headline dan minimal 1 produk wajib diisi'); return }

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
            product_ids: form.product_ids,
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

  async function stopPromotion(promotion: PromotionWithProducts) {
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
            product_ids: promotion.products.map(p => p.id),
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

  async function deletePromotion(promotion: PromotionWithProducts) {
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
              <label className="label">Produk * ({form.product_ids.length} dipilih)</label>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 8px' }}>Centang produk yang mau dimasukkan ke promosi ini. Harga & diskon otomatis ikut masing-masing produk. Produk &quot;Coming Soon&quot; tidak muncul di daftar ini.</p>
              <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, padding: 6 }}>
                {selectableProducts.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 6px', cursor: 'pointer', borderRadius: 6 }}>
                    <input type="checkbox" checked={form.product_ids.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                    <span style={{ flex: 1, fontSize: '0.85rem', color: '#0d3369' }}>{p.name}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{formatRp(p.price_after_discount)}</span>
                  </label>
                ))}
                {selectableProducts.length === 0 && (
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px' }}>Belum ada produk yang bisa dipakai (semua sedang Coming Soon).</p>
                )}
              </div>
              {form.product_ids.length > 0 && (
                <>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '10px 0 4px' }}>Urutan tampil (geser untuk mengubah urutan):</p>
                  <Reorder.Group
                    axis="y"
                    values={form.product_ids}
                    onReorder={ids => setForm(f => ({ ...f, product_ids: ids }))}
                    style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}
                  >
                    {form.product_ids.map(id => {
                      const p = products.find(pp => pp.id === id)
                      return (
                        <Reorder.Item
                          key={id}
                          value={id}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#ffffff', cursor: 'grab' }}
                        >
                          <GripVertical size={14} color="#94a3b8" />
                          <span style={{ flex: 1, fontSize: '0.82rem', color: '#0d3369' }}>{p?.name || '(produk tidak ditemukan)'}</span>
                          <button type="button" onClick={() => toggleProduct(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex' }}><X size={14} /></button>
                        </Reorder.Item>
                      )
                    })}
                  </Reorder.Group>
                </>
              )}
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
                  {' · '}{promotion.products.length} produk{promotion.products.length > 0 ? ` (${promotion.products.map(p => p.name).join(', ')})` : ''}
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
