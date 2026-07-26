import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js dev server only trusts the "localhost" origin by default.
  // Local subdomains (course./page./inside.localhost:3000) need to be
  // allow-listed here or proxy.ts sees hostname="localhost" and the
  // subdomain rewrite logic never triggers.
  allowedDevOrigins: ['*.localhost'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
  },

  async headers() {
    return [
      // -------------------------------------------------------
      // Service Worker: JANGAN pernah di-cache oleh browser.
      // Ini kunci agar browser selalu cek versi terbaru setiap
      // ada Vercel deployment baru.
      // -------------------------------------------------------
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      // -------------------------------------------------------
      // Security headers untuk semua route
      // -------------------------------------------------------
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
