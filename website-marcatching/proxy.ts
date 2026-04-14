import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone()
  const { pathname } = url
  const hostname = req.headers.get('host') || ''

  // 1. Only protect /admin routes (not /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const authCookie = req.cookies.get('marcatching_admin')
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // 2. Subdomain Course Logic
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

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
