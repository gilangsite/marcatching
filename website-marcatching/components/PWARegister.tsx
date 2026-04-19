'use client'

import { useEffect } from 'react'

/**
 * PWARegister
 *
 * Komponen ini melakukan dua hal:
 * 1. Mendaftarkan Service Worker (/sw.js) ke browser
 * 2. Mendeteksi saat SW baru tersedia (setelah Vercel deploy)
 *    dan memuat ulang halaman secara otomatis agar user
 *    langsung mendapatkan versi terbaru tanpa harus menutup app.
 *
 * Komponen ini tidak merender apapun — hanya efek samping.
 */
export default function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let refreshing = false

    async function registerSW() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          // Selalu ambil sw.js langsung dari network, bukan cache browser.
          // Ini krusial agar browser tahu ada SW baru setiap Vercel deploy.
          updateViaCache: 'none',
        })

        // Cek update setiap kali halaman mendapat fokus (user kembali ke tab)
        window.addEventListener('focus', () => {
          registration.update().catch(() => {})
        })

        // --------------------------------------------------------
        // Deteksi SW baru: ada dua skenario
        // --------------------------------------------------------

        // Skenario A: SW baru sudah menunggu saat halaman dimuat
        if (registration.waiting) {
          activateNewSW(registration.waiting)
        }

        // Skenario B: SW baru ditemukan saat app sudah berjalan
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            // SW baru sudah diinstall dan sedang menunggu aktivasi
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              activateNewSW(newWorker)
            }
          })
        })
      } catch (err) {
        console.error('[PWA] Service Worker registration failed:', err)
      }
    }

    function activateNewSW(worker: ServiceWorker) {
      // Kirim sinyal SKIP_WAITING agar SW baru langsung aktif
      worker.postMessage({ type: 'SKIP_WAITING' })
    }

    // Listener: saat SW controller berubah (SW baru mengambil alih),
    // reload halaman agar user mendapatkan konten terbaru.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Guard agar reload hanya terjadi sekali
      if (refreshing) return
      refreshing = true
      console.log('[PWA] New version available — reloading...')
      window.location.reload()
    })

    // --------------------------------------------------------
    // Global Click Interceptor untuk PWA cross-subdomain
    // --------------------------------------------------------
    const handleGlobalClick = (e: MouseEvent) => {
      // Jika Next.js sudah handle klik ini (misalnya navigasi SPA via <Link>), kita biarkan saja.
      if (e.defaultPrevented) return

      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (!anchor) return

      const href = anchor.href
      if (!href) return

      // Jangan cegat link yang memiliki target="_blank"
      if (anchor.target === '_blank') return

      try {
        const url = new URL(href)
        const isMarcatchingURL =
          url.hostname === 'marcatching.com' ||
          url.hostname.endsWith('.marcatching.com') ||
          url.hostname === 'localhost' ||
          url.hostname.includes('192.168.') // untuk testing lokal

        const isSameOrigin = url.origin === window.location.origin

        if (isMarcatchingURL && !isSameOrigin) {
          // Paksa buka link menggunakan assign agar iOS standalone PWA tidak 
          // membuka Safari open in external browser jika pindah antar subdomain.
          e.preventDefault()
          window.location.assign(url.href)
        }
      } catch (err) {
        // Abaikan jika URL tidak valid
      }
    }

    document.addEventListener('click', handleGlobalClick)

    registerSW()

    return () => {
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [])

  // Komponen ini tidak merender UI apapun
  return null
}
