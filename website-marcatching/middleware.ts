import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply to /admin and its subpaths
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Exclude the login page itself
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for the active cookie
    const hasV2Token = request.cookies.has('marcatching_admin_v2')
    const hasV1Token = request.cookies.has('marcatching_admin')

    // If neither exists, redirect to login
    if (!hasV2Token && !hasV1Token) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
