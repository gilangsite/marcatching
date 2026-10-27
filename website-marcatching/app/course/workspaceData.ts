import { createVisualIdentityMarkdown, emptyVisualIdentity, type VisualIdentity } from './visualIdentity'

export type JourneySection =
  | 'audience'
  | 'revenue'
  | 'content'
  | 'memory'
  | 'conversion'
  | 'experiments'
  | 'metrics'
  | 'deliverables'

export type WorkspaceSection = 'overview' | JourneySection | 'calendar'

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube'

export type SocialProfile = {
  platform: SocialPlatform
  url: string
  audienceCount: number
}

export type AudienceDimension = {
  id: 'pain' | 'desire' | 'fear' | 'status' | 'friction' | 'trigger'
  label: string
  plainLabel: string
  prompt: string
  explanation: string
  insight: string
}

export type RecommendedPrompt = {
  id: string
  title: string
  category: string
  why: string
  prompt: string
}

export type CalendarItem = {
  id: string
  week: number
  title: string
  channel: string
  contentIp: string
  status: 'Idea' | 'Draft' | 'Ready' | 'Published'
}

export type ExperimentStatus = 'Draft' | 'On going' | 'Uploaded'

export type Experiment = {
  id: string
  name: string
  hypothesis: string
  contentUrl: string
  status: ExperimentStatus
  result: {
    views: number
    likes: number
    comments: number
    shares: number
    saves: number
    clicks: number
    leads: number
  }
  learning: string
  createdAt: string
}

export type MetricSnapshot = {
  id: string
  month: string
  followers: number
  averageViews: number
  engagement: number
  leads: number
  sales: number
}

export type Deliverable = {
  id: string
  code: string
  name: string
  description: string
  status: 'Not started' | 'In progress' | 'Review' | 'Approved'
}

export type BrandMemorySectionKey =
  | 'snapshot'
  | 'offer'
  | 'audience'
  | 'voice'
  | 'redLines'
  | 'proofKit'
  | 'conversion'
  | 'qualityGate'

/** Order and markdown headings of the AI-refined brand-memory.md. Headings match the raw template so import/export keeps working. */
export const brandMemorySections: Array<{ key: BrandMemorySectionKey; title: string }> = [
  { key: 'snapshot', title: 'Brand Snapshot' },
  { key: 'offer', title: 'Offer' },
  { key: 'audience', title: 'Audience Facts' },
  { key: 'voice', title: 'Creator Voice' },
  { key: 'redLines', title: 'Redlines' },
  { key: 'proofKit', title: 'Proof Kit' },
  { key: 'conversion', title: 'Conversion Path' },
  { key: 'qualityGate', title: 'Output Quality Gate' },
]

export type BrandInterviewQuestion = {
  id: string
  topic: BrandMemorySectionKey
  question: string
  why: string
  answer: string
}

/** Clarifying questions the AI asked before writing. Lives in the workspace so answers survive a refresh. */
export type BrandInterview = {
  status: 'asking' | 'done'
  inputHash: string
  questions: BrandInterviewQuestion[]
}

export type RefinedBrandMemory = {
  /** Only an approved version replaces the raw template in downloads and Skill ZIPs. */
  status: 'draft' | 'approved'
  /** Hash of the raw inputs it was written from; a mismatch means the raw answers changed since. */
  inputHash: string
  generatedAt: string
  model: string
  sections: Record<BrandMemorySectionKey, string>
  gaps: string[]
  warnings: string[]
}

export type BrandMemoryInput = { id: string; group: string; label: string; value: string }

