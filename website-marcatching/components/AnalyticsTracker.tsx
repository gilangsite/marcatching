'use client'

import { useEffect, useRef } from 'react'

// Generate or retrieve a session ID for this browser session
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem('_mc_sid')
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem('_mc_sid', sid)
  }
  return sid
}

// Send analytics event to API
async function sendEvent(payload: {
  event_type: 'page_view' | 'click'
  page_path?: string
  link_id?: string
  link_title?: string
}) {
  try {
    const sessionId = getSessionId()
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        session_id: sessionId,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
      }),
    })
  } catch {
    // Silently fail — analytics should never break user experience
  }
}

// Declare global tracking function type
declare global {
  interface Window {
    __trackClick: (linkId: string, linkTitle: string) => void
  }
}

export default function AnalyticsTracker() {
  const tracked = useRef(false)

  useEffect(() => {
    // Skip tracking on admin pages
    if (window.location.pathname.startsWith('/admin')) return

    // Track page view (once per mount)
    if (!tracked.current) {
      tracked.current = true
      sendEvent({
        event_type: 'page_view',
        page_path: window.location.pathname + window.location.search,
      })
    }

    // Expose global click tracker for button components
    window.__trackClick = (linkId: string, linkTitle: string) => {
      sendEvent({
        event_type: 'click',
        page_path: window.location.pathname + window.location.search,
        link_id: linkId,
        link_title: linkTitle,
      })
    }
  }, [])

  return null // invisible component
}
