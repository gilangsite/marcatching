import { NextResponse } from 'next/server'
import { promptLibrary, type PromptRole } from '@/src/data/promptLibrary'

type PromptRequest = {
  role?: PromptRole
  audience?: Record<string, unknown>
  revenue?: Record<string, unknown>
  experimentSuggestion?: unknown
}

function cleanText(value: unknown, maxLength = 1600) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function tokens(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\u1e00-\u1eff]+/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
}

function stripFence(value: string) {
  return value.replace(/```text\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as PromptRequest
    const role: PromptRole = body.role === 'content-creator' ? 'content-creator' : 'digital-marketer'
    const audience = body.audience && typeof body.audience === 'object' ? body.audience : {}
    const revenue = body.revenue && typeof body.revenue === 'object' ? body.revenue : {}
    const contextValues = [...Object.values(audience), ...Object.values(revenue)].map(value => cleanText(value)).filter(Boolean)
    const contextText = contextValues.join(' ')
    const contextTokens = new Set(tokens(contextText))

    const ranked = promptLibrary
      .filter(prompt => prompt.role === role)
      .map(prompt => {
        const haystack = [prompt.title, prompt.categoryLabel, prompt.psychologicalJob, ...prompt.tags, ...prompt.bestUsedFor].join(' ').toLowerCase()
        let score = Math.max(0, 120 - prompt.recommendedOrder)
        contextTokens.forEach(token => {
          if (haystack.includes(token)) score += 18
        })
        if (cleanText(audience.fear) && /trust|risk|fear|skeptic|proof/i.test(haystack)) score += 16
        if (cleanText(audience.friction) && /friction|conversion|objection|cta|risk/i.test(haystack)) score += 14
        if (cleanText(revenue.offer) && /offer|conversion|sales|value|position/i.test(haystack)) score += 14
        if (cleanText(body.experimentSuggestion) && /content|hook|creative|campaign|copy/i.test(haystack)) score += 12
        return { prompt, score }
      })
      .sort((a, b) => b.score - a.score)

    const selected: typeof ranked = []
    const categories = new Set<string>()
    for (const candidate of ranked) {
      if (selected.length >= 3) break
      if (!categories.has(candidate.prompt.category) || ranked.length - selected.length <= 3) {
        selected.push(candidate)
        categories.add(candidate.prompt.category)
      }
    }
    for (const candidate of ranked) {
      if (selected.length >= 3) break
      if (!selected.some(item => item.prompt.id === candidate.prompt.id)) selected.push(candidate)
    }

    const personalizedContext = [
      '# PERSONAL CONTEXT FROM CREATOR WORKSPACE',
      '',
      'Gunakan konteks di bawah sebagai sumber utama. Jika sebuah field kosong, jangan mengarang datanya.',
      '',
      ...Object.entries(audience).map(([key, value]) => `- Audience ${key}: ${cleanText(value) || 'Belum diisi'}`),
      ...Object.entries(revenue).map(([key, value]) => `- Revenue ${key}: ${cleanText(value) || 'Belum diisi'}`),
      cleanText(body.experimentSuggestion) ? `- Experiment learning: ${cleanText(body.experimentSuggestion)}` : '',
      '',
      '# SELECTED MARCATCHING PROMPT',
      '',
    ].filter(Boolean).join('\n')

    const prompts = selected.map(({ prompt }) => ({
      id: prompt.id,
      title: prompt.title,
      category: prompt.categoryLabel,
      why: `Dipilih karena job “${prompt.shortDescription}” paling dekat dengan Audience OS dan Revenue Thesis yang kamu isi.`,
      prompt: `${personalizedContext}\n${stripFence(prompt.fullPrompt)}`,
    }))

    return NextResponse.json({ prompts }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ message: 'Request prompt tidak valid' }, { status: 400 })
  }
}
