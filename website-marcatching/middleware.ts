import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl
  
  // Protect /admin routes, but allow /admin/login
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
  // If the host is exactly inside.marcatching.com, we protect the root too
  const isInsideDomain = host === 'inside.marcatching.com' && pathname !== '/admin/login' && pathname !== '/api/auth'
  
  if (isAdminRoute || isInsideDomain) {
    const authCookie = request.cookies.get('marcatching_admin')?.value
    
    if (authCookie !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Also protect API routes related to admin tasks if needed, 
  // but many API routes check auth individually or don't.
  // We'll leave the API routes as they are or protect specific ones if we know them.

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
