'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Check, Copy, Download, ExternalLink, FileText, Mail, RefreshCw, Search, Users } from 'lucide-react'
import styles from './admin.module.css'

type WorkspaceExport = {
  id: string
  userId: string
  name: string
  email: string
  whatsapp: string
  completedSections: number
  socialProfiles: Array<{ platform?: string; url?: string; audienceCount?: number }>
  experiments: number
  metrics: number
  updatedAt: string
  createdAt: string
  data: Record<string, unknown>
}

function feedbackMessage(item: WorkspaceExport) {
  return [
    `Hai ${item.name}, aku Gilang, founder Marcatching.`,
    '',
    'Aku lihat kamu sudah menyelesaikan Marcatching Creator Workspace kamu dengan data:',
    `Nama: ${item.name}`,
    `Email: ${item.email || 'Belum tersedia'}`,
    `Nomor telepon: ${item.whatsapp || 'Belum tersedia'}`,
    '',
    'Izin aku kirim feedback dari hasil analisis tim Marcatching, ya.',
    '',
    '*Confidential — data dan feedback ini hanya untuk kebutuhan analisis Creator Workspace kamu.',
  ].join('\n')
}

function exportUrl(format: 'pdf' | 'md' | 'json', id?: string) {
  const params = new URLSearchParams({ format })
  if (id) params.set('id', id)
  return `/api/admin/creator-workspaces/export?${params.toString()}`
}

export default function CreatorWorkspaceTab() {
  const [workspaces, setWorkspaces] = useState<WorkspaceExport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [copiedId, setCopiedId] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/creator-workspaces', { cache: 'no-store' })
      const payload = await response.json() as { data?: WorkspaceExport[]; message?: string }
      if (!response.ok) throw new Error(payload.message || 'Gagal memuat workspace')
      setWorkspaces(payload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat workspace')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return workspaces
    return workspaces.filter(item => item.name.toLowerCase().includes(normalized) || item.email.toLowerCase().includes(normalized) || item.whatsapp.includes(normalized) || item.userId.includes(normalized))
  }, [query, workspaces])

  const totals = useMemo(() => ({
    completed: workspaces.filter(item => item.completedSections >= 8).length,
    experiments: workspaces.reduce((total, item) => total + item.experiments, 0),
  }), [workspaces])

  async function copyFeedback(item: WorkspaceExport) {
    await navigator.clipboard.writeText(feedbackMessage(item))
    setCopiedId(item.id)
    window.setTimeout(() => setCopiedId(current => current === item.id ? '' : current), 1800)
  }

  return (
    <div className={`${styles.tabContent} ${styles.creatorWorkspaceAdmin}`}>
      <div className={styles.creatorWorkspaceHeader}>
        <div>
          <span>Creator Intelligence</span>
          <h1>Creator Workspaces</h1>
          <p>Download jawaban member untuk dianalisis oleh AI Marcatching, lalu gunakan email atau WhatsApp untuk mengirim feedback.</p>
        </div>
        <div className={styles.creatorWorkspaceActions}>
          <button type="button" onClick={() => void load()}><RefreshCw size={15} /> Refresh</button>
          <a href={exportUrl('pdf')}><Download size={15} /> PDF</a>
          <a href={exportUrl('md')}><FileText size={15} /> Markdown</a>
          <a href={exportUrl('json')} className={styles.creatorWorkspacePrimary}><Download size={15} /> AI JSON</a>
        </div>
      </div>

      <div className={styles.creatorWorkspaceStats}>
        <article><Users size={18} /><span><small>Total workspace</small><strong>{workspaces.length}</strong></span></article>
        <article><BarChart3 size={18} /><span><small>Journey selesai</small><strong>{totals.completed}</strong></span></article>
        <article><FileText size={18} /><span><small>Experiments tercatat</small><strong>{totals.experiments}</strong></span></article>
      </div>

      <label className={styles.creatorWorkspaceSearch}><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama, email, WhatsApp, atau member ID" /></label>

      {loading ? <div className={styles.creatorWorkspaceEmpty}><RefreshCw size={18} /> Memuat Creator Workspaces...</div> : error ? <div className={styles.creatorWorkspaceEmpty}>{error}</div> : (
        <div className={styles.creatorWorkspaceTable}>
          <div className={styles.creatorWorkspaceTableHead}><span>Member</span><span>Progress</span><span>Data</span><span>Updated</span><span>Action</span></div>
          {filtered.map(item => {
            const message = feedbackMessage(item)
            const isComplete = item.completedSections >= 8
            const whatsappNumber = item.whatsapp.replace(/\D/g, '').replace(/^0/, '62')
            return (
            <article key={item.id}>
              <div><strong>{item.name}</strong><small>{item.email || 'Email belum tersedia'} · {item.whatsapp || item.userId}</small></div>
              <div><strong>{item.completedSections}/8 section</strong><small>{item.completedSections >= 8 ? 'Overview unlocked' : 'Guided journey'}</small></div>
              <div><strong>{item.experiments} experiments</strong><small>{item.metrics} monthly snapshots</small></div>
              <time>{new Date(item.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
              <div className={styles.creatorWorkspaceRowActions}>
                {isComplete && <button type="button" className={styles.creatorWorkspaceCopy} onClick={() => void copyFeedback(item)}>{copiedId === item.id ? <Check size={14} /> : <Copy size={14} />} {copiedId === item.id ? 'Tersalin' : 'Copy chat'}</button>}
                {isComplete && item.email && <a href={`mailto:${item.email}?subject=${encodeURIComponent('Feedback Creator Workspace Marcatching')}&body=${encodeURIComponent(message)}`} aria-label={`Email ${item.email}`}><Mail size={15} /></a>}
                {isComplete && whatsappNumber && <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${item.whatsapp}`}><ExternalLink size={15} /></a>}
                <span className={styles.creatorWorkspaceFormats} aria-label={`Download workspace ${item.name}`}>
                  <a href={exportUrl('pdf', item.id)}>PDF</a>
                  <a href={exportUrl('md', item.id)}>MD</a>
                  <a href={exportUrl('json', item.id)}>JSON</a>
                </span>
              </div>
            </article>
          )})}
          {!filtered.length && <div className={styles.creatorWorkspaceEmpty}>Tidak ada workspace yang cocok.</div>}
        </div>
      )}
    </div>
  )
}
