'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import RichTextEditor from '@/components/RichTextEditor'
import {
  Plus, Trash2, Pencil, X, Check, GripVertical, Upload,
  ToggleLeft, ToggleRight, Star, ChevronDown, ChevronUp,
  Printer, Download, FileText
} from 'lucide-react'
import styles from './admin.module.css'

// ─── Types ────────────────────────────────────────────────────
export type QuestionType = 'short_answer' | 'long_answer' | 'dropdown' | 'checkbox' | 'radio' | 'rating'

export interface SurveyQuestion {
  id: string
  survey_id: string
  label: string
  type: QuestionType
  options: string[]
  is_required: boolean
  order_index: number
  section: 'biodata' | 'survey'
}

export interface Survey {
  id: string
  title: string
  slug: string
  description: string
  image_url: string
  image_aspect_ratio: string
  status: 'active' | 'inactive'
  created_at: string
  survey_questions?: SurveyQuestion[]
}

// ─── Helpers ──────────────────────────────────────────────────
function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function genId() { return Math.random().toString(36).slice(2, 9) }

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return canvas.toDataURL('image/jpeg', 0.9)
}

const ASPECT_RATIOS: Record<string, number> = {
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '4:5': 4 / 5,
  '1:1': 1 / 1,
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'long_answer', label: 'Long Answer' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Option (Radio)' },
  { value: 'rating', label: 'Rating (Bintang)' },
]

