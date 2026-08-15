'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  GraduationCap,
  Layers3,
  Play,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { CourseMaterial, Product } from '@/lib/supabaseClient'
import { calculateWorkspaceProgress, type WorkspaceData } from './workspaceData'
import SkillLibrary from './SkillLibrary'
import styles from './course.module.css'

type EnrolledCourse = Product & {
  materials: CourseMaterial[]
  completedCount: number
}

function displayNameFromEmail(email: string) {
  const prefix = email.split('@')[0] || 'Builder'
  return prefix
    .split(/[._-]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function imageUrl(url: string) {
  return url.includes('drive.google.com/uc')
    ? `${url.replace(/uc\?export=view&id=/, 'thumbnail?id=')}&sz=w900-h1500`
    : url
}

export default function CourseDashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [workspaceProgress, setWorkspaceProgress] = useState(0)
  const [workspaceSectionsDone, setWorkspaceSectionsDone] = useState(0)

  useEffect(() => {
    void loadDashboard()
    // This initial request should only run once when the member opens the dashboard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadDashboard() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/login')
      return
    }

    const email = (user.email || '').toLowerCase().trim()
    setUserName(displayNameFromEmail(email))

    const { data: workspaceRow } = await supabase
      .from('creator_workspaces')
      .select('data')
      .eq('user_id', user.id)
      .maybeSingle()
    if (workspaceRow?.data) {
      const workspaceData = workspaceRow.data as WorkspaceData
      setWorkspaceProgress(calculateWorkspaceProgress(workspaceData))
      setWorkspaceSectionsDone(Array.isArray(workspaceData.onboarding?.completedSections) ? workspaceData.onboarding.completedSections.length : 0)
    }

    const { data: enrollments } = await supabase
      .from('course_access_emails')
      .select('product_id')
      .eq('email', email)

    if (!enrollments?.length) {
      setCourses([])
      setLoading(false)
      return
    }

    const productIds = [...new Set(enrollments.map(item => item.product_id).filter((id): id is string => typeof id === 'string' && id.length > 0))]
    const [{ data: products }, { data: materials }] = await Promise.all([
      supabase.from('products').select('*').in('id', productIds),
      supabase.from('course_materials').select('*').in('product_id', productIds).neq('type', 'zip').order('order_index'),
    ])

    if (!products) {
      setLoading(false)
      return
    }

    const courseMaterials = (materials || []) as CourseMaterial[]
    const materialIds = courseMaterials.map(material => material.id)
    const { data: progress } = materialIds.length
      ? await supabase.from('learning_progress').select('material_id').eq('user_id', user.id).in('material_id', materialIds)
      : { data: [] }
    const completedIds = new Set((progress || []).map(item => item.material_id))
    const enriched = products.flatMap(product => {
      const productMaterials = courseMaterials.filter(material => material.product_id === product.id)
      if (!productMaterials.length) return []
      return [{ ...product, materials: productMaterials, completedCount: productMaterials.filter(material => completedIds.has(material.id)).length }]
    })

    setCourses(enriched)
    setLoading(false)
  }

  const totals = useMemo(() => {
    const materials = courses.reduce((sum, course) => sum + course.materials.length, 0)
    const completed = courses.reduce((sum, course) => sum + course.completedCount, 0)
    const percentage = materials ? Math.round((completed / materials) * 100) : 0
    return { materials, completed, percentage }
  }, [courses])

  const continueCourse = useMemo(() => {
    return courses.find(course => course.completedCount < course.materials.length) || courses[0] || null
  }, [courses])

  const continuePercentage = continueCourse?.materials.length
    ? Math.round((continueCourse.completedCount / continueCourse.materials.length) * 100)
    : 0

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}><Compass size={14} /> Learning home</span>
          <h1>Selamat datang, {userName || 'Builder'}.</h1>
          <p>Satu tempat untuk melanjutkan materi, melihat progress, dan mengubah insight menjadi sistem.</p>
        </div>
        <Link href="/workspace" className={styles.secondaryButton}>
          <Sparkles size={16} /> Buka Creator Workspace
        </Link>
      </header>

      <section className={styles.statsGrid} aria-label="Ringkasan progress">
        <article className={styles.statCard}>
          <span className={styles.statIcon}><Layers3 size={18} /></span>
          <div><small>Course aktif</small><strong>{loading ? '—' : courses.length}</strong></div>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statIcon}><CheckCircle2 size={18} /></span>
          <div><small>Materi selesai</small><strong>{loading ? '—' : `${totals.completed}/${totals.materials}`}</strong></div>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statIcon}><TrendingUp size={18} /></span>
          <div><small>Overall progress</small><strong>{loading ? '—' : `${totals.percentage}%`}</strong></div>
        </article>
      </section>

      {!loading && continueCourse && (
        <section className={styles.continueCard}>
          <div className={styles.continueVisual}>
            {continueCourse.image_url ? (
              // Product cover URLs are administered content and can use providers outside Next Image allowlists.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl(continueCourse.image_url)} alt="" />
            ) : (
              <GraduationCap size={44} />
            )}
            <span><Play size={14} fill="currentColor" /> Continue learning</span>
          </div>
          <div className={styles.continueCopy}>
            <span className={styles.cardKicker}>Next best action</span>
            <h2>{continueCourse.name}</h2>
            <p>{continueCourse.sub_headline || 'Lanjutkan dari materi yang belum selesai.'}</p>
            <div className={styles.continueMeta}>
              <span><BookOpen size={14} /> {continueCourse.materials.length} materi</span>
              <span><Clock3 size={14} /> {continueCourse.materials.length - continueCourse.completedCount} tersisa</span>
            </div>
            <div className={styles.progressTrack} aria-label={`${continuePercentage}% selesai`}>
              <span style={{ width: `${continuePercentage}%` }} />
            </div>
            <div className={styles.continueFooter}>
              <small>{continuePercentage}% selesai</small>
              <Link href={`/${continueCourse.slug}`} className={styles.primaryButton}>
                Lanjutkan course <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className={styles.workspaceBanner}>
        <div className={styles.workspaceBannerCopy}>
          <span className={styles.cardKicker}><Sparkles size={13} /> New operating layer</span>
          <h2>Course member sekarang punya Creator Revenue Workspace.</h2>
          <p>
            Strukturkan Audience OS, Revenue Thesis, tiga Content IP, conversion path, eksperimen,
            dan scorecard dalam satu alur kerja.
          </p>
          <Link href="/workspace" className={styles.primaryButton}>
            Masuk ke workspace <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.workspaceBlueprint} aria-hidden="true">
          <div className={styles.blueprintTop}><span /> Creator Revenue OS <b>{workspaceSectionsDone}/8 sections</b></div>
          <div className={styles.blueprintBody}>
            <div className={styles.blueprintScore}><strong>{workspaceProgress}%</strong><span>Real data filled</span></div>
            <div className={styles.blueprintLine}><i style={{ width: `${workspaceProgress}%` }} /></div>
            <div className={styles.blueprintModules}>
              <span className={workspaceSectionsDone >= 1 ? styles.blueprintDone : styles.blueprintActive}>Audience OS {workspaceSectionsDone >= 1 ? <CheckCircle2 size={13} /> : <Target size={13} />}</span>
              <span className={workspaceSectionsDone >= 2 ? styles.blueprintDone : styles.blueprintActive}>Revenue Thesis {workspaceSectionsDone >= 2 ? <CheckCircle2 size={13} /> : <Target size={13} />}</span>
              <span className={workspaceSectionsDone >= 3 ? styles.blueprintDone : styles.blueprintActive}>Content IP {workspaceSectionsDone >= 3 ? <CheckCircle2 size={13} /> : <Target size={13} />}</span>
            </div>
          </div>
        </div>
      </section>

      <SkillLibrary />

      <section className={styles.courseSection}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.cardKicker}>Your library</span>
            <h2>Course saya</h2>
          </div>
          <span>{courses.length} course</span>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <span className={styles.loader} />
            Menyiapkan learning space...
          </div>
        ) : courses.length === 0 ? (
          <div className={styles.emptyState}>
            <span><GraduationCap size={27} /></span>
            <h3>Course belum muncul.</h3>
            <p>
              Akses akan tampil setelah pembayaran dikonfirmasi. Jika sudah melakukan pembayaran,
              hubungi tim Marcatching menggunakan email checkout.
            </p>
            <a href="mailto:gilang@marcatching.com" className={styles.secondaryButton}>Hubungi support</a>
          </div>
        ) : (
          <div className={styles.courseGrid}>
            {courses.map(course => {
              const total = course.materials.length
              const done = course.completedCount
              const percentage = total ? Math.round((done / total) * 100) : 0
              const complete = total > 0 && done === total

              return (
                <Link key={course.id} href={`/${course.slug}`} className={styles.courseCard}>
                  <div className={styles.courseCover}>
                    {course.image_url ? (
                      // Product cover URLs are administered content and can use providers outside Next Image allowlists.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl(course.image_url)} alt={course.name} />
                    ) : (
                      <GraduationCap size={38} />
                    )}
                    <span className={complete ? styles.statusComplete : styles.statusActive}>
                      {complete ? 'Completed' : 'In progress'}
                    </span>
                  </div>
                  <div className={styles.courseCardBody}>
                    <span className={styles.cardKicker}>{total} learning assets</span>
                    <h3>{course.name}</h3>
                    <p>{course.sub_headline || 'Materi praktis untuk membangun marketing system.'}</p>
                    <div className={styles.progressTrack}><span style={{ width: `${percentage}%` }} /></div>
                    <div className={styles.courseCardFooter}>
                      <small>{done}/{total} selesai · {percentage}%</small>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
