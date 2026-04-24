import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// Only create the client if we're actually going to use it, but since env vars are present it's safe at module scope.
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone()
  const { pathname } = url
  const hostname = req.headers.get('host') || ''

  // 1. Subdomain Course Logic
  if (hostname.startsWith('course.')) {
    if (!pathname.startsWith('/course')) {
      url.pathname = `/course${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }
  } else if (pathname.startsWith('/course')) {
    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')
    url.hostname = isLocal ? `course.${hostname}` : 'course.marcatching.com'
    url.pathname = pathname.replace('/course', '') || '/'
    return NextResponse.redirect(url)
  }

  // 2. Subdomain Admin (inside.) Logic
  if (hostname.startsWith('inside.')) {
    // Rewrite all inside.marcatching.com/* → internal /admin/*
    if (!pathname.startsWith('/admin')) {
      url.pathname = `/admin${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }
  } else if (pathname.startsWith('/admin')) {
    // Redirect old marcatching.com/admin/* → inside.marcatching.com/*
    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')
    url.hostname = isLocal ? `inside.${hostname}` : 'inside.marcatching.com'
    url.pathname = pathname.replace('/admin', '') || '/'
    return NextResponse.redirect(url)
  }

  // 3. Protect /admin routes (not /admin/login) – applies after rewrite
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionCookie = req.cookies.get('marcatching_admin_session')
    
    // Determine the correct login URL to redirect to based on the current hostname
    const loginPath = hostname.startsWith('inside.') ? '/login' : '/admin/login'
    
    if (!sessionCookie?.value) {
      const res = NextResponse.redirect(new URL(loginPath, req.url))
      res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin_v2', '', { maxAge: 0, path: '/' })
      return res
    }

    // Verify session token in DB
    const { data } = await supabase
      .from('admin_sessions')
      .select('id')
      .eq('session_token', sessionCookie.value)
      .single()
      
    if (!data) {
      // Invalid session (logged out from another device)
      const res = NextResponse.redirect(new URL(loginPath, req.url))
      res.cookies.set('marcatching_admin_session', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin_v2', '', { maxAge: 0, path: '/' })
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest\\.webmanifest|sw\\.js|icons|splash).*)'],
}
