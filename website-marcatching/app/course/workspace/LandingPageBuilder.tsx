'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import {
  ArrowDown, ArrowUp, ChevronDown, Copy, ExternalLink, Eye, EyeOff, GripVertical, ImagePlus, Images, Link2,
  LoaderCircle, Plus, Sparkles, Trash2, TriangleAlert, Type, Undo2, Video, X,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import LandingPageView from '@/components/landing/LandingPageView'
import {
  ASPECT_OPTIONS, LANDING_LIMITS, OVERLAY_OPTIONS, addMissingProfileButtons, emptyLandingStyle, isRenderable, newBlock, parseVideoUrl,
  seedLandingPage, slugify, styleFromVisualIdentity, themeForBackground, validateSlug,
  type BackgroundOverlay, type ButtonSource, type CarouselImage, type ImageAspect, type LandingBlock, type LandingBlockType, type LandingPage,
  type LandingProfile, type LandingStyle,
} from '@/lib/landingPage'
import { findFont, fontOptions, normalizeHex } from '../visualIdentity'
import type { WorkspaceData } from '../workspaceData'
import BrandProfileFields from './BrandProfileFields'
import { compressImage } from './compressImage'
import workspaceStyles from './workspace.module.css'
import styles from './landing-builder.module.css'

type Props = {
  workspace: WorkspaceData
  setWorkspace: React.Dispatch<React.SetStateAction<WorkspaceData>>
  /** Flushes the latest workspace to the account so the server sees the current Brand Memory. */
  persist: () => Promise<boolean>
  notify: (message: string) => void
  memoryReady: boolean
  onOpenMemory: () => void
}

type Quota = { usedBytes: number; limitBytes: number; maxFileBytes: number }

class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message)
  }
}

async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new ApiError('Login kembali untuk melanjutkan.', 401)
  const response = await fetch(path, { ...init, headers: { ...init.headers, Authorization: `Bearer ${session.access_token}` }, cache: 'no-store' })
  const payload = await response.json().catch(() => ({})) as T & { message?: string; code?: string }
  if (!response.ok) throw new ApiError(payload.message || 'Terjadi kesalahan. Coba lagi.', response.status, payload.code)
  return payload
}

function profileFromWorkspace(workspace: WorkspaceData): LandingProfile {
  const social = (platform: string) => workspace.socialProfiles.find(profile => profile.platform === platform)?.url || ''
  return {
    brandName: workspace.creatorName,
    description: workspace.brandProfile.description,
    instagram: social('instagram'),
    tiktok: social('tiktok'),
    youtube: social('youtube'),
    website: workspace.brandProfile.website,
    whatsapp: workspace.brandProfile.whatsapp,
    email: workspace.brandProfile.email,
  }
}

function publicBase() {
  const { hostname, protocol, port } = window.location
  if (hostname.endsWith('marcatching.com')) return 'https://page.marcatching.com'
  return `${protocol}//page.${hostname.replace(/^course\./, '')}${port ? `:${port}` : ''}`
}

