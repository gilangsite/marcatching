import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberApiAuth'
import { LlmError } from '@/lib/llm'
import { askClarifyingQuestions, parseAnswers, parseInputs, writeBrandMemory } from '@/lib/brandMemoryAi'

export const maxDuration = 60

const WINDOW_MS = 60 * 60 * 1000
const MAX_CALLS_PER_WINDOW = 12
const MAX_BODY_BYTES = 120_000
const MIN_INPUT_CHARS = 200

// Best-effort guard against runaway cost on the free tier. It is per server instance, so it caps a single
// user hammering one instance but is not a hard global quota; move to a table if limits must be exact.
const recentCalls = new Map<string, number[]>()

function takeQuota(userId: string) {
  const now = Date.now()
  const calls = (recentCalls.get(userId) || []).filter(time => now - time < WINDOW_MS)
  if (calls.length >= MAX_CALLS_PER_WINDOW) {
    recentCalls.set(userId, calls)
    return false
  }
  calls.push(now)
  recentCalls.set(userId, calls)
  if (recentCalls.size > 5000) {
    for (const [key, times] of recentCalls) if (!times.some(time => now - time < WINDOW_MS)) recentCalls.delete(key)
  }
  return true
}

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
  if (!takeQuota(user.id)) return fail('Kamu sudah memakai AI cukup banyak dalam satu jam terakhir. Coba lagi nanti.', 429)

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
