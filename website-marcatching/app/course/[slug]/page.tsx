'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Download,
  Expand,
  FileArchive,
  FileText,
  GraduationCap,
  Play,
  Video,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { CourseMaterial, Product } from '@/lib/supabaseClient'
import styles from '../course.module.css'

function getYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtu\.be\/([^?\s]+)/,
    /youtube\.com\/embed\/([^?\s]+)/,
    /youtube\.com\/shorts\/([^?\s]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function getDriveFileId(url: string): string | null {
  const pathMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (pathMatch) return pathMatch[1]
  const queryMatch = url.match(/id=([a-zA-Z0-9_-]+)/)
  return queryMatch?.[1] || null
}

function materialLabel(type: CourseMaterial['type']) {
  if (type === 'pdf') return 'PDF document'
  if (type === 'md') return 'Markdown file'
  if (type === 'zip') return 'Resource pack'
  return 'Video lesson'
}

function MaterialIcon({ type }: { type: CourseMaterial['type'] }) {
  if (type === 'video') return <Video size={18} />
  if (type === 'zip') return <FileArchive size={18} />
  return <FileText size={18} />
}

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  const [userId, setUserId] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [openMaterial, setOpenMaterial] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [notEnrolled, setNotEnrolled] = useState(false)
  const [fullScreenPdfUrl, setFullScreenPdfUrl] = useState<string | null>(null)
  const [fullScreenTitle, setFullScreenTitle] = useState('')

  const loadCourse = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/login')
      return
    }

    setUserId(user.id)
    const email = (user.email || '').toLowerCase().trim()

    const { data: course } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!course) {
      setLoading(false)
      return
    }

    setProduct(course)

    const { data: enrollment } = await supabase
      .from('course_access_emails')
      .select('id')
      .eq('email', email)
      .eq('product_id', course.id)
      .maybeSingle()

    if (!enrollment) {
      setNotEnrolled(true)
      setLoading(false)
      return
    }

    const { data: courseMaterials } = await supabase
      .from('course_materials')
      .select('*')
      .eq('product_id', course.id)
      .order('order_index')

    const nextMaterials = courseMaterials || []
    setMaterials(nextMaterials)

    if (nextMaterials.length) {
      const { data: progress } = await supabase
        .from('learning_progress')
        .select('material_id')
        .eq('user_id', user.id)
        .in('material_id', nextMaterials.map(material => material.id))

      setCompletedIds(new Set(progress?.map(item => item.material_id) || []))
    }

    setLoading(false)
  }, [router, slug])

  useEffect(() => {
    queueMicrotask(() => {
      void loadCourse()
    })
  }, [loadCourse])

  const total = materials.length
  const done = completedIds.size
  const percentage = total ? Math.round((done / total) * 100) : 0
  const complete = total > 0 && done === total
  const nextMaterial = useMemo(
    () => materials.find(material => !completedIds.has(material.id)) || materials[0] || null,
    [completedIds, materials]
  )

  async function toggleComplete(materialId: string) {
    if (togglingId) return
    setTogglingId(materialId)
    const wasCompleted = completedIds.has(materialId)

    if (wasCompleted) {
      await supabase
        .from('learning_progress')
        .delete()
        .eq('user_id', userId)
        .eq('material_id', materialId)

      setCompletedIds(current => {
        const next = new Set(current)
        next.delete(materialId)
        return next
      })
    } else {
      await supabase
        .from('learning_progress')
        .upsert({ user_id: userId, material_id: materialId }, { onConflict: 'user_id,material_id' })

      setCompletedIds(current => new Set([...current, materialId]))
    }

    setTogglingId(null)
  }

  function openNextMaterial() {
    if (!nextMaterial) return
    setOpenMaterial(nextMaterial.id)
    window.setTimeout(() => {
      document.getElementById(`material-${nextMaterial.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 30)
  }

  if (loading) {
    return (
      <div className={styles.courseState}>
        <span className={styles.loader} />
        <p>Menyiapkan course...</p>
      </div>
    )
  }

  if (notEnrolled) {
    return (
      <div className={styles.courseState}>
        <span><GraduationCap size={29} /></span>
        <h1>Akses course tidak ditemukan.</h1>
        <p>Akun ini belum memiliki akses ke course tersebut.</p>
        <Link href="/" className={styles.secondaryButton}>Kembali ke Learning Home</Link>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.courseState}>
        <h1>Course tidak ditemukan.</h1>
        <Link href="/" className={styles.secondaryButton}>Kembali ke Learning Home</Link>
      </div>
    )
  }

  return (
    <div className={styles.courseDetailPage}>
      <Link href="/" className={styles.backLink}><ArrowLeft size={15} /> Learning Home</Link>

      <header className={styles.courseHero}>
        <div className={styles.courseHeroCopy}>
          <span className={styles.eyebrow}><GraduationCap size={14} /> Marcatching course</span>
          <h1>{product.name}</h1>
          <p>{product.sub_headline || 'Materi praktis untuk membangun marketing system yang bisa dieksekusi.'}</p>
          <div className={styles.courseHeroMeta}>
            <span><BookOpen size={14} /> {total} learning assets</span>
            <span><CheckCircle2 size={14} /> {done} completed</span>
          </div>
          {nextMaterial && !complete && (
            <button type="button" className={styles.primaryButton} onClick={openNextMaterial}>
              <Play size={15} fill="currentColor" /> Lanjutkan materi
            </button>
          )}
        </div>

        <div className={styles.courseHeroProgress}>
          <div style={{ '--course-progress': `${percentage * 3.6}deg` } as React.CSSProperties}>
            <strong>{percentage}%</strong>
            <span>completed</span>
          </div>
          <p>{complete ? 'Course completed. Great work.' : `${total - done} materi tersisa`}</p>
        </div>
      </header>

      <section className={styles.lessonSection}>
        <div className={styles.sectionHeader}>
          <div><span className={styles.cardKicker}>Learning path</span><h2>Daftar materi</h2></div>
          <span>{done}/{total} selesai</span>
        </div>

        {materials.length === 0 ? (
          <div className={styles.emptyState}>
            <span><BookOpen size={27} /></span>
            <h3>Materi sedang disiapkan.</h3>
            <p>Tim Marcatching sedang menyusun learning assets untuk course ini.</p>
          </div>
        ) : (
          <div className={styles.lessonList}>
            {materials.map((material, index) => {
              const isDone = completedIds.has(material.id)
              const isOpen = openMaterial === material.id

              return (
                <article
                  key={material.id}
                  id={`material-${material.id}`}
                  className={`${styles.lessonCard} ${isDone ? styles.lessonCardDone : ''}`}
                >
                  <div className={styles.lessonHeader}>
                    <span className={styles.lessonIndex}>{isDone ? <Check size={14} /> : String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.lessonIcon}><MaterialIcon type={material.type} /></span>
                    <div className={styles.lessonCopy}>
                      <small>{materialLabel(material.type)}</small>
                      <h3>{material.title}</h3>
                    </div>
                    <div className={styles.lessonActions}>
                      <button
                        type="button"
                        className={`${styles.completeButton} ${isDone ? styles.completeButtonDone : ''}`}
                        onClick={() => toggleComplete(material.id)}
                        disabled={togglingId === material.id}
                      >
                        {isDone ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        <span>{isDone ? 'Selesai' : 'Tandai selesai'}</span>
                      </button>
                      <button
                        type="button"
                        className={styles.openButton}
                        onClick={() => setOpenMaterial(current => current === material.id ? null : material.id)}
                        aria-expanded={isOpen}
                      >
                        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        <span>{isOpen ? 'Tutup' : 'Buka'}</span>
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className={styles.viewerPanel}>
                      <MaterialViewer
                        material={material}
                        onFullScreen={(url, title) => {
                          setFullScreenPdfUrl(url)
                          setFullScreenTitle(title)
                        }}
                      />
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      {fullScreenPdfUrl && (
        <div className={styles.pdfOverlay} role="dialog" aria-modal="true" aria-label={fullScreenTitle}>
          <header>
            <div><BookOpen size={18} /><h2>{fullScreenTitle}</h2></div>
            <button type="button" onClick={() => setFullScreenPdfUrl(null)}><X size={17} /> Tutup</button>
          </header>
          <div className={styles.pdfOverlayBody}>
            <iframe src={fullScreenPdfUrl} title={fullScreenTitle} />
            <span aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  )
}

function MaterialViewer({
  material,
  onFullScreen,
}: {
  material: CourseMaterial
  onFullScreen: (url: string, title: string) => void
}) {
  if (material.type === 'video') {
    const youtubeId = getYoutubeId(material.content_url)
    if (!youtubeId) return <p className={styles.viewerError}>URL video belum valid. Hubungi tim Marcatching.</p>

    return (
      <div className={styles.videoViewer}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&color=white`}
          title={material.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (material.type === 'md' || material.type === 'zip') {
    const fileId = getDriveFileId(material.content_url)
    const downloadUrl = fileId
      ? `/api/download?id=${fileId}&title=${encodeURIComponent(material.title)}`
      : material.content_url
    const extension = material.type === 'md' ? '.md' : '.zip'

    return (
      <div className={styles.downloadViewer}>
        <span>{material.type === 'zip' ? <FileArchive size={33} /> : <FileText size={33} />}</span>
        <small>{material.type === 'zip' ? 'Resource pack' : 'AI workspace file'}</small>
        <h3>{material.title}{extension}</h3>
        <p>
          {material.type === 'zip'
            ? 'Unduh lalu ekstrak file untuk menggunakan seluruh resource.'
            : 'Unduh file Markdown untuk diimpor ke workspace AI pilihanmu.'}
        </p>
        <a href={downloadUrl} download={`${material.title}${extension}`}>
          <Download size={16} /> Download {extension} <ArrowRight size={15} />
        </a>
      </div>
    )
  }

  const fileId = getDriveFileId(material.content_url)
  const embedUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/preview`
    : material.content_url

  return (
    <div className={styles.pdfViewer}>
      <iframe src={embedUrl} title={material.title} allow="autoplay" allowFullScreen />
      <span aria-hidden="true" />
      <button type="button" onClick={() => onFullScreen(embedUrl, material.title)}>
        <Expand size={14} /> Full screen
      </button>
    </div>
  )
}
