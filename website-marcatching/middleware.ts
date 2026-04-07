import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // We only care about protecting /admin routes. This is double-checked by the matcher below.
  const isAuthRoute = request.nextUrl.pathname === '/admin/login'
  
  if (isAuthRoute) {
    // Let them go to the login page
    return NextResponse.next()
  }

  // Get the admin cookie (set by our /api/auth route)
  const authCookie = request.cookies.get('marcatching_admin')

  // If there is no valid cookie, kick them to login
  if (!authCookie || authCookie.value !== 'authenticated') {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Otherwise, user is authenticated, let them through
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
}
