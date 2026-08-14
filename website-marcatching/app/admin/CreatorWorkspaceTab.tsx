'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, ExternalLink, FileText, Mail, RefreshCw, Search, Users } from 'lucide-react'
import styles from './admin.module.css'

type WorkspaceExport = {
  id: string
  userId: string
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

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export default function CreatorWorkspaceTab() {
  const [workspaces, setWorkspaces] = useState<WorkspaceExport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

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
    return workspaces.filter(item => item.email.toLowerCase().includes(normalized) || item.whatsapp.includes(normalized) || item.userId.includes(normalized))
  }, [query, workspaces])

  const totals = useMemo(() => ({
    completed: workspaces.filter(item => item.completedSections >= 8).length,
    experiments: workspaces.reduce((total, item) => total + item.experiments, 0),
  }), [workspaces])

  function downloadJson(items: WorkspaceExport[], name: string) {
    downloadFile(name, JSON.stringify({ exportedAt: new Date().toISOString(), workspaces: items }, null, 2), 'application/json;charset=utf-8')
  }

  function downloadCsv() {
    const header = ['email', 'whatsapp', 'completed_sections', 'experiments', 'metric_snapshots', 'social_profiles', 'updated_at']
    const rows = filtered.map(item => [
      item.email,
      item.whatsapp,
      item.completedSections,
      item.experiments,
      item.metrics,
      item.socialProfiles.map(profile => `${profile.platform}: ${profile.url} (${profile.audienceCount || 0})`).join(' | '),
      item.updatedAt,
    ].map(csvCell).join(','))
    downloadFile('marcatching-creator-workspaces.csv', [header.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8')
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
          <button type="button" onClick={downloadCsv}><Download size={15} /> Download CSV</button>
          <button type="button" className={styles.creatorWorkspacePrimary} onClick={() => downloadJson(filtered, 'marcatching-creator-workspaces-ai.json')}><FileText size={15} /> Download AI JSON</button>
        </div>
      </div>

      <div className={styles.creatorWorkspaceStats}>
        <article><Users size={18} /><span><small>Total workspace</small><strong>{workspaces.length}</strong></span></article>
        <article><BarChart3 size={18} /><span><small>Journey selesai</small><strong>{totals.completed}</strong></span></article>
        <article><FileText size={18} /><span><small>Experiments tercatat</small><strong>{totals.experiments}</strong></span></article>
      </div>

      <label className={styles.creatorWorkspaceSearch}><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari email, WhatsApp, atau member ID" /></label>

      {loading ? <div className={styles.creatorWorkspaceEmpty}><RefreshCw size={18} /> Memuat Creator Workspaces...</div> : error ? <div className={styles.creatorWorkspaceEmpty}>{error}</div> : (
        <div className={styles.creatorWorkspaceTable}>
          <div className={styles.creatorWorkspaceTableHead}><span>Member</span><span>Progress</span><span>Data</span><span>Updated</span><span>Action</span></div>
          {filtered.map(item => (
            <article key={item.id}>
              <div><strong>{item.email || 'Email belum tersedia'}</strong><small>{item.whatsapp || item.userId}</small></div>
              <div><strong>{item.completedSections}/8 section</strong><small>{item.completedSections >= 8 ? 'Overview unlocked' : 'Guided journey'}</small></div>
              <div><strong>{item.experiments} experiments</strong><small>{item.metrics} monthly snapshots</small></div>
              <time>{new Date(item.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
              <div className={styles.creatorWorkspaceRowActions}>
                {item.email && <a href={`mailto:${item.email}`} aria-label={`Email ${item.email}`}><Mail size={15} /></a>}
                {item.whatsapp && <a href={`https://wa.me/${item.whatsapp.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${item.whatsapp}`}><ExternalLink size={15} /></a>}
                <button type="button" onClick={() => downloadJson([item], `creator-workspace-${item.userId}.json`)} aria-label="Download workspace"><Download size={15} /></button>
              </div>
            </article>
          ))}
          {!filtered.length && <div className={styles.creatorWorkspaceEmpty}>Tidak ada workspace yang cocok.</div>}
        </div>
      )}
    </div>
  )
}