export type WorkspaceData = {
  version: 2
  creatorName: string
  businessType: string
  primaryGoal: string
  socialProfiles: SocialProfile[]
  onboarding: {
    socialSetupDone: boolean
    completedSections: JourneySection[]
    skippedSections: JourneySection[]
    unlockedAt: string
  }
  audience: AudienceDimension[]
  revenue: {
    buyer: string
    problem: string
    whyNow: string
    offer: string
    proof: string
    testimonials: string
    numbersData: string
    processEvidence: string
    limitations: string
    revenuePath: string
  }
  contentRole: 'content-creator' | 'digital-marketer' | ''
  recommendedPrompts: RecommendedPrompt[]
  contentExperimentSuggestion: string
  memory: {
    voice: string
    redLines: string
    audienceFacts: string
    qualityGate: string
    experimentLearnings: string
  }
  conversion: {
    attention: string
    profile: string
    lead: string
    nurture: string
    close: string
    primaryCta: string
    successPoint: string
  }
  experiments: Experiment[]
  metrics: MetricSnapshot[]
  deliverables: Deliverable[]
  calendar: CalendarItem[]
  /** Per-skill customization answers, keyed by product_id, then by the requirement field's key. */
  skillRequirements: Record<string, Record<string, string>>
  brandInterview: BrandInterview | null
  refinedMemory: RefinedBrandMemory | null
  /** Optional colors, fonts and style notes. Written into brand-memory.md verbatim, never rewritten by the AI. */
  visualIdentity: VisualIdentity
}

export const journeyOrder: JourneySection[] = [
  'audience',
  'revenue',
  'content',
  'memory',
  'conversion',
  'experiments',
  'metrics',
  'deliverables',
]

export const workspaceSections: Array<{
  id: WorkspaceSection
  label: string
  description: string
}> = [
  { id: 'overview', label: 'Overview', description: 'Seluruh sistem dalam satu pandangan' },
  { id: 'audience', label: 'Audience OS', description: 'Kenali cara pembeli berpikir' },
  { id: 'revenue', label: 'Revenue Thesis', description: 'Alasan orang membeli dari kamu' },
  { id: 'content', label: 'Content IP', description: 'Prompt paling relevan untukmu' },
  { id: 'memory', label: 'AI Memory', description: 'Brand context yang bisa dipakai ulang' },
  { id: 'conversion', label: 'Conversion Map', description: 'Jalur perhatian sampai hasil' },
  { id: 'experiments', label: 'Experiments', description: 'Uji konten dan simpan hasilnya' },
  { id: 'metrics', label: 'Metric Scorecard', description: 'Catatan perkembangan per bulan' },
  { id: 'deliverables', label: 'Deliverables', description: 'Status output yang harus selesai' },
  { id: 'calendar', label: '30-Day Map', description: 'Rencana eksekusi setelah setup' },
]

export const defaultAudience: AudienceDimension[] = [
  {
    id: 'pain',
    label: 'Pain',
    plainLabel: 'Masalah utama',
    prompt: 'Jika pembeli kamu adalah orang yang kamu jelaskan tadi, masalah apa yang paling mengganggu mereka sekarang?',
    explanation: 'Pain bukan sekadar keluhan umum. Cari situasi nyata yang membuat mereka berhenti, frustrasi, rugi waktu, atau merasa hasilnya tidak bergerak.',
    insight: '',
  },
  {
    id: 'desire',
    label: 'Desire',
    plainLabel: 'Hasil yang diharapkan',
    prompt: 'Kalau masalah itu selesai, hasil seperti apa yang paling mereka harapkan?',
    explanation: 'Desire adalah perubahan yang ingin mereka rasakan atau tunjukkan. Tulis hasil akhirnya, bukan hanya fitur yang mereka beli.',
    insight: '',
  },
  {
    id: 'fear',
    label: 'Fear',
    plainLabel: 'Hal yang ditakutkan',
    prompt: 'Apa yang paling mereka takutkan jika memilih solusi yang salah atau tidak melakukan apa-apa?',
    explanation: 'Fear menjelaskan risiko yang ada di kepala pembeli: gagal lagi, membuang uang, terlihat tidak kompeten, atau kehilangan kesempatan.',
    insight: '',
  },
  {
    id: 'status',
    label: 'Status',
    plainLabel: 'Identitas yang ingin dibangun',
    prompt: 'Setelah berhasil, mereka ingin dikenal sebagai orang seperti apa?',
    explanation: 'Status adalah identitas yang ingin mereka miliki di mata diri sendiri atau orang lain—misalnya lebih profesional, konsisten, atau dipercaya.',
    insight: '',
  },
  {
    id: 'friction',
    label: 'Friction',
    plainLabel: 'Alasan belum bertindak',
    prompt: 'Apa yang membuat mereka masih menunda meskipun masalahnya sudah terasa?',
    explanation: 'Friction adalah hambatan untuk bergerak: harga, waktu, proses yang rumit, kurang percaya, atau tidak tahu harus mulai dari mana.',
    insight: '',
  },
  {
    id: 'trigger',
    label: 'Trigger',
    plainLabel: 'Momen pemicu',
    prompt: 'Peristiwa apa yang biasanya membuat mereka akhirnya berkata, “aku harus mulai sekarang”?',
    explanation: 'Trigger adalah momen yang mengubah niat menjadi tindakan—deadline, hasil yang turun, komentar tertentu, kebutuhan mendadak, atau target baru.',
    insight: '',
  },
]

