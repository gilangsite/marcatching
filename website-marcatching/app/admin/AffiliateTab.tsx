'use client'
/* eslint-disable @typescript-eslint/no-explicit-any, react/jsx-key */

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BadgePercent,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Loader2,
  MousePointerClick,
  Pause,
  Play,
  RefreshCw,
  Save,
  ShieldAlert,
  Users,
} from 'lucide-react'
import styles from './affiliate.module.css'

type AdminData = Record<string, any> & {
  products: Array<any>; programs: Array<any>; versions: Array<any>; members: Array<any>;
  accounts: Array<any>; clicks: Array<any>; commissions: Array<any>; adjustments: Array<any>; cycles: Array<any>;
  statements: Array<any>; payouts: Array<any>; emailDeliveries: Array<any>; disputes: Array<any>; terms: Array<any>;
  metrics: Record<string, number>;
}

type Section = 'overview' | 'programs' | 'affiliates' | 'sales' | 'commissions' | 'payouts' | 'disputes' | 'settings'
const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const formatMoney = (value: unknown) => money.format(Number(value) || 0)
const date = (value: string | null | undefined) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '—'

function previousMonth() {
  const now = new Date()
  const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(firstThisMonth.getTime() - 86_400_000)
  const start = new Date(end.getFullYear(), end.getMonth(), 1)
  const iso = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  return { periodStart: iso(start), periodEnd: iso(end) }
}

