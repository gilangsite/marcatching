'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, BookOpen, FileText, Video, CheckCircle2,
  Circle, ChevronDown, ChevronUp, LogOut, Menu, GraduationCap
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Product, CourseMaterial } from '@/lib/supabaseClient'
import styles from '../course.module.css'

function getYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtu\.be\/([^?\s]+)/,
    /youtube\.com\/embed\/([^?\s]+)/,
    /youtube\.com\/shorts\/([^?\s]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function getDriveFileId(url: string): string | null {
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (m) return m[1]
  const m2 = url.match(/id=([a-zA-Z0-9_-]+)/)
  if (m2) return m2[1]
  return null
}

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [openMaterial, setOpenMaterial] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [notEnrolled, setNotEnrolled] = useState(false)

  const loadCourse = useCallback(async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/course/login'); return }

    setUserId(user.id)
    const email = user.email || ''
    setUserEmail(email)
    const namePart = email.split('@')[0]
    setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1))

    // Get product by slug
    const { data: prod } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!prod) { setLoading(false); return }
    setProduct(prod)

    // Check enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', prod.id)
      .single()

    if (!enrollment) {
      setNotEnrolled(true)
      setLoading(false)
      return
    }

    // Get materials
    const { data: mats } = await supabase
      .from('course_materials')
      .select('*')
      .eq('product_id', prod.id)
      .order('order_index')

    setMaterials(mats || [])

    // Get completed materials
    if (mats && mats.length > 0) {
      const { data: progress } = await supabase
        .from('learning_progress')
        .select('material_id')
        .eq('user_id', user.id)
        .in('material_id', mats.map(m => m.id))

      setCompletedIds(new Set(progress?.map(p => p.material_id) || []))
    }

    setLoading(false)
  }, [slug, router])

  useEffect(() => { loadCourse() }, [loadCourse])

  async function toggleComplete(materialId: string) {
    if (togglingId) return
    setTogglingId(materialId)

    const isDone = completedIds.has(materialId)

    if (isDone) {
      // Unmark
      await supabase
        .from('learning_progress')
        .delete()
        .eq('user_id', userId)
        .eq('material_id', materialId)

      setCompletedIds(prev => {
        const next = new Set(prev)
        next.delete(materialId)
        return next
      })
    } else {
      // Mark complete
      await supabase
        .from('learning_progress')
        .upsert({ user_id: userId, material_id: materialId }, { onConflict: 'user_id,material_id' })

      setCompletedIds(prev => new Set([...prev, materialId]))
    }

    setTogglingId(null)
  }

  function toggleViewer(materialId: string) {
    setOpenMaterial(prev => prev === materialId ? null : materialId)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/course/login')
  }

  const total = materials.length
  const done = completedIds.size
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const isComplete = total > 0 && done === total

  return (
    <div className={styles.page}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button className={styles.hamburgerBtn} onClick={() => setIsSidebarOpen(true)}>
          <Menu size={22} color="#ffffff" />
        </button>
        <Image
          src="/logo-type-white.png"
          alt="Marcatching"
          width={110}
          height={26}
          className={styles.mobileHeaderLogo}
        />
      </div>

      {/* Overlay */}
      <div
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.sidebarOverlayOpen : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogoDesktop}>
          <Image
            src="/logo-type-white.png"
            alt="Marcatching"
            width={140}
            height={32}
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className={styles.sidebarLogo}>
          <button className={styles.hamburgerBtnSidebar} onClick={() => setIsSidebarOpen(false)}>
            <Menu size={22} color="rgba(255,255,255,0.8)" />
          </button>
          <Image
            src="/logo-type-white.png"
            alt="Marcatching"
            width={100}
            height={24}
            style={{ objectFit: 'contain' }}
          />
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '0 0 8px' }} />

        {/* User info */}
        <div style={{ padding: '12px 16px 16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Akun</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginBottom: 1 }}>{userName}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', wordBreak: 'break-all' }}>{userEmail}</div>
          </div>
        </div>

        <nav className={styles.sidenav}>
          <Link href="/course" className={styles.navItem} onClick={() => setIsSidebarOpen(false)}>
            <BookOpen size={17} /> My Courses
          </Link>
        </nav>

        <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0 16px 12px' }} />
        <div style={{ padding: '0 12px 24px' }}>
          <button onClick={handleLogout} className={styles.navItem} style={{ color: '#f87171', width: '100%' }}>
            <LogOut size={17} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.content}>
        <div className={styles.courseDetailPage}>
          {/* Back */}
          <Link href="/course" className={styles.backBtn}>
            <ArrowLeft size={15} /> Kembali ke My Courses
          </Link>

          {loading ? (
            <div className={styles.loading}><GraduationCap size={20} /> Memuat course...</div>
          ) : notEnrolled ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><GraduationCap size={28} /></div>
              <h3 className={styles.emptyTitle}>Akses Tidak Ditemukan</h3>
              <p className={styles.emptyDesc}>Kamu tidak memiliki akses ke course ini. Silakan kembali ke halaman My Courses.</p>
            </div>
          ) : !product ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Course tidak ditemukan.</h3>
            </div>
          ) : (
            <>
              {/* Course Header */}
              <div className={styles.courseDetailHeader}>
                <h1 className={styles.courseDetailTitle}>{product.name}</h1>
                {product.sub_headline && (
                  <p className={styles.courseDetailSub}>{product.sub_headline}</p>
                )}

                {total === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                    Materi sedang disiapkan. Cek kembali nanti ya! 🚀
                  </p>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {done} dari {total} materi selesai
                      </span>
                      {isComplete && (
                        <span className={`${styles.badge} ${styles.badgeGreen}`}>✓ Course Selesai!</span>
                      )}
                    </div>
                    <div className={styles.courseDetailProgress}>
                      <div className={styles.courseDetailProgressBar}>
                        <div
                          className={styles.courseDetailProgressFill}
                          style={{
                            width: `${pct}%`,
                            background: isComplete
                              ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                              : 'linear-gradient(90deg, #111111, #374151)'
                          }}
                        />
                      </div>
                      <span className={styles.courseDetailProgressLabel}>{pct}%</span>
                    </div>
                  </>
                )}
              </div>

              {/* Materials */}
              {materials.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><BookOpen size={28} /></div>
                  <h3 className={styles.emptyTitle}>Materi Belum Tersedia</h3>
                  <p className={styles.emptyDesc}>Admin sedang menyiapkan materi untuk course ini. Silakan cek kembali nanti.</p>
                </div>
              ) : (
                <div>
                  <h2 className={styles.sectionTitle} style={{ marginBottom: 14 }}>
                    Daftar Materi ({total})
                  </h2>
                  <div className={styles.materialsList}>
                    {materials.map((mat, idx) => {
                      const isDone = completedIds.has(mat.id)
                      const isOpen = openMaterial === mat.id

                      return (
                        <div
                          key={mat.id}
                          id={`material-${mat.id}`}
                          className={`${styles.materialCard} ${isDone ? styles.materialCardDone : ''}`}
                        >
                          <div className={styles.materialCardHeader}>
                            {/* Index */}
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: isDone ? '#dcfce7' : '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: isDone ? '#16a34a' : '#64748b',
                              flexShrink: 0
                            }}>
                              {isDone ? '✓' : idx + 1}
                            </div>

                            {/* Icon */}
                            <div className={`${styles.materialIconWrap} ${isDone ? styles.materialIconWrapDone : ''}`}>
                              {mat.type === 'pdf'
                                ? <FileText size={18} />
                                : <Video size={18} />
                              }
                            </div>

                            {/* Info */}
                            <div className={styles.materialInfo}>
                              <p className={`${styles.materialTitle} ${isDone ? styles.materialTitleDone : ''}`}>
                                {mat.title}
                              </p>
                              <span className={styles.materialType}>
                                {mat.type === 'pdf' ? 'PDF Dokumen' : 'Video YouTube'}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className={styles.materialActions}>
                              {/* Tandai Selesai button */}
                              <button
                                className={`${styles.completeBtn} ${isDone ? styles.completeBtnDone : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleComplete(mat.id) }}
                                disabled={togglingId === mat.id}
                                title={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                              >
                                {isDone
                                  ? <><CheckCircle2 size={14} /> Selesai</>
                                  : <><Circle size={14} /> Tandai Selesai</>
                                }
                              </button>

                              {/* Open/close viewer */}
                              <button
                                className={styles.openBtn}
                                onClick={() => toggleViewer(mat.id)}
                              >
                                {isOpen
                                  ? <><ChevronUp size={14} /> Tutup</>
                                  : <><ChevronDown size={14} /> Buka</>
                                }
                              </button>
                            </div>
                          </div>

                          {/* Viewer Panel */}
                          {isOpen && (
                            <div className={styles.viewerPanel}>
                              {mat.type === 'video' ? (
                                (() => {
                                  const ytId = getYoutubeId(mat.content_url)
                                  if (!ytId) return (
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                      URL video tidak valid. Hubungi admin.
                                    </p>
                                  )
                                  return (
                                    <div className={styles.youtubeWrap}>
                                      <iframe
                                        src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&color=white`}
                                        title={mat.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    </div>
                                  )
                                })()
                              ) : (
                                (() => {
                                  const fileId = getDriveFileId(mat.content_url)
                                  const embedUrl = fileId
                                    ? `https://drive.google.com/file/d/${fileId}/preview`
                                    : mat.content_url

                                  return (
                                    <div
                                      className={styles.pdfWrap}
                                      onContextMenu={(e) => e.preventDefault()}
                                    >
                                      {/* Transparent overlay to block right-click */}
                                      <div className={styles.pdfOverlay} onContextMenu={(e) => e.preventDefault()} />
                                      <iframe
                                        src={embedUrl + '#toolbar=0&navpanes=0&scrollbar=0'}
                                        title={mat.title}
                                        sandbox="allow-same-origin allow-scripts"
                                      />
                                    </div>
                                  )
                                })()
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
