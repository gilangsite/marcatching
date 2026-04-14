'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookOpen, LogOut, Menu, GraduationCap, ChevronRight
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Product, CourseMaterial } from '@/lib/supabaseClient'
import styles from './course.module.css'

type EnrolledCourse = Product & {
  materials: CourseMaterial[]
  completedCount: number
}

export default function CourseDashboardPage() {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    const email = user.email || ''
    setUserEmail(email)
    // Use display name from email prefix, capitalize
    const namePart = email.split('@')[0]
    setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1))

    // Get enrollments for this user by their registered email
    const { data: enrollments } = await supabase
      .from('course_access_emails')
      .select('product_id')
      .eq('email', email.toLowerCase().trim())

    if (!enrollments || enrollments.length === 0) {
      setLoading(false)
      setCourses([])
      return
    }

    const productIds = enrollments.map((e) => e.product_id)

    // Get products
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (!products) { setLoading(false); return }

    // For each product, get materials & user's completed materials
    const enriched: EnrolledCourse[] = await Promise.all(
      products.map(async (product) => {
        const { data: materials } = await supabase
          .from('course_materials')
          .select('*')
          .eq('product_id', product.id)
          .order('order_index')

        const materialIds = (materials || []).map((m) => m.id)
        let completedCount = 0

        if (materialIds.length > 0) {
          const { data: progress } = await supabase
            .from('learning_progress')
            .select('material_id')
            .eq('user_id', user.id)
            .in('material_id', materialIds)

          completedCount = progress?.length || 0
        }

        return { ...product, materials: materials || [], completedCount }
      })
    )

    setCourses(enriched)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className={styles.page}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button className={styles.hamburgerBtn} onClick={() => setIsSidebarOpen(true)}>
          <Menu size={22} color="#ffffff" />
        </button>
        <Image
          src="https://marcatching.com/logo-type-white.png"
          alt="Marcatching"
          width={110}
          height={26}
          className={styles.mobileHeaderLogo}
          unoptimized={true}
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
            src="https://marcatching.com/logo-type-white.png"
            alt="Marcatching"
            width={140}
            height={32}
            style={{ objectFit: 'contain' }}
            unoptimized={true}
          />
        </div>
        <div className={styles.sidebarLogo}>
          <button className={styles.hamburgerBtnSidebar} onClick={() => setIsSidebarOpen(false)}>
            <Menu size={22} color="rgba(255,255,255,0.8)" />
          </button>
          <Image
            src="https://marcatching.com/logo-type-white.png"
            alt="Marcatching"
            width={100}
            height={24}
            style={{ objectFit: 'contain' }}
            unoptimized={true}
          />
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '0 0 8px' }} />

        {/* User info */}
        <div style={{ padding: '12px 16px 16px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Akun</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginBottom: 1 }}>{userName}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', wordBreak: 'break-all' }}>{userEmail}</div>
          </div>
        </div>

        <nav className={styles.sidenav}>
          <Link
            href="/"
            className={`${styles.navItem} ${styles.navItemActive}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <BookOpen size={17} /> My Courses
          </Link>
        </nav>

        <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0 16px 12px' }} />
        <div style={{ paddingBottom: 24, padding: '0 12px 24px' }}>
          <button onClick={handleLogout} className={styles.navItem} style={{ color: '#f87171', width: '100%' }}>
            <LogOut size={17} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.content}>
        {/* Greeting */}
        <div className={styles.greetingSection}>
          <p className={styles.greetingLabel}>Marcatching E-Course</p>
          <h1 className={styles.greetingName}>Halo, {userName}!</h1>
          <p className={styles.greetingSubtitle}>
            Berikut adalah course yang kamu miliki. Selamat belajar!
          </p>
        </div>

        {/* Course List */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Course Saya</h2>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            {courses.length} course
          </span>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <GraduationCap size={20} /> Memuat course kamu...
          </div>
        ) : courses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <GraduationCap size={28} />
            </div>
            <h3 className={styles.emptyTitle}>Belum ada course</h3>
            <p className={styles.emptyDesc}>
              Course kamu akan muncul di sini setelah pembayaran dikonfirmasi oleh admin Marcatching.
              Jika sudah dikonfirmasi namun course belum muncul, coba logout dan login kembali.
            </p>
          </div>
        ) : (
          <div className={styles.courseGrid}>
            {courses.map((course) => {
              const total = course.materials.length
              const done = course.completedCount
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              const isComplete = total > 0 && done === total

              return (
                <Link
                  key={course.id}
                  href={`/${course.slug}`}
                  className={styles.courseCard}
                  id={`course-card-${course.slug}`}
                >
                  {course.image_url ? (
                    <img
                      src={
                        course.image_url.includes('drive.google.com/uc')
                          ? course.image_url.replace(/uc\?export=view&id=/, 'thumbnail?id=') + '&sz=w1200-h900'
                          : course.image_url
                      }
                      alt={course.name}
                      className={styles.courseCardImage}
                    />
                  ) : (
                    <div className={styles.courseCardImagePlaceholder}>
                      <GraduationCap size={40} />
                    </div>
                  )}
                  <div className={styles.courseCardBody}>
                    {isComplete && (
                      <span className={`${styles.badge} ${styles.badgeGreen}`} style={{ marginBottom: 8 }}>
                        ✓ Selesai
                      </span>
                    )}
                    <h3 className={styles.courseCardTitle}>{course.name}</h3>
                    {course.sub_headline && (
                      <p className={styles.courseCardSub}>{course.sub_headline}</p>
                    )}
                    <p className={styles.courseCardMeta}>
                      {total} materi · {done} selesai
                    </p>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${isComplete ? styles.progressFillGreen : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className={styles.progressLabel}>{pct}% selesai</span>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
