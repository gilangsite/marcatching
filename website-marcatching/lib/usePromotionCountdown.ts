'use client'

import { useEffect, useState } from 'react'

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number; expired: boolean }

// Shared by the course dashboard (dark theme) and /store (light theme) promo
// surfaces — each renders these parts with its own markup, this hook only
// owns the ticking/date math. Passing `endsAt: null` means "no countdown
// configured" and the hook returns null so callers render no timer row.
export function usePromotionCountdown(endsAt: string | null, onExpire?: () => void): CountdownParts | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!endsAt) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [endsAt])

  const remainingMs = endsAt ? new Date(endsAt).getTime() - now : null
  const expired = remainingMs !== null && remainingMs <= 0

  useEffect(() => {
    if (expired) onExpire?.()
    // onExpire is expected to be a stable callback (or safely re-invokable); only `expired` should retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired])

  if (!endsAt) return null
  if (expired) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }

  const totalSeconds = Math.floor((remainingMs as number) / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: false,
  }
}
