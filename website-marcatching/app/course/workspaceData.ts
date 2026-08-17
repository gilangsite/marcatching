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
}

export function createBrandMemoryMarkdown(data: WorkspaceData, updatedAt = new Date()) {
  const updated = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta' }).format(updatedAt)
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
