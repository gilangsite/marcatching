import 'server-only'

// Best-effort guard per server instance. It stops one user hammering an endpoint, but it is not a hard
// global quota: move it to a table if limits must be exact across instances.
const buckets = new Map<string, number[]>()

export function takeQuota(key: string, max: number, windowMs: number) {
  const now = Date.now()
  const calls = (buckets.get(key) || []).filter(time => now - time < windowMs)
  if (calls.length >= max) {
    buckets.set(key, calls)
    return false
  }
  calls.push(now)
  buckets.set(key, calls)
  if (buckets.size > 5000) {
    for (const [name, times] of buckets) if (!times.some(time => now - time < windowMs)) buckets.delete(name)
  }
  return true
}

export const HOUR_MS = 60 * 60 * 1000