export const defaultDeliverables: Deliverable[] = [
  { id: 'd1', code: '01', name: 'Audience OS', description: 'Enam insight pembeli yang sudah cukup spesifik untuk dipakai membuat pesan.', status: 'Not started' },
  { id: 'd2', code: '02', name: 'Revenue Thesis', description: 'Satu alasan yang jelas kenapa target pembeli memilih offer kamu sekarang.', status: 'Not started' },
  { id: 'd3', code: '03', name: 'Prompt Stack', description: 'Tiga prompt utama sesuai role dan konteks bisnis kamu.', status: 'Not started' },
  { id: 'd4', code: '04', name: 'Brand Memory', description: 'File brand-memory.md yang siap dipakai di Marcatching Prompt Library.', status: 'Not started' },
  { id: 'd5', code: '05', name: 'Conversion Map', description: 'Jalur dari perhatian menuju primary CTA dan success point.', status: 'Not started' },
  { id: 'd6', code: '06', name: 'Experiment Log', description: 'Konten yang diuji, status publikasi, hasil, dan learning-nya.', status: 'Not started' },
  { id: 'd7', code: '07', name: 'Monthly Scorecard', description: 'Snapshot bulanan untuk membaca perubahan akun secara manual.', status: 'Not started' },
  { id: 'd8', code: '08', name: '30-Day Map', description: 'Rencana konten lanjutan berdasarkan sistem yang sudah dibangun.', status: 'Not started' },
]

export const defaultWorkspaceData: WorkspaceData = {
  version: 2,
  creatorName: '',
  businessType: '',
  primaryGoal: '',
  socialProfiles: [
    { platform: 'instagram', url: '', audienceCount: 0 },
    { platform: 'tiktok', url: '', audienceCount: 0 },
    { platform: 'youtube', url: '', audienceCount: 0 },
  ],
  onboarding: {
    socialSetupDone: false,
    completedSections: [],
    skippedSections: [],
    unlockedAt: '',
  },
  audience: defaultAudience,
  revenue: {
    buyer: '',
    problem: '',
    whyNow: '',
    offer: '',
    proof: '',
    testimonials: '',
    numbersData: '',
    processEvidence: '',
    limitations: '',
    revenuePath: '',
  },
  contentRole: '',
  recommendedPrompts: [],
  contentExperimentSuggestion: '',
  memory: {
    voice: '',
    redLines: '',
    audienceFacts: '',
    qualityGate: '',
    experimentLearnings: '',
  },
  conversion: {
    attention: '',
    profile: '',
    lead: '',
    nurture: '',
    close: '',
    primaryCta: '',
    successPoint: '',
  },
  experiments: [],
  metrics: [],
  deliverables: defaultDeliverables,
  calendar: [],
  skillRequirements: {},
  brandInterview: null,
  refinedMemory: null,
  visualIdentity: { ...emptyVisualIdentity },
}

