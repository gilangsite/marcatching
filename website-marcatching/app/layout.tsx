import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Marcatching — Where Innovation Meets Marketing',
  description: 'Marcatching is a platform that connects businesses with the right audience. Discover tools, insights, and strategies to grow your brand.',
  keywords: ['Marcatching', 'marketing', 'brand', 'digital marketing', 'Indonesia'],
  authors: [{ name: 'Marcatching' }],
  openGraph: {
    title: 'Marcatching — Where Innovation Meets Marketing',
    description: 'Marcatching is a platform that connects businesses with the right audience.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Marcatching',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marcatching',
    description: 'Where Innovation Meets Marketing',
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
      <body>{children}</body>
    </html>
  )
}
