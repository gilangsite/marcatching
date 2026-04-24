import { NextRequest, NextResponse } from 'next/server'

// Edge Runtime compatible — NO Supabase client, use REST API directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
// Anon key also works for reads since we created table without RLS
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function isValidSession(sessionToken: string): Promise<boolean> {
  try {
    // Use service key if available, else fall back to anon key
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
        // Disable edge/fetch caching entirely - critical for session revocation
        cache: 'no-store',
      }
    )
    if (!res.ok) {
      console.error('[proxy] Supabase session check failed:', res.status, await res.text())
      // If Supabase is down, allow through to avoid locking admin out
      return true
    }
    const data = await res.json()
    return Array.isArray(data) && data.length > 0
  } catch (err) {
    console.error('[proxy] isValidSession error:', err)
    // On network error, allow through to avoid locking admin out
    return true
  }
}

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

  // 3. Protect /admin routes (not /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionToken = req.cookies.get('marcatching_admin_session')?.value
    const loginPath = hostname.startsWith('inside.') ? '/login' : '/admin/login'

    if (!sessionToken) {
      const res = NextResponse.redirect(new URL(loginPath, req.url))
      res.cookies.set('marcatching_admin_session', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin_v2', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
      return res
    }

    // Always verify against DB with no-store cache — critical for Hard Exit to work
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