const revenueInputLabels: Array<[keyof WorkspaceData['revenue'], string]> = [
  ['buyer', 'Buyer (siapa yang membeli)'],
  ['problem', 'Core Problem (masalah yang dibayar)'],
  ['whyNow', 'Why Now (alasan membeli sekarang)'],
  ['offer', 'Offer (solusi yang dijual)'],
  ['proof', 'Proof (alasan untuk percaya)'],
  ['testimonials', 'Testimonials (kutipan nyata pembeli)'],
  ['numbersData', 'Numbers/Data (angka pendukung klaim)'],
  ['processEvidence', 'Process Evidence (bukti cara kerja)'],
  ['limitations', 'Limitations (batasan yang jujur diungkap)'],
  ['revenuePath', 'Revenue Path (jalur menuju transaksi)'],
]

const memoryInputLabels: Array<[keyof WorkspaceData['memory'], string]> = [
  ['voice', 'Creator voice'],
  ['redLines', 'Redlines'],
  ['audienceFacts', 'Audience facts'],
  ['qualityGate', 'Output quality gate'],
]

const conversionInputLabels: Array<[keyof WorkspaceData['conversion'], string]> = [
  ['attention', 'Attention (orang berhenti melihat)'],
  ['profile', 'Profile (orang memeriksa kamu)'],
  ['lead', 'Lead (sinyal minat)'],
  ['nurture', 'Nurture (orang memahami value)'],
  ['close', 'Close (keputusan membeli)'],
  ['primaryCta', 'Primary CTA'],
  ['successPoint', 'Success Point'],
]

/**
 * Flattens everything the creator typed that should shape the brand memory. Experiment learnings and
 * Skill Requirements are left out on purpose: they are appended verbatim, never rewritten by the AI.
 */
export function collectBrandMemoryInputs(data: WorkspaceData): BrandMemoryInput[] {
  const inputs: BrandMemoryInput[] = []
  const add = (id: string, group: string, label: string, value: unknown) => {
    const text = typeof value === 'string' ? value.trim() : ''
    if (text) inputs.push({ id, group, label, value: text })
  }

  add('profile.creatorName', 'Identitas', 'Nama brand/creator', data.creatorName)
  add('profile.businessType', 'Identitas', 'Jenis bisnis', data.businessType)
  add('profile.primaryGoal', 'Identitas', 'Tujuan utama', data.primaryGoal)
  const socials = (Array.isArray(data.socialProfiles) ? data.socialProfiles : [])
    .filter(profile => profile.url?.trim())
    .map(profile => `${profile.platform}: ${profile.url.trim()}${profile.audienceCount > 0 ? ` (${profile.audienceCount} audiens)` : ''}`)
  add('profile.social', 'Identitas', 'Akun sosial media', socials.join('\n'))
  for (const dimension of Array.isArray(data.audience) ? data.audience : []) {
    add(`audience.${dimension.id}`, 'Audience OS', `${dimension.label} (${dimension.plainLabel})`, dimension.insight)
  }
  for (const [key, label] of revenueInputLabels) add(`revenue.${key}`, 'Revenue Thesis', label, data.revenue?.[key])
  for (const [key, label] of memoryInputLabels) add(`memory.${key}`, 'AI Memory', label, data.memory?.[key])
  for (const [key, label] of conversionInputLabels) add(`conversion.${key}`, 'Conversion Map', label, data.conversion?.[key])
  return inputs
}

