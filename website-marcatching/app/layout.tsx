import type { Metadata, Viewport } from 'next'
import './globals.css'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import PWARegister from '@/components/PWARegister'

// ----------------------------------------------------------------
// Viewport — termasuk theme color untuk browser chrome & iOS
// ----------------------------------------------------------------
export const viewport: Viewport = {
  themeColor: '#0a0f1e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // Penting untuk iPhone dengan notch
}

// ----------------------------------------------------------------
// Metadata — termasuk tag khusus iOS PWA
// ----------------------------------------------------------------
export const metadata: Metadata = {
  metadataBase: new URL('https://marcatching.com'),
  title: 'Marcatching — Where Innovation Meets Marketing',
  description: 'Marcatching is a platform that connects businesses with the right audience. Discover tools, insights, and strategies to grow your brand.',
  keywords: ['Marcatching', 'marketing', 'brand', 'digital marketing', 'Indonesia'],
  authors: [{ name: 'Marcatching' }],
  // iOS Safari PWA meta tags
  appleWebApp: {
    capable: true,                  // apple-mobile-web-app-capable
    title: 'Marcatching',           // Nama di bawah icon home screen
    statusBarStyle: 'black-translucent', // Status bar transparan (cocok untuk dark theme)
    startupImage: [
      // iPhone 14 Pro / 14 Pro Max
      {
        url: '/splash/splash-1179x2556.png',
        media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone 14 / 13 / 12
      {
        url: '/splash/splash-1170x2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone SE
      {
        url: '/splash/splash-750x1334.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  openGraph: {
    title: 'Marcatching — Where Innovation Meets Marketing',
    description: 'Marcatching is a platform that connects businesses with the right audience.',
    url: 'https://marcatching.com',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Marcatching',
    images: [{
      url: '/opengraph-image.png',
      width: 1200,
      height: 630,
      alt: 'Marcatching — Where Innovation Meets Marketing',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marcatching — Where Innovation Meets Marketing',
    description: 'Marcatching is a platform that connects businesses with the right audience.',
    images: ['/opengraph-image.png'],
  },
  robots: 'index, follow',
  // Icons — file dari realfavicongenerator (letakkan di public/icons/)
  icons: {
    // Apple Touch Icon — WAJIB untuk iPhone home screen
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    icon: [
      { url: '/icons/favicon.ico', rel: 'shortcut icon' },
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        <AnalyticsTracker />
        <PWARegister />
        {children}
      </body>
    </html>
  )
}

