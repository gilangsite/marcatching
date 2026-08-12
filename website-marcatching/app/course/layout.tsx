'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import CourseShell from './CourseShell'
import styles from './course.module.css'

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthPage = pathname === '/login'
    || pathname === '/course/login'
    || pathname === '/reset-password'
    || pathname === '/course/reset-password'
  const [checking, setChecking] = useState(!isAuthPage)

  useEffect(() => {
    // Login and password recovery validate their own access state.
    if (isAuthPage) {
      return
    }

    let active = true
    const fallbackTimer = window.setTimeout(() => {
      if (active) router.replace('/login')
    }, 8000)

    void supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!active) return
        window.clearTimeout(fallbackTimer)
        if (!session) {
          router.replace('/login')
        } else {
          setChecking(false)
        }
      })
      .catch(() => {
        if (!active) return
        window.clearTimeout(fallbackTimer)
        router.replace('/login')
      })

    // Listen for auth state changes (e.g. logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isAuthPage) {
        router.replace('/login')
      }
    })

    return () => {
      active = false
      window.clearTimeout(fallbackTimer)
      subscription.unsubscribe()
    }
  }, [isAuthPage, router])

  // Show nothing while checking auth (prevents flash)
  if (checking && !isAuthPage) {
    return (
      <div className={styles.gateLoading}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Memuat...
      </div>
    )
  }

  if (isAuthPage) return <>{children}</>

  return <CourseShell>{children}</CourseShell>
}
