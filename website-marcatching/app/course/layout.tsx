'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Don't guard the login page itself
    if (pathname === '/login') {
      setChecking(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setChecking(false)
      }
    })

    // Listen for auth state changes (e.g. logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/login') {
        router.replace('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  // Show nothing while checking auth (prevents flash)
  if (checking && pathname !== '/login') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f6fa',
        color: '#94a3b8',
        fontSize: '0.9rem',
        fontFamily: 'Inter, sans-serif',
        gap: '10px'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Memuat...
      </div>
    )
  }

  return <>{children}</>
}
