import type { NextRequest } from 'next/server'

const SERVICE_SUBDOMAINS = new Set(['course', 'inside', 'page'])

function firstHeaderValue(value: string | null) {
  return value?.split(',')[0]?.trim() || ''
}

function splitHost(rawHost: string) {
  const match = rawHost.toLowerCase().match(/^([^:]+)(:\d+)?$/)
  return { hostname: match?.[1] || '', port: match?.[2] || '' }
}

function isAllowedHost(hostname: string) {
  return hostname === 'marcatching.com'
    || hostname.endsWith('.marcatching.com')
    || hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname.endsWith('.localhost')
    || hostname.endsWith('.vercel.app')
}

/**
 * Resolve the public storefront paired with the current request environment.
 * Examples:
 * course.marcatching.com -> www.marcatching.com
 * course.staging.marcatching.com -> staging.marcatching.com
 * course.localhost:3000 -> localhost:3000
 */
export function storefrontOrigin(req: Pick<NextRequest, 'headers' | 'nextUrl'>) {
  const forwardedHost = firstHeaderValue(req.headers.get('x-forwarded-host'))
  const rawHost = forwardedHost || firstHeaderValue(req.headers.get('host')) || req.nextUrl.host
  const { hostname: requestHostname, port } = splitHost(rawHost)

  if (!isAllowedHost(requestHostname)) return 'https://www.marcatching.com'

  const labels = requestHostname.split('.')
  if (SERVICE_SUBDOMAINS.has(labels[0])) labels.shift()
  let hostname = labels.join('.')
  if (hostname === 'marcatching.com') hostname = 'www.marcatching.com'

  const forwardedProtocol = firstHeaderValue(req.headers.get('x-forwarded-proto'))
  const protocol = forwardedProtocol || req.nextUrl.protocol.replace(':', '') || 'https'
  const safeProtocol = protocol === 'http' && (hostname === 'localhost' || hostname === '127.0.0.1') ? 'http' : 'https'
  return `${safeProtocol}://${hostname}${port}`
}

export function affiliateCookieDomain(storeOrigin: string) {
  const hostname = new URL(storeOrigin).hostname
  return hostname === 'marcatching.com' || hostname === 'www.marcatching.com'
    ? '.marcatching.com'
    : undefined
}
