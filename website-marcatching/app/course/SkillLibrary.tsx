'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BrainCircuit, CheckCircle2, Download, ExternalLink, FileArchive, LockKeyhole, RefreshCw, Settings2, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { SkillRequirementsModal } from './SkillRequirementsModal'
import styles from './skill-library.module.css'

type SkillCatalogItem = {
  id: string
  name: string
  sourceName: string
  description: string
  imageUrl: string | null
  owned: boolean
  memoryReady: boolean
  canCreate: boolean
  storeUrl: string
  status: 'locked' | 'memory_required' | 'ready'
}

type SkillDownloadMode = 'original' | 'personalized'

function filenameFromDisposition(value: string | null, fallback: string) {
  if (!value) return fallback
  const encoded = value.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (encoded) {
    try { return decodeURIComponent(encoded) } catch { return fallback }
  }
  return value.match(/filename="([^"]+)"/i)?.[1] || fallback
}

export default function SkillLibrary({ compact = false }: { compact?: boolean }) {
  const [skills, setSkills] = useState<SkillCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeDownload, setActiveDownload] = useState('')
  const [checkingRequirements, setCheckingRequirements] = useState('')
  const [requirementsModal, setRequirementsModal] = useState<{ skillId: string; skillName: string } | null>(null)
  const [notice, setNotice] = useState('')

  async function memberToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  async function loadSkills() {
    setLoading(true)
    setError('')
    try {
      const token = await memberToken()
      if (!token) throw new Error('Login kembali untuk melihat Skill kamu.')
      const response = await fetch('/api/workspace/skills', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      const payload = await response.json() as { skills?: SkillCatalogItem[]; message?: string }
      if (!response.ok) throw new Error(payload.message || 'Katalog Skill belum bisa dimuat.')
      setSkills(payload.skills || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Katalog Skill belum bisa dimuat.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSkills()
    // Load once when this library surface is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function downloadSkill(skill: SkillCatalogItem, mode: SkillDownloadMode) {
    const downloadKey = `${skill.id}:${mode}`
    setActiveDownload(downloadKey)
    setNotice('')
    setError('')
    try {
      const token = await memberToken()
      if (!token) throw new Error('Login kembali untuk mengunduh Skill.')
      const response = await fetch('/api/workspace/skills', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: skill.id, mode }),
      })
      if (!response.ok) {
        const payload = await response.json() as { message?: string }
        throw new Error(payload.message || 'Skill belum berhasil diunduh.')
      }
      const blob = await response.blob()
      const fallback = mode === 'original' ? `${skill.sourceName}.zip` : `${skill.sourceName}-personalized.zip`
      const filename = filenameFromDisposition(response.headers.get('content-disposition'), fallback)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice(mode === 'original' ? `${skill.name} original berhasil diunduh.` : `${skill.name} sudah dibuat dan dipersonalisasi dari Brand Memory kamu.`)
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Skill belum berhasil diunduh.')
    } finally {
      setActiveDownload('')
    }
  }

  async function handleCreatePersonalized(skill: SkillCatalogItem) {
    setCheckingRequirements(skill.id)
    setError('')
    try {
      const token = await memberToken()
      if (!token) throw new Error('Login kembali untuk mengunduh Skill.')
      const response = await fetch(`/api/workspace/skills/requirements?skillId=${encodeURIComponent(skill.id)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      const payload = await response.json() as { fields?: Array<{ key: string }>; existingAnswers?: Record<string, string> }
      const fields = payload.fields || []
      const existingAnswers = payload.existingAnswers || {}
      const allAnswered = fields.every(field => (existingAnswers[field.key] || '').trim().length > 0)
      if (fields.length > 0 && !allAnswered) {
        setRequirementsModal({ skillId: skill.id, skillName: skill.name })
        return
      }
    } catch {
      // If the requirements check itself fails, fall through and let the actual
      // download call surface a real error instead of silently blocking the user.
    } finally {
      setCheckingRequirements('')
    }
    void downloadSkill(skill, 'personalized')
  }

  return (
    <section className={`${styles.skillLibrary} ${compact ? styles.skillLibraryCompact : ''}`}>
      <header className={styles.skillHeader}>
        <div>
          <span><Sparkles size={13} /> Marcatching Skill Builder</span>
          <h2>Ubah Brand Memory menjadi Skill yang benar-benar milikmu.</h2>
          <p>Setelah produk dimiliki, kamu bisa mengunduh Skill original atau membuat versi dengan tambahan brand-memory.md milikmu.</p>
        </div>
        <button type="button" onClick={() => void loadSkills()} disabled={loading} aria-label="Refresh katalog Skill"><RefreshCw size={15} /> Refresh</button>
      </header>

      {loading ? (
        <div className={styles.skillState}><RefreshCw size={18} /> Mencocokkan pembelian dan Brand Memory...</div>
      ) : skills.length === 0 ? (
        <div className={styles.skillState}><FileArchive size={22} /><strong>Belum ada Skill di katalog.</strong><p>Skill baru yang di-upload dari Inside akan otomatis muncul di sini.</p></div>
      ) : (
        <div className={styles.skillGrid}>
          {skills.map(skill => {
            const originalKey = `${skill.id}:original`
            const personalizedKey = `${skill.id}:personalized`
            const skillBusy = activeDownload.startsWith(`${skill.id}:`)
            return <article key={skill.id} className={`${styles.skillCard} ${skill.status === 'locked' ? styles.skillCardLocked : ''}`}>
              <div className={styles.skillMedia}>
                {skill.imageUrl ? <Image src={skill.imageUrl} alt={`Cover ${skill.name}`} fill sizes={compact ? '(max-width: 720px) 100vw, 40vw' : '(max-width: 720px) 100vw, 50vw'} unoptimized className={styles.skillImage} /> : <span className={styles.skillMediaPlaceholder}><FileArchive size={30} /> Cover Skill</span>}
              </div>
              <div className={styles.skillCardTop}>
                <span className={styles.skillIcon}>{skill.status === 'locked' ? <LockKeyhole size={21} /> : <FileArchive size={21} />}</span>
                <span className={`${styles.skillBadge} ${skill.status === 'ready' ? styles.skillBadgeReady : ''}`}>
                  {skill.status === 'locked' ? 'Belum dimiliki' : skill.status === 'ready' ? 'Ready to create' : 'AI Memory diperlukan'}
                </span>
              </div>
              <small>Original & personalized Skill · .zip</small>
              <h3>{skill.name}</h3>
              <p>{skill.description}</p>
              <div className={styles.skillRequirements}>
                <span className={skill.owned ? styles.requirementReady : ''}>{skill.owned ? <CheckCircle2 size={13} /> : <LockKeyhole size={13} />} Skill dimiliki</span>
                <span className={skill.memoryReady ? styles.requirementReady : ''}>{skill.memoryReady ? <CheckCircle2 size={13} /> : <BrainCircuit size={13} />} Brand Memory lengkap</span>
              </div>
              <div className={styles.skillCardAction}>
                {skill.status === 'locked' ? (
                  <a href={skill.storeUrl} target="_blank" rel="noreferrer">Lihat di Marcatching Store <ExternalLink size={14} /></a>
                ) : (
                  <>
                    <button type="button" className={styles.skillOriginalAction} onClick={() => void downloadSkill(skill, 'original')} disabled={skillBusy}>
                      {activeDownload === originalKey ? <RefreshCw size={15} /> : <Download size={15} />}
                      {activeDownload === originalKey ? 'Menyiapkan ZIP...' : 'Download Skill original'}
                    </button>
                    {skill.status === 'memory_required' ? (
                      <Link href="/workspace">Lengkapi AI Memory <BrainCircuit size={14} /></Link>
                    ) : (
                      <>
                        <button type="button" className={styles.skillPersonalizedAction} onClick={() => void handleCreatePersonalized(skill)} disabled={skillBusy || checkingRequirements === skill.id}>
                          {activeDownload === personalizedKey || checkingRequirements === skill.id ? <RefreshCw size={15} /> : <Sparkles size={15} />}
                          {activeDownload === personalizedKey ? 'Mencocokkan Skill...' : checkingRequirements === skill.id ? 'Mengecek requirement...' : 'Create personalized Skill'}
                        </button>
                        <button type="button" className={styles.skillOriginalAction} onClick={() => setRequirementsModal({ skillId: skill.id, skillName: skill.name })} disabled={skillBusy}>
                          <Settings2 size={15} /> Customize
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </article>
          })}
        </div>
      )}

      {notice && <p className={styles.skillNotice} role="status"><CheckCircle2 size={14} /> {notice}</p>}
      {error && <p className={styles.skillError} role="alert">{error}</p>}

      <SkillRequirementsModal
        isOpen={requirementsModal !== null}
        skillId={requirementsModal?.skillId || ''}
        skillName={requirementsModal?.skillName || ''}
        onClose={() => setRequirementsModal(null)}
        onSaved={() => {
          const skill = skills.find(item => item.id === requirementsModal?.skillId)
          setRequirementsModal(null)
          if (skill) void downloadSkill(skill, 'personalized')
        }}
      />
    </section>
  )
}