/** FNV-1a. Only used to notice that the raw answers changed, not for anything security related. */
export function hashBrandMemoryInputs(data: WorkspaceData) {
  const source = collectBrandMemoryInputs(data).map(input => `${input.id}\u0000${input.value}`).join('\u0001')
  let hash = 0x811c9dc5
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

const brandMemorySectionKeys = brandMemorySections.map(section => section.key)

function cleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function cleanStringList(value: unknown, maxItems: number, maxLength: number) {
  return Array.isArray(value) ? value.map(item => cleanString(item, maxLength)).filter(Boolean).slice(0, maxItems) : []
}

export function sanitizeRefinedMemory(value: unknown): RefinedBrandMemory | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const saved = value as Record<string, unknown>
  const rawSections = saved.sections && typeof saved.sections === 'object' ? saved.sections as Record<string, unknown> : null
  if (!rawSections) return null
  const sections = Object.fromEntries(brandMemorySectionKeys.map(key => [key, cleanString(rawSections[key], 6000)])) as Record<BrandMemorySectionKey, string>
  if (!brandMemorySectionKeys.some(key => sections[key])) return null
  return {
    status: saved.status === 'approved' ? 'approved' : 'draft',
    inputHash: cleanString(saved.inputHash, 16),
    generatedAt: cleanString(saved.generatedAt, 40),
    model: cleanString(saved.model, 80),
    sections,
    gaps: cleanStringList(saved.gaps, 12, 300),
    warnings: cleanStringList(saved.warnings, 12, 300),
  }
}

export function sanitizeBrandInterview(value: unknown): BrandInterview | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const saved = value as Record<string, unknown>
  if (!Array.isArray(saved.questions)) return null
  const questions = saved.questions.flatMap((item, index): BrandInterviewQuestion[] => {
    if (!item || typeof item !== 'object') return []
    const question = item as Record<string, unknown>
    const text = cleanString(question.question, 400)
    if (!text) return []
    return [{
      id: cleanString(question.id, 40) || `q${index + 1}`,
      topic: brandMemorySectionKeys.includes(question.topic as BrandMemorySectionKey) ? question.topic as BrandMemorySectionKey : 'snapshot',
      question: text,
      why: cleanString(question.why, 300),
      answer: cleanString(question.answer, 2000),
    }]
  }).slice(0, 8)
  return { status: saved.status === 'asking' ? 'asking' : 'done', inputHash: cleanString(saved.inputHash, 16), questions }
}

/** The AI version only replaces the raw template once the creator approved it AND the raw answers have not changed since. */
export function isRefinedMemoryCurrent(data: WorkspaceData) {
  const refined = sanitizeRefinedMemory(data.refinedMemory)
  return Boolean(refined && refined.status === 'approved' && refined.inputHash === hashBrandMemoryInputs(data))
}

function createRefinedBrandMemoryMarkdown(data: WorkspaceData, refined: RefinedBrandMemory, updated: string) {
  const lines = [
    '# Brand Memory',
    '',
    `Updated: ${updated}`,
    `Brand/Creator: ${data.creatorName.trim() || 'Belum diisi'}`,
    '',
    '> Dirapikan dengan AI dari jawaban creator dan sudah disetujui creator. Jika sebuah informasi tidak tercantum di sini, anggap belum diketahui dan tanyakan ke creator — jangan mengarang.',
    '',
  ]
  for (const { key, title } of brandMemorySections) {
    lines.push(`## ${title}`, refined.sections[key] || 'Belum ada informasi.', '')
  }
  lines.push('## Primary CTA', data.conversion.primaryCta || 'Belum diisi di Conversion Map.', '')
  lines.push(createVisualIdentityMarkdown(data.visualIdentity), '')
  if (refined.gaps.length) {
    lines.push('## Belum Diketahui', 'Hal berikut belum dijawab creator. Jangan diisi dengan asumsi:', ...refined.gaps.map(gap => `- ${gap}`), '')
  }
  lines.push('## Experiment Learnings', data.memory.experimentLearnings || 'Belum ada experiment learning yang diimpor.', '')
  return lines.join('\n')
}

