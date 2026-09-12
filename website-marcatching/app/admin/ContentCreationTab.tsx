'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { DM_Sans, Poppins } from 'next/font/google'
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, ArrowLeft, ArrowDown, ArrowRight, ArrowUp, Bold, Check, ChevronDown, Copy, Download, ImagePlus, Italic, Keyboard, Layers, LoaderCircle, Minus, Plus, Redo2, Save, Trash2, Type, Undo2, ZoomIn, ZoomOut } from 'lucide-react'
import { clamp, MAX_ELEMENTS, MAX_IMAGE_BYTES, MAX_SLIDES, newProject, newSlide, parseProject, RATIOS, replaceText, resizeProject, selectionHasStyle, setTextSelectionStyle, summary, textStyles, toggleTextSelectionStyle, type Element, type Font, type Project, type ProjectSummary, type Ratio, type Slide, type TextElement, type TextStyle } from '@/lib/content-creation/model'
import { clearImageCache, downloadProject, elementBounds, type Fonts } from '@/lib/content-creation/render'
import SlideCanvas from './content-creation/SlideCanvas'
import styles from './content-creation/content-creation.module.css'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], display: 'swap', preload: false })
const dmSans = DM_Sans({ subsets: ['latin'], style: ['normal', 'italic'], display: 'swap', preload: false })
const fonts: Fonts = { poppins: poppins.style.fontFamily, 'dm-sans': dmSans.style.fontFamily, palatino: 'Palatino, "Palatino Linotype", "Book Antiqua", serif', classic: '"Times New Roman", Times, serif' }
const fontNames: Record<Font, string> = { poppins: 'Poppins', 'dm-sans': 'DM Sans', palatino: 'Palatino', classic: 'Classic' }
const API = '/api/admin/content-creation'
const DRAFT_PREFIX = 'marcatching:content-draft:v1:'
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: 'no-store', ...init })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Permintaan gagal. Coba lagi.')
  return result
}
function localDrafts(): Project[] {
  const drafts: Project[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(DRAFT_PREFIX)) {
      try { drafts.push(parseProject(JSON.parse(localStorage.getItem(key)!))) } catch { /* Ignore invalid drafts without destroying them. */ }
    }
  }
  return drafts
}
function message(e: unknown) { return e instanceof Error ? e.message : 'Terjadi kesalahan. Coba lagi.' }

function SelectMenu({ label, ariaLabel, value, options, onChange, compact = false }: { label?: string; ariaLabel: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', key) }
  }, [open])
  const selected = options.find(option => option.value === value)?.label || value
  return <div ref={root} className={`${styles.customSelect} ${compact ? styles.customSelectCompact : ''}`}>
    {label && <span className={styles.customSelectLabel}>{label}</span>}
    <button type="button" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(value => !value)}><span>{selected}</span><ChevronDown size={14} /></button>
    {open && <div className={styles.customSelectMenu} role="listbox" aria-label={`${ariaLabel} pilihan`}>{options.map(option => <button type="button" role="option" aria-selected={option.value === value} key={option.value} onClick={() => { onChange(option.value); setOpen(false) }}>{option.label}{option.value === value && <Check size={14} />}</button>)}</div>}
  </div>
}

