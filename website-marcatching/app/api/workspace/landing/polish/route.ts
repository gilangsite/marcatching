import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberApiAuth'
import { LlmError } from '@/lib/llm'
import { polishDescription } from '@/lib/landingAi'
import { cleanText } from '@/lib/landingPage'
import { HOUR_MS, takeQuota } from '@/lib/rateLimit'
import { failLanding, unauthorized } from '@/lib/landingServer'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const user = await getMemberFromRequest(request)
  if (!user?.email) return unauthorized()
  if (Number(request.headers.get('content-length') || 0) > 20_000) return failLanding('Teks terlalu panjang.', 413)

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return failLanding('Permintaan tidak valid.', 400) }

  const description = cleanText(body.description, 400)
  if (description.length < 20) return failLanding('Tulis deskripsi minimal 20 karakter dulu agar AI punya bahan untuk dipoles.', 400)
  // Same shared AI budget as Brand Memory.
  if (!takeQuota(`ai:${user.id}`, 20, HOUR_MS)) return failLanding('Kamu sudah memakai AI cukup banyak dalam satu jam terakhir. Coba lagi nanti.', 429)

  try {
    const result = await polishDescription({
      brandName: cleanText(body.brandName, 80),
      description,
      offer: cleanText(body.offer, 400),
      voice: cleanText(body.voice, 600),
    })
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    if (error instanceof LlmError) return failLanding(error.message, error.status)
    console.error('[landing] polish failed', error)
    return failLanding('Deskripsi belum berhasil dipoles.', 500)
  }
}