// ─── Question Editor ──────────────────────────────────────────
function QuestionEditor({
  q, onChange, onDelete, onMove, isFirst, isLast
}: {
  q: SurveyQuestion
  onChange: (q: SurveyQuestion) => void
  onDelete: () => void
  onMove: (dir: 'up' | 'down') => void
  isFirst: boolean
  isLast: boolean
}) {
  const [newOpt, setNewOpt] = useState('')
  const needsOptions = ['dropdown', 'checkbox', 'radio'].includes(q.type)

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Reorder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 8 }}>
          <button onClick={() => onMove('up')} disabled={isFirst}
            style={{ background: 'none', border: 'none', cursor: isFirst ? 'default' : 'pointer', opacity: isFirst ? 0.3 : 1, padding: 2 }}>
            <ChevronUp size={14} color="#64748b" />
          </button>
          <button onClick={() => onMove('down')} disabled={isLast}
            style={{ background: 'none', border: 'none', cursor: isLast ? 'default' : 'pointer', opacity: isLast ? 0.3 : 1, padding: 2 }}>
            <ChevronDown size={14} color="#64748b" />
          </button>
        </div>

        <div style={{ flex: 1 }}>
          {/* Label */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="Tulis pertanyaan di sini..."
              value={q.label}
              onChange={e => onChange({ ...q, label: e.target.value })}
            />
            {/* Required toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.8rem', fontWeight: 600, color: q.is_required ? '#0d3369' : '#94a3b8' }}>
              <input type="checkbox" checked={q.is_required} onChange={e => onChange({ ...q, is_required: e.target.checked })} style={{ accentColor: '#0d3369' }} />
              Wajib *
            </label>
          </div>

          {/* Type */}
          <select className="select" style={{ marginBottom: needsOptions ? 10 : 0 }} value={q.type}
            onChange={e => onChange({ ...q, type: e.target.value as QuestionType, options: [] })}>
            {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {/* Options (for dropdown/checkbox/radio) */}
          {needsOptions && (
            <div style={{ marginTop: 8 }}>
              {q.options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <input className="input" style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem' }}
                    value={opt} onChange={e => {
                      const opts = [...q.options]; opts[i] = e.target.value
                      onChange({ ...q, options: opts })
                    }} />
                  <button onClick={() => onChange({ ...q, options: q.options.filter((_, j) => j !== i) })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="input" style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem' }}
                  placeholder="Tambah opsi..." value={newOpt}
                  onChange={e => setNewOpt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newOpt.trim()) {
                      onChange({ ...q, options: [...q.options, newOpt.trim()] }); setNewOpt('')
                    }
                  }} />
                <button className="btn btn-navy" style={{ padding: '6px 12px' }}
                  onClick={() => { if (newOpt.trim()) { onChange({ ...q, options: [...q.options, newOpt.trim()] }); setNewOpt('') } }}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Rating preview */}
          {q.type === 'rating' && (
            <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map(n => <Star key={n} size={20} color="#f59e0b" fill="#fde68a" />)}
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: 8, alignSelf: 'center' }}>1 – 5 bintang</span>
            </div>
          )}
        </div>

        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', paddingTop: 8 }}>
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Main SurveyTab ───────────────────────────────────────────
export default function SurveyTab() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Survey | null>(null)
  const [saving, setSaving] = useState(false)

  // Tabs & Results
  const [activeTab, setActiveTab] = useState<'manage' | 'results'>('manage')
  const [resultsSurveyTitle, setResultsSurveyTitle] = useState('')
  const [responses, setResponses] = useState<any[]>([])
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])      // section='survey'
  const [biodataQs, setBiodataQs] = useState<SurveyQuestion[]>([])     // section='biodata'

  // Crop state
  const [cropSrc, setCropSrc] = useState('')
  const [showCrop, setShowCrop] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const onCropComplete = useCallback((_: any, px: any) => setCroppedAreaPixels(px), [])

  async function fetchSurveys() {
    setLoading(true)
    const res = await fetch('/api/surveys')
    const data = await res.json()
    setSurveys(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function fetchResponses(title: string) {
    if (!title) return
    setLoadingResponses(true)
    try {
      const res = await fetch(`/api/surveys/responses?surveyTitle=${encodeURIComponent(title)}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setResponses(data)
      } else {
        setResponses([])
      }
    } catch (err) {
      console.error(err)
      setResponses([])
    }
    setLoadingResponses(false)
  }

  useEffect(() => { fetchSurveys() }, [])

  useEffect(() => {
    if (activeTab === 'results' && resultsSurveyTitle) {
      fetchResponses(resultsSurveyTitle)
    }
  }, [activeTab, resultsSurveyTitle])

  function openNew() {
    setEditing(null)
    setTitle(''); setSlug(''); setDescription(''); setImageUrl(''); setAspectRatio('16:9')
    setStatus('active'); setQuestions([]); setBiodataQs([])
    setShowForm(true)
  }

  function openEdit(s: Survey) {
    setEditing(s)
    setTitle(s.title); setSlug(s.slug); setDescription(s.description || '')
    setImageUrl(s.image_url || ''); setAspectRatio(s.image_aspect_ratio || '16:9')
    setStatus(s.status)
    const qs = (s.survey_questions ?? []).map(q => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
      section: (q.section ?? 'survey') as 'biodata' | 'survey',
    }))
    const sorted = qs.sort((a, b) => a.order_index - b.order_index)
    setBiodataQs(sorted.filter(q => q.section === 'biodata'))
    setQuestions(sorted.filter(q => q.section === 'survey'))
    setShowForm(true)
  }

  function addQuestion(section: 'biodata' | 'survey' = 'survey') {
    const setter = section === 'biodata' ? setBiodataQs : setQuestions
    setter(prev => [...prev, {
      id: genId(),
      survey_id: editing?.id ?? '',
      label: '',
      type: 'short_answer',
      options: [],
      is_required: true,
      order_index: prev.length,
      section,
    }])
  }

  function moveQuestion(idx: number, dir: 'up' | 'down', section: 'biodata' | 'survey' = 'survey') {
    const list = section === 'biodata' ? [...biodataQs] : [...questions]
    const setter = section === 'biodata' ? setBiodataQs : setQuestions
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    ;[list[idx], list[swapIdx]] = [list[swapIdx], list[idx]]
    setter(list.map((q, i) => ({ ...q, order_index: i })))
  }

  // Image upload flow
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setCropSrc(ev.target?.result as string)
      setShowCrop(true)
    }
    reader.readAsDataURL(file)
  }

  async function handleCropConfirm() {
    if (!croppedAreaPixels || !cropSrc) return
    setUploadingImage(true)
    const cropped = await getCroppedImg(cropSrc, croppedAreaPixels)
    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
      'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'
    const filename = `survey_thumb_${Date.now()}.jpg`
    const base64 = cropped.split(',')[1]
    try {
      const res = await fetch(appScriptUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'upload', filename, mimeType: 'image/jpeg', base64 }),
        redirect: 'follow',
      })
      const data = await res.json()
      if (data.status === 'success' && data.url) { setImageUrl(data.url) }
      else alert('Gagal upload gambar: ' + (data.message || 'Unknown error'))
    } catch { alert('Error saat upload gambar') }
    setUploadingImage(false)
    setShowCrop(false)
    setCropSrc('')
  }

  async function handleSave() {
    if (!title.trim() || !slug.trim()) { alert('Judul dan slug wajib diisi'); return }
    setSaving(true)
    const surveyPayload = { title, slug, description, image_url: imageUrl, image_aspect_ratio: aspectRatio, status }

    let surveyId = editing?.id
    if (editing) {
      await fetch('/api/surveys', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...surveyPayload }) })
    } else {
      const res = await fetch('/api/surveys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(surveyPayload) })
      const data = await res.json()
      surveyId = data.id
    }

    if (surveyId) {
      if (editing) {
        await fetch('/api/surveys/questions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ survey_id: surveyId }),
        })
      }
      // Merge biodata + survey questions with correct section tags
      const allQs = [
        ...biodataQs.map((q, i) => ({ ...q, survey_id: surveyId, order_index: i, section: 'biodata' })),
        ...questions.map((q, i) => ({ ...q, survey_id: surveyId, order_index: i, section: 'survey' })),
      ]
      if (allQs.length > 0) {
        await fetch('/api/surveys/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions: allQs }),
        })
      }
    }

    setSaving(false)
    setShowForm(false)
    fetchSurveys()
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus survey ini? Semua pertanyaan akan ikut terhapus.')) return
    await fetch('/api/surveys', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchSurveys()
  }

  async function toggleStatus(s: Survey) {
    const newStatus = s.status === 'active' ? 'inactive' : 'active'
    await fetch('/api/surveys', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, status: newStatus }) })
    fetchSurveys()
  }

  return (
    <div className={styles.tabContent} style={{ maxWidth: 960 }}>
      {/* Header */}
      <div className={styles.contentHeader} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h1 className={styles.contentTitle}>Survey</h1>
            <p className={styles.contentDesc}>Kelola survey Marcatching — buat, aktifkan, dan lihat hasilnya.</p>
          </div>
          {activeTab === 'manage' && (
            <button className="btn btn-navy" onClick={openNew}><Plus size={16} /> Buat Survey</button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #e2e8f0', width: '100%', paddingBottom: 10 }}>
          <button
            onClick={() => setActiveTab('manage')}
            style={{ background: 'none', border: 'none', fontSize: '0.95rem', fontWeight: activeTab === 'manage' ? 800 : 500, color: activeTab === 'manage' ? '#0d3369' : '#64748b', cursor: 'pointer', paddingBottom: 6, borderBottom: activeTab === 'manage' ? '2px solid #0d3369' : '2px solid transparent' }}
          >
            Kelola Survey
          </button>
          <button
            onClick={() => setActiveTab('results')}
            style={{ background: 'none', border: 'none', fontSize: '0.95rem', fontWeight: activeTab === 'results' ? 800 : 500, color: activeTab === 'results' ? '#0d3369' : '#64748b', cursor: 'pointer', paddingBottom: 6, borderBottom: activeTab === 'results' ? '2px solid #0d3369' : '2px solid transparent' }}
          >
            Hasil Survey
          </button>
        </div>
      </div>

      {/* Crop modal */}
      {showCrop && (
        <div className={styles.cropModalOverlay}>
          <div className={styles.cropModalContent} style={{ maxWidth: 540 }}>
            <div className={styles.cropModalHeader}>
              <h3 className={styles.cropModalTitle}>Crop Gambar</h3>
              <button className={styles.closeBtn} onClick={() => { setShowCrop(false); setCropSrc('') }}><X size={18} /></button>
            </div>
            <div style={{ position: 'relative', height: 340, background: '#0f172a' }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT_RATIOS[aspectRatio] ?? 16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, padding: 20, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => { setShowCrop(false); setCropSrc('') }}>Batal</button>
              <button className="btn btn-navy" onClick={handleCropConfirm} disabled={uploadingImage}>
                {uploadingImage ? 'Uploading...' : <><Check size={14} /> Konfirmasi Crop</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeTab === 'manage' ? (
        showForm ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0d3369' }}>
              {editing ? 'Edit Survey' : 'Buat Survey Baru'}
            </h2>
            <button className={styles.closeBtn} onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>

          {/* Status + Slug */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label className="label">Judul Survey *</label>
              <input className="input" value={title} onChange={e => { setTitle(e.target.value); if (!editing) setSlug(slugify(e.target.value)) }} placeholder="Masukkan judul survey..." />
            </div>
            <div className="form-group">
              <label className="label">Slug (URL) *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>marcatching.com/survey/</span>
                <input className="input" value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="nama-survey" />
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d3369' }}>Status Survey:</label>
            <button onClick={() => setStatus(s => s === 'active' ? 'inactive' : 'active')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: status === 'active' ? '#dcfce7' : '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', color: status === 'active' ? '#16a34a' : '#94a3b8' }}>
              {status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {status === 'active' ? 'Active' : 'Inactive'}
            </button>
          </div>

          {/* Image */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="label">Thumbnail</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="label" style={{ marginBottom: 4 }}>Aspect Ratio</label>
                <select className="select" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} style={{ minWidth: 120 }}>
                  {Object.keys(ASPECT_RATIOS).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                {imageUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={imageUrl} alt="thumbnail" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    <button onClick={() => setImageUrl('')} style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', borderRadius: '50%', color: '#fff', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-ghost" onClick={() => imageInputRef.current?.click()} style={{ padding: '10px 20px' }}>
                    <Upload size={14} /> Upload Gambar
                  </button>
                )}
                <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="label">Deskripsi Survey</label>
            <RichTextEditor value={description} onChange={setDescription} placeholder="Tulis deskripsi survey..." minHeight={120} />
          </div>

          {/* ── BIODATA QUESTIONS ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0d3369' }}>Pertanyaan Biodata ({biodataQs.length})</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>Ditampilkan di awal survey untuk collect data diri</p>
              </div>
              <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '0.82rem' }} onClick={() => addQuestion('biodata')}>
                <Plus size={14} /> Tambah
              </button>
            </div>
            {biodataQs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: '0.82rem', border: '1.5px dashed #e2e8f0', borderRadius: 10 }}>
                Belum ada pertanyaan biodata.
              </div>
            )}
            {biodataQs.map((q, i) => (
              <QuestionEditor key={q.id} q={q}
                onChange={updated => setBiodataQs(prev => prev.map((x, j) => j === i ? updated : x))}
                onDelete={() => setBiodataQs(prev => prev.filter((_, j) => j !== i))}
                onMove={dir => moveQuestion(i, dir, 'biodata')}
                isFirst={i === 0} isLast={i === biodataQs.length - 1}
              />
            ))}
          </div>

          {/* divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Pertanyaan Survey</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* ── SURVEY QUESTIONS ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0d3369' }}>Pertanyaan Survey ({questions.length})</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>Pertanyaan utama yang akan dijawab satu per satu</p>
              </div>
              <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '0.82rem' }} onClick={() => addQuestion('survey')}>
                <Plus size={14} /> Tambah
              </button>
            </div>
            {questions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: '0.82rem', border: '1.5px dashed #e2e8f0', borderRadius: 10 }}>
                Belum ada pertanyaan survey.
              </div>
            )}
            {questions.map((q, i) => (
              <QuestionEditor key={q.id} q={q}
                onChange={updated => setQuestions(prev => prev.map((x, j) => j === i ? updated : x))}
                onDelete={() => setQuestions(prev => prev.filter((_, j) => j !== i))}
                onMove={dir => moveQuestion(i, dir, 'survey')}
                isFirst={i === 0} isLast={i === questions.length - 1}
              />
            ))}
          </div>

          {/* Save */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Batal</button>
            <button className="btn btn-navy" onClick={handleSave} disabled={saving} style={{ minWidth: 140 }}>
              {saving ? 'Menyimpan...' : <><Check size={14} /> Simpan Survey</>}
            </button>
          </div>
        </div>
      ) : (
        /* Survey list */
        <div>
          {loading ? (
            <div className={styles.loading}>Memuat data survey...</div>
          ) : surveys.length === 0 ? (
            <div className={styles.emptyState}>
              <p style={{ margin: 0, fontWeight: 700, color: '#0d3369' }}>Belum ada survey.</p>
              <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: '0.88rem' }}>Klik "Buat Survey" untuk membuat survey pertama kamu.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {surveys.map(s => (
                <div key={s.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  {s.image_url && (
                    <img src={s.image_url} alt={s.title} style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid #e2e8f0' }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0d3369' }}>{s.title}</span>
                      <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: s.status === 'active' ? '#dcfce7' : '#f1f5f9', color: s.status === 'active' ? '#16a34a' : '#94a3b8' }}>
                        {s.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      marcatching.com/survey/{s.slug} · {s.survey_questions?.length ?? 0} pertanyaan
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => toggleStatus(s)}
                      title={s.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                      style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: '6px 10px', color: s.status === 'active' ? '#16a34a' : '#94a3b8' }}>
                      {s.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button className={styles.editBtn} onClick={() => openEdit(s)}><Pencil size={14} /></button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) ) : (
        /* Results View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0d3369' }}>Pilih Survey:</label>
            <select className="select" value={resultsSurveyTitle} onChange={e => setResultsSurveyTitle(e.target.value)} style={{ width: 240 }}>
              <option value="">-- Pilih Survey --</option>
              {surveys.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
            </select>
          </div>

          {loadingResponses ? (
             <div className={styles.loading}>Memuat hasil survey...</div>
          ) : !resultsSurveyTitle ? (
             <div className={styles.emptyState}>Pilih survey dari dropdown di atas untuk melihat hasilnya.</div>
          ) : responses.length === 0 ? (
             <div className={styles.emptyState}>Belum ada respon untuk survey ini, atau data belum ditarik dari Apps Script. Pastikan script update sudah dipasang.</div>
          ) : (
             <div className={styles.ordersTable}>
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                   <tr>
                     <th>No</th>
                     <th>Timestamp</th>
                     <th>Nama / Email</th>
                     <th>Aksi</th>
                   </tr>
                 </thead>
                 <tbody>
                   {responses.map((resp, i) => {
                     const name = resp.Nama || resp.nama || resp.Name || resp.name || '-';
                     const email = resp.Email || resp.email || '-';
                     const ts = resp.Timestamp || resp.timestamp || resp.submittedAt || '-';
                     return (
                       <tr key={i}>
                         <td>{i + 1}</td>
                         <td>{ts}</td>
                         <td>{name !== '-' ? name : email}</td>
                         <td>
                           <button onClick={() => setSelectedResponse(resp)} className="btn btn-navy" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                             <FileText size={14} /> Preview
                           </button>
                         </td>
                       </tr>
                     )
                   })}
                 </tbody>
               </table>
             </div>
          )}
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedResponse && (
        <div className={styles.cropModalOverlay} style={{ padding: '20px 0', zIndex: 9999 }}>
          <div className={styles.cropModalContent} style={{ maxWidth: 800, width: '90%', height: '90vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            {/* Header Modal */}
            <div className={`${styles.cropModalHeader} ${styles.noPrint}`} style={{ flexShrink: 0, background: '#fff' }}>
              <h3 className={styles.cropModalTitle}>Preview Dokumen Survey</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedResponse(null)}><X size={18} /></button>
            </div>
            
            {/* Document Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', position: 'relative' }}>
              <div className={styles.printArea} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '48px 56px', minHeight: 800, margin: '0 auto', maxWidth: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative' }}>
                
                {/* Kop Surat */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0d3369', paddingBottom: 24, marginBottom: 32 }}>
                  <img src="/logo-type-black.png" alt="Marcatching Logo" style={{ height: 40, objectFit: 'contain' }} />
                  <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Survey Document
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      {resultsSurveyTitle}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 16 }}>
                    <strong>Tanggal Submit:</strong> {selectedResponse.Timestamp || selectedResponse.timestamp || selectedResponse.submittedAt || new Date().toISOString()}
                  </div>
                  
                  {Object.keys(selectedResponse).filter(k => k.toLowerCase() !== 'timestamp' && k.toLowerCase() !== 'submittedat').map((key, i) => (
                    <div key={i} style={{ marginBottom: 20, breakInside: 'avoid' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{key}</div>
                      <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        {selectedResponse[key]?.toString() || '-'}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Actions */}
            <div className={styles.noPrint} style={{ padding: 20, background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => {
                const content = `# Marcatching Survey Document\n\n**Survey:** ${resultsSurveyTitle}\n**Tanggal:** ${selectedResponse.Timestamp || selectedResponse.submittedAt || new Date().toISOString()}\n\n` + 
                  Object.keys(selectedResponse).filter(k => k.toLowerCase() !== 'timestamp' && k.toLowerCase() !== 'submittedat').map(k => `### ${k}\n${selectedResponse[k]}\n`).join('\n')
                const blob = new Blob([content], { type: 'text/markdown' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `survey-${resultsSurveyTitle.replace(/\s+/g, '-')}-${Date.now()}.md`
                a.click()
              }}>
                <Download size={16} /> Download .md
              </button>
              <button className="btn btn-navy" onClick={() => window.print()}>
                <Printer size={16} /> Print PDF
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
