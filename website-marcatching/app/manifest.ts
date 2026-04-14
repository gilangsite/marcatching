import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Marcatching — Where Innovation Meets Marketing',
    short_name: 'Marcatching',
    description:
      'Platform yang menghubungkan bisnis dengan audiens yang tepat. Temukan tools, insight, dan strategi untuk mengembangkan brand Anda.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0f1e',
    theme_color: '#0a0f1e',
    categories: ['business', 'education', 'marketing'],
    lang: 'id',
    icons: [
      {
        src: '/icons/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/opengraph-image.png',
        sizes: '1200x630',
        type: 'image/png',
      },
    ],
  }
}
