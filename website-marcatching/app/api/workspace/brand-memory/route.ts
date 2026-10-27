import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberApiAuth'
import { LlmError } from '@/lib/llm'
import { HOUR_MS, takeQuota } from '@/lib/rateLimit'
import { askClarifyingQuestions, parseAnswers, parseInputs, writeBrandMemory } from '@/lib/brandMemoryAi'

export const maxDuration = 60

const MAX_CALLS_PER_WINDOW = 20
const MAX_BODY_BYTES = 120_000
const MIN_INPUT_CHARS = 200

function fail(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(request: NextRequest) {
  const user = await getMemberFromRequest(request)
  if (!user?.email) return fail('Sesi kamu sudah berakhir. Login kembali untuk melanjutkan.', 401)

  const declaredLength = Number(request.headers.get('content-length') || 0)
  if (declaredLength > MAX_BODY_BYTES) return fail('Jawaban terlalu panjang untuk dirapikan.', 413)

  let body: { action?: unknown; inputs?: unknown; answers?: unknown }
  try {
    body = await request.json()
  } catch {
    return fail('Permintaan tidak valid.', 400)
  }

  const inputs = parseInputs(body.inputs)
  const answers = parseAnswers(body.answers)
  const totalChars = inputs.reduce((sum, input) => sum + input.value.length, 0)
  if (totalChars < MIN_INPUT_CHARS) return fail('Lengkapi dulu jawaban di Creator Workspace sebelum dirapikan AI.', 400)

  if (body.action !== 'analyze' && body.action !== 'generate') return fail('Aksi tidak dikenal.', 400)
  // One shared AI budget per member across Brand Memory and landing page polishing.
  if (!takeQuota(`ai:${user.id}`, MAX_CALLS_PER_WINDOW, HOUR_MS)) return fail('Kamu sudah memakai AI cukup banyak dalam satu jam terakhir. Coba lagi nanti.', 429)

  try {
    if (body.action === 'analyze') {
      const questions = await askClarifyingQuestions(inputs, answers)
      return NextResponse.json({ questions }, { headers: { 'Cache-Control': 'private, no-store' } })
    }
    const result = await writeBrandMemory(inputs, answers)
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    if (error instanceof LlmError) return fail(error.message, error.status)
    console.error('[brand-memory] unexpected error', error)
    return fail(error instanceof Error ? error.message : 'Brand Memory belum berhasil dirapikan.', 500)
  }
}
