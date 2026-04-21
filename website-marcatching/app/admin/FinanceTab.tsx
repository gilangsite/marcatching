'use client'

import { useState, useEffect } from 'react'
import {
  Plus, X, Check, Trash2, Pencil, TrendingUp, TrendingDown,
  Settings, DollarSign, RefreshCw, ChevronDown, ChevronUp,
  FileSpreadsheet
} from 'lucide-react'
import styles from './admin.module.css'

// ─── Types ────────────────────────────────────────────────────
export type FinanceType = 'income' | 'cost'

export interface FinanceRecord {
  id: string
  date: string
  nominal: number
  category: string
  item: string
  details: string
  billing: string
  status: string
  type: FinanceType
}

export interface FinanceConfig {
  categories: string[]
  billingOptions: string[]
  statusOptions: string[]
}

const DEFAULT_CONFIG: FinanceConfig = {
  categories: [
    'Product Sales', 'Service Fee', 'Sponsorship', 'Investment',
    'Affiliate', 'Ads Revenue', 'Marketing', 'Operations',
    'Tools & Software', 'Team', 'Tax', 'Infrastructure', 'Other'
  ],
  billingOptions: ['Once', 'Daily', 'Weekly', 'Monthly', 'Yearly'],
  statusOptions: ['Paid', 'Pending', 'Overdue', 'Cancelled'],
}

const CONFIG_KEY = 'marcatching_finance_config'

function loadConfig(): FinanceConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const saved = localStorage.getItem(CONFIG_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        categories: parsed.categories ?? DEFAULT_CONFIG.categories,
        billingOptions: parsed.billingOptions ?? DEFAULT_CONFIG.billingOptions,
        statusOptions: parsed.statusOptions ?? DEFAULT_CONFIG.statusOptions,
      }
    }
  } catch {}
  return DEFAULT_CONFIG
}