export function createBrandMemoryMarkdown(data: WorkspaceData, updatedAt = new Date()) {
  const updated = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta' }).format(updatedAt)
  if (isRefinedMemoryCurrent(data)) return createRefinedBrandMemoryMarkdown(data, sanitizeRefinedMemory(data.refinedMemory) as RefinedBrandMemory, updated)
  return [
    '# Brand Memory',
    '',
    `Updated: ${updated}`,
    `Brand/Creator: ${data.creatorName.trim() || 'Belum diisi'}`,
    '',
    '## Offer',
    data.revenue.offer || 'Belum diisi di Revenue Thesis.',
    '',
    '## Creator Voice',
    data.memory.voice,
    '',
    '## Redlines',
    data.memory.redLines,
    '',
    '## Audience Facts',
    data.memory.audienceFacts,
    '',
    '## Proof Kit',
    '### General Proof',
    data.revenue.proof || 'Belum diisi di Revenue Thesis.',
    '### Testimonials',
    data.revenue.testimonials || 'Belum ada testimoni yang dicatat.',
    '### Numbers/Data',
    data.revenue.numbersData || 'Belum ada angka/data yang dicatat.',
    '### Process Evidence',
    data.revenue.processEvidence || 'Belum ada bukti proses/mekanisme yang dicatat.',
    '### Limitations / Honest Notes',
    data.revenue.limitations || 'Belum ada batasan yang dicatat — jangan mengarang klaim di luar apa yang tersedia di atas.',
    '',
    '## Primary CTA',
    data.conversion.primaryCta || 'Belum diisi di Conversion Map.',
    '',
    createVisualIdentityMarkdown(data.visualIdentity),
    '',
    '## Output Quality Gate',
    data.memory.qualityGate,
    '',
    '## Experiment Learnings',
    data.memory.experimentLearnings || 'Belum ada experiment learning yang diimpor.',
    '',
  ].join('\n')
}

function textRatio(value: unknown, target: number) {
  return Math.min((typeof value === 'string' ? value.trim().length : 0) / target, 1)
}

export function calculateWorkspaceProgress(data: WorkspaceData) {
  const scores: number[] = []
  const socialProfiles = Array.isArray(data.socialProfiles) ? data.socialProfiles : []
  const audience = Array.isArray(data.audience) ? data.audience : []
  const experiments = Array.isArray(data.experiments) ? data.experiments : []
  const metrics = Array.isArray(data.metrics) ? data.metrics : []
  const deliverables = Array.isArray(data.deliverables) ? data.deliverables : []

  scores.push(Math.min(socialProfiles.filter(profile => profile?.url?.trim()).length / 3, 1))
  defaultAudience.forEach(dimension => scores.push(textRatio(audience.find(item => item.id === dimension.id)?.insight, 120)))
  const revenue = data.revenue || defaultWorkspaceData.revenue
  Object.values(revenue).forEach(value => scores.push(textRatio(value, 140)))
  scores.push(data.contentRole ? 1 : 0)
  scores.push(Math.min((Array.isArray(data.recommendedPrompts) ? data.recommendedPrompts.length : 0) / 3, 1))
  const memory = data.memory || defaultWorkspaceData.memory
  ;(['voice', 'redLines', 'audienceFacts', 'qualityGate'] as const).forEach(field => scores.push(textRatio(memory[field], 240)))
  const conversion = data.conversion || defaultWorkspaceData.conversion
  ;(['attention', 'profile', 'lead', 'nurture', 'close', 'primaryCta', 'successPoint'] as const).forEach(field => scores.push(textRatio(conversion[field], 90)))
  scores.push(Math.min(experiments.length, 1))
  const measuredExperiments = experiments.filter(item => Number(item?.result?.views || 0) > 0).length
  scores.push(experiments.length ? Math.min(measuredExperiments / experiments.length, 1) : 0)
  scores.push(Math.min(metrics.length / 3, 1))
  scores.push(deliverables.length ? deliverables.filter(item => item.status !== 'Not started').length / deliverables.length : 0)
  const raw = scores.reduce((total, score) => total + score, 0) / scores.length
  return Math.min(99, Math.floor(raw * 99))
}
