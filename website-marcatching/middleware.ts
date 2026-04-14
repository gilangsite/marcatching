import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const hostname = req.headers.get('host') || ''

  // If accessed via the new subdomain: course.marcatching.com
  // (Also allows local testing e.g., course.localhost:3000)
  if (hostname.startsWith('course.')) {
    // We rewrite the URL internally to the /course route
    if (!url.pathname.startsWith('/course')) {
      url.pathname = `/course${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }
  } 
  // If someone accesses the old URL /course... on the main domain directly, redirect them!
  else if (req.nextUrl.pathname.startsWith('/course')) {
    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')
    url.hostname = isLocal ? `course.${hostname}` : 'course.marcatching.com'
    url.pathname = url.pathname.replace('/course', '') || '/'
    // We only redirect if it's not internal rewrite, to be safe.
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Run on all paths except static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
