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
import { contrastRatio, contrastWarnings, emptyVisualIdentity, fontOptions, googleFontsPreviewUrl, normalizeHex, sanitizeVisualIdentity } from '../../app/course/visualIdentity'

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

test('hex codes are normalized and invalid ones are dropped, never guessed', () => {
  assert.equal(normalizeHex('#1e3a8a'), '#1E3A8A')
  assert.equal(normalizeHex('1E3A8A'), '#1E3A8A')
  assert.equal(normalizeHex('#fa0'), '#FFAA00')
  for (const bad of ['', '#12', '#12345', 'blue', '#GGGGGG', '#1E3A8A; background:red', null, 5]) assert.equal(normalizeHex(bad), '')
  const identity = sanitizeVisualIdentity({ primaryColor: 'blue', secondaryColor: '#abc', headingFont: ' Poppins ', mood: 'x'.repeat(200) })
  assert.equal(identity.primaryColor, '')
  assert.equal(identity.secondaryColor, '#AABBCC')
  assert.equal(identity.headingFont, 'Poppins')
  assert.equal(identity.mood.length, 60)
  assert.deepEqual(sanitizeVisualIdentity(undefined), emptyVisualIdentity)
})

test('contrast helper matches known WCAG values and flags unreadable palettes', () => {
  assert.equal(contrastRatio('#000000', '#FFFFFF').toFixed(1), '21.0')
  assert.equal(contrastRatio('#777777', '#FFFFFF').toFixed(1), '4.5')
  assert.equal(contrastRatio('nope', '#FFFFFF'), 0)
  const bad = { ...emptyVisualIdentity, textColor: '#CCCCCC', backgroundColor: '#FFFFFF' }
  assert.equal(contrastWarnings(bad).length, 1)
  assert.equal(contrastWarnings({ ...emptyVisualIdentity, textColor: '#111111', backgroundColor: '#FFFFFF' }).length, 0)
})

test('visual identity reaches brand-memory.md verbatim in both raw and AI versions, and tells the AI not to invent when empty', () => {
  const data = workspace()
  assert.match(createBrandMemoryMarkdown(data), /## Visual Identity\nBelum diisi creator\. Jangan mengarang/)

  data.visualIdentity = { ...emptyVisualIdentity, primaryColor: '#1E3A8A', secondaryColor: '#F59E0B', headingFont: 'Poppins', bodyFont: 'Fontku Sendiri', mood: 'Minimalis & bersih', tagline: 'Kopi tanpa drama' }
  const raw = createBrandMemoryMarkdown(data)
  assert.match(raw, /\| Primary \| #1E3A8A \|/)
  assert.match(raw, /\| Secondary \| #F59E0B \|/)
  assert.doesNotMatch(raw, /Accent/)
  assert.match(raw, /Heading: \*\*Poppins\*\* \(Google Fonts, sans-serif\)\. Fallback: sans-serif/)
  assert.match(raw, /Body: \*\*Fontku Sendiri\*\*\. Jika font ini tidak tersedia/)
  assert.match(raw, /Tagline: "Kopi tanpa drama"/)

  data.refinedMemory = refined(data, 'approved')
  const ai = createBrandMemoryMarkdown(data)
  assert.match(ai, /## Offer\nisi offer/)
  assert.match(ai, /\| Primary \| #1E3A8A \|/)

  // Changing the palette is not a change to the AI-written text, so it must not invalidate the approval.
  data.visualIdentity.primaryColor = '#000000'
  assert.match(createBrandMemoryMarkdown(data), /## Offer\nisi offer/)
})

test('font preview URL only asks Google for weights each family really has', () => {
  const url = googleFontsPreviewUrl()
  assert.match(url, /family=Bebas\+Neue&/)
  assert.match(url, /family=DM\+Serif\+Display&/)
  assert.match(url, /family=Poppins:wght@400;700/)
  assert.equal(new Set(fontOptions.map(font => font.name)).size, fontOptions.length)
})