export default function ContentCreationTab() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [drafts, setDrafts] = useState<Project[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [cloudVersion, setCloudVersion] = useState('')
  const [ratio, setRatio] = useState<Ratio>('1:1')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [provider, setProvider] = useState('')
  const [offset, setOffset] = useState(0)
  const [more, setMore] = useState(false)
  const refresh = useCallback(async (nextOffset = 0) => {
    setLoading(true); setError('')
    try { setDrafts(localDrafts()) } catch { setError('Draft lokal tidak tersedia di browser ini.') }
    try {
      const data = await request<{ projects: ProjectSummary[]; imageProvider: string }>(`${API}?offset=${nextOffset}`)
      setProjects(previous => nextOffset ? [...previous, ...data.projects] : data.projects)
      setProvider(data.imageProvider); setOffset(nextOffset); setMore(data.projects.length === 25)
    } catch (e) { setError(message(e)) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void refresh(); return () => clearImageCache() }, [refresh])
  async function open(id: string) {
    setBusy(true); setError('')
    try {
      const draft = drafts.find(p => p.id === id)
      const remote = projects.find(p => p.id === id)
      if (draft && (!remote || draft.updatedAt > remote.updatedAt)) { setCloudVersion(''); setProject(draft); return }
      const result = await request<{ project: Project }>(`${API}?id=${id}`)
      const loaded = parseProject(result.project)
      setCloudVersion(JSON.stringify(loaded)); setProject(loaded)
    } catch (e) { setError(message(e)) }
    finally { setBusy(false) }
  }
  async function remove(id: string, title: string) {
    if (!window.confirm(`Hapus project “${title}” beserta semua gambarnya?`)) return
    setBusy(true); setError('')
    try {
      await request(`${API}?id=${id}`, { method: 'DELETE' })
      localStorage.removeItem(DRAFT_PREFIX + id)
      await refresh()
    } catch (e) { setError(message(e)) }
    finally { setBusy(false) }
  }
  if (project) return <Editor key={project.id} initial={project} initialSaved={cloudVersion} onClose={() => { setProject(null); void refresh() }} />
  const merged = new Map(projects.map(p => [p.id, p]))
  for (const p of drafts) if (!merged.has(p.id) || p.updatedAt > merged.get(p.id)!.updatedAt) merged.set(p.id, summary(p))
  const cards = [...merged.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return <section className={`${styles.root} ${styles.library}`}>
    <div className={styles.libraryHero}>
      <div><div className={styles.eyebrow}>MARCATCHING STUDIO</div><h1>Content Creation</h1><p>Dari satu ide, jadi satu carousel. Atur gambar, tulis cerita, lalu download semua slide.</p></div>
      <div className={styles.createRow}><SelectMenu label="Ukuran slide" ariaLabel="Ukuran slide" value={ratio} options={Object.keys(RATIOS).map(value => ({ value, label: value }))} onChange={value => setRatio(value as Ratio)} /><button className={styles.primary} disabled={busy} onClick={() => { setCloudVersion(''); setProject(newProject(ratio)) }}><Plus size={18} /> Buat project</button></div>
    </div>
    {error && <div className={styles.error} role="alert">{error}<button onClick={() => void refresh()}>Coba lagi</button></div>}
    <div className={styles.libraryLabel}><h2>Project kamu <span>{cards.length}</span></h2><small>{provider === 'r2' ? 'Gambar tersimpan di Cloudflare R2' : provider ? 'Gambar tersimpan di Supabase' : ''}</small></div>
    {loading && !cards.length ? <p className={styles.empty}><LoaderCircle className={styles.spin} /> Memuat project…</p> : !cards.length ? <div className={styles.empty}><Layers size={36} /><h2>Cerita berikutnya mulai di sini.</h2><p>Buat project, unggah background, dan tambahkan teks pertamamu.</p></div> : <div className={styles.projectGrid}>{cards.map(p => <article className={styles.projectCard} key={p.id}>
      <button className={styles.projectOpen} disabled={busy} onClick={() => void open(p.id)}>
        <div className={styles.projectCover}><div style={{ aspectRatio: p.ratio.replace(':', '/') }}><Layers size={28} /><span>{p.ratio}</span></div></div>
        <h3>{p.title}</h3><p>{p.slideCount} slide · {new Date(p.updatedAt).toLocaleDateString('id-ID')}</p>
        {drafts.some(d => d.id === p.id && d.updatedAt >= p.updatedAt) && <span className={styles.draftBadge}>Draft di browser ini</span>}
      </button><button className={styles.deleteProject} title={`Hapus ${p.title}`} aria-label={`Hapus ${p.title}`} disabled={busy} onClick={() => void remove(p.id, p.title)}><Trash2 size={16} /></button>
    </article>)}</div>}
    {more && <button disabled={loading} onClick={() => void refresh(offset + 25)}>Muat project lainnya</button>}
  </section>
}

function Editor({ initial, initialSaved, onClose }: { initial: Project; initialSaved: string; onClose: () => void }) {
  const [project, setProject] = useState(initial)
  const current = useRef(project)
  const [slideId, setSlideId] = useState(initial.slides[0].id)
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState(initialSaved ? 'Tersimpan di cloud' : 'Draft lokal · klik Simpan untuk menyimpan ke cloud')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [textSelection, setTextSelection] = useState<{ start: number; end: number } | null>(null)
  const [historyTick, setHistoryTick] = useState(0)
  const past = useRef<Project[]>([]), future = useRef<Project[]>([])
  const textInput = useRef<HTMLTextAreaElement>(null)
  const stageScroll = useRef<HTMLDivElement>(null)
  const zoomCurrent = useRef(zoom)
  const elementClipboard = useRef<Element | null>(null)
  const uploadInput = useRef<HTMLInputElement>(null)
  const uploadKind = useRef<'background' | 'image'>('background')
  const lastSaved = useRef(initialSaved)
  const mounted = useRef(true)
  const slide = project.slides.find(s => s.id === slideId) || project.slides[0]
  const active = slide.elements.find(e => e.id === selected)
  const [width, height] = RATIOS[project.ratio]
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => { zoomCurrent.current = zoom }, [zoom])
  useEffect(() => {
    const stage = stageScroll.current
    if (!stage) return
    let gestureStartZoom = zoomCurrent.current
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      setZoom(value => clamp(Math.round((value - event.deltaY * .15) * 10) / 10, 25, 250))
    }
    const gestureStart = (event: Event) => { event.preventDefault(); gestureStartZoom = zoomCurrent.current }
    const gestureChange = (event: Event) => {
      event.preventDefault()
      const scale = Number((event as Event & { scale?: number }).scale || 1)
      setZoom(clamp(Math.round(gestureStartZoom * scale * 10) / 10, 25, 250))
    }
    stage.addEventListener('wheel', wheel, { passive: false })
    stage.addEventListener('gesturestart', gestureStart, { passive: false })
    stage.addEventListener('gesturechange', gestureChange, { passive: false })
    return () => {
      stage.removeEventListener('wheel', wheel)
      stage.removeEventListener('gesturestart', gestureStart)
      stage.removeEventListener('gesturechange', gestureChange)
    }
  }, [])
  useEffect(() => {
    try {
      if (JSON.stringify(project) !== lastSaved.current) localStorage.setItem(DRAFT_PREFIX + project.id, JSON.stringify(project))
    } catch { setError('Penyimpanan draft browser penuh atau tidak tersedia. Klik Simpan sebelum meninggalkan editor.') }
  }, [project])
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (JSON.stringify(current.current) !== lastSaved.current) e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])
  function snapshot() {
    past.current = [...past.current.slice(-49), current.current]; future.current = []
    setHistoryTick(t => t + 1)
  }
  function commit(next: Project, record = true) {
    if (record) snapshot()
    next = { ...next, updatedAt: new Date().toISOString() }
    current.current = next; setProject(next); setStatus('Draft lokal · belum disimpan ke cloud')
  }
  function patchSlide(change: (s: Slide) => Slide, record = true) {
    const p = current.current
    commit({ ...p, slides: p.slides.map(s => s.id === slide.id ? change(s) : s) }, record)
  }
  function patchElement(change: Partial<Element>, record = true) {
    patchSlide(s => ({ ...s, elements: s.elements.map(e => e.id === selected ? { ...e, ...change } as Element : e) }), record)
  }
  function replaceElement(element: Element, record = true) {
    patchSlide(s => ({ ...s, elements: s.elements.map(value => value.id === element.id ? element : value) }), record)
  }
  function replaceSelectedText(text: string) {
    patchSlide(s => ({ ...s, elements: s.elements.map(element => element.id === selected && element.type === 'text' ? replaceText(element, text) : element) }))
  }
  function selectElement(id: string | null) { setSelected(id); setTextSelection(null) }
  function removeElement() { if (selected) { patchSlide(s => ({ ...s, elements: s.elements.filter(e => e.id !== selected) })); selectElement(null) } }
  function history(redo: boolean) {
    const from = redo ? future : past, to = redo ? past : future
    const next = from.current.pop()
    if (!next) return
    to.current.push(current.current)
    current.current = { ...next, updatedAt: new Date().toISOString() }; setProject(current.current)
    selectElement(null); setHistoryTick(t => t + 1); setStatus('Draft lokal · belum disimpan ke cloud')
  }
  const save = useCallback(async () => {
    if (saving) return
    const document = current.current
    setSaving(true); setError('')
    try {
      const result = await request<{ project: Project }>(API, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(document) })
      if (current.current === document) {
        lastSaved.current = JSON.stringify(result.project)
        current.current = result.project
        localStorage.removeItem(DRAFT_PREFIX + document.id)
        if (mounted.current) { setProject(result.project); setStatus('Tersimpan di cloud') }
      } else if (mounted.current) setStatus('Ada perubahan baru · klik Simpan lagi')
    } catch (e) { if (mounted.current) { setError(message(e)); setStatus('Belum tersimpan ke cloud') } }
    finally { if (mounted.current) setSaving(false) }
  }, [saving])
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      const input = e.target instanceof HTMLElement && (e.target.matches('input, textarea, select') || e.target.isContentEditable)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (!uploading) void save(); return }
      if (input || uploading || exporting) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); history(e.shiftKey); return }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        if (active) duplicateElement(active)
        else addSlide(true)
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && active) { e.preventDefault(); elementClipboard.current = structuredClone(active); return }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && elementClipboard.current) { e.preventDefault(); duplicateElement(elementClipboard.current); return }
      if ((e.ctrlKey || e.metaKey) && e.key === '[') { e.preventDefault(); layer(-1); return }
      if ((e.ctrlKey || e.metaKey) && e.key === ']') { e.preventDefault(); layer(1); return }
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) { e.preventDefault(); setZoom(value => clamp(value + 10, 25, 250)); return }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); setZoom(value => clamp(value - 10, 25, 250)); return }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); setZoom(100); return }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) { e.preventDefault(); removeElement() }
      if (e.key === 'Escape') selectElement(null)
      if (active && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault(); const step = e.shiftKey ? 10 : 1
        patchElement({ x: clamp(active.x + (e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0), -3840, width - 16), y: clamp(active.y + (e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0), -3840, height - 16) })
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  })
  function addText() {
    if (slide.elements.length >= MAX_ELEMENTS) return
    const element: Element = { id: crypto.randomUUID(), type: 'text', text: 'Tulis ceritamu di sini', x: width * .1, y: height * .15, width: width * .8, font: 'poppins', fontSize: 64, bold: false, italic: false, marks: [], color: '#172033', align: 'left' }
    patchSlide(s => ({ ...s, elements: [...s.elements, element] })); selectElement(element.id)
    setTimeout(() => { textInput.current?.focus(); textInput.current?.select(); setTextSelection({ start: 0, end: element.text.length }) }, 0)
  }
  function addSlide(duplicate = false) {
    if (project.slides.length >= MAX_SLIDES) return
    const next: Slide = duplicate ? { ...structuredClone(slide), id: crypto.randomUUID(), elements: slide.elements.map(e => ({ ...e, id: crypto.randomUUID() })) } : newSlide()
    const slides = [...project.slides]; slides.splice(slides.indexOf(slide) + 1, 0, next)
    commit({ ...project, slides }); setSlideId(next.id); selectElement(null)
  }
  function shiftSlide(direction: number) {
    const slides = [...project.slides], index = slides.indexOf(slide), target = index + direction
    if (target < 0 || target >= slides.length) return
    ;[slides[index], slides[target]] = [slides[target], slides[index]]
    commit({ ...project, slides })
  }
  function layer(direction: number) {
    const elements = [...slide.elements], index = elements.findIndex(e => e.id === selected), target = index + direction
    if (index < 0 || target < 0 || target >= elements.length) return
    ;[elements[index], elements[target]] = [elements[target], elements[index]]
    patchSlide(s => ({ ...s, elements }))
  }
  function duplicateElement(source: Element) {
    if (slide.elements.length >= MAX_ELEMENTS) return
    const duplicate = { ...structuredClone(source), id: crypto.randomUUID(), x: clamp(source.x + 24, -source.width + 16, width - 16), y: clamp(source.y + 24, -3840, height - 16) }
    patchSlide(s => ({ ...s, elements: [...s.elements, duplicate] })); selectElement(duplicate.id)
  }
  function alignElement(position: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    if (!active) return
    const context = document.createElement('canvas').getContext('2d')!
    const bounds = elementBounds(context, active, fonts)
    if (position === 'left') patchElement({ x: 0 })
    else if (position === 'center') patchElement({ x: (width - active.width) / 2 })
    else if (position === 'right') patchElement({ x: width - active.width })
    else if (position === 'top') patchElement({ y: 0 })
    else if (position === 'middle') patchElement({ y: (height - bounds.height) / 2 })
    else patchElement({ y: height - bounds.height })
  }
  function updateTextSelection(target: HTMLTextAreaElement) {
    const start = target.selectionStart, end = target.selectionEnd
    setTextSelection(end > start ? { start, end } : null)
  }
  function changeTextSelectionStyle(change: Partial<TextStyle>, restoreFocus = true) {
    if (active?.type !== 'text' || !textSelection) return
    const { start, end } = textSelection
    replaceElement(setTextSelectionStyle(active, start, end, change))
    if (restoreFocus) requestAnimationFrame(() => { textInput.current?.focus(); textInput.current?.setSelectionRange(start, end) })
  }
  function formatTextSelection(format: 'bold' | 'italic' | 'normal') {
    if (active?.type !== 'text' || !textSelection) return
    if (format === 'normal') changeTextSelectionStyle({ bold: false, italic: false })
    else {
      const next = toggleTextSelectionStyle(active, textSelection.start, textSelection.end, format)
      replaceElement(next)
      requestAnimationFrame(() => { textInput.current?.focus(); textInput.current?.setSelectionRange(textSelection.start, textSelection.end) })
    }
  }
  async function upload(file?: File) {
    if (!file) return
    const kind = uploadKind.current
    setError('')
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > MAX_IMAGE_BYTES) { setError('Gunakan PNG, JPEG, atau WebP maksimal 3 MB.'); return }
    setUploading(true)
    try {
      const objectURL = URL.createObjectURL(file)
      let dimensions: { width: number; height: number }
      try {
        dimensions = await new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => img.naturalWidth * img.naturalHeight <= 40000000 ? resolve({ width: img.naturalWidth, height: img.naturalHeight }) : reject(new Error('Resolusi gambar terlalu besar. Maksimum 40 megapiksel.'))
          img.onerror = () => reject(new Error('File gambar tidak dapat dibaca.')); img.src = objectURL
        })
      } finally { URL.revokeObjectURL(objectURL) }
      const form = new FormData(); form.set('projectId', project.id); form.set('file', file)
      const result = await request<{ asset: string }>(`${API}/assets`, { method: 'POST', body: form })
      if (!mounted.current) return
      if (kind === 'background') patchSlide(s => ({ ...s, background: result.asset }))
      else {
        const scale = Math.min(width * .6 / dimensions.width, height * .6 / dimensions.height)
        const w = Math.max(16, dimensions.width * scale), h = Math.max(16, dimensions.height * scale)
        const element: Element = { id: crypto.randomUUID(), type: 'image', asset: result.asset, x: (width - w) / 2, y: (height - h) / 2, width: w, height: h }
        patchSlide(s => ({ ...s, elements: [...s.elements, element] })); selectElement(element.id)
      }
    } catch (e) { if (mounted.current) setError(message(e)) }
    finally { if (mounted.current) setUploading(false) }
  }
  async function download() {
    setExporting(true); setProgress(0); setError('')
    try { await downloadProject(current.current, fonts, setProgress) }
    catch (e) { setError(message(e)) }
    finally { setExporting(false) }
  }
  const disabled = uploading || exporting
  const index = project.slides.indexOf(slide)
  const selectedIndex = slide.elements.findIndex(e => e.id === selected)
  const selectedTextStyle = active?.type === 'text' && textSelection
    ? textStyles(active)[textSelection.start] || { bold: active.bold, italic: active.italic, fontSize: active.fontSize, color: active.color }
    : null
  return <section className={styles.root}>
    <header className={styles.editorHeader}>
      <button className={styles.iconButton} title="Kembali ke project" aria-label="Kembali ke project" disabled={disabled || saving} onClick={onClose}><ArrowLeft size={20} /></button>
      <div className={styles.projectTitle}><input aria-label="Nama project" value={project.title} maxLength={120} onChange={e => commit({ ...project, title: e.target.value })} /><small role="status">{saving ? 'Menyimpan…' : status}</small></div>
      <div className={styles.headerActions}><button disabled={saving || disabled} onClick={() => void save()}>{saving ? <LoaderCircle size={16} className={styles.spin} /> : <Save size={16} />} Simpan</button><button className={styles.primary} disabled={disabled} onClick={() => void download()}>{exporting ? <LoaderCircle size={16} className={styles.spin} /> : <Download size={16} />} {exporting ? `${progress}/${project.slides.length} slide` : 'Download semua'}</button></div>
    </header>
    {error && <div className={styles.error} role="alert">{error}<button aria-label="Tutup pesan" onClick={() => setError('')}>×</button></div>}
    <fieldset className={styles.editorFieldset} disabled={disabled}>
    <div className={styles.toolbar}>
      <div className={styles.toolGroup}><button disabled={!past.current.length} onClick={() => history(false)} aria-label="Undo" title="Undo (⌘/Ctrl Z)"><Undo2 size={17} /></button><button disabled={!future.current.length} onClick={() => history(true)} aria-label="Redo" title="Redo (⌘/Ctrl Shift Z)"><Redo2 size={17} /></button><button disabled={!active || slide.elements.length >= MAX_ELEMENTS} onClick={() => active && duplicateElement(active)} aria-label="Duplikat elemen" title="Duplikat elemen (⌘/Ctrl D)"><Copy size={17} /></button></div>
      <SelectMenu label="Ratio" ariaLabel="Ratio project" compact value={project.ratio} options={Object.keys(RATIOS).map(value => ({ value, label: value }))} onChange={value => commit(resizeProject(project, value as Ratio))} /><span className={styles.dimensions}>{width} × {height} px</span>
      <div className={styles.toolGroup}><button disabled={slide.elements.length >= MAX_ELEMENTS} onClick={addText}><Type size={17} /> Teks</button><button disabled={slide.elements.length >= MAX_ELEMENTS} onClick={() => { uploadKind.current = 'image'; uploadInput.current?.click() }}><ImagePlus size={17} /> Gambar</button></div>
      <details className={styles.shortcutMenu}><summary><Keyboard size={16} /> Shortcut</summary><div><span><kbd>⌘/Ctrl Z</kbd> Undo</span><span><kbd>⌘/Ctrl D</kbd> Duplikat</span><span><kbd>⌘/Ctrl C/V</kbd> Copy/paste</span><span><kbd>← ↑ → ↓</kbd> Geser 1 px</span><span><kbd>Shift + arah</kbd> Geser 10 px</span><span><kbd>⌘/Ctrl [ ]</kbd> Layer</span><span><kbd>⌘/Ctrl + − 0</kbd> Zoom</span><span><kbd>Delete</kbd> Hapus</span></div></details>
      <div className={styles.zoom} aria-label="Kontrol zoom preview"><span>Zoom</span><button type="button" aria-label="Zoom out" onClick={() => setZoom(value => clamp(value - 10, 25, 250))}><ZoomOut size={15} /></button><input aria-label="Zoom canvas" type="range" min={25} max={250} step={5} value={zoom} onChange={e => setZoom(+e.target.value)} /><input aria-label="Nilai zoom" type="number" min={25} max={250} value={Math.round(zoom)} onChange={e => { const value = Number(e.target.value); if (Number.isFinite(value)) setZoom(clamp(value, 25, 250)) }} /><span>%</span><button type="button" aria-label="Zoom in" onClick={() => setZoom(value => clamp(value + 10, 25, 250))}><ZoomIn size={15} /></button></div>
    </div>
    <div className={styles.editorGrid}>
      <aside className={styles.slidesPanel} aria-label="Daftar slide"><div className={styles.panelHeading}><h2>Slide <span>{project.slides.length}/{MAX_SLIDES}</span></h2><button aria-label="Tambah slide" title="Tambah slide" disabled={project.slides.length >= MAX_SLIDES} onClick={() => addSlide()}><Plus size={17} /></button></div>
        <div className={styles.slideList}>{project.slides.map((s, i) => <button key={s.id} className={`${styles.slideThumb} ${slide.id === s.id ? styles.activeSlide : ''}`} aria-label={`Pilih slide ${i + 1}`} aria-pressed={slide.id === s.id} onClick={() => { setSlideId(s.id); selectElement(null) }}><SlideCanvas slide={s} ratio={project.ratio} fonts={fonts} thumbnail /><span>{String(i + 1).padStart(2, '0')}</span></button>)}</div>
        <div className={styles.slideActions}><button title="Duplikat slide" aria-label="Duplikat slide" disabled={project.slides.length >= MAX_SLIDES} onClick={() => addSlide(true)}><Copy size={16} /></button><button title="Geser slide sebelumnya" aria-label="Geser slide sebelumnya" disabled={index === 0} onClick={() => shiftSlide(-1)}><ArrowUp size={16} /></button><button title="Geser slide sesudahnya" aria-label="Geser slide sesudahnya" disabled={index === project.slides.length - 1} onClick={() => shiftSlide(1)}><ArrowDown size={16} /></button><button title="Hapus slide" aria-label="Hapus slide" disabled={project.slides.length === 1} onClick={() => { const slides = project.slides.filter(s => s.id !== slide.id); commit({ ...project, slides }); setSlideId(slides[Math.min(index, slides.length - 1)].id); selectElement(null) }}><Trash2 size={16} /></button></div>
      </aside>
      <main className={styles.stage}>
        <div className={styles.stageLabel}>SLIDE {String(index + 1).padStart(2, '0')} <span>{project.ratio}</span></div>
        <div ref={stageScroll} className={styles.stageScroll}><div className={styles.artboard} style={{ width: `${Math.round((width > height ? 680 : 480) * zoom / 100)}px`, maxWidth: zoom <= 100 ? '100%' : 'none' }}><SlideCanvas slide={slide} ratio={project.ratio} fonts={fonts} selected={selected} onSelect={disabled ? undefined : selectElement} onGestureStart={snapshot} onChange={element => patchSlide(s => ({ ...s, elements: s.elements.map(e => e.id === element.id ? element : e) }), false)} onEdit={() => { if (active?.type === 'text') { textInput.current?.focus(); textInput.current?.select(); setTextSelection({ start: 0, end: active.text.length }) } }} /></div></div>
        <p className={styles.stageHint}>{uploading ? 'Mengunggah gambar…' : 'Drag untuk memindahkan · Handle kiri/kanan mengatur lebar teks · Kotak pojok untuk scale · Pinch trackpad untuk zoom'}</p>
      </main>
      <aside className={styles.properties} aria-label="Properti elemen">
        <div className={styles.propertySection}><h2>Background</h2><button className={styles.uploadButton} onClick={() => { uploadKind.current = 'background'; uploadInput.current?.click() }}><ImagePlus size={18} />{slide.background ? 'Ganti background' : 'Upload template'}</button><small>PNG, JPEG, WebP · maks. 3 MB<br />Gambar mengisi slide dengan crop tengah.</small><div className={styles.propertyRow}><label className={styles.inlineLabel}>Warna<input aria-label="Warna background" type="color" value={slide.color} onChange={e => patchSlide(s => ({ ...s, color: e.target.value }))} /></label>{slide.background && <button onClick={() => patchSlide(s => ({ ...s, background: null }))}>Hapus</button>}</div></div>
        <div className={styles.propertySection}><h2>{active?.type === 'text' ? 'Teks' : active?.type === 'image' ? 'Gambar' : 'Elemen'}</h2>
          {!active && <p className={styles.muted}>Pilih elemen di canvas atau tambahkan teks untuk mulai mengedit.</p>}
          {active?.type === 'text' && <>
            <div className={styles.textEditorWrap}>
              <label>Edit teks<textarea ref={textInput} aria-label="Isi teks" rows={5} maxLength={10000} value={active.text} onChange={e => { replaceSelectedText(e.target.value); updateTextSelection(e.currentTarget) }} onSelect={e => updateTextSelection(e.currentTarget)} onKeyUp={e => updateTextSelection(e.currentTarget)} onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && ['b', 'i'].includes(e.key.toLowerCase())) { e.preventDefault(); formatTextSelection(e.key.toLowerCase() === 'b' ? 'bold' : 'italic') }
              }} /></label>
              {textSelection && <div className={styles.selectionToolbar} role="toolbar" aria-label="Format teks terpilih">
                <button type="button" aria-label="Bold teks terpilih" aria-pressed={selectionHasStyle(active, textSelection.start, textSelection.end, 'bold')} onMouseDown={e => e.preventDefault()} onClick={() => formatTextSelection('bold')}><Bold size={15} /></button>
                <button type="button" aria-label="Italic teks terpilih" aria-pressed={selectionHasStyle(active, textSelection.start, textSelection.end, 'italic')} onMouseDown={e => e.preventDefault()} onClick={() => formatTextSelection('italic')}><Italic size={15} /></button>
                <button type="button" aria-label="Hapus format teks terpilih" title="Regular" onMouseDown={e => e.preventDefault()} onClick={() => formatTextSelection('normal')}><Type size={15} /><span>Regular</span></button>
                <span className={styles.selectionDivider} />
                <button type="button" aria-label="Perkecil teks terpilih" onMouseDown={e => e.preventDefault()} onClick={() => selectedTextStyle && changeTextSelectionStyle({ fontSize: clamp(selectedTextStyle.fontSize - 2, 8, 400) })}><Minus size={14} /></button>
                <input aria-label="Ukuran teks terpilih" type="number" min={8} max={400} value={Math.round(selectedTextStyle?.fontSize || active.fontSize)} onChange={e => changeTextSelectionStyle({ fontSize: clamp(Number(e.target.value) || 8, 8, 400) }, false)} />
                <button type="button" aria-label="Perbesar teks terpilih" onMouseDown={e => e.preventDefault()} onClick={() => selectedTextStyle && changeTextSelectionStyle({ fontSize: clamp(selectedTextStyle.fontSize + 2, 8, 400) })}><Plus size={14} /></button>
                <label className={styles.selectionColor} title="Warna teks terpilih"><span className={styles.srOnly}>Warna teks terpilih</span><input aria-label="Warna teks terpilih" type="color" value={selectedTextStyle?.color || active.color} onChange={e => changeTextSelectionStyle({ color: e.target.value }, false)} /></label>
              </div>}
            </div>
            <small>Blok sebagian teks untuk mengubah bold, italic, ukuran, dan warna hanya pada selection. Shortcut: ⌘/Ctrl B dan ⌘/Ctrl I.</small>
            <SelectMenu label="Font" ariaLabel="Font" value={active.font} options={Object.entries(fontNames).map(([value, label]) => ({ value, label }))} onChange={value => patchElement({ font: value as Font })} />
            <div className={styles.twoColumns}><SelectMenu label="Style seluruh teks" ariaLabel="Style teks" value={`${active.bold ? 'bold' : 'regular'}${active.italic ? '-italic' : ''}`} options={[{ value: 'regular', label: 'Regular' }, { value: 'bold', label: 'Bold' }, { value: 'regular-italic', label: 'Italic' }, { value: 'bold-italic', label: 'Bold Italic' }]} onChange={value => patchElement({ bold: value.includes('bold'), italic: value.includes('italic'), marks: [] })} /><NumberField label="Ukuran font" value={active.fontSize} min={8} max={400} onChange={fontSize => patchElement({ fontSize })} /></div>
            <input type="range" aria-label="Slider ukuran font" min={8} max={400} step={1} value={active.fontSize} onChange={e => patchElement({ fontSize: +e.target.value })} />
            <div className={styles.twoColumns}><label>Warna teks<input aria-label="Warna teks" type="color" value={active.color} onChange={e => patchElement({ color: e.target.value })} /></label><SelectMenu label="Alignment" ariaLabel="Alignment teks" value={active.align} options={[{ value: 'left', label: 'Kiri' }, { value: 'center', label: 'Tengah' }, { value: 'right', label: 'Kanan' }, { value: 'justify', label: 'Justify' }]} onChange={value => patchElement({ align: value as TextElement['align'] })} /></div>
            <div className={styles.textAlignButtons} role="group" aria-label="Alignment teks cepat"><button type="button" aria-label="Teks rata kiri" aria-pressed={active.align === 'left'} onClick={() => patchElement({ align: 'left' })}><AlignLeft size={16} /></button><button type="button" aria-label="Teks rata tengah" aria-pressed={active.align === 'center'} onClick={() => patchElement({ align: 'center' })}><AlignCenter size={16} /></button><button type="button" aria-label="Teks rata kanan" aria-pressed={active.align === 'right'} onClick={() => patchElement({ align: 'right' })}><AlignRight size={16} /></button><button type="button" aria-label="Teks justify" aria-pressed={active.align === 'justify'} onClick={() => patchElement({ align: 'justify' })}><AlignJustify size={16} /></button></div>
          </>}
          {active && <>
            <div className={styles.positionTools}><strong>Rapikan posisi di slide</strong><div role="group" aria-label="Rapikan posisi elemen"><button type="button" onClick={() => alignElement('left')} aria-label="Posisi kiri"><ArrowLeft size={14} />Kiri</button><button type="button" onClick={() => alignElement('center')} aria-label="Posisi tengah horizontal"><Minus size={14} />Tengah</button><button type="button" onClick={() => alignElement('right')} aria-label="Posisi kanan">Kanan<ArrowRight size={14} /></button><button type="button" onClick={() => alignElement('top')} aria-label="Posisi atas"><ArrowUp size={14} />Atas</button><button type="button" onClick={() => alignElement('middle')} aria-label="Posisi tengah vertikal"><Minus size={14} />Tengah</button><button type="button" onClick={() => alignElement('bottom')} aria-label="Posisi bawah"><ArrowDown size={14} />Bawah</button></div></div>
            <div className={styles.twoColumns}><NumberField label="Posisi X" value={active.x} min={-3840} max={width - 16} onChange={x => patchElement({ x })} /><NumberField label="Posisi Y" value={active.y} min={-3840} max={height - 16} onChange={y => patchElement({ y })} /><NumberField label="Lebar" value={active.width} min={16} max={3840} onChange={w => patchElement(active.type === 'image' ? { width: w, height: clamp(active.height * w / active.width, 16, 3840) } : { width: w })} />{active.type === 'image' && <NumberField label="Tinggi" value={active.height} min={16} max={3840} onChange={h => patchElement({ height: h, width: clamp(active.width * h / active.height, 16, 3840) })} />}</div>
            <div className={styles.propertyRow}><button disabled={slide.elements.length >= MAX_ELEMENTS} onClick={() => duplicateElement(active)} title="Duplikat elemen (⌘/Ctrl D)"><Copy size={15} /> Duplikat</button><button disabled={selectedIndex === slide.elements.length - 1} onClick={() => layer(1)} title="Naik satu layer"><ArrowUp size={15} /> Maju</button><button disabled={selectedIndex <= 0} onClick={() => layer(-1)} title="Turun satu layer"><ArrowDown size={15} /> Mundur</button></div><button className={styles.dangerButton} onClick={removeElement}><Trash2 size={15} /> Hapus elemen</button>
          </>}
        </div>
        <div className={styles.propertySection}><h2><Layers size={16} /> Layer <span>{slide.elements.length}/{MAX_ELEMENTS}</span></h2><small>Layer teratas tampil paling depan.</small><div className={styles.layerList}>{[...slide.elements].reverse().map((e, i) => <button key={e.id} className={e.id === selected ? styles.selectedLayer : ''} onClick={() => selectElement(e.id)}>{e.type === 'text' ? <Type size={15} /> : <ImagePlus size={15} />}<span>{e.type === 'text' ? e.text || 'Teks kosong' : `Gambar ${slide.elements.length - i}`}</span>{e.id === selected && <Check size={14} />}</button>)}</div></div>
      </aside>
    </div>
    </fieldset>
    <input ref={uploadInput} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { void upload(e.target.files?.[0]); e.target.value = '' }} />
    <span className={styles.srOnly} aria-live="polite">{historyTick ? 'Project diperbarui' : ''}</span>
  </section>
}
function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  const displayed = draft ?? String(Math.round(value * 10) / 10)
  function apply() {
    const n = Number(displayed)
    if (displayed.trim() && Number.isFinite(n) && n !== value) onChange(clamp(n, min, max))
    setDraft(null)
  }
  return <label>{label}<input aria-label={label} type="number" min={min} max={max} step="any" value={displayed} onChange={e => setDraft(e.target.value)} onBlur={apply} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }} /></label>
}