function saveConfig(cfg: FinanceConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID').format(Math.abs(Math.round(n)))
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function fmtDate(dateStr: string) {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// ─── Status colour helper ──────────────────────────────────────
function statusStyle(status: string): { bg: string; color: string } {
  switch (status) {
    case 'Paid':      return { bg: '#d1fae5', color: '#065f46' }
    case 'Pending':   return { bg: '#fef3c7', color: '#92400e' }
    case 'Overdue':   return { bg: '#fee2e2', color: '#991b1b' }
    case 'Cancelled': return { bg: '#f1f5f9', color: '#475569' }
    default:          return { bg: '#f1f5f9', color: '#475569' }
  }
}

// ─── Settings Panel ────────────────────────────────────────────
function SettingsPanel({ config, onSave }: { config: FinanceConfig; onSave: (c: FinanceConfig) => void }) {
  const [local, setLocal] = useState<FinanceConfig>({ ...config, categories: [...config.categories], billingOptions: [...config.billingOptions], statusOptions: [...config.statusOptions] })
  const [newCat, setNewCat] = useState('')
  const [newBilling, setNewBilling] = useState('')
  const [newStatus, setNewStatus] = useState('')

  function addItem(field: keyof FinanceConfig, val: string, setter: (v: string) => void) {
    const trimmed = val.trim()
    if (!trimmed || (local[field] as string[]).includes(trimmed)) return
    const updated = { ...local, [field]: [...(local[field] as string[]), trimmed] }
    setLocal(updated)
    onSave(updated)
    setter('')
  }

  function removeItem(field: keyof FinanceConfig, idx: number) {
    const updated = { ...local, [field]: (local[field] as string[]).filter((_, i) => i !== idx) }
    setLocal(updated)
    onSave(updated)
  }

  const SECTION_STYLES: { field: keyof FinanceConfig; label: string; bg: string; color: string; placeholder: string }[] = [
    { field: 'categories',     label: 'Kategori',     bg: 'rgba(99,102,241,0.1)',  color: '#4f46e5', placeholder: 'Tambah kategori...' },
    { field: 'billingOptions', label: 'Tipe Billing', bg: 'rgba(245,158,11,0.1)', color: '#b45309', placeholder: 'Tambah tipe billing...' },
    { field: 'statusOptions',  label: 'Status',       bg: 'rgba(16,185,129,0.1)', color: '#047857', placeholder: 'Tambah status...' },
  ]

  const inputs = [newCat, newBilling, newStatus]
  const setters = [setNewCat, setNewBilling, setNewStatus]

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 28px', marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Settings size={18} color="#0d3369" />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0d3369' }}>Finance Settings</h3>
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8' }}>Tersimpan otomatis di browser</span>
      </div>

      {SECTION_STYLES.map((sec, si) => (
        <div key={sec.field} style={{ marginBottom: si < 2 ? 22 : 0 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 10 }}>
            {sec.label}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {(local[sec.field] as string[]).map((item, idx) => (
              <span key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px 4px 12px', background: sec.bg,
                borderRadius: 999, fontSize: '0.82rem', color: sec.color, fontWeight: 600
              }}>
                {item}
                <button onClick={() => removeItem(sec.field, idx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" style={{ flex: 1, maxWidth: 320 }} placeholder={sec.placeholder}
              value={inputs[si]}
              onChange={e => setters[si](e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(sec.field, inputs[si], setters[si]) } }} />
            <button className="btn btn-navy" style={{ padding: '8px 14px' }}
              onClick={() => addItem(sec.field, inputs[si], setters[si])}>
              <Plus size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Add / Edit Modal ──────────────────────────────────────────
interface ModalState {
  open: boolean
  type: FinanceType
  editing: FinanceRecord | null
}

const EMPTY_FORM = {
  date: todayStr(), nominal: '', category: '', item: '', details: '', billing: 'Once', status: 'Paid'
}

function FinanceModal({
  modal, config, onClose, onSave, saving
}: {
  modal: ModalState
  config: FinanceConfig
  onClose: () => void
  onSave: (form: typeof EMPTY_FORM) => void
  saving: boolean
}) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (modal.editing) {
      setForm({
        date: modal.editing.date,
        nominal: String(modal.editing.nominal),
        category: modal.editing.category,
        item: modal.editing.item,
        details: modal.editing.details,
        billing: modal.editing.billing,
        status: modal.editing.status,
      })
    } else {
      setForm({
        ...EMPTY_FORM,
        date: todayStr(),
        category: config.categories[0] ?? '',
        billing: config.billingOptions[0] ?? 'Once',
        status: config.statusOptions[0] ?? 'Paid',
      })
    }
  }, [modal, config])

  if (!modal.open) return null

  const isIncome = modal.type === 'income'
  const accentColor = isIncome ? '#10b981' : '#ef4444'
  const accentDark = isIncome ? '#059669' : '#dc2626'
  const borderColor = isIncome ? '#bbf7d0' : '#fecaca'

  return (
    <div className={styles.cropModalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.cropModalContent} style={{ maxWidth: 580 }}>
        {/* Header */}
        <div className={styles.cropModalHeader} style={{ borderBottom: `2px solid ${borderColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isIncome
              ? <TrendingUp size={20} color={accentColor} />
              : <TrendingDown size={20} color={accentColor} />}
            <h3 className={styles.cropModalTitle} style={{ color: isIncome ? '#15803d' : '#be123c' }}>
              {modal.editing ? 'Edit' : 'Tambah'} {isIncome ? 'Income' : 'Cost'}
            </h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Form */}
        <div style={{ padding: '24px 28px', maxHeight: '72vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            <div className="form-group">
              <label className="label">Tanggal *</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="label">Nominal (Rp) *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.9rem' }}>Rp</span>
                <input className="input" style={{ flex: 1 }} type="number" min="0" placeholder="0" value={form.nominal}
                  onChange={e => setForm(f => ({ ...f, nominal: e.target.value }))} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Kategori *</label>
              <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {config.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Item</label>
              <input className="input" placeholder="Nama item / transaksi" value={form.item}
                onChange={e => setForm(f => ({ ...f, item: e.target.value }))} />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Details</label>
              <textarea className="input" rows={2} placeholder="Keterangan tambahan..." value={form.details}
                onChange={e => setForm(f => ({ ...f, details: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="label">Billing</label>
              <select className="select" value={form.billing} onChange={e => setForm(f => ({ ...f, billing: e.target.value }))}>
                {config.billingOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {config.statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <button className="btn btn-ghost" onClick={onClose}>Batal</button>
            <button
              className="btn btn-navy"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentDark})`, border: 'none', fontWeight: 700, padding: '10px 24px' }}
              onClick={() => onSave(form)}
              disabled={saving || !form.nominal || !form.category}>
              {saving ? 'Menyimpan...' : <><Check size={16} /> Simpan</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Finance Tab ──────────────────────────────────────────
export default function FinanceTab() {
  const [config, setConfig] = useState<FinanceConfig>(DEFAULT_CONFIG)
  const [incomeRecords, setIncomeRecords] = useState<FinanceRecord[]>([])
  const [costRecords, setCostRecords] = useState<FinanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState<'all' | FinanceType>('all')
  const [showSettings, setShowSettings] = useState(false)
  const [modal, setModal] = useState<ModalState>({ open: false, type: 'income', editing: null })

  // ── Load config from localStorage ──
  useEffect(() => {
    setConfig(loadConfig())
  }, [])

  // ── Fetch records ──────────────────
  async function fetchData() {
    setLoading(true)
    try {
      const [iRes, cRes] = await Promise.all([
        fetch('/api/finance?type=income'),
        fetch('/api/finance?type=cost'),
      ])
      const iData = await iRes.json()
      const cData = await cRes.json()
      setIncomeRecords((iData.rows ?? []).map((r: any) => ({ ...r, type: 'income' as FinanceType })))
      setCostRecords((cData.rows ?? []).map((r: any) => ({ ...r, type: 'cost' as FinanceType })))
    } catch (err) {
      console.error('Finance fetch error:', err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // ── Open modal ─────────────────────
  function openAdd(type: FinanceType) {
    setModal({ open: true, type, editing: null })
  }
  function openEdit(r: FinanceRecord) {
    setModal({ open: true, type: r.type, editing: r })
  }

  // ── Save record ────────────────────
  async function handleSave(form: typeof EMPTY_FORM) {
    if (!form.nominal || !form.category) return
    setSaving(true)
    const payload = {
      sheetType: modal.type,
      date: form.date,
      nominal: parseFloat(form.nominal) || 0,
      category: form.category,
      item: form.item,
      details: form.details,
      billing: form.billing,
      status: form.status,
    }
    try {
      if (modal.editing) {
        await fetch('/api/finance', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: modal.editing.id }),
        })
      } else {
        await fetch('/api/finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      setModal({ open: false, type: 'income', editing: null })
      fetchData()
    } catch {
      alert('Gagal menyimpan data keuangan.')
    }
    setSaving(false)
  }

  // ── Delete record ──────────────────
  async function handleDelete(r: FinanceRecord) {
    if (!confirm(`Hapus record "${r.item || r.category}" ini?`)) return
    await fetch('/api/finance', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetType: r.type, id: r.id }),
    })
    fetchData()
  }

  // ── Config save ────────────────────
  function handleConfigSave(cfg: FinanceConfig) {
    setConfig(cfg)
    saveConfig(cfg)
  }

  // ── Computed ───────────────────────
  const allSorted = [...incomeRecords, ...costRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const displayed = filterType === 'all'
    ? allSorted
    : filterType === 'income'
    ? incomeRecords.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : costRecords.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalIncome = incomeRecords.reduce((s, r) => s + (Number(r.nominal) || 0), 0)
  const totalCost   = costRecords.reduce((s, r)   => s + (Number(r.nominal) || 0), 0)
  const net         = totalIncome - totalCost

  return (
    <div className={styles.tabContent} style={{ maxWidth: 1200 }}>

      {/* ── Header ── */}
      <div className={styles.contentHeader}>
        <div>
          <h1 className={styles.contentTitle}>Finance</h1>
          <p className={styles.contentDesc}>Catat pemasukan &amp; pengeluaran bisnis Marcatching — Data tersimpan di Google Sheets</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a
            href="https://docs.google.com/spreadsheets/d/1TvV_dii3oNwrxUTv_B0Mx7H-mLYk0LeHpAWglyyBGl8/edit"
            target="_blank" rel="noopener noreferrer"
            className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
            <FileSpreadsheet size={14} /> Google Sheets
          </a>
          <button className="btn btn-ghost" style={{ padding: '8px 14px' }}
            onClick={() => setShowSettings(v => !v)}>
            <Settings size={16} /> {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button className="btn btn-ghost" style={{ padding: '8px 14px' }}
            onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {/* Income */}
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '1.5px solid #6ee7b7', borderRadius: 20, padding: '22px 26px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: 20, top: 20, opacity: 0.15 }}>
            <TrendingUp size={48} color="#059669" />
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Total Income
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#064e3b', lineHeight: 1.1, marginBottom: 6 }}>
            Rp {formatRp(totalIncome)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
            {incomeRecords.length} transaksi
          </div>
        </div>

        {/* Cost */}
        <div style={{
          background: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
          border: '1.5px solid #fca5a5', borderRadius: 20, padding: '22px 26px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: 20, top: 20, opacity: 0.15 }}>
            <TrendingDown size={48} color="#dc2626" />
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Total Cost
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7f1d1d', lineHeight: 1.1, marginBottom: 6 }}>
            Rp {formatRp(totalCost)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>
            {costRecords.length} transaksi
          </div>
        </div>

        {/* Net */}
        <div style={{
          background: net >= 0
            ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
            : 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
          border: `1.5px solid ${net >= 0 ? '#6ee7b7' : '#fca5a5'}`,
          borderRadius: 20, padding: '22px 26px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: 20, top: 20, opacity: 0.12 }}>
            <DollarSign size={52} color={net >= 0 ? '#059669' : '#dc2626'} />
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: net >= 0 ? '#059669' : '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            {net >= 0 ? '● Surplus' : '● Deficit'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: net >= 0 ? '#064e3b' : '#7f1d1d', lineHeight: 1.1, marginBottom: 6 }}>
            Rp {formatRp(Math.abs(net))}
          </div>
          <div style={{ fontSize: '0.78rem', color: net >= 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
            {net >= 0 ? 'Perusahaan untung' : 'Perusahaan rugi'}
          </div>
        </div>
      </div>

      {/* ── Settings Panel ── */}
      {showSettings && (
        <SettingsPanel config={config} onSave={handleConfigSave} />
      )}

      {/* ── Action Buttons + Filter ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          className="btn btn-navy"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', padding: '10px 22px', fontWeight: 700, borderRadius: 10 }}
          onClick={() => openAdd('income')}>
          <TrendingUp size={16} /> Tambah Income
        </button>
        <button
          className="btn btn-navy"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', padding: '10px 22px', fontWeight: 700, borderRadius: 10 }}
          onClick={() => openAdd('cost')}>
          <TrendingDown size={16} /> Tambah Cost
        </button>

        {/* Filter */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {(['all', 'income', 'cost'] as const).map(f => (
            <button key={f} onClick={() => setFilterType(f)} style={{
              padding: '8px 18px', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem',
              border: '1.5px solid', cursor: 'pointer', transition: 'all 0.18s',
              borderColor: filterType === f ? '#0d3369' : '#e2e8f0',
              background: filterType === f ? '#0d3369' : '#ffffff',
              color: filterType === f ? '#ffffff' : '#64748b',
            }}>
              {f === 'all' ? 'Semua' : f === 'income' ? 'Income' : 'Cost'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className={styles.loading}>Memuat data keuangan dari Google Sheets...</div>
      ) : displayed.length === 0 ? (
        <div className={styles.emptyState}>
          <DollarSign size={44} style={{ margin: '0 auto 12px', display: 'block', color: '#cbd5e1' }} />
          <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Belum ada catatan keuangan.</p>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Klik Tambah Income atau Tambah Cost untuk mulai mencatat.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(13,51,105,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', borderBottom: '2px solid #e2e8f0' }}>
                {['Tanggal', 'Tipe', 'Nominal', 'Kategori (Item)', 'Details', 'Billing', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{
                    padding: '13px 16px', textAlign: h === 'Nominal' || h === 'Aksi' ? 'right' : 'left',
                    fontWeight: 700, color: '#0d3369', fontSize: '0.72rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((r, i) => (
                <tr key={r.id || i}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                  <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {fmtDate(r.date)}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: r.type === 'income' ? '#d1fae5' : '#fee2e2',
                      color: r.type === 'income' ? '#065f46' : '#991b1b'
                    }}>
                      {r.type === 'income' ? '▲ Income' : '▼ Cost'}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap',
                    color: r.type === 'income' ? '#15803d' : '#be123c' }}>
                    {r.type === 'income' ? '+' : '−'} Rp {formatRp(r.nominal)}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.category}</div>
                    {r.item && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{r.item}</div>}
                  </td>

                  <td style={{ padding: '12px 16px', color: '#64748b', maxWidth: 200 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.details || '—'}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
                      background: '#fef3c7', color: '#92400e'
                    }}>
                      {r.billing}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
                      background: statusStyle(r.status).bg,
                      color: statusStyle(r.status).color
                    }}>
                      {r.status}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className={styles.editBtn} onClick={() => openEdit(r)} title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(r)} title="Hapus">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer totals */}
            <tfoot>
              <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 700, color: '#0d3369', fontSize: '0.82rem' }}>
                  {displayed.length} transaksi
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, fontSize: '0.9rem', color: net >= 0 ? '#15803d' : '#be123c' }}>
                  Net: {net >= 0 ? '+' : '−'} Rp {formatRp(Math.abs(net))}
                </td>
                <td colSpan={5} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── Modal ── */}
      <FinanceModal modal={modal} config={config}
        onClose={() => setModal({ open: false, type: 'income', editing: null })}
        onSave={handleSave} saving={saving} />
    </div>
  )
}
