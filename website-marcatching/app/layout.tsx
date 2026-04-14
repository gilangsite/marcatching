import type { Metadata } from 'next'
import './globals.css'
import AnalyticsTracker from '@/components/AnalyticsTracker'

export const metadata: Metadata = {
  metadataBase: new URL('https://marcatching.com'),
  title: 'Marcatching — Where Innovation Meets Marketing',
  description: 'Marcatching is a platform that connects businesses with the right audience. Discover tools, insights, and strategies to grow your brand.',
  keywords: ['Marcatching', 'marketing', 'brand', 'digital marketing', 'Indonesia'],
  authors: [{ name: 'Marcatching' }],
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
        {children}
      </body>
    </html>
  )
}

