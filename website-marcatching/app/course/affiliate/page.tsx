'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  BadgePercent,
  Banknote,
  Check,
  ChevronRight,
  CircleDollarSign,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  MousePointerClick,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react'
import styles from './affiliate.module.css'

type Dashboard = {
  terms: { id: string; version: number; title: string; content: string; effective_at: string | null } | null
  member: { id: string; display_name: string; affiliate_code: string; status: string; accepted_terms_at: string } | null
  requiresTermsAcceptance: boolean
  settings: { minimumPayoutRupiah: number; settlementSchedule: string; attributionModel: string; commissionBase: string }
  totals: { clicks: number; pending: number; available: number; processing: number; paid: number }
  programs: Array<any>
  commissions: Array<any>
  adjustments: Array<any>
  statements: Array<any>
  payouts: Array<any>
  disputes: Array<any>
  payoutAccount: { bank_name: string; account_name: string; account_number_last4: string; tax_id_last4: string | null; verified_at: string | null } | null
}

const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

function formatMoney(value: unknown) {
  return money.format(Number(value) || 0)
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

export default function AffiliatePage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [activeTab, setActiveTab] = useState<'programs' | 'commissions' | 'payouts' | 'terms'>('programs')
  const [payoutForm, setPayoutForm] = useState({ bankName: '', accountName: '', accountNumber: '', taxId: '' })
  const [dispute, setDispute] = useState({ statementId: '', reason: '', disputedAmountRupiah: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/affiliate', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'Dashboard belum dapat dimuat')
      setData(payload)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Dashboard belum dapat dimuat')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function action(name: string, payload: Record<string, unknown> = {}) {
    setBusy(name)
    setMessage('')
    try {
      const response = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: name, ...payload }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Permintaan belum berhasil')
      setData(result.data)
      setMessage('Perubahan berhasil disimpan.')
      return true
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Permintaan belum berhasil')
      return false
    } finally {
      setBusy('')
    }
  }

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url)
    setMessage('Link affiliate berhasil disalin.')
  }

  const statementById = useMemo(() => new Map((data?.statements || []).map(row => [row.id, row])), [data])

  if (loading) return <div className={styles.state}><Loader2 className={styles.spin} /> Memuat affiliate workspace...</div>
  if (!data) return <div className={styles.state}>{message || 'Dashboard belum tersedia.'}</div>

  if (!data.member) {
    return (
      <div className={styles.page}>
        <section className={styles.hero}>
          <span className={styles.eyebrow}><BadgePercent size={14} /> Marcatching Affiliate</span>
          <h1>Ubah rekomendasi produk menjadi pendapatan.</h1>
          <p>Bagikan produk Marcatching yang kamu percaya. Setiap rate terkunci per versi, transparan dari click sampai payout, dan tidak pernah di-reset.</p>
        </section>
        <section className={styles.activationCard}>
          <div className={styles.activationIcon}><ShieldCheck /></div>
          <div>
            <span className={styles.kicker}>Aktivasi satu kali</span>
            <h2>Mulai sebagai affiliate</h2>
            <p>Tidak perlu form pendaftaran baru. Akun course-mu menjadi identitas affiliate setelah menerima syarat program.</p>
          </div>
          <div className={styles.activationActions}>
            <button className={styles.secondaryButton} disabled={!data.terms} onClick={() => setTermsOpen(value => !value)}>
              <FileText size={16} /> Baca S&K
            </button>
            {data.terms ? <label className={styles.checkRow}>
              <input type="checkbox" checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)} />
              Saya memahami dan menyetujui versi {data.terms.version}
            </label> : <p className={styles.termsUnavailable}><FileText size={16} /> S&K masih berstatus draft dan belum dipublikasikan oleh tim Marcatching.</p>}
            <button className={styles.primaryButton} disabled={!termsAccepted || !data.terms || Boolean(busy)} onClick={() => action('activate')}>
              {busy === 'activate' ? <Loader2 className={styles.spin} size={16} /> : <ChevronRight size={16} />}
              Aktifkan affiliate
            </button>
          </div>
        </section>
        {termsOpen && data.terms && <section className={styles.termsCard}><h2>{data.terms.title}</h2><pre>{data.terms.content}</pre></section>}
        {message && <p className={styles.toast}>{message}</p>}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.heroCompact}>
        <div>
          <span className={styles.eyebrow}><BadgePercent size={14} /> Affiliate workspace</span>
          <h1>Halo, {data.member.display_name}</h1>
          <p>Kode affiliate <strong>{data.member.affiliate_code}</strong> · rate yang kamu setujui tersimpan sebagai versi permanen.</p>
        </div>
        <span className={styles.activePill}><Check size={13} /> Active</span>
      </section>

      {data.requiresTermsAcceptance && <section className={styles.reconsent}>
        <div><strong>S&K affiliate telah diperbarui</strong><p>Baca versi {data.terms?.version}, lalu setujui kembali sebelum membuat link atau mengubah payout.</p></div>
        <button className={styles.secondaryButton} onClick={() => setActiveTab('terms')}>Baca versi baru</button>
        <button className={styles.primaryButton} disabled={Boolean(busy)} onClick={() => action('accept_terms')}>Setujui versi {data.terms?.version}</button>
      </section>}

      <section className={styles.metrics}>
        <article><MousePointerClick /><span>Valid clicks</span><strong>{data.totals.clicks}</strong></article>
        <article><CircleDollarSign /><span>Pending</span><strong>{formatMoney(data.totals.pending)}</strong></article>
        <article><Banknote /><span>Siap payout</span><strong>{formatMoney(data.totals.available)}</strong></article>
        <article><ReceiptText /><span>Sudah dibayar</span><strong>{formatMoney(data.totals.paid)}</strong></article>
      </section>

      <nav className={styles.tabs}>
        {(['programs', 'commissions', 'payouts', 'terms'] as const).map(tab => (
          <button key={tab} className={activeTab === tab ? styles.tabActive : ''} onClick={() => setActiveTab(tab)}>
            {tab === 'programs' ? 'Program & Link' : tab === 'commissions' ? 'Komisi' : tab === 'payouts' ? 'Payout & Banding' : 'Ketentuan'}
          </button>
        ))}
      </nav>

      {activeTab === 'programs' && (
        <section className={styles.programGrid}>
          {data.programs.length === 0 && <div className={styles.empty}>Belum ada program affiliate yang dibuka.</div>}
          {data.programs.map(program => {
            const product = program.products || {}
            const version = program.enrollment?.affiliate_program_versions || program.currentVersion
            const enrolled = Boolean(program.enrollment)
            return (
              <article className={styles.programCard} key={program.id}>
                <div className={styles.productTop}>
                  {product.image_url ? <Image src={product.image_url} alt="" width={52} height={52} unoptimized /> : <div className={styles.productFallback}><Link2 /></div>}
                  <div><span>{program.eligibility_type === 'owners_only' ? 'Khusus pemilik produk' : 'Semua member'}</span><h2>{product.name || 'Produk Marcatching'}</h2></div>
                </div>
                <div className={styles.rate}><strong>{((Number(version?.commission_bps) || 0) / 100).toLocaleString('id-ID')}%</strong><span>komisi per penjualan</span></div>
                <dl><div><dt>Cookie</dt><dd>{program.attribution_window_days} hari</dd></div><div><dt>Hold</dt><dd>{program.holding_days} hari</dd></div><div><dt>Harga</dt><dd>{formatMoney(product.price_after_discount)}</dd></div></dl>
                {program.promotional_brief && <p className={styles.brief}>{program.promotional_brief}</p>}
                {program.restrictions && <p className={styles.restriction}><strong>Batasan:</strong> {program.restrictions}</p>}
                {program.affiliateUrl ? (
                  <div className={styles.linkBox}><code>{program.affiliateUrl}</code><button onClick={() => copyLink(program.affiliateUrl)}><Copy size={15} /> Salin</button></div>
                ) : (
                  <button className={styles.primaryButton} disabled={!program.eligible || program.status !== 'active' || Boolean(busy)} onClick={() => action('join', { programId: program.id })}>
                    {busy === 'join' ? <Loader2 className={styles.spin} size={16} /> : <Link2 size={16} />}
                    {program.eligible ? 'Setujui rate & buat link' : 'Miliki produk untuk bergabung'}
                  </button>
                )}
                {enrolled && <small className={styles.lockNote}><ShieldCheck size={13} /> Rate v{version?.version_number} terkunci sejak {formatDate(program.enrollment.accepted_at)}</small>}
                {program.asset_url && <a className={styles.assetLink} href={program.asset_url} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Buka asset promosi</a>}
              </article>
            )
          })}
        </section>
      )}

      {activeTab === 'commissions' && (
        <section className={styles.tableCard}>
          <div className={styles.cardHeader}><div><span className={styles.kicker}>Immutable history</span><h2>Riwayat komisi</h2></div><p>Pending matang otomatis setelah masa hold.</p></div>
          <div className={styles.tableWrap}><table><thead><tr><th>Tanggal</th><th>Order</th><th>Dasar</th><th>Rate</th><th>Komisi</th><th>Status</th></tr></thead><tbody>
            {data.commissions.map(row => <tr key={row.id}><td>{formatDate(row.created_at)}</td><td><code>{String(row.order_id).slice(0, 8)}</code></td><td>{formatMoney(row.commissionable_amount_rupiah)}</td><td>{Number(row.commission_bps) / 100}%</td><td>{formatMoney(row.commission_amount_rupiah)}</td><td><span className={`${styles.status} ${styles[`status_${row.status}`] || ''}`}>{row.status}</span></td></tr>)}
            {data.adjustments.map(row => <tr key={row.id}><td>{formatDate(row.created_at)}</td><td><code>ADJUST</code></td><td>—</td><td>—</td><td>{formatMoney(row.amount_rupiah)}</td><td><span className={`${styles.status} ${Number(row.amount_rupiah) < 0 ? styles.status_reversed : styles.status_available}`}>{row.adjustment_type}</span></td></tr>)}
            {data.commissions.length === 0 && data.adjustments.length === 0 && <tr><td colSpan={6} className={styles.emptyCell}>Belum ada komisi.</td></tr>}
          </tbody></table></div>
        </section>
      )}

      {activeTab === 'payouts' && (
        <div className={styles.twoColumn}>
          <section className={styles.formCard}>
            <span className={styles.kicker}>Rekening payout</span><h2>{data.payoutAccount ? `${data.payoutAccount.bank_name} •••• ${data.payoutAccount.account_number_last4}` : 'Lengkapi rekening'}</h2>
            <p>Nomor lengkap dienkripsi dan tidak pernah dikirim ke browser setelah disimpan.</p>
            <div className={styles.formGrid}>
              <label>Bank<input value={payoutForm.bankName} onChange={e => setPayoutForm({ ...payoutForm, bankName: e.target.value })} placeholder="BCA / Mandiri / BRI" /></label>
              <label>Nama pemilik<input value={payoutForm.accountName} onChange={e => setPayoutForm({ ...payoutForm, accountName: e.target.value })} /></label>
              <label>Nomor rekening<input inputMode="numeric" value={payoutForm.accountNumber} onChange={e => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })} /></label>
              <label>NPWP (opsional)<input value={payoutForm.taxId} onChange={e => setPayoutForm({ ...payoutForm, taxId: e.target.value })} /></label>
            </div>
            <button className={styles.primaryButton} disabled={Boolean(busy)} onClick={() => action('save_payout_account', payoutForm)}>Simpan rekening terenkripsi</button>
          </section>
          <section className={styles.formCard}>
            <span className={styles.kicker}>Banding statement</span><h2>Laporkan ketidaksesuaian</h2><p>Ajukan maksimal tiga hari setelah statement diterbitkan.</p>
            <label>Statement<select value={dispute.statementId} onChange={e => setDispute({ ...dispute, statementId: e.target.value })}><option value="">Pilih statement</option>{data.statements.map(row => <option key={row.id} value={row.id}>{formatDate(row.issued_at)} · {formatMoney(row.net_payout_rupiah)}</option>)}</select></label>
            <label>Nominal yang dipermasalahkan<input inputMode="numeric" value={dispute.disputedAmountRupiah} onChange={e => setDispute({ ...dispute, disputedAmountRupiah: e.target.value })} /></label>
            <label>Alasan<textarea value={dispute.reason} onChange={e => setDispute({ ...dispute, reason: e.target.value })} rows={4} /></label>
            <button className={styles.secondaryButton} disabled={!dispute.statementId || Boolean(busy)} onClick={async () => { if (await action('submit_dispute', dispute)) setDispute({ statementId: '', reason: '', disputedAmountRupiah: '' }) }}>Kirim banding</button>
          </section>
          <section className={`${styles.tableCard} ${styles.fullWidth}`}>
            <div className={styles.cardHeader}><div><span className={styles.kicker}>Statement & slip</span><h2>Riwayat payout</h2></div></div>
            <div className={styles.tableWrap}><table><thead><tr><th>Tanggal</th><th>Gross</th><th>Net</th><th>Status</th><th>Referensi</th><th>Slip</th></tr></thead><tbody>
              {data.payouts.map(row => { const statement = statementById.get(row.statement_id); return <tr key={row.id}><td>{formatDate(row.paid_at || row.created_at)}</td><td>{formatMoney(statement?.gross_commission_rupiah)}</td><td>{formatMoney(row.amount_rupiah)}</td><td><span className={`${styles.status} ${styles[`status_${row.status}`] || ''}`}>{row.status}</span></td><td>{row.transfer_reference || '—'}</td><td>{row.status === 'paid' ? <a href={`/api/affiliate/payouts/${row.id}/receipt`} target="_blank">PDF</a> : '—'}</td></tr> })}
              {data.payouts.length === 0 && <tr><td colSpan={6} className={styles.emptyCell}>Belum ada payout.</td></tr>}
            </tbody></table></div>
          </section>
        </div>
      )}

      {activeTab === 'terms' && <section className={styles.termsCard}><h2>{data.terms?.title}</h2><div className={styles.rules}><p><strong>Minimum payout:</strong> {formatMoney(data.settings.minimumPayoutRupiah)}</p><p><strong>Jadwal:</strong> {data.settings.settlementSchedule}</p><p><strong>Atribusi:</strong> {data.settings.attributionModel}</p><p><strong>Dasar komisi:</strong> {data.settings.commissionBase}</p></div><pre>{data.terms?.content}</pre></section>}
      {message && <p className={styles.toast}>{message}</p>}
    </div>
  )
}
