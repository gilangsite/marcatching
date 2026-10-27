import test from 'node:test'
import assert from 'node:assert/strict'
import Module from 'node:module'
import {
  brandMemorySections,
  createBrandMemoryMarkdown,
  defaultWorkspaceData,
  hashBrandMemoryInputs,
  sanitizeBrandInterview,
  sanitizeRefinedMemory,
  type RefinedBrandMemory,
  type WorkspaceData,
} from '../../app/course/workspaceData'

// `server-only` is resolved by Next's bundler, not by Node, so stub it for the server modules under test.
const moduleLoader = Module as unknown as { _load: (request: string, ...rest: unknown[]) => unknown }
const originalLoad = moduleLoader._load
moduleLoader._load = function (this: unknown, request: string, ...rest: unknown[]) {
  return request === 'server-only' ? {} : originalLoad.call(this, request, ...rest)
}

function workspace(): WorkspaceData {
  const data = JSON.parse(JSON.stringify(defaultWorkspaceData)) as WorkspaceData
  data.creatorName = 'Kopi Sore'
  data.revenue.offer = 'Kelas barista online 4 minggu'
  data.memory.voice = 'santai, pakai "gue-lo" sesekali'
  data.conversion.primaryCta = 'Daftar kelas via WhatsApp'
  return data
}

function refined(data: WorkspaceData, status: RefinedBrandMemory['status']): RefinedBrandMemory {
  return {
    status,
    inputHash: hashBrandMemoryInputs(data),
    generatedAt: '2026-10-27T00:00:00.000Z',
    model: 'test',
    sections: Object.fromEntries(brandMemorySections.map(section => [section.key, `isi ${section.key}`])) as RefinedBrandMemory['sections'],
    gaps: ['Harga kelas belum diketahui'],
    warnings: [],
  }
}

test('raw template is used until the AI version is approved, then the AI version replaces it', () => {
  const data = workspace()
  data.refinedMemory = refined(data, 'draft')
  assert.match(createBrandMemoryMarkdown(data), /## Offer\nKelas barista online/)

  data.refinedMemory = refined(data, 'approved')
  const markdown = createBrandMemoryMarkdown(data)
  assert.match(markdown, /## Offer\nisi offer/)
  assert.match(markdown, /## Creator Voice\nisi voice/)
  assert.match(markdown, /## Primary CTA\nDaftar kelas via WhatsApp/)
  assert.match(markdown, /Harga kelas belum diketahui/)
})

test('an approved AI version is ignored once the raw answers change, so new answers are never silently dropped', () => {
  const data = workspace()
  data.refinedMemory = refined(data, 'approved')
  data.revenue.offer = 'Kelas barista online 8 minggu'
  const markdown = createBrandMemoryMarkdown(data)
  assert.match(markdown, /8 minggu/)
  assert.doesNotMatch(markdown, /isi offer/)
})

test('editing the AI text or experiment learnings does not invalidate the approval', () => {
  const data = workspace()
  data.refinedMemory = refined(data, 'approved')
  data.refinedMemory.sections.voice = 'diedit creator'
  data.memory.experimentLearnings = 'Hook cerita naik 2x'
  const markdown = createBrandMemoryMarkdown(data)
  assert.match(markdown, /## Creator Voice\ndiedit creator/)
  assert.match(markdown, /## Experiment Learnings\nHook cerita naik 2x/)
})

test('sanitizers drop malformed saved data instead of crashing', () => {
  assert.equal(sanitizeRefinedMemory('x'), null)
  assert.equal(sanitizeRefinedMemory({ sections: {} }), null)
  assert.equal(sanitizeBrandInterview({ questions: 'nope' }), null)
  const interview = sanitizeBrandInterview({ status: 'asking', inputHash: 'abc', questions: [{ question: 'Berapa harganya?', topic: 'bogus', answer: 5 }, null, { question: '' }] })
  assert.equal(interview?.questions.length, 1)
  assert.equal(interview?.questions[0].topic, 'snapshot')
  assert.equal(interview?.questions[0].answer, '')
})

test('Gemini responses are validated: headings flattened, unknown numbers flagged, bad shape rejected', async () => {
  process.env.GEMINI_API_KEY = 'test-key'
  const { writeBrandMemory, askClarifyingQuestions } = await import('../../lib/brandMemoryAi')
  const inputs = [{ id: 'revenue.offer', group: 'Revenue Thesis', label: 'Offer', value: 'Kelas barista 4 minggu seharga Rp 500.000' }]
  const gemini = (body: unknown, init?: ResponseInit) => {
    globalThis.fetch = (async () => new Response(JSON.stringify(body), { status: 200, ...init })) as typeof fetch
  }
  const wrap = (value: unknown) => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(value) }] } }] })

  const sections = Object.fromEntries(brandMemorySections.map(section => [section.key, 'ok'])) as Record<string, string>
  sections.offer = '# Judul\nKelas 4 minggu, Rp 500000, sudah 120 murid.'
  gemini(wrap({ sections, gaps: ['Testimoni belum ada'] }))
  const result = await writeBrandMemory(inputs, [])
  assert.equal(result.sections.offer.startsWith('**Judul**'), true)
  assert.equal(result.warnings.length, 1)
  assert.match(result.warnings[0], /120/)
  assert.doesNotMatch(result.warnings[0], /500000/)

  gemini(wrap({ sections: {}, gaps: [] }))
  await assert.rejects(() => writeBrandMemory(inputs, []))

  gemini(wrap({ questions: [
    { topic: 'voice', question: 'Contoh kalimat khasmu?', why: 'Agar gaya tidak generik' },
    { topic: 'voice', question: 'contoh kalimat khasmu?', why: 'duplikat' },
    { topic: 'nonsense', question: 'Berapa harga?', why: 'x' },
  ] }))
  const questions = await askClarifyingQuestions(inputs, [])
  assert.deepEqual(questions.map(question => question.topic), ['voice', 'snapshot'])

  gemini({}, { status: 429 })
  await assert.rejects(() => askClarifyingQuestions(inputs, []), /Kuota AI/)
})
