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
}

export type GenerateJsonResult = { data: unknown; model: string }

export class LlmError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message)
  }
}

const GEMINI_DEFAULT_MODEL = 'gemini-3.8-flash'

async function generateWithGemini(input: GenerateJsonInput): Promise<GenerateJsonResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new LlmError('AI belum dikonfigurasi di server (GEMINI_API_KEY kosong).', 503)
  const model = process.env.GEMINI_MODEL?.trim() || GEMINI_DEFAULT_MODEL

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
      signal: AbortSignal.timeout(50_000),
      cache: 'no-store',
    })
  } catch {
    throw new LlmError('AI tidak merespons tepat waktu. Coba lagi sebentar lagi.', 504)
  }

  if (response.status === 429) throw new LlmError('Kuota AI sedang penuh. Coba lagi beberapa menit lagi.', 429)
  if (!response.ok) {
    // Keep provider details in the server log only; they can echo prompt content or key hints.
    console.error('[llm] gemini error', response.status, (await response.text().catch(() => '')).slice(0, 500))
    throw new LlmError('AI sedang bermasalah. Coba lagi nanti.')
  }

  const payload = await response.json() as {
    promptFeedback?: { blockReason?: string }
    candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }>
  }
  if (payload.promptFeedback?.blockReason) throw new LlmError('AI menolak memproses isi jawabanmu. Coba ubah sedikit redaksinya.', 422)
  const candidate = payload.candidates?.[0]
  const text = candidate?.content?.parts?.map(part => part.text || '').join('').trim()
  if (!text) throw new LlmError('AI tidak mengembalikan hasil. Coba lagi.')
  if (candidate?.finishReason === 'MAX_TOKENS') throw new LlmError('Hasil AI terpotong karena terlalu panjang. Coba lagi.')

  try {
    return { data: JSON.parse(text), model }
  } catch {
    throw new LlmError('Format hasil AI tidak valid. Coba lagi.')
  }
}

export async function generateJson(input: GenerateJsonInput): Promise<GenerateJsonResult> {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase()
  if (provider === 'gemini') return generateWithGemini(input)
  throw new LlmError(`LLM_PROVIDER "${provider}" belum didukung.`, 503)
}