/** Live-typing slug: spaces become hyphens so "Kopi Sore" turns into kopi-sore instead of losing the gap. */
function typeSlug(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function megabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`
}

type SlugState = { state: 'idle' | 'checking' | 'ok' | 'bad'; message: string }

/**
 * Format problems are derived on the spot. Only the "is it taken?" answer is fetched, debounced, and it is
 * tied to the slug it was asked about, so a stale answer can never be shown for a newer value.
 */
function useSlugCheck(slug: string, skip: boolean): SlugState {
  const [remote, setRemote] = useState<{ slug: string; available: boolean; message: string } | null>(null)
  const local = skip ? null : validateSlug(slug)
  const needsRemote = Boolean(local?.ok)

  useEffect(() => {
    if (!needsRemote) return
    let active = true
    const timer = window.setTimeout(async () => {
      try {
        const answer = await authFetch<{ available: boolean; reason?: string }>(`/api/workspace/landing/slug?slug=${encodeURIComponent(slug)}`)
        if (active) setRemote({ slug, available: answer.available, message: answer.reason || 'Link ini sudah dipakai brand lain.' })
      } catch (error) {
        if (active) setRemote({ slug, available: false, message: error instanceof Error ? error.message : 'Ketersediaan link belum bisa dicek.' })
      }
    }, 450)
    return () => { active = false; window.clearTimeout(timer) }
  }, [slug, needsRemote])

  if (skip) return { state: 'idle', message: '' }
  if (local && !local.ok) return { state: 'bad', message: local.reason }
  if (remote?.slug === slug) return remote.available ? { state: 'ok', message: 'Link tersedia' } : { state: 'bad', message: remote.message }
  return { state: 'checking', message: 'Mengecek ketersediaan...' }
}

const typeMeta: Record<LandingBlockType, { label: string; icon: React.ComponentType<{ size?: number }> }> = {
  text: { label: 'Teks', icon: Type },
  button: { label: 'Tombol link', icon: Link2 },
  video: { label: 'Video', icon: Video },
  image: { label: 'Foto', icon: ImagePlus },
  carousel: { label: 'Carousel foto', icon: Images },
}

const sourceOptions: Array<{ value: ButtonSource; label: string }> = [
  { value: 'link', label: 'Link umum' }, { value: 'instagram', label: 'Instagram' }, { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' }, { value: 'website', label: 'Website' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'email', label: 'Email' },
]

export default function LandingPageBuilder({ workspace, setWorkspace, persist, notify, memoryReady, onOpenMemory }: Props) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [page, setPage] = useState<LandingPage | null>(null)
  const [savedJson, setSavedJson] = useState('')
  const [quota, setQuota] = useState<Quota>({ usedBytes: 0, limitBytes: 100 * 1024 * 1024, maxFileBytes: 4 * 1024 * 1024 })
  const [uploadsEnabled, setUploadsEnabled] = useState(true)
  const [busy, setBusy] = useState<'create' | 'save' | 'polish' | 'delete' | null>(null)
  const [error, setError] = useState('')
  // Suggested from the brand name until the creator types their own.
  const [typedSlug, setTypedSlug] = useState<string | null>(null)
  const setupSlug = typedSlug ?? slugify(workspace.creatorName)
  const [previousDescription, setPreviousDescription] = useState<string | null>(null)
  const [polishNote, setPolishNote] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const savedSlug = useMemo(() => { try { return savedJson ? (JSON.parse(savedJson) as LandingPage).slug : '' } catch { return '' } }, [savedJson])
  const editorSlug = page?.slug ?? ''
  const slugCheck = useSlugCheck(page ? editorSlug : setupSlug, page ? editorSlug === savedSlug : false)
  const dirty = Boolean(page) && JSON.stringify(page) !== savedJson

  useEffect(() => {
    let active = true
    authFetch<{ page: LandingPage | null; quota: Quota; uploadsEnabled: boolean }>('/api/workspace/landing')
      .then(result => {
        if (!active) return
        setPage(result.page)
        setSavedJson(result.page ? JSON.stringify(result.page) : '')
        setQuota(result.quota)
        setUploadsEnabled(result.uploadsEnabled)
      })
      .catch(failure => { if (active) setLoadError(failure instanceof Error ? failure.message : 'Landing page belum bisa dimuat.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function patchPage(partial: Partial<LandingPage>) {
    setPage(current => (current ? { ...current, ...partial } : current))
  }

  function patchBlock(id: string, next: LandingBlock) {
    setPage(current => (current ? { ...current, blocks: current.blocks.map(block => (block.id === id ? next : block)) } : current))
  }

  function moveBlock(id: string, direction: -1 | 1) {
    setPage(current => {
      if (!current) return current
      const index = current.blocks.findIndex(block => block.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= current.blocks.length) return current
      const blocks = [...current.blocks]
      ;[blocks[index], blocks[target]] = [blocks[target], blocks[index]]
      return { ...current, blocks }
    })
  }

  function addBlock(type: LandingBlockType) {
    setPage(current => {
      if (!current) return current
      if (current.blocks.length >= LANDING_LIMITS.blocks) { notify(`Maksimal ${LANDING_LIMITS.blocks} blok per halaman.`); return current }
      return { ...current, blocks: [...current.blocks, newBlock(type)] }
    })
  }

  async function polish(source: string) {
    setError('')
    setPolishNote('')
    const result = await authFetch<{ description: string; changed: boolean; note: string }>('/api/workspace/landing/polish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandName: workspace.creatorName, description: source, offer: workspace.revenue.offer, voice: workspace.memory.voice }),
    })
    return result
  }

  async function polishCurrent() {
    if (!page) return
    setBusy('polish')
    try {
      const result = await polish(page.description)
      if (result.changed) {
        setPreviousDescription(page.description)
        patchPage({ description: result.description })
      }
      setPolishNote(result.note || (result.changed ? 'Sudah dipoles. Cek dulu, lalu simpan.' : 'Deskripsimu sudah bagus, tidak ada yang diubah.'))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Deskripsi belum berhasil dipoles.')
    } finally {
      setBusy(null)
    }
  }

  async function createPage() {
    setError('')
    setBusy('create')
    try {
      await persist()
      let description = workspace.brandProfile.description.trim()
      let polished = false
      if (description.length >= 20) {
        try {
          const result = await polish(description)
          if (result.changed) { description = result.description; polished = true }
        } catch { /* The raw description is a fine starting point if AI is unavailable. */ }
      }
      const seed = seedLandingPage(profileFromWorkspace(workspace), description, setupSlug, { ...emptyLandingStyle, ...styleFromVisualIdentity(workspace.visualIdentity) })
      const saved = await authFetch<{ page: LandingPage }>('/api/workspace/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: seed }),
      })
      setPage(saved.page)
      setSavedJson(JSON.stringify(saved.page))
      if (polished) { setPreviousDescription(workspace.brandProfile.description.trim()); setPolishNote('Deskripsi sudah dipoles AI. Kamu bisa urungkan kalau kurang cocok.') }
      notify('Landing page dibuat sebagai draft. Atur isinya, lalu terbitkan.')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Landing page belum berhasil dibuat.')
    } finally {
      setBusy(null)
    }
  }

  async function save(status?: LandingPage['status']) {
    if (!page) return
    setError('')
    setBusy('save')
    try {
      const next = { ...page, status: status ?? page.status }
      if (next.status === 'published') await persist()
      const saved = await authFetch<{ page: LandingPage }>('/api/workspace/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: next }),
      })
      setPage(saved.page)
      setSavedJson(JSON.stringify(saved.page))
      notify(saved.page.status === 'published' ? 'Tersimpan dan sudah tayang.' : 'Draft tersimpan.')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Landing page belum berhasil disimpan.')
    } finally {
      setBusy(null)
    }
  }

  async function removePage() {
    setBusy('delete')
    setError('')
    try {
      await authFetch('/api/workspace/landing', { method: 'DELETE' })
      setPage(null)
      setSavedJson('')
      setConfirmDelete(false)
      setQuota(current => ({ ...current, usedBytes: 0 }))
      notify('Landing page dihapus.')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Landing page belum berhasil dihapus.')
    } finally {
      setBusy(null)
    }
  }

  function patchStyle(partial: Partial<LandingStyle>) {
    setPage(current => (current ? { ...current, style: { ...current.style, ...partial } } : current))
  }

  function syncIdentityStyle() {
    const fromIdentity = styleFromVisualIdentity(workspace.visualIdentity)
    const hasAny = Object.values(fromIdentity).some(Boolean)
    if (!hasAny) { notify('Brand Identity kamu masih kosong. Isi warna dan font di AI Memory dulu.'); return }
    setPage(current => (current ? { ...current, theme: fromIdentity.background ? themeForBackground(fromIdentity.background) : current.theme, style: { ...current.style, ...fromIdentity } } : current))
    notify('Warna dan font diambil ulang dari Brand Identity.')
  }

  function syncProfileButtons() {
    if (!page) return
    const result = addMissingProfileButtons(page.blocks, profileFromWorkspace(workspace))
    patchPage({ blocks: result.blocks })
    notify(result.added ? `${result.added} tombol ditambahkan dari profilmu.` : 'Semua tombol dari profilmu sudah ada di halaman.')
  }

  async function uploadPhoto(file: File, maxEdge?: number) {
    const blob = await compressImage(file, maxEdge)
    const form = new FormData()
    form.append('file', blob, 'photo')
    const result = await authFetch<{ url: string; usedBytes: number }>('/api/workspace/landing/upload', { method: 'POST', body: form })
    setQuota(current => ({ ...current, usedBytes: result.usedBytes }))
    return result.url
  }

  if (loading) return <section className={styles.panel}><p className={styles.muted}><LoaderCircle size={15} className={workspaceStyles.spin} /> Memuat landing page...</p></section>
  if (loadError) return <section className={styles.panel}><p className={workspaceStyles.aiError}><TriangleAlert size={14} /> {loadError}</p></section>

  // Past the loading return means the first fetch finished in the browser, so reading window cannot differ from server HTML.
  const base = publicBase()

  // ---------------------------------------------------------------- setup (no page yet)
  if (!page) {
    const hasBrand = workspace.creatorName.trim().length > 0
    const canCreate = memoryReady && hasBrand && slugCheck.state === 'ok' && busy === null
    return (
      <div className={styles.stack}>
        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <div>
              <h2>Buat landing page brand-mu</h2>
              <p>Satu link untuk semua tombol, foto, dan video brand-mu. Semua isian di bawah opsional kecuali nama brand, dan akan menjadi tombol serta deskripsi awal yang bisa kamu ubah kapan saja.</p>
            </div>
          </header>

          {!memoryReady && (
            <p className={workspaceStyles.aiNote}>
              <TriangleAlert size={14} /> Lengkapi dulu keempat paragraf AI Memory (minimal 100 karakter masing-masing) agar landing page bisa dibuat.
              <button type="button" className={styles.inlineLink} onClick={onOpenMemory}>Buka AI Memory</button>
            </p>
          )}

          <BrandProfileFields workspace={workspace} setWorkspace={setWorkspace} />
          <p className={styles.muted}>Link Instagram, TikTok, dan YouTube diambil dari profil sosial yang sudah kamu isi di awal.</p>

          <div className={styles.slugField}>
            <label htmlFor="landing-slug">Alamat landing page</label>
            <div className={styles.slugInput}>
              <span>{base.replace(/^https?:\/\//, '')}/</span>
              <input id="landing-slug" value={setupSlug} maxLength={30} onChange={event => setTypedSlug(typeSlug(event.target.value))} placeholder="nama-brand" />
            </div>
            <SlugMessage check={slugCheck} />
          </div>

          {error && <p className={workspaceStyles.aiError}><TriangleAlert size={14} /> {error}</p>}
          <div className={workspaceStyles.aiActions}>
            <button type="button" className={workspaceStyles.primaryButton} onClick={() => void createPage()} disabled={!canCreate}>
              {busy === 'create' ? <LoaderCircle size={15} className={workspaceStyles.spin} /> : <Sparkles size={15} />} {busy === 'create' ? 'Menyiapkan halaman...' : 'Buat landing page'}
            </button>
            {!hasBrand && <small>Isi nama brand dulu.</small>}
          </div>
          <p className={styles.fine}>Kalau deskripsi diisi, AI memolesnya sedikit saat halaman dibuat (Google Gemini paket gratis; Google dapat memakai data tersebut untuk meningkatkan produknya). Hasilnya bisa kamu urungkan.</p>
        </section>
      </div>
    )
  }

  // ---------------------------------------------------------------- editor
  const published = page.status === 'published'
  const suspended = page.status === 'suspended'
  const url = `${base}/${savedSlug || page.slug}`
  const slugChanged = page.slug !== savedSlug
  const slugBlocking = slugChanged && slugCheck.state !== 'ok'
  const usedPercent = Math.min(100, (quota.usedBytes / quota.limitBytes) * 100)

  return (
    <div className={styles.layout}>
      <div className={styles.stack}>
        <section className={styles.panel}>
          <header className={styles.statusBar}>
            <div>
              <span className={`${styles.badge} ${published ? styles.badgeLive : suspended ? styles.badgeBad : ''}`}>{suspended ? 'Ditangguhkan' : published ? 'Tayang' : 'Draft'}</span>
              <a className={styles.url} href={url} target="_blank" rel="noopener noreferrer">{url.replace(/^https?:\/\//, '')}</a>
            </div>
            <div className={styles.rowButtons}>
              <button type="button" className={workspaceStyles.secondaryButton} onClick={() => { void navigator.clipboard.writeText(url); notify('Link disalin.') }}><Copy size={14} /> Salin</button>
              {published && <a className={workspaceStyles.secondaryButton} href={url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Buka</a>}
            </div>
          </header>

          {suspended && <p className={workspaceStyles.aiError}><TriangleAlert size={14} /> Halaman ini ditangguhkan oleh Marcatching dan tidak bisa diubah. Hubungi tim kami untuk bantuan.</p>}
          {!published && !suspended && <p className={styles.muted}>Draft hanya terlihat olehmu di panel preview. Terbitkan agar orang lain bisa membukanya.</p>}
          {error && <p className={workspaceStyles.aiError}><TriangleAlert size={14} /> {error}</p>}

          <div className={workspaceStyles.aiActions}>
            <button type="button" className={workspaceStyles.primaryButton} onClick={() => void save()} disabled={busy !== null || suspended || !dirty || slugBlocking}>
              {busy === 'save' ? <LoaderCircle size={15} className={workspaceStyles.spin} /> : null} {busy === 'save' ? 'Menyimpan...' : dirty ? 'Simpan perubahan' : 'Tersimpan'}
            </button>
            {published
              ? <button type="button" className={workspaceStyles.secondaryButton} onClick={() => void save('draft')} disabled={busy !== null || suspended || slugBlocking}><EyeOff size={15} /> Tarik ke draft</button>
              : <button type="button" className={workspaceStyles.secondaryButton} onClick={() => void save('published')} disabled={busy !== null || suspended || slugBlocking}><Eye size={15} /> Terbitkan</button>}
            {dirty && <small>Ada perubahan yang belum disimpan.</small>}
          </div>
        </section>

        <section className={styles.panel}>
          <header className={styles.panelHead}><div><h3>Tampilan & alamat</h3></div></header>
          <div className={styles.slugField}>
            <label htmlFor="landing-slug-edit">Alamat landing page</label>
            <div className={styles.slugInput}>
              <span>{base.replace(/^https?:\/\//, '')}/</span>
              <input id="landing-slug-edit" value={page.slug} maxLength={30} disabled={suspended} onChange={event => patchPage({ slug: typeSlug(event.target.value) })} />
            </div>
            <SlugMessage check={slugCheck} />
            {slugChanged && savedSlug && <p className={styles.fine}>Setelah disimpan, link lama ({savedSlug}) berhenti berfungsi dan bisa dipakai brand lain.</p>}
          </div>
          <div className={styles.segment} role="group" aria-label="Tema halaman">
            {(['black', 'white'] as const).map(theme => (
              <button key={theme} type="button" className={page.theme === theme ? styles.segmentActive : undefined} onClick={() => patchPage({ theme })}>{theme === 'black' ? 'Gelap' : 'Terang'}</button>
            ))}
          </div>
          <label className={styles.field}>
            <span>Headline (nama brand)</span>
            <input value={page.headline} maxLength={LANDING_LIMITS.headline} onChange={event => patchPage({ headline: event.target.value })} />
          </label>
          <label className={styles.field}>
            <span>Deskripsi</span>
            <textarea value={page.description} maxLength={LANDING_LIMITS.description} rows={3} onChange={event => patchPage({ description: event.target.value })} placeholder="Satu atau dua kalimat tentang brand-mu." />
            <small>{page.description.length}/{LANDING_LIMITS.description}</small>
          </label>
          <div className={workspaceStyles.aiActions}>
            <button type="button" className={workspaceStyles.secondaryButton} onClick={() => void polishCurrent()} disabled={busy !== null || page.description.trim().length < 20}>
              {busy === 'polish' ? <LoaderCircle size={15} className={workspaceStyles.spin} /> : <Sparkles size={15} />} {busy === 'polish' ? 'AI memoles...' : 'Poles dengan AI'}
            </button>
            {previousDescription !== null && (
              <button type="button" className={workspaceStyles.secondaryButton} onClick={() => { patchPage({ description: previousDescription }); setPreviousDescription(null); setPolishNote('') }}><Undo2 size={15} /> Urungkan</button>
            )}
            {polishNote && <small>{polishNote}</small>}
          </div>
        </section>

        <StylePanel
          style={page.style}
          identity={workspace.visualIdentity}
          uploadsEnabled={uploadsEnabled}
          onChange={patchStyle}
          onSyncIdentity={syncIdentityStyle}
          onUpload={uploadPhoto}
          notify={notify}
        />

        <ProfilePanel workspace={workspace} setWorkspace={setWorkspace} onSync={syncProfileButtons} />

        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <div>
              <h3>Isi halaman <small>{page.blocks.length}/{LANDING_LIMITS.blocks} blok</small></h3>
              <p>Seret untuk mengubah urutan. Blok yang belum lengkap tidak tampil untuk pengunjung.</p>
            </div>
          </header>

          <Reorder.Group axis="y" values={page.blocks} onReorder={blocks => patchPage({ blocks })} className={styles.blockList}>
            {page.blocks.map((block, index) => (
              <BlockCard
                key={block.id}
                block={block}
                first={index === 0}
                last={index === page.blocks.length - 1}
                uploadsEnabled={uploadsEnabled}
                onChange={next => patchBlock(block.id, next)}
                onMove={direction => moveBlock(block.id, direction)}
                onRemove={() => patchPage({ blocks: page.blocks.filter(item => item.id !== block.id) })}
                onUpload={uploadPhoto}
                notify={notify}
              />
            ))}
          </Reorder.Group>

          <div className={styles.addRow}>
            {(Object.keys(typeMeta) as LandingBlockType[]).map(type => {
              const Icon = typeMeta[type].icon
              const needsUpload = type === 'image' || type === 'carousel'
              return (
                <button key={type} type="button" onClick={() => addBlock(type)} disabled={needsUpload && !uploadsEnabled} title={needsUpload && !uploadsEnabled ? 'Upload foto belum aktif di server' : undefined}>
                  <Plus size={13} /><Icon size={15} /> {typeMeta[type].label}
                </button>
              )
            })}
          </div>

          <div className={styles.quota}>
            <div><span>Penyimpanan foto</span><b>{megabytes(quota.usedBytes)} dari {megabytes(quota.limitBytes)}</b></div>
            <i><u style={{ width: `${usedPercent}%` }} className={usedPercent > 90 ? styles.quotaFull : undefined} /></i>
            <small>Foto dikompres otomatis. Foto yang dihapus dari halaman akan dibersihkan sekitar satu jam setelah kamu menyimpan.</small>
          </div>
        </section>

        <section className={styles.panel}>
          <header className={styles.panelHead}><div><h3>Hapus landing page</h3><p>Menghapus halaman, link, dan semua foto yang kamu upload. Tidak bisa dibatalkan.</p></div></header>
          <div className={workspaceStyles.aiActions}>
            {confirmDelete ? (
              <>
                <button type="button" className={styles.dangerButton} onClick={() => void removePage()} disabled={busy !== null || suspended}>{busy === 'delete' ? 'Menghapus...' : 'Ya, hapus permanen'}</button>
                <button type="button" className={workspaceStyles.secondaryButton} onClick={() => setConfirmDelete(false)}>Batal</button>
              </>
            ) : (
              <button type="button" className={workspaceStyles.secondaryButton} onClick={() => setConfirmDelete(true)} disabled={suspended}><Trash2 size={15} /> Hapus landing page</button>
            )}
          </div>
        </section>
      </div>

      <aside className={styles.previewColumn} aria-label="Preview landing page">
        <div className={styles.phone}>
          <div className={styles.phoneBar}>Preview{dirty ? ' · belum disimpan' : ''}</div>
          <div className={styles.phoneScreen}><LandingPageView page={page} preview /></div>
        </div>
      </aside>
    </div>
  )
}

function SlugMessage({ check }: { check: SlugState }) {
  if (check.state === 'idle' || !check.message) return null
  return <p className={`${styles.slugMessage} ${check.state === 'ok' ? styles.slugOk : check.state === 'bad' ? styles.slugBad : ''}`}>{check.message}</p>
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const valid = normalizeHex(value)
  const invalid = Boolean(value.trim()) && !valid
  return (
    <div className={styles.colorField}>
      <span>{label}</span>
      <div>
        <label className={`${styles.swatch} ${valid ? '' : styles.swatchEmpty}`} style={valid ? { background: valid } : undefined} aria-label={`Pilih warna ${label}`}>
          <input type="color" value={valid || '#000000'} onChange={event => onChange(event.target.value.toUpperCase())} />
        </label>
        <input
          className={invalid ? styles.invalidInput : undefined}
          value={value}
          maxLength={7}
          spellCheck={false}
          placeholder="Otomatis"
          aria-label={`Hex ${label}`}
          onChange={event => onChange(event.target.value)}
          onBlur={() => { if (valid && valid !== value) onChange(valid) }}
        />
        {value && <button type="button" onClick={() => onChange('')} aria-label={`Hapus ${label}`}><X size={13} /></button>}
      </div>
    </div>
  )
}

function StylePanel({ style, identity, uploadsEnabled, onChange, onSyncIdentity, onUpload, notify }: {
  style: LandingStyle
  identity: WorkspaceData['visualIdentity']
  uploadsEnabled: boolean
  onChange: (partial: Partial<LandingStyle>) => void
  onSyncIdentity: () => void
  onUpload: (file: File, maxEdge?: number) => Promise<string>
  notify: (message: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const customFonts = [identity.headingFont, identity.bodyFont].filter(name => name && !findFont(name))

  async function pick(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // 1920px on the long edge is plenty for a 9:16 phone background (1080 x 1920).
      onChange({ backgroundImage: await onUpload(file, 1920) })
    } catch (failure) {
      notify(failure instanceof Error ? failure.message : 'Gambar latar belum berhasil diupload.')
    } finally {
      setUploading(false)
      if (input.current) input.current.value = ''
    }
  }

  const fontSelect = (label: string, value: string, key: 'headingFont' | 'bodyFont') => (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={findFont(value)?.name ?? ''} onChange={event => onChange({ [key]: event.target.value })}>
        <option value="">Bawaan</option>
        {fontOptions.map(font => <option key={font.name} value={font.name}>{font.name} · {font.kind}</option>)}
      </select>
    </label>
  )

  return (
    <section className={styles.panel}>
      <header className={styles.panelHead}>
        <div>
          <h3>Gaya halaman</h3>
          <p>Warna dan font diambil otomatis dari Brand Identity-mu saat halaman dibuat. Ubah di sini kalau halaman ini perlu tampil berbeda.</p>
        </div>
      </header>

      <div className={styles.colorGrid}>
        <ColorField label="Primary" value={style.primary} onChange={value => onChange({ primary: value })} />
        <ColorField label="Secondary" value={style.secondary} onChange={value => onChange({ secondary: value })} />
        <ColorField label="Latar" value={style.background} onChange={value => onChange({ background: value })} />
        <ColorField label="Teks" value={style.text} onChange={value => onChange({ text: value })} />
      </div>
      <p className={styles.fine}>Kosong berarti otomatis: latar mengikuti tema Gelap/Terang dan teks dipilih agar mudah dibaca. Warna teks yang kontrasnya kurang akan diganti otomatis.</p>

      <div className={styles.twoCols}>
        {fontSelect('Font judul', style.headingFont, 'headingFont')}
        {fontSelect('Font isi', style.bodyFont, 'bodyFont')}
      </div>
      {customFonts.length > 0 && <p className={styles.fine}>Font kustom ({customFonts.join(', ')}) di Brand Identity tidak bisa dimuat di landing page. Pilih salah satu font dari daftar di atas.</p>}

      <div className={workspaceStyles.aiActions}>
        <button type="button" className={workspaceStyles.secondaryButton} onClick={onSyncIdentity}><Sparkles size={15} /> Ambil ulang dari Brand Identity</button>
        <small>Menimpa warna dan font di atas. Gambar latar tidak berubah.</small>
      </div>

      <div className={styles.bgBlock}>
        <div className={styles.bgPreview}>
          {style.backgroundImage
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={style.backgroundImage} alt="" />
            : <span>9:16</span>}
        </div>
        <div className={styles.bgControls}>
          <b>Gambar latar</b>
          <p>Foto potret rasio 9:16 (contoh 1080 × 1920) paling pas. Gambar tampil di balik isi halaman dan tersimpan di penyimpanan fotomu.</p>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={event => void pick(event.target.files)} />
          <div className={styles.uploadRow}>
            <button type="button" className={workspaceStyles.secondaryButton} onClick={() => input.current?.click()} disabled={uploading || !uploadsEnabled}>
              {uploading ? <LoaderCircle size={15} className={workspaceStyles.spin} /> : <ImagePlus size={15} />} {uploading ? 'Mengupload...' : style.backgroundImage ? 'Ganti gambar' : 'Pilih gambar'}
            </button>
            {style.backgroundImage && <button type="button" className={workspaceStyles.secondaryButton} onClick={() => onChange({ backgroundImage: '' })}><X size={14} /> Lepas</button>}
          </div>
          {style.backgroundImage && (
            <Segment<BackgroundOverlay> label="Lapisan penyeimbang (agar teks tetap terbaca)" value={style.overlay} options={OVERLAY_OPTIONS.map(option => [option.value, option.label] as [BackgroundOverlay, string])} onChange={overlay => onChange({ overlay })} />
          )}
        </div>
      </div>
    </section>
  )
}

function ProfilePanel({ workspace, setWorkspace, onSync }: { workspace: WorkspaceData; setWorkspace: React.Dispatch<React.SetStateAction<WorkspaceData>>; onSync: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <section className={styles.panel}>
      <button type="button" className={styles.collapseHead} onClick={() => setOpen(current => !current)} aria-expanded={open}>
        <span><b>Profil brand</b><small>Sumber tombol otomatis (website, WhatsApp, email). Ikut tersimpan di Creator Workspace.</small></span>
        <ChevronDown size={16} className={open ? styles.chevronOpen : undefined} />
      </button>
      {open && (
        <>
          <BrandProfileFields workspace={workspace} setWorkspace={setWorkspace} />
          <div className={workspaceStyles.aiActions}>
            <button type="button" className={workspaceStyles.secondaryButton} onClick={onSync}><Plus size={15} /> Tambah tombol dari profil</button>
            <small>Hanya menambah tombol yang belum ada. Tombol yang sudah kamu ubah tidak ditimpa.</small>
          </div>
        </>
      )}
    </section>
  )
}

type CardProps = {
  block: LandingBlock
  first: boolean
  last: boolean
  uploadsEnabled: boolean
  onChange: (block: LandingBlock) => void
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  onUpload: (file: File) => Promise<string>
  notify: (message: string) => void
}

function blockSummary(block: LandingBlock) {
  if (block.type === 'text') return block.text || 'Teks kosong'
  if (block.type === 'button') return block.label || 'Tombol belum diberi nama'
  if (block.type === 'video') return block.url || 'Belum ada link video'
  if (block.type === 'image') return block.url ? 'Foto terpasang' : 'Belum ada foto'
  return `${block.images.length} foto`
}

function BlockCard({ block, first, last, uploadsEnabled, onChange, onMove, onRemove, onUpload, notify }: CardProps) {
  const controls = useDragControls()
  const [open, setOpen] = useState(() => !isRenderable(block))
  const meta = typeMeta[block.type]
  const Icon = meta.icon
  const complete = isRenderable(block)

  return (
    <Reorder.Item value={block} dragListener={false} dragControls={controls} className={styles.blockCard}>
      <div className={styles.blockHead}>
        <button type="button" className={styles.grip} onPointerDown={event => controls.start(event)} aria-label="Seret untuk memindahkan" title="Seret untuk memindahkan"><GripVertical size={16} /></button>
        <button type="button" className={styles.blockTitle} onClick={() => setOpen(current => !current)} aria-expanded={open}>
          <span className={styles.blockIcon}><Icon size={15} /></span>
          <span><b>{meta.label}</b><small>{blockSummary(block)}</small></span>
          {!complete && <em>Belum lengkap</em>}
          <ChevronDown size={15} className={open ? styles.chevronOpen : undefined} />
        </button>
        <div className={styles.blockActions}>
          <button type="button" onClick={() => onMove(-1)} disabled={first} aria-label="Naikkan"><ArrowUp size={14} /></button>
          <button type="button" onClick={() => onMove(1)} disabled={last} aria-label="Turunkan"><ArrowDown size={14} /></button>
          <button type="button" onClick={onRemove} aria-label="Hapus blok"><Trash2 size={14} /></button>
        </div>
      </div>
      {open && (
        <div className={styles.blockBody}>
          {block.type === 'text' && <TextEditor block={block} onChange={onChange} />}
          {block.type === 'button' && <ButtonEditor block={block} onChange={onChange} />}
          {block.type === 'video' && <VideoEditor block={block} onChange={onChange} />}
          {block.type === 'image' && <ImageEditor block={block} uploadsEnabled={uploadsEnabled} onChange={onChange} onUpload={onUpload} notify={notify} />}
          {block.type === 'carousel' && <CarouselEditor block={block} uploadsEnabled={uploadsEnabled} onChange={onChange} onUpload={onUpload} notify={notify} />}
        </div>
      )}
    </Reorder.Item>
  )
}

function TextEditor({ block, onChange }: { block: Extract<LandingBlock, { type: 'text' }>; onChange: (block: LandingBlock) => void }) {
  return (
    <>
      <label className={styles.field}>
        <span>Teks</span>
        <textarea value={block.text} maxLength={LANDING_LIMITS.text} rows={4} onChange={event => onChange({ ...block, text: event.target.value })} placeholder="Tulis apa saja: sapaan, cerita singkat, jam buka, promo." />
      </label>
      <div className={styles.options}>
        <Segment label="Rata" value={block.align} options={[['left', 'Kiri'], ['center', 'Tengah']]} onChange={align => onChange({ ...block, align })} />
        <Segment label="Ukuran" value={block.size} options={[['sm', 'Kecil'], ['md', 'Sedang'], ['lg', 'Besar']]} onChange={size => onChange({ ...block, size })} />
        <label className={styles.check}><input type="checkbox" checked={block.bold} onChange={event => onChange({ ...block, bold: event.target.checked })} /> Tebal</label>
      </div>
    </>
  )
}

function ButtonEditor({ block, onChange }: { block: Extract<LandingBlock, { type: 'button' }>; onChange: (block: LandingBlock) => void }) {
  return (
    <>
      <label className={styles.field}>
        <span>Nama tombol</span>
        <input value={block.label} maxLength={LANDING_LIMITS.label} onChange={event => onChange({ ...block, label: event.target.value })} placeholder="Contoh: Pesan lewat WhatsApp" />
      </label>
      <label className={styles.field}>
        <span>Link tujuan</span>
        <input value={block.url} maxLength={LANDING_LIMITS.url} onChange={event => onChange({ ...block, url: event.target.value })} placeholder="https://..., mailto:, atau tel:" inputMode="url" />
      </label>
      <label className={styles.field}>
        <span>Ikon</span>
        <select value={block.source} onChange={event => onChange({ ...block, source: event.target.value as ButtonSource })}>
          {sourceOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    </>
  )
}

function VideoEditor({ block, onChange }: { block: Extract<LandingBlock, { type: 'video' }>; onChange: (block: LandingBlock) => void }) {
  const known = parseVideoUrl(block.url)
  return (
    <>
      <label className={styles.field}>
        <span>Link video</span>
        <input value={block.url} maxLength={LANDING_LIMITS.url} onChange={event => onChange({ ...block, url: event.target.value })} placeholder="Tempel link YouTube, TikTok, atau Instagram Reels" inputMode="url" />
        <small className={block.url && !known ? styles.slugBad : undefined}>
          {block.url ? (known ? `Dikenali: ${known.provider === 'youtube' ? 'YouTube' : known.provider === 'tiktok' ? 'TikTok' : 'Instagram'}` : 'Link tidak dikenali. Gunakan link video publik dari YouTube, TikTok (format tiktok.com/@akun/video/...), atau Instagram (reel atau post).') : 'Video harus publik. Link pendek TikTok (vm.tiktok.com) belum didukung, buka videonya dan salin link lengkapnya.'}
        </small>
      </label>
      <label className={styles.field}>
        <span>Keterangan (opsional)</span>
        <input value={block.caption} maxLength={LANDING_LIMITS.caption} onChange={event => onChange({ ...block, caption: event.target.value })} />
      </label>
    </>
  )
}

function AspectSelect({ value, onChange }: { value: ImageAspect; onChange: (aspect: ImageAspect) => void }) {
  return (
    <Segment label="Rasio" value={value} options={ASPECT_OPTIONS.map(option => [option.value, option.label] as [ImageAspect, string])} onChange={onChange} />
  )
}

function ImageEditor({ block, uploadsEnabled, onChange, onUpload, notify }: { block: Extract<LandingBlock, { type: 'image' }>; uploadsEnabled: boolean; onChange: (block: LandingBlock) => void; onUpload: (file: File) => Promise<string>; notify: (message: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  async function pick(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    try {
      onChange({ ...block, url: await onUpload(file) })
    } catch (failure) {
      notify(failure instanceof Error ? failure.message : 'Foto belum berhasil diupload.')
    } finally {
      setUploading(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <>
      <div className={styles.uploadRow}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {block.url && <img src={block.url} alt="" className={styles.thumb} />}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={event => void pick(event.target.files)} />
        <button type="button" className={workspaceStyles.secondaryButton} onClick={() => input.current?.click()} disabled={uploading || !uploadsEnabled}>
          {uploading ? <LoaderCircle size={15} className={workspaceStyles.spin} /> : <ImagePlus size={15} />} {uploading ? 'Mengupload...' : block.url ? 'Ganti foto' : 'Pilih foto'}
        </button>
        {block.url && <button type="button" className={workspaceStyles.secondaryButton} onClick={() => onChange({ ...block, url: '' })}><X size={14} /> Lepas</button>}
      </div>
      <AspectSelect value={block.aspect} onChange={aspect => onChange({ ...block, aspect })} />
      <label className={styles.field}>
        <span>Deskripsi foto (untuk pembaca layar)</span>
        <input value={block.alt} maxLength={LANDING_LIMITS.alt} onChange={event => onChange({ ...block, alt: event.target.value })} />
      </label>
      <label className={styles.field}>
        <span>Link saat foto diklik (opsional)</span>
        <input value={block.link} maxLength={LANDING_LIMITS.url} onChange={event => onChange({ ...block, link: event.target.value })} placeholder="https://..." inputMode="url" />
      </label>
    </>
  )
}

function CarouselEditor({ block, uploadsEnabled, onChange, onUpload, notify }: { block: Extract<LandingBlock, { type: 'carousel' }>; uploadsEnabled: boolean; onChange: (block: LandingBlock) => void; onUpload: (file: File) => Promise<string>; notify: (message: string) => void }) {
  const [uploading, setUploading] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const room = LANDING_LIMITS.carouselImages - block.images.length

  async function pick(files: FileList | null) {
    const list = Array.from(files || []).slice(0, room)
    if (!list.length) return
    if ((files?.length || 0) > room) notify(`Maksimal ${LANDING_LIMITS.carouselImages} foto per carousel. Hanya ${room} foto pertama yang dipakai.`)
    setUploading(list.length)
    const added: CarouselImage[] = []
    for (const file of list) {
      try {
        added.push({ url: await onUpload(file), link: '' })
      } catch (failure) {
        notify(failure instanceof Error ? failure.message : 'Satu foto belum berhasil diupload.')
      }
    }
    onChange({ ...block, images: [...block.images, ...added] })
    setUploading(0)
    if (input.current) input.current.value = ''
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= block.images.length) return
    const images = [...block.images]
    ;[images[index], images[target]] = [images[target], images[index]]
    onChange({ ...block, images })
  }

  return (
    <>
      <div className={styles.thumbGrid}>
        {block.images.map((image, index) => (
          <div key={image.url} className={styles.thumbCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" />
            <div>
              <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label="Geser ke kiri"><ArrowUp size={12} style={{ transform: 'rotate(-90deg)' }} /></button>
              <button type="button" onClick={() => moveImage(index, 1)} disabled={index === block.images.length - 1} aria-label="Geser ke kanan"><ArrowDown size={12} style={{ transform: 'rotate(-90deg)' }} /></button>
              <button type="button" onClick={() => onChange({ ...block, images: block.images.filter((_, position) => position !== index) })} aria-label="Hapus foto"><X size={12} /></button>
            </div>
            <input value={image.link} maxLength={LANDING_LIMITS.url} placeholder="Link (opsional)" onChange={event => onChange({ ...block, images: block.images.map((item, position) => (position === index ? { ...item, link: event.target.value } : item)) })} />
          </div>
        ))}
        {uploading > 0 && <div className={styles.thumbLoading}><LoaderCircle size={18} className={workspaceStyles.spin} /> {uploading} foto</div>}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={event => void pick(event.target.files)} />
      <div className={styles.uploadRow}>
        <button type="button" className={workspaceStyles.secondaryButton} onClick={() => input.current?.click()} disabled={uploading > 0 || room <= 0 || !uploadsEnabled}>
          <ImagePlus size={15} /> {room <= 0 ? 'Batas foto tercapai' : 'Tambah foto'}
        </button>
        <small className={styles.muted}>{block.images.length}/{LANDING_LIMITS.carouselImages} foto</small>
      </div>
      <AspectSelect value={block.aspect} onChange={aspect => onChange({ ...block, aspect })} />
    </>
  )
}

function Segment<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<[T, string]>; onChange: (value: T) => void }) {
  return (
    <div className={styles.segmentGroup}>
      <span>{label}</span>
      <div className={styles.segment} role="group" aria-label={label}>
        {options.map(([optionValue, text]) => (
          <button key={optionValue} type="button" className={value === optionValue ? styles.segmentActive : undefined} onClick={() => onChange(optionValue)}>{text}</button>
        ))}
      </div>
    </div>
  )
}
