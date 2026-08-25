'use client'

import { useEffect } from 'react'

/**
 * PWARegister
 *
 * Mendaftarkan service worker notification-only dan membersihkan cache halaman
 * dari versi lama yang pernah memakai stale-while-revalidate.
 *
 * Komponen ini tidak merender apapun — hanya efek samping.
 */
export default function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Service worker menyimpan HTML lama berdasarkan origin. Di localhost ini
    // bisa membuat chunk CSS dari Next dev tidak cocok dengan halaman terbaru.
    // Lepaskan semua worker dan cache PWA saat development agar reload lokal
    // selalu menggunakan aset yang baru dibuat Turbopack.
    if (process.env.NODE_ENV === 'development') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister())
      })
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys
            .filter((key) => key.startsWith('marcatching-'))
            .forEach((key) => caches.delete(key))
        })
      }
      return
    }

    let refreshing = false
    let focusHandler: (() => void) | null = null
    const hadControllerAtMount = Boolean(navigator.serviceWorker.controller)

    async function clearLegacyPageCaches() {
      if (!('caches' in window)) return
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key.startsWith('marcatching-'))
          .map((key) => caches.delete(key))
      )
    }

    async function registerSW() {
      try {
        // Remove HTML cached by the previous worker before registering the
        // network-only replacement. This is safe to repeat on every origin.
        await clearLegacyPageCaches()

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          // Selalu ambil sw.js langsung dari network, bukan cache browser.
          // Ini krusial agar browser tahu ada SW baru setiap Vercel deploy.
          updateViaCache: 'none',
        })

        // Cek update setiap kali halaman mendapat fokus (user kembali ke tab)
        focusHandler = () => {
          registration.update().catch(() => {})
        }
        window.addEventListener('focus', focusHandler)

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
    const handleControllerChange = () => {
      // A first-time registration should not reload a page that is already
      // correct. Reload only when replacing a worker that controlled the tab.
      if (!hadControllerAtMount) return
      // Guard agar reload hanya terjadi sekali
      if (refreshing) return
      refreshing = true
      console.log('[PWA] New version available — reloading...')
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

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
      } catch {
        // Abaikan jika URL tidak valid
      }
    }

    document.addEventListener('click', handleGlobalClick)

    registerSW()

    return () => {
      document.removeEventListener('click', handleGlobalClick)
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      if (focusHandler) window.removeEventListener('focus', focusHandler)
    }
  }, [])

  // Komponen ini tidak merender UI apapun
  return null
}
