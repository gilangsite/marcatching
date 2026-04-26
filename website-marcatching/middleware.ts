import { NextRequest, NextResponse } from 'next/server'

// Edge Runtime compatible — NO Supabase client, use REST API directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function isValidSession(sessionToken: string): Promise<boolean> {
  try {
    const authKey = supabaseServiceKey || supabaseAnonKey
    const res = await fetch(
      `${supabaseUrl}/rest/v1/admin_sessions?session_token=eq.${encodeURIComponent(sessionToken)}&select=id&limit=1`,
      {
        method: 'GET',
        headers: {
          'apikey': authKey,
          'Authorization': `Bearer ${authKey}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      console.error('[middleware] Supabase session check failed:', res.status)
      // SECURITY: on Supabase error, DENY access (fail-closed)
      return false
    }

    const data = await res.json()
    return Array.isArray(data) && data.length > 0
  } catch (err) {
    console.error('[middleware] isValidSession error:', err)
    // SECURITY: on network error, DENY access (fail-closed)
    return false
  }
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const { pathname } = url
  const hostname = req.headers.get('host') || ''

  // ── 1. Subdomain routing: course. ──────────────────────────────
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

  // ── 2. Subdomain routing: inside. ──────────────────────────────
  if (hostname.startsWith('inside.')) {
    if (!pathname.startsWith('/admin')) {
      url.pathname = `/admin${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }
  } else if (pathname.startsWith('/admin')) {
    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')
    url.hostname = isLocal ? `inside.${hostname}` : 'inside.marcatching.com'
    url.pathname = pathname.replace('/admin', '') || '/'
    return NextResponse.redirect(url)
  }

  // ── 3. Protect /admin routes (except /admin/login) ─────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const loginPath = hostname.startsWith('inside.') ? '/login' : '/admin/login'

    const sessionToken = req.cookies.get('marcatching_admin_session')?.value

    // No session cookie at all → redirect to login
    if (!sessionToken) {
      const res = NextResponse.redirect(new URL(loginPath, req.url))
      // Clear all legacy cookies just in case
      res.cookies.set('marcatching_admin_session', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin_v2', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
      return res
    }

    // Always verify session token against DB (no-store = bypasses edge cache)
    const valid = await isValidSession(sessionToken)
    if (!valid) {
      const res = NextResponse.redirect(new URL(loginPath, req.url))
      res.cookies.set('marcatching_admin_session', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin_v2', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest\\.webmanifest|sw\\.js|icons|splash).*)'],
}
