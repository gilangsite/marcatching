import 'server-only'

/**
 * Single entry point for "give me JSON that matches this schema". Callers never touch a provider SDK,
 * so moving from Gemini to OpenAI/Anthropic later means adding one branch here and setting LLM_PROVIDER.
 */
export type JsonSchema = Record<string, unknown>

export type GenerateJsonInput = {
  system: string
  user: string
  /** Gemini responseSchema (OpenAPI subset, upper-case type names). */
  schema: JsonSchema
  temperature?: number
  /** Per-attempt limit. Short outputs (a sentence) can fail fast; long ones (a whole brand memory) need more. */
  timeoutMs?: number
}

export type GenerateJsonResult = { data: unknown; model: string }

export class LlmError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message)
  }
}

/**
 * Free-tier Gemini models take turns being overloaded (503) or simply not answering, so a single model is not
 * dependable. They are tried in this order until one answers. Only models Google lists as free are included, and
 * GEMINI_MODEL, when set, is tried first.
 */
const DEFAULT_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash']
const DEFAULT_ATTEMPT_MS = 25_000
/** Stay inside the routes' 60s maxDuration so the user gets a clear message instead of a platform timeout. */
const TOTAL_BUDGET_MS = 54_000
const MIN_ATTEMPT_MS = 4_000

export function geminiModelChain(preferred = process.env.GEMINI_MODEL) {
  return [...new Set([(preferred || '').trim(), ...DEFAULT_MODELS].filter(Boolean))]
}

type Attempt =
  | { kind: 'ok'; data: unknown }
  // This model could not help right now; the next one might. `busy` means capacity, not a broken request.
  | { kind: 'next'; reason: string; busy: boolean }
  // Retrying elsewhere cannot help (bad key, rejected prompt).
  | { kind: 'fatal'; error: LlmError }

async function attemptGemini(model: string, apiKey: string, input: GenerateJsonInput, timeoutMs: number): Promise<Attempt> {
  let response: Response
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: input.system }] },
        contents: [{ role: 'user', parts: [{ text: input.user }] }],
        generationConfig: {
          temperature: input.temperature ?? 0.3,
          responseMimeType: 'application/json',
          responseSchema: input.schema,
        },
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    })
  } catch {
    return { kind: 'next', reason: `no answer within ${Math.round(timeoutMs / 1000)}s`, busy: true }
  }

  if (!response.ok) {
    // Provider details stay in the server log only; they can echo prompt content.
    const detail = (await response.text().catch(() => '')).slice(0, 300)
    // Invalid key or rejected request: every model would say the same, so stop instead of burning quota.
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      console.error('[llm] gemini rejected the request', model, response.status, detail)
      return { kind: 'fatal', error: new LlmError('AI belum bisa dipakai karena pengaturan di server. Hubungi tim Marcatching.', 502) }
    }
    // 404 = model retired for this account; 429/5xx = quota or overload. Either way another model may work.
    return { kind: 'next', reason: `HTTP ${response.status} ${detail.replace(/\s+/g, ' ').slice(0, 120)}`, busy: response.status !== 404 }
  }

  const payload = await response.json().catch(() => null) as {
    promptFeedback?: { blockReason?: string }
    candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }>
  } | null
  if (payload?.promptFeedback?.blockReason) return { kind: 'fatal', error: new LlmError('AI menolak memproses isi tulisanmu. Coba ubah sedikit redaksinya.', 422) }
  const candidate = payload?.candidates?.[0]
  const text = candidate?.content?.parts?.map(part => part.text || '').join('').trim()
  if (!text) return { kind: 'next', reason: 'empty answer', busy: false }
  if (candidate?.finishReason === 'MAX_TOKENS') return { kind: 'next', reason: 'answer cut off', busy: false }
  try {
    return { kind: 'ok', data: JSON.parse(text) }
  } catch {
    return { kind: 'next', reason: 'answer was not valid JSON', busy: false }
  }
}

async function generateWithGemini(input: GenerateJsonInput): Promise<GenerateJsonResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new LlmError('AI belum dikonfigurasi di server (GEMINI_API_KEY kosong).', 503)

  const deadline = Date.now() + TOTAL_BUDGET_MS
  const failures: Array<{ model: string; reason: string; busy: boolean }> = []

  for (const model of geminiModelChain()) {
    const remaining = deadline - Date.now()
    if (remaining < MIN_ATTEMPT_MS) break
    const result = await attemptGemini(model, apiKey, input, Math.min(input.timeoutMs ?? DEFAULT_ATTEMPT_MS, remaining))
    if (result.kind === 'ok') {
      if (failures.length) console.warn('[llm] answered by', model, 'after', failures.map(failure => `${failure.model}: ${failure.reason}`).join('; '))
      return { data: result.data, model }
    }
    if (result.kind === 'fatal') throw result.error
    failures.push({ model, reason: result.reason, busy: result.busy })
  }

  console.error('[llm] every model failed', failures)
  // When the failures are overload/timeouts, say so: it is temporary and not the member's fault.
  const busy = failures.length > 0 && failures.every(failure => failure.busy)
  throw new LlmError(
    busy ? 'Layanan AI Google sedang penuh. Coba lagi dalam beberapa menit.' : 'AI belum berhasil menjawab. Coba lagi sebentar lagi.',
    busy ? 503 : 502,
  )
}

export async function generateJson(input: GenerateJsonInput): Promise<GenerateJsonResult> {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase()
  if (provider === 'gemini') return generateWithGemini(input)
  throw new LlmError(`LLM_PROVIDER "${provider}" belum didukung.`, 503)
}
