import type { NextRequest } from 'next/server'

// Next.js may normalize nextUrl.hostname to the dev-server bind host.
// Compare with Host so inside.localhost and the production subdomain work.
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (!origin) return true
  try {
    const parsed = new URL(origin)
    return parsed.host === req.headers.get('host') && parsed.protocol === req.nextUrl.protocol
  } catch { return false }
}