export default function AffiliateTab() {
  const [data, setData] = useState<AdminData | null>(null)
  const [section, setSection] = useState<Section>('overview')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    productId: '', commissionPercent: '10', attributionWindowDays: '30', holdingDays: '14',
    eligibilityType: 'owners_only', startsAt: new Date().toISOString().slice(0, 16), endsAt: '',
    promotionalBrief: '', approvedCopy: '', assetUrl: '', restrictions: '', calculatorPrice: '100000',
  })
  const [settlement, setSettlement] = useState(previousMonth)
  const [terms, setTerms] = useState({ title: 'Syarat dan Ketentuan Marcatching Affiliate', content: '' })
  const [payoutRefs, setPayoutRefs] = useState<Record<string, { transferReference: string; proofUrl: string }>>({})
  const [revealedAccounts, setRevealedAccounts] = useState<Record<string, { bankName: string; accountName: string; accountNumber: string; taxId: string | null }>>({})
  const [disputeNotes, setDisputeNotes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/affiliate', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Data affiliate gagal dimuat')
      setData(result)
      const latest = result.terms?.[0]
      if (latest) setTerms({ title: latest.title, content: latest.content })
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Data affiliate gagal dimuat')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  async function action(name: string, payload: Record<string, unknown> = {}) {
    setBusy(name)
    setNotice('')
    try {
      const response = await fetch('/api/admin/affiliate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: name, ...payload }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Action gagal')
      setData(result.data)
      setNotice(name === 'generate_settlement'
        ? `${result.settlement?.statementCount || 0} statement dibuat, total ${formatMoney(result.settlement?.payoutTotalRupiah)}.`
        : 'Perubahan berhasil disimpan.')
      return true
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Action gagal')
      return false
    } finally { setBusy('') }
  }

  async function revealPayoutAccount(payoutId: string) {
    setBusy(`reveal:${payoutId}`)
    setNotice('')
    try {
      const response = await fetch('/api/admin/affiliate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reveal_payout_account', payoutId }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Rekening belum dapat ditampilkan')
      setRevealedAccounts(current => ({ ...current, [payoutId]: result.account }))
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Rekening belum dapat ditampilkan')
    } finally { setBusy('') }
  }

  const productById = useMemo(() => new Map((data?.products || []).map(row => [row.id, row])), [data])
  const memberById = useMemo(() => new Map((data?.members || []).map(row => [row.id, row])), [data])
  const programById = useMemo(() => new Map((data?.programs || []).map(row => [row.id, row])), [data])
  const accountByMember = useMemo(() => new Map((data?.accounts || []).map(row => [row.affiliate_member_id, row])), [data])
  const emailByPayout = useMemo(() => new Map((data?.emailDeliveries || []).map(row => [row.payout_id, row])), [data])
  const latestVersion = useCallback((programId: string) => (data?.versions || []).filter(row => row.program_id === programId).sort((a, b) => b.version_number - a.version_number)[0], [data])

  function selectProgramProduct(productId: string) {
    const program = data?.programs.find(row => row.product_id === productId)
    const version = program ? latestVersion(program.id) : null
    setForm(current => ({
      ...current,
      productId,
      commissionPercent: version ? String(Number(version.commission_bps) / 100) : current.commissionPercent,
      attributionWindowDays: program ? String(program.attribution_window_days) : '30',
      holdingDays: program ? String(program.holding_days) : '14',
      eligibilityType: program?.eligibility_type || 'owners_only',
      promotionalBrief: program?.promotional_brief || '',
      approvedCopy: program?.approved_copy || '',
      assetUrl: program?.asset_url || '',
      restrictions: program?.restrictions || '',
    }))
  }

  if (loading) return <div className={styles.state}><Loader2 className={styles.spin} /> Memuat Affiliate OS...</div>
  if (!data) return <div className={styles.state}><div><ShieldAlert /><p>{notice}</p><button onClick={load}>Coba lagi</button></div></div>

  const commissionPreview = Math.round((Number(form.calculatorPrice) || 0) * (Number(form.commissionPercent) || 0) / 100)
  const validProducts = data.products
  const publishedTerms = data.terms.find(row => row.status === 'published')
  const latestTerms = data.terms[0]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><span><BadgePercent size={14} /> First-party revenue channel</span><h1>Affiliate</h1><p>Kelola produk Marcatching, rate terkunci, atribusi, ledger, settlement, dan payout.</p></div>
        <button className={styles.iconButton} onClick={load} aria-label="Refresh"><RefreshCw size={17} /></button>
      </header>

      <nav className={styles.sections}>
        {(['overview', 'programs', 'affiliates', 'sales', 'commissions', 'payouts', 'disputes', 'settings'] as Section[]).map(item => (
          <button key={item} className={section === item ? styles.active : ''} onClick={() => setSection(item)}>{item}</button>
        ))}
      </nav>

      {!publishedTerms && <section className={styles.termsAlert}>
        <ShieldAlert size={22} />
        <div className={styles.termsAlertCopy}>
          <strong>S&amp;K affiliate belum dipublikasikan</strong>
          <p>Draft v{latestTerms?.version || 1} sudah tersimpan. Review isi dokumen lalu publish dari Settings agar S&amp;K muncul dan dapat disetujui di dashboard course.</p>
        </div>
        <button className={styles.textButton} onClick={() => setSection('settings')}>Review &amp; publish S&amp;K</button>
      </section>}

      {section === 'overview' && <>
        <section className={styles.metrics}>
          <article><Users /><span>Active affiliates</span><strong>{data.metrics.activeAffiliates}</strong></article>
          <article><MousePointerClick /><span>Valid clicks</span><strong>{data.metrics.validClicks}</strong></article>
          <article><CircleDollarSign /><span>Attributed revenue</span><strong>{formatMoney(data.metrics.attributedRevenueRupiah)}</strong></article>
          <article><Banknote /><span>Outstanding</span><strong>{formatMoney(data.metrics.pendingRupiah + data.metrics.availableRupiah + data.metrics.processingRupiah)}</strong></article>
        </section>
        <section className={styles.insightGrid}>
          <article><span>Pending hold</span><strong>{formatMoney(data.metrics.pendingRupiah)}</strong><p>Menunggu masa validasi refund 14 hari atau sesuai program.</p></article>
          <article><span>Available</span><strong>{formatMoney(data.metrics.availableRupiah)}</strong><p>Siap dimasukkan ke settlement berikutnya.</p></article>
          <article><span>Processing</span><strong>{formatMoney(data.metrics.processingRupiah)}</strong><p>Sudah dialokasikan ke statement dan payout.</p></article>
          <article><span>Lifetime paid</span><strong>{formatMoney(data.metrics.paidRupiah)}</strong><p>Riwayat tetap tersimpan; saldo tidak pernah di-reset.</p></article>
        </section>
        <section className={styles.panel}><div className={styles.panelTitle}><div><span>Control notes</span><h2>Aturan inti aktif</h2></div></div><div className={styles.rules}><p><CheckCircle2 /> Komisi snapshot per order dan rate version.</p><p><CheckCircle2 /> Self-purchase dan link kedaluwarsa tidak dihitung.</p><p><CheckCircle2 /> Refund membalik komisi sebelum payout.</p><p><CheckCircle2 /> Rp50.000 minimum; sisanya carry forward.</p></div></section>
      </>}

      {section === 'programs' && <div className={styles.programLayout}>
        <section className={styles.panel}>
          <div className={styles.panelTitle}><div><span>Publish immutable version</span><h2>Tambahkan produk affiliate</h2></div></div>
          <div className={styles.formGrid}>
            <label>Produk<select value={form.productId} onChange={e => selectProgramProduct(e.target.value)}><option value="">Pilih dari Products / E-Commerce</option>{validProducts.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
            <label>Komisi (%)<input type="number" min="0.01" max="100" step="0.01" value={form.commissionPercent} onChange={e => setForm({ ...form, commissionPercent: e.target.value })} /></label>
            <label>Cookie window (hari)<input type="number" min="1" max="90" value={form.attributionWindowDays} onChange={e => setForm({ ...form, attributionWindowDays: e.target.value })} /></label>
            <label>Masa hold (hari)<input type="number" min="0" max="90" value={form.holdingDays} onChange={e => setForm({ ...form, holdingDays: e.target.value })} /></label>
            <label>Eligibility<select value={form.eligibilityType} onChange={e => setForm({ ...form, eligibilityType: e.target.value })}><option value="owners_only">Pemilik produk saja</option><option value="all_members">Semua member course</option></select></label>
            <label>Mulai berlaku<input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} /></label>
            <label>Berakhir (opsional)<input type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} /></label>
            <label>URL asset<input value={form.assetUrl} onChange={e => setForm({ ...form, assetUrl: e.target.value })} placeholder="https://..." /></label>
            <label className={styles.full}>Brief<textarea rows={4} value={form.promotionalBrief} onChange={e => setForm({ ...form, promotionalBrief: e.target.value })} /></label>
            <label className={styles.full}>Approved copy<textarea rows={3} value={form.approvedCopy} onChange={e => setForm({ ...form, approvedCopy: e.target.value })} /></label>
            <label className={styles.full}>Larangan / restrictions<textarea rows={3} value={form.restrictions} onChange={e => setForm({ ...form, restrictions: e.target.value })} /></label>
          </div>
          <div className={styles.calculator}><div><span>Simulasi harga item</span><input type="number" value={form.calculatorPrice} onChange={e => setForm({ ...form, calculatorPrice: e.target.value })} /></div><div><span>Komisi affiliate</span><strong>{formatMoney(commissionPreview)}</strong></div><div><span>Revenue Marcatching*</span><strong>{formatMoney((Number(form.calculatorPrice) || 0) - commissionPreview)}</strong></div><small>*Sebelum pajak/biaya internal; Midtrans tidak mengurangi basis komisi.</small></div>
          <button className={styles.primary} disabled={!form.productId || Boolean(busy)} onClick={async () => {
            const saved = await action('publish_program_version', {
              ...form, commissionBps: Math.round(Number(form.commissionPercent) * 100),
              startsAt: new Date(form.startsAt).toISOString(), endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : '',
            })
            if (saved) setForm({ ...form, productId: '' })
          }}><Save size={16} /> Publish versi komisi baru</button>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelTitle}><div><span>Live catalog</span><h2>Program aktif</h2></div></div>
          <div className={styles.cards}>{data.programs.map(program => { const product = productById.get(program.product_id); const version = latestVersion(program.id); return <article key={program.id}><div><span className={`${styles.pill} ${styles[`pill_${program.status}`] || ''}`}>{program.status}</span><h3>{product?.name || 'Produk'}</h3><p>v{version?.version_number || '—'} · {Number(version?.commission_bps || 0) / 100}% · cookie {program.attribution_window_days} hari</p></div><button className={styles.iconButton} title={program.status === 'active' ? 'Pause' : 'Aktifkan'} onClick={() => action('set_program_status', { programId: program.id, status: program.status === 'active' ? 'paused' : 'active' })}>{program.status === 'active' ? <Pause size={15} /> : <Play size={15} />}</button></article>})}{!data.programs.length && <p className={styles.empty}>Belum ada program.</p>}</div>
          <p className={styles.hint}>Untuk mengganti rate, publikasikan versi baru melalui API/admin setelah memilih program. Enrollment lama tetap memakai rate lamanya; tidak ada perubahan retroaktif.</p>
        </section>
      </div>}

      {section === 'affiliates' && <section className={styles.panel}><div className={styles.panelTitle}><div><span>Members</span><h2>Affiliate directory</h2></div></div><Table headers={['Affiliate', 'Kode', 'Rekening', 'Bergabung', 'Status', 'Action']} rows={data.members.map(member => [<><strong>{member.display_name}</strong><small>{member.email}</small></>, member.affiliate_code, accountByMember.has(member.id) ? `${accountByMember.get(member.id).bank_name} •••• ${accountByMember.get(member.id).account_number_last4}` : 'Belum diisi', date(member.created_at), <span className={`${styles.pill} ${styles[`pill_${member.status}`] || ''}`}>{member.status}</span>, <button className={styles.textButton} onClick={() => action('set_member_status', { memberId: member.id, status: member.status === 'active' ? 'suspended' : 'active' })}>{member.status === 'active' ? 'Suspend' : 'Activate'}</button>])} /></section>}

      {section === 'sales' && <section className={styles.panel}><div className={styles.panelTitle}><div><span>Brand Collab replacement</span><h2>Affiliate sales</h2></div></div><Table headers={['Tanggal', 'Order', 'Product', 'Affiliate', 'Revenue', 'Komisi', 'Status']} rows={data.commissions.map(row => { const program = programById.get(row.program_id); return [date(row.created_at), <code>{String(row.order_id).slice(0, 8)}</code>, productById.get(program?.product_id)?.name || '—', memberById.get(row.affiliate_member_id)?.display_name || '—', formatMoney(row.commissionable_amount_rupiah), formatMoney(row.commission_amount_rupiah), <span className={`${styles.pill} ${styles[`pill_${row.status}`] || ''}`}>{row.status}</span>] })} /></section>}

      {section === 'commissions' && <section className={styles.panel}><div className={styles.panelTitle}><div><span>Append-only ledger</span><h2>Komisi</h2></div></div><Table headers={['Dibuat', 'Affiliate', 'Basis', 'Rate', 'Komisi', 'Available', 'Status']} rows={data.commissions.map(row => [date(row.created_at), memberById.get(row.affiliate_member_id)?.display_name || '—', formatMoney(row.commissionable_amount_rupiah), `${Number(row.commission_bps) / 100}%`, formatMoney(row.commission_amount_rupiah), date(row.available_at), <span className={`${styles.pill} ${styles[`pill_${row.status}`] || ''}`}>{row.status}</span>])} /></section>}

      {section === 'payouts' && <>
        <section className={styles.settlementBar}><div><span>Generate monthly settlement</span><strong>Minimum payout Rp50.000</strong></div><label>Mulai<input type="date" value={settlement.periodStart} onChange={e => setSettlement({ ...settlement, periodStart: e.target.value })} /></label><label>Selesai<input type="date" value={settlement.periodEnd} onChange={e => setSettlement({ ...settlement, periodEnd: e.target.value })} /></label><button className={styles.primary} disabled={Boolean(busy)} onClick={() => action('generate_settlement', settlement)}>Buat statement</button></section>
        <section className={styles.panel}><div className={styles.panelTitle}><div><span>Manual bank transfer</span><h2>Payout queue</h2></div></div><div className={styles.payoutList}>{data.payouts.map(payout => { const member = memberById.get(payout.affiliate_member_id); const local = payoutRefs[payout.id] || { transferReference: '', proofUrl: '' }; const emailDelivery = emailByPayout.get(payout.id); const needsRetry = emailDelivery?.status !== 'sent' || !payout.finance_exported_at; const revealed = revealedAccounts[payout.id]; return <article key={payout.id}><div><span className={`${styles.pill} ${styles[`pill_${payout.status}`] || ''}`}>{payout.status}</span><h3>{member?.display_name || 'Affiliate'} · {formatMoney(payout.amount_rupiah)}</h3><p>{payout.bank_name} · {payout.account_name} · {revealed ? revealed.accountNumber : `•••• ${payout.account_number_last4}`}</p>{revealed?.taxId && <small>NPWP: {revealed.taxId}</small>}{!revealed && payout.status !== 'paid' && <button className={styles.textButton} disabled={busy === `reveal:${payout.id}`} onClick={() => revealPayoutAccount(payout.id)}>Tampilkan rekening</button>}{payout.status === 'paid' && <small>Email: {emailDelivery?.status || 'belum terkirim'} · Finance: {payout.finance_exported_at ? 'synced' : 'pending'}</small>}</div>{payout.status !== 'paid' ? <div className={styles.payForm}><input placeholder="Referensi transfer" value={local.transferReference} onChange={e => setPayoutRefs({ ...payoutRefs, [payout.id]: { ...local, transferReference: e.target.value } })} /><input placeholder="URL bukti (opsional)" value={local.proofUrl} onChange={e => setPayoutRefs({ ...payoutRefs, [payout.id]: { ...local, proofUrl: e.target.value } })} /><button className={styles.primary} disabled={!local.transferReference || Boolean(busy)} onClick={() => action('mark_payout_paid', { payoutId: payout.id, ...local })}>Sudah transfer</button></div> : <div className={styles.paidInfo}><CheckCircle2 /> {payout.transfer_reference}<a href={`/api/affiliate/payouts/${payout.id}/receipt`} target="_blank">Slip PDF</a>{needsRetry && <button className={styles.textButton} onClick={() => action('mark_payout_paid', { payoutId: payout.id, transferReference: payout.transfer_reference, proofUrl: payout.proof_url || '' })}>Retry sync</button>}</div>}</article>})}{!data.payouts.length && <p className={styles.empty}>Belum ada payout queue.</p>}</div></section>
      </>}

      {section === 'disputes' && <section className={styles.panel}><div className={styles.panelTitle}><div><span>Appeal desk</span><h2>Banding ketidaksesuaian</h2></div></div><div className={styles.disputeList}>{data.disputes.map(item => <article key={item.id}><div><span className={`${styles.pill} ${styles[`pill_${item.status}`] || ''}`}>{item.status}</span><h3>{memberById.get(item.affiliate_member_id)?.display_name || 'Affiliate'} · {formatMoney(item.disputed_amount_rupiah)}</h3><p>{item.reason}</p><small>Statement {String(item.statement_id).slice(0, 8)} · {date(item.created_at)}</small></div>{['submitted', 'reviewing'].includes(item.status) && <div><textarea placeholder="Catatan keputusan" value={disputeNotes[item.id] || ''} onChange={e => setDisputeNotes({ ...disputeNotes, [item.id]: e.target.value })} /><span><button className={styles.textButton} onClick={() => action('resolve_dispute', { disputeId: item.id, resolution: 'rejected', adminNote: disputeNotes[item.id] })}>Tolak</button><button className={styles.primary} onClick={() => action('resolve_dispute', { disputeId: item.id, resolution: 'resolved', adminNote: disputeNotes[item.id] })}>Selesaikan</button></span></div>}</article>)}{!data.disputes.length && <p className={styles.empty}>Belum ada banding.</p>}</div></section>}

      {section === 'settings' && <div className={styles.settingsGrid}>
        <section className={styles.panel}>
          <div className={styles.panelTitle}><div><span>Versioned legal consent</span><h2>Syarat &amp; Ketentuan</h2></div></div>
          <div className={styles.termsStatus}>
            <span className={`${styles.pill} ${publishedTerms ? styles.pill_published : styles.pill_pending}`}>
              {publishedTerms ? `Published v${publishedTerms.version}` : `Draft v${latestTerms?.version || 1}`}
            </span>
            <p>{publishedTerms ? 'Versi ini sudah tampil di dashboard course. Publish lagi hanya jika isi S&K benar-benar berubah.' : 'Belum tampil di dashboard course. Review isi draft di bawah, lalu publish versi pertama.'}</p>
          </div>
          <label className={styles.stack}>Judul<input value={terms.title} onChange={e => setTerms({ ...terms, title: e.target.value })} /></label>
          <label className={styles.stack}>Isi<textarea rows={24} value={terms.content} onChange={e => setTerms({ ...terms, content: e.target.value })} /></label>
          <button className={styles.primary} disabled={terms.content.length < 200 || Boolean(busy)} onClick={() => action('publish_terms', terms)}>
            <FileText size={16} /> {publishedTerms ? 'Publish sebagai versi baru' : 'Publish S&K pertama'}
          </button>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelTitle}><div><span>Operational policy</span><h2>Konfigurasi tetap MVP</h2></div></div>
          <dl className={styles.configList}><div><dt>Attribution</dt><dd>Last valid click</dd></div><div><dt>Default cookie</dt><dd>30 hari</dd></div><div><dt>Default hold</dt><dd>14 hari</dd></div><div><dt>Minimum payout</dt><dd>Rp50.000</dd></div><div><dt>Settlement</dt><dd>Tanggal 1</dd></div><div><dt>Banding</dt><dd>Tanggal 1–3 / 3 hari</dd></div><div><dt>Transfer</dt><dd>Maks. tanggal 5</dd></div><div><dt>Transfer fee</dt><dd>Ditanggung Marcatching</dd></div></dl>
          <p className={styles.hint}>Nilai kritis disimpan pada snapshot setiap program/order. Ubah konstanta global lewat migration baru agar audit trail tetap jelas.</p>
        </section>
      </div>}

      {notice && <div className={styles.notice}>{notice}</div>}
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: Array<Array<React.ReactNode>> }) {
  return <div className={styles.tableWrap}><table><thead><tr>{headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}{!rows.length && <tr><td colSpan={headers.length} className={styles.empty}>Belum ada data.</td></tr>}</tbody></table></div>
}
