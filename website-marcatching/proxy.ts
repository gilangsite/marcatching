import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Edge Runtime compatible — the admin-session check below stays on raw REST (no
// Supabase client needed for a single-row lookup). The member session refresh
// further down does use @supabase/ssr's createServerClient, which is Edge-safe.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
// Support both env var naming conventions (Vercel uses PUBLISHABLE_DEFAULT_KEY)
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  ''

// Same cookie-domain logic as lib/supabaseClient.ts's browser client (see the comment
// there for why *.localhost intentionally does not get a cross-subdomain domain).
function computeCookieDomain(hostname: string): string | undefined {
  if (hostname.endsWith('marcatching.com')) return '.marcatching.com'
  return undefined
}

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
        // Disable edge/fetch caching entirely - critical for Hard Exit to work
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      console.error('[proxy] Supabase session check failed:', res.status, await res.text())
      // SECURITY: fail-CLOSED — deny access on any Supabase error
      return false
    }

    const data = await res.json()
    return Array.isArray(data) && data.length > 0
  } catch (err) {
    console.error('[proxy] isValidSession error:', err)
    // SECURITY: fail-CLOSED — deny access on network error
    return false
  }
}

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone()
  const { pathname } = url
  // `nextUrl.hostname` isn't reliable for the App Router in this Next.js
  // version (it reflects the dev server's bind host, not the actual
  // request). Derive the hostname from the Host header instead, stripping
  // the port so local redirects don't end up as course.localhost:3000:3000.
  const hostname = (req.headers.get('host') || req.nextUrl.hostname).split(':')[0]

  // Member (Supabase Auth) session refresh — only bother if a session cookie is
  // already present, so anonymous traffic (most of /store, /article, etc.) doesn't
  // pay for an extra round-trip. Collected cookies get re-applied to whichever
  // response this proxy ends up returning, via withRefreshedCookies() below.
  const refreshedCookies: { name: string; value: string; options: CookieOptions }[] = []
  if (req.cookies.getAll().some(cookie => cookie.name.startsWith('sb-'))) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookieOptions: {
          domain: computeCookieDomain(hostname),
          sameSite: 'lax',
          secure: req.nextUrl.protocol === 'https:',
        },
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: cookiesToSet => { refreshedCookies.push(...cookiesToSet) },
        },
      })
      await supabase.auth.getUser()
    } catch (err) {
      console.error('[proxy] member session refresh error:', err)
    }
  }

  function withRefreshedCookies<T extends NextResponse>(res: T): T {
    for (const { name, value, options } of refreshedCookies) {
      res.cookies.set(name, value, options)
    }
    return res
  }

  let effectivePath = pathname

  // 1. Subdomain Page (Landing Page) Logic
  // page.marcatching.com → rewrite ke /page-home
  if (hostname.startsWith('page.')) {
    if (!pathname.startsWith('/page-home')) {
      effectivePath = `/page-home${pathname === '/' ? '' : pathname}`
    }
  } else if (pathname.startsWith('/page-home')) {
    // Akses langsung ke /page-home tanpa subdomain → redirect ke page.marcatching.com
    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')
    url.hostname = isLocal ? `page.${hostname}` : 'page.marcatching.com'
    url.pathname = pathname.replace('/page-home', '') || '/'
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // 2. Subdomain Course Logic
  if (hostname.startsWith('course.')) {
    if (!pathname.startsWith('/course')) {
      effectivePath = `/course${pathname === '/' ? '' : pathname}`
    }
  } else if (pathname.startsWith('/course')) {
    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')
    url.hostname = isLocal ? `course.${hostname}` : 'course.marcatching.com'
    url.pathname = pathname.replace('/course', '') || '/'
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // 2. Subdomain Admin (inside.) Logic
  if (hostname.startsWith('inside.')) {
    if (!pathname.startsWith('/admin')) {
      effectivePath = `/admin${pathname === '/' ? '' : pathname}`
    }
  } else if (pathname.startsWith('/admin')) {
    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')
    url.hostname = isLocal ? `inside.${hostname}` : 'inside.marcatching.com'
    url.pathname = pathname.replace('/admin', '') || '/'
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // 3. Protect effective /admin routes (not /admin/login)
  if (effectivePath.startsWith('/admin') && !effectivePath.startsWith('/admin/login')) {
    const loginPath = hostname.startsWith('inside.') ? '/login' : '/admin/login'
    const sessionToken = req.cookies.get('marcatching_admin_session')?.value

    // No session cookie → redirect to login
    if (!sessionToken) {
      const res = NextResponse.redirect(new URL(loginPath, req.url))
      res.cookies.set('marcatching_admin_session', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin_v2', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
      return withRefreshedCookies(res)
    }

    // Always verify against DB with no-store cache — critical for Hard Exit to work
    const valid = await isValidSession(sessionToken)
    if (!valid) {
      const res = NextResponse.redirect(new URL(loginPath, req.url))
      res.cookies.set('marcatching_admin_session', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin_v2', '', { maxAge: 0, path: '/' })
      res.cookies.set('marcatching_admin', '', { maxAge: 0, path: '/' })
      return withRefreshedCookies(res)
    }
  }

  // 4. Apply rewrite if effectivePath changed
  if (effectivePath !== pathname) {
    url.pathname = effectivePath
    return withRefreshedCookies(NextResponse.rewrite(url))
  }

  return withRefreshedCookies(NextResponse.next())
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest\\.webmanifest|sw\\.js|icons|splash|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2)).*)'],
}
