'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  Link2,
  LockKeyhole,
  Network,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react'
import {
  defaultAudience,
  defaultWorkspaceData,
  calculateWorkspaceProgress,
  journeyOrder,
  workspaceSections,
  type AudienceDimension,
  type CalendarItem,
  type Deliverable,
  type Experiment,
  type ExperimentStatus,
  type JourneySection,
  type MetricSnapshot,
  type RecommendedPrompt,
  type SocialPlatform,
  type WorkspaceData,
  type WorkspaceSection,
} from '../workspaceData'
import SkillLibrary from '../SkillLibrary'
import styles from './workspace.module.css'

const LEGACY_STORAGE_KEY = 'marcatching-creator-workspace-v1'
const RECOVERY_STORAGE_KEY = 'marcatching-creator-workspace-recovery-v2'
const audienceTarget = 120
const paragraphTarget = 240

const sectionIcons: Record<WorkspaceSection, React.ComponentType<{ size?: number }>> = {
  overview: LayoutDashboard,
  audience: Users,
  revenue: Target,
  content: Lightbulb,
  memory: BrainCircuit,
  conversion: Network,
  experiments: FlaskConical,
  metrics: BarChart3,
  deliverables: ClipboardCheck,
  calendar: CalendarDays,
}

const journeyCopy: Record<JourneySection, { label: string; eyebrow: string; intro: string }> = {
  audience: {
    label: 'Audience OS',
    eyebrow: 'Kenali pembelimu',
    intro: 'Enam jawaban ini menjadi fondasi untuk offer, pesan, prompt, dan eksperimen berikutnya.',
  },
  revenue: {
    label: 'Revenue Thesis',
    eyebrow: 'Hubungkan insight ke pembelian',
    intro: 'Revenue Thesis adalah hipotesis sederhana tentang siapa yang membeli, kenapa sekarang, dan jalur paling masuk akal menuju transaksi.',
  },
  content: {
    label: 'Content IP',
    eyebrow: 'Bangun prompt stack',
    intro: 'Pilih peranmu. Marcatching akan mengambil tiga prompt paling relevan dari Prompt Library berdasarkan Audience OS dan Revenue Thesis.',
  },
  memory: {
    label: 'AI Memory',
    eyebrow: 'Buat brand-memory.md',
    intro: 'Empat paragraf ini membuat AI memahami cara brandmu berpikir, berbicara, dan menilai kualitas—tanpa mengulang briefing dari nol.',
  },
  conversion: {
    label: 'Conversion Map',
    eyebrow: 'Tentukan next action',
    intro: 'Petakan apa yang terjadi setelah orang melihat konten sampai mereka mencapai hasil yang benar-benar bernilai untuk bisnis kamu.',
  },
  experiments: {
    label: 'Experiment',
    eyebrow: 'Ubah konten menjadi learning',
    intro: 'Simpan link konten, status publikasi, dan hasilnya. Data ini akan memperbaiki Content IP dan Brand Memory kamu.',
  },
  metrics: {
    label: 'Metric Scorecard',
    eyebrow: 'Catat perkembangan bulanan',
    intro: 'Masukkan snapshot akun secara manual setiap bulan agar perubahan terlihat dari data, bukan perasaan.',
  },
  deliverables: {
    label: 'Deliverables',
    eyebrow: 'Jadikan output terlihat',
    intro: 'Update status setiap output. Status dibuat besar supaya kamu langsung tahu apa yang belum bergerak.',
  },
}

const revenueFields: Array<{
  key: keyof WorkspaceData['revenue']
  term: string
  plain: string
  question: string
  explanation: string
}> = [
  { key: 'buyer', term: 'Buyer', plain: 'Siapa yang membeli', question: 'Siapa orang paling spesifik yang ingin kamu bantu dan mampu membeli offer ini?', explanation: 'Hindari “semua orang”. Jelaskan peran, situasi, level pengalaman, dan kondisi yang membuat mereka relevan.' },
  { key: 'problem', term: 'Core Problem', plain: 'Masalah yang dibayar', question: 'Masalah apa yang cukup penting sampai mereka mau membayar untuk menyelesaikannya?', explanation: 'Pilih masalah yang memiliki dampak nyata pada waktu, uang, performa, reputasi, atau ketenangan mereka.' },
  { key: 'whyNow', term: 'Why Now', plain: 'Alasan membeli sekarang', question: 'Kenapa masalah ini perlu diselesaikan sekarang, bukan enam bulan lagi?', explanation: 'Cari tekanan waktu yang jujur: target, perubahan kondisi, biaya menunda, atau momentum yang sedang terbuka.' },
  { key: 'offer', term: 'Offer', plain: 'Solusi yang kamu jual', question: 'Solusi apa yang kamu tawarkan, untuk hasil apa, dan dalam bentuk apa?', explanation: 'Jelaskan deliverable atau pengalaman yang mereka beli—bukan slogan. Buat satu kalimat yang mudah diulang.' },
  { key: 'proof', term: 'Proof', plain: 'Alasan untuk percaya', question: 'Bukti apa yang membuat pembeli merasa aman untuk percaya?', explanation: 'Bisa berupa hasil, proses, pengalaman, contoh pekerjaan, testimoni, atau batasan yang dijelaskan dengan jujur.' },
  { key: 'revenuePath', term: 'Revenue Path', plain: 'Jalur menuju transaksi', question: 'Dari konten, langkah apa saja yang mereka lalui sampai menjadi pembeli?', explanation: 'Contoh: konten → profile → DM → diagnostic call → payment. Pilih jalur terpendek yang tetap terasa masuk akal.' },
]

const memoryFields: Array<{
  key: 'voice' | 'redLines' | 'audienceFacts' | 'qualityGate'
  label: string
  target: string
  explanation: string
  placeholder: string
}> = [
  {
    key: 'voice',
    label: 'Creator voice',
    target: 'Target: AI mampu menulis seperti brand kamu, bukan seperti template internet.',
    explanation: 'Jelaskan ritme kalimat, pilihan kata, tingkat formalitas, energi, humor, sudut pandang, dan contoh gaya yang terasa benar. Sebutkan juga gaya yang terlihat mirip tetapi bukan kamu.',
    placeholder: 'Brand kami berbicara dengan nada... Kami lebih sering menggunakan... Ketika menjelaskan hal kompleks, kami... Contoh kalimat yang terasa seperti kami adalah...',
  },
  {
    key: 'redLines',
    label: 'Redlines',
    target: 'Target: output aman, jujur, dan tidak keluar dari batas brand.',
    explanation: 'Tuliskan klaim yang tidak boleh dibuat, topik sensitif, kata yang dihindari, bentuk urgency yang dilarang, aturan legal/etika, dan perilaku yang bisa merusak kepercayaan audiens.',
    placeholder: 'Kami tidak pernah menjanjikan... Hindari kata... Jangan menggunakan fake urgency... Jika bukti belum tersedia, AI harus...',
  },
  {
    key: 'audienceFacts',
    label: 'Audience facts',
    target: 'Target: AI membedakan fakta audiens dari asumsi yang masih perlu diuji.',
    explanation: 'Masukkan hal yang sudah diketahui dari DM, komentar, interview, transaksi, atau observasi. Sertakan bahasa asli mereka, kondisi pembelian, keberatan, dan pola yang berulang.',
    placeholder: 'Berdasarkan sumber..., audiens kami biasanya... Kalimat yang sering mereka gunakan adalah... Keberatan yang paling sering muncul...',
  },
  {
    key: 'qualityGate',
    label: 'Output quality gate',
    target: 'Target: ada checklist objektif sebelum sebuah output dianggap siap dipakai.',
    explanation: 'Definisikan syarat minimum sebuah output: seberapa spesifik, bukti yang wajib ada, struktur, CTA, panjang, kualitas bahasa, dan tanda bahwa output harus diulang.',
    placeholder: 'Output hanya boleh dipakai jika... Setiap konten wajib memiliki... Rewrite jika... Sebelum final, periksa...',
  },
]

const conversionFields: Array<{
  key: keyof WorkspaceData['conversion']
  term: string
  plain: string
  question: string
}> = [
  { key: 'attention', term: 'Attention', plain: 'Orang berhenti melihat', question: 'Konten atau pesan apa yang membuat target pembeli berhenti dan merasa, “ini tentang aku”?' },
  { key: 'profile', term: 'Profile', plain: 'Orang memeriksa kamu', question: 'Apa yang harus mereka lihat di profile agar cukup percaya untuk lanjut?' },
  { key: 'lead', term: 'Lead', plain: 'Orang memberi sinyal minat', question: 'Aksi ringan apa yang membuat mereka masuk ke percakapan atau meninggalkan kontak?' },
  { key: 'nurture', term: 'Nurture', plain: 'Orang memahami value', question: 'Apa yang membantu mereka memahami proses, bukti, dan kecocokan offer kamu?' },
  { key: 'close', term: 'Close', plain: 'Orang mengambil keputusan', question: 'Langkah apa yang mengubah calon pembeli menjadi transaksi?' },
  { key: 'primaryCta', term: 'Primary CTA', plain: 'Ajakan utama', question: 'Satu ajakan apa yang paling sering ingin kamu gunakan di konten?' },
  { key: 'successPoint', term: 'Success Point', plain: 'Tanda berhasil', question: 'Peristiwa apa yang benar-benar kamu anggap berhasil—bukan sekadar klik atau views?' },
]

const deliverableStatuses: Deliverable['status'][] = ['Not started', 'In progress', 'Review', 'Approved']
const experimentStatuses: ExperimentStatus[] = ['Draft', 'On going', 'Uploaded']
const calendarStatuses: CalendarItem['status'][] = ['Idea', 'Draft', 'Ready', 'Published']

function cloneDefaultData(): WorkspaceData {
  return JSON.parse(JSON.stringify(defaultWorkspaceData)) as WorkspaceData
}

type WorkspaceRecovery = {
  userId: string
  savedAt: number
  data: WorkspaceData
}

function readRecovery(userId: string): WorkspaceRecovery | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECOVERY_STORAGE_KEY) || 'null') as WorkspaceRecovery | null
    return parsed?.userId === userId && parsed.data ? parsed : null
  } catch {
    return null
  }
}

function writeRecovery(userId: string, data: WorkspaceData) {
  window.localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify({ userId, savedAt: Date.now(), data } satisfies WorkspaceRecovery))
}

function firstIncompleteSubstep(section: JourneySection, data: WorkspaceData) {
  if (section === 'audience') {
    const index = data.audience.findIndex(item => item.insight.trim().length < 30)
    return index === -1 ? Math.max(0, data.audience.length - 1) : index
  }
  if (section === 'revenue') {
    const index = revenueFields.findIndex(field => data.revenue[field.key].trim().length < 24)
    return index === -1 ? revenueFields.length - 1 : index
  }
  if (section === 'memory') {
    const index = memoryFields.findIndex(field => data.memory[field.key].trim().length < 100)
    return index === -1 ? memoryFields.length - 1 : index
  }
  if (section === 'conversion') {
    const index = conversionFields.findIndex(field => data.conversion[field.key].trim().length < 8)
    return index === -1 ? conversionFields.length - 1 : index
  }
  return 0
}

function looksLikeUntouchedLegacyBlueprint(saved: Record<string, unknown>) {
  const audience = Array.isArray(saved.audience) ? saved.audience as Array<Record<string, unknown>> : []
  return saved.creatorName === 'Creator Workspace'
    && saved.businessType === 'Knowledge creator'
    && String(audience[0]?.insight || '').startsWith('Konten sudah konsisten, tetapi tidak menghasilkan')
}

function mergeWorkspaceData(parsed: unknown): WorkspaceData {
  const fallback = cloneDefaultData()
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback

  const saved = parsed as Record<string, unknown>
  if (looksLikeUntouchedLegacyBlueprint(saved)) return fallback
  const savedAudience = Array.isArray(saved.audience) ? saved.audience as Array<Record<string, unknown>> : []
  const revenue = saved.revenue && typeof saved.revenue === 'object' ? saved.revenue as Record<string, unknown> : {}
  const memory = saved.memory && typeof saved.memory === 'object' ? saved.memory as Record<string, unknown> : {}
  const conversion = saved.conversion && typeof saved.conversion === 'object' ? saved.conversion as Record<string, unknown> : {}
  const onboarding = saved.onboarding && typeof saved.onboarding === 'object' ? saved.onboarding as Record<string, unknown> : {}
  const savedMetrics = Array.isArray(saved.metrics) ? saved.metrics as Array<Record<string, unknown>> : []
  const hasMonthlyMetrics = savedMetrics.length > 0 && typeof savedMetrics[0]?.month === 'string'

  return {
    ...fallback,
    version: 2,
    creatorName: typeof saved.creatorName === 'string' ? saved.creatorName : '',
    businessType: typeof saved.businessType === 'string' ? saved.businessType : '',
    primaryGoal: typeof saved.primaryGoal === 'string' ? saved.primaryGoal : '',
    socialProfiles: Array.isArray(saved.socialProfiles)
      ? fallback.socialProfiles.map(profile => {
          const match = (saved.socialProfiles as Array<Record<string, unknown>>).find(item => item.platform === profile.platform)
          return match ? { ...profile, url: String(match.url || ''), audienceCount: Number(match.audienceCount || 0) } : profile
        })
      : fallback.socialProfiles,
    onboarding: {
      socialSetupDone: onboarding.socialSetupDone === true,
      completedSections: Array.isArray(onboarding.completedSections)
        ? onboarding.completedSections.filter((section): section is JourneySection => journeyOrder.includes(section as JourneySection))
        : [],
      skippedSections: Array.isArray(onboarding.skippedSections)
        ? onboarding.skippedSections.filter((section): section is JourneySection => journeyOrder.includes(section as JourneySection))
        : [],
      unlockedAt: typeof onboarding.unlockedAt === 'string' ? onboarding.unlockedAt : '',
    },
    audience: defaultAudience.map(item => {
      const match = savedAudience.find(candidate => candidate.id === item.id)
      return { ...item, insight: typeof match?.insight === 'string' ? match.insight : '' }
    }),
    revenue: {
      buyer: String(revenue.buyer || ''),
      problem: String(revenue.problem || ''),
      whyNow: String(revenue.whyNow || ''),
      offer: String(revenue.offer || ''),
      proof: String(revenue.proof || ''),
      revenuePath: String(revenue.revenuePath || revenue.path || ''),
    },
    contentRole: saved.contentRole === 'content-creator' || saved.contentRole === 'digital-marketer' ? saved.contentRole : '',
    recommendedPrompts: Array.isArray(saved.recommendedPrompts) ? saved.recommendedPrompts as RecommendedPrompt[] : [],
    contentExperimentSuggestion: typeof saved.contentExperimentSuggestion === 'string' ? saved.contentExperimentSuggestion : '',
    memory: {
      voice: String(memory.voice || ''),
      redLines: String(memory.redLines || ''),
      audienceFacts: String(memory.audienceFacts || ''),
      qualityGate: String(memory.qualityGate || ''),
      experimentLearnings: String(memory.experimentLearnings || ''),
    },
    conversion: {
      attention: String(conversion.attention || conversion.awareness || ''),
      profile: String(conversion.profile || ''),
      lead: String(conversion.lead || ''),
      nurture: String(conversion.nurture || ''),
      close: String(conversion.close || ''),
      primaryCta: String(conversion.primaryCta || ''),
      successPoint: String(conversion.successPoint || ''),
    },
    experiments: Array.isArray(saved.experiments)
      ? (saved.experiments as Array<Record<string, unknown>>).map((item, index) => {
          const result = item.result && typeof item.result === 'object' ? item.result as Record<string, unknown> : {}
          return {
            id: String(item.id || `legacy-${index}`),
            name: String(item.name || 'Experiment'),
            hypothesis: String(item.hypothesis || ''),
            contentUrl: String(item.contentUrl || ''),
            status: item.status === 'Uploaded' || item.status === 'On going' ? item.status : 'Draft',
            result: {
              views: Number(result.views || 0),
              likes: Number(result.likes || 0),
              comments: Number(result.comments || 0),
              shares: Number(result.shares || 0),
              saves: Number(result.saves || 0),
              clicks: Number(result.clicks || 0),
              leads: Number(result.leads || 0),
            },
            learning: String(item.learning || (typeof item.result === 'string' ? item.result : '')),
            createdAt: String(item.createdAt || new Date().toISOString()),
          }
        })
      : [],
    metrics: hasMonthlyMetrics ? savedMetrics as MetricSnapshot[] : [],
    deliverables: Array.isArray(saved.deliverables)
      ? fallback.deliverables.map(item => {
          const match = (saved.deliverables as Array<Record<string, unknown>>).find(candidate => candidate.id === item.id || candidate.code === item.code)
          return match ? { ...item, status: deliverableStatuses.includes(match.status as Deliverable['status']) ? match.status as Deliverable['status'] : item.status } : item
        })
      : fallback.deliverables,
    calendar: Array.isArray(saved.calendar)
      ? (saved.calendar as Array<Record<string, unknown>>).map((item, index) => ({
          id: String(item.id || `calendar-${index}`),
          week: Math.max(1, Math.min(4, Number(item.week || 1))),
          title: String(item.title || ''),
          channel: String(item.channel || item.format || ''),
          contentIp: String(item.contentIp || ''),
          status: calendarStatuses.includes(item.status as CalendarItem['status']) ? item.status as CalendarItem['status'] : 'Idea',
        }))
      : [],
  }
}

function cleanUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function socialHandle(url: string) {
  try {
    const parsed = new URL(cleanUrl(url))
    const segments = parsed.pathname.split('/').filter(Boolean)
    return segments[0] ? `@${segments[0].replace(/^@/, '')}` : parsed.hostname
  } catch {
    return url
  }
}

function platformLabel(platform: SocialPlatform) {
  if (platform === 'youtube') return 'YouTube'
  if (platform === 'tiktok') return 'TikTok'
  return 'Instagram'
}

function experimentSuggestion(experiments: Experiment[]) {
  const measured = experiments.filter(item => item.result.views > 0)
  if (!measured.length) return ''
  const best = [...measured].sort((a, b) => {
    const engagementA = (a.result.likes + a.result.comments + a.result.shares + a.result.saves) / a.result.views
    const engagementB = (b.result.likes + b.result.comments + b.result.shares + b.result.saves) / b.result.views
    return engagementB - engagementA
  })[0]
  const engagements = best.result.likes + best.result.comments + best.result.shares + best.result.saves
  const rate = best.result.views ? ((engagements / best.result.views) * 100).toFixed(2) : '0'
  return `Experiment “${best.name}” menjadi signal terkuat saat ini: ${best.result.views.toLocaleString('id-ID')} views dengan ${rate}% engagement${best.result.leads ? ` dan ${best.result.leads} lead` : ''}. ${best.learning || 'Pertahankan pola pembuka, format, dan CTA dari konten ini sebagai hipotesis untuk tes berikutnya.'}`
}

function statusTone(status: string) {
  if (status === 'Approved' || status === 'Published' || status === 'Uploaded') return styles.statusSuccess
  if (status === 'Review' || status === 'Ready' || status === 'On going') return styles.statusInfo
  if (status === 'In progress' || status === 'Draft') return styles.statusWarning
  return styles.statusNeutral
}

function emptyExperiment(): Omit<Experiment, 'id' | 'createdAt'> {
  return {
    name: '',
    hypothesis: '',
    contentUrl: '',
    status: 'Draft',
    result: { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, leads: 0 },
    learning: '',
  }
}

function emptyMetric(): Omit<MetricSnapshot, 'id'> {
  return {
    month: new Date().toISOString().slice(0, 7),
    followers: 0,
    averageViews: 0,
    engagement: 0,
    leads: 0,
    sales: 0,
  }
}

export default function WorkspaceClient() {
  const router = useRouter()
  const [workspace, setWorkspace] = useState<WorkspaceData>(() => cloneDefaultData())
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [hydrated, setHydrated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [toast, setToast] = useState('')
  const [substep, setSubstep] = useState(0)
  const [promptLoading, setPromptLoading] = useState(false)
  const [experimentDraft, setExperimentDraft] = useState(emptyExperiment)
  const [metricDraft, setMetricDraft] = useState(emptyMetric)
  const [calendarDraft, setCalendarDraft] = useState({ title: '', channel: '', contentIp: '', week: 1 })
  const [resultExperimentId, setResultExperimentId] = useState<string | null>(null)
  const [showReset, setShowReset] = useState(false)
  const [resetAccepted, setResetAccepted] = useState(false)
  const [showSectionTransition, setShowSectionTransition] = useState(false)
  const [quitting, setQuitting] = useState(false)
  const skipAutosaveRef = useRef(false)
  const workspaceRef = useRef(workspace)

  const guidedSection = useMemo<'social' | JourneySection | null>(() => {
    if (!workspace.onboarding.socialSetupDone) return 'social'
    return journeyOrder.find(section => !workspace.onboarding.completedSections.includes(section)) || null
  }, [workspace.onboarding])

  const progress = useMemo(() => calculateWorkspaceProgress(workspace), [workspace])
  const unlocked = guidedSection === null

  useEffect(() => {
    let active = true
    async function hydrate() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return
      if (!user) {
        setHydrated(true)
        return
      }
      setUserId(user.id)
      const { data: row } = await supabase.from('creator_workspaces').select('data, updated_at').eq('user_id', user.id).maybeSingle()
      if (!active) return
      let initial = cloneDefaultData()
      if (row?.data) {
        initial = mergeWorkspaceData(row.data)
      } else {
        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)
        if (legacy) {
          try {
            initial = mergeWorkspaceData(JSON.parse(legacy))
          } catch {
            initial = cloneDefaultData()
          }
        }
        if (legacy) window.localStorage.removeItem(LEGACY_STORAGE_KEY)
      }

      const recovery = readRecovery(user.id)
      const databaseUpdatedAt = row?.updated_at ? new Date(row.updated_at).getTime() : 0
      const recoveredNewerDraft = recovery && recovery.savedAt > databaseUpdatedAt
      if (recoveredNewerDraft) initial = mergeWorkspaceData(recovery.data)

      skipAutosaveRef.current = true
      workspaceRef.current = initial
      setWorkspace(initial)

      if (!row || recoveredNewerDraft) {
        const { error } = await supabase.from('creator_workspaces').upsert({ user_id: user.id, data: initial, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        if (!error && recoveredNewerDraft) window.localStorage.removeItem(RECOVERY_STORAGE_KEY)
      }
      if (active) setHydrated(true)
    }
    void hydrate()
    return () => { active = false }
  }, [])

  useEffect(() => {
    workspaceRef.current = workspace
    if (!hydrated || !userId) return
    writeRecovery(userId, workspace)
  }, [workspace, hydrated, userId])

  useEffect(() => {
    if (!hydrated || !userId) return
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false
      return
    }
    const timeout = window.setTimeout(() => void persistWorkspace(workspace, true), 600)
    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, hydrated, userId])

  useEffect(() => {
    if (!guidedSection || guidedSection === 'social') {
      setSubstep(0)
      setShowSectionTransition(false)
      return
    }
    setSubstep(firstIncompleteSubstep(guidedSection, workspaceRef.current))
    setShowSectionTransition(true)
    const timeout = window.setTimeout(() => setShowSectionTransition(false), 2400)
    return () => window.clearTimeout(timeout)
  }, [guidedSection])

  useEffect(() => {
    if (!hydrated || !userId) return
    const preserveDraft = () => writeRecovery(userId, workspaceRef.current)
    const preserveWhenHidden = () => {
      if (document.visibilityState === 'hidden') preserveDraft()
    }
    window.addEventListener('pagehide', preserveDraft)
    document.addEventListener('visibilitychange', preserveWhenHidden)
    return () => {
      window.removeEventListener('pagehide', preserveDraft)
      document.removeEventListener('visibilitychange', preserveWhenHidden)
    }
  }, [hydrated, userId])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  async function persistWorkspace(next: WorkspaceData, silent = false) {
    if (!userId) return false
    const saveStartedAt = Date.now()
    setSaveStatus('saving')
    const { error } = await supabase.from('creator_workspaces').upsert({ user_id: userId, data: next, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) {
      setSaveStatus('error')
      if (!silent) notify('Data belum tersimpan. Coba sekali lagi.')
      return false
    }
    const recovery = readRecovery(userId)
    if (!recovery || recovery.savedAt <= saveStartedAt) window.localStorage.removeItem(RECOVERY_STORAGE_KEY)
    setSaveStatus('saved')
    if (!silent) notify('Semua perubahan tersimpan ke akunmu.')
    return true
  }

  async function saveNow() {
    await persistWorkspace(workspace)
  }

  async function saveAndQuit() {
    setQuitting(true)
    const saved = await persistWorkspace(workspace)
    setQuitting(false)
    if (saved) router.push('/')
  }

  function updateAudience(id: AudienceDimension['id'], insight: string) {
    setWorkspace(current => ({ ...current, audience: current.audience.map(item => item.id === id ? { ...item, insight } : item) }))
  }

  function updateRevenue(key: keyof WorkspaceData['revenue'], value: string) {
    setWorkspace(current => ({ ...current, revenue: { ...current.revenue, [key]: value } }))
  }

  function updateMemory(key: keyof WorkspaceData['memory'], value: string) {
    setWorkspace(current => ({ ...current, memory: { ...current.memory, [key]: value } }))
  }

  function updateConversion(key: keyof WorkspaceData['conversion'], value: string) {
    setWorkspace(current => ({ ...current, conversion: { ...current.conversion, [key]: value } }))
  }

  function updateSocial(platform: SocialPlatform, patch: Partial<{ url: string; audienceCount: number }>) {
    setWorkspace(current => ({
      ...current,
      socialProfiles: current.socialProfiles.map(profile => profile.platform === platform ? { ...profile, ...patch } : profile),
    }))
  }

  function completeSocialSetup() {
    const connected = workspace.socialProfiles.some(profile => cleanUrl(profile.url))
    if (!connected) {
      notify('Masukkan minimal satu link sosial media untuk melanjutkan.')
      return
    }
    setWorkspace(current => ({
      ...current,
      socialProfiles: current.socialProfiles.map(profile => ({ ...profile, url: cleanUrl(profile.url) })),
      onboarding: { ...current.onboarding, socialSetupDone: true },
    }))
  }

  function completeSection(section: JourneySection, skipped = false) {
    setWorkspace(current => {
      const completedSections = current.onboarding.completedSections.includes(section)
        ? current.onboarding.completedSections
        : [...current.onboarding.completedSections, section]
      const skippedSections = skipped && !current.onboarding.skippedSections.includes(section)
        ? [...current.onboarding.skippedSections, section]
        : current.onboarding.skippedSections
      const allDone = journeyOrder.every(item => completedSections.includes(item))
      return {
        ...current,
        onboarding: {
          ...current.onboarding,
          completedSections,
          skippedSections,
          unlockedAt: allDone ? new Date().toISOString() : current.onboarding.unlockedAt,
        },
      }
    })
    if (section === 'deliverables') {
      setActiveSection('overview')
      notify('Overview terbuka. Creator Workspace kamu sekarang siap digunakan.')
    }
  }

  async function requestPrompts(role: 'content-creator' | 'digital-marketer', source: WorkspaceData = workspace) {
    setPromptLoading(true)
    try {
      const response = await fetch('/api/workspace/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          audience: source.audience.reduce<Record<string, string>>((result, item) => ({ ...result, [item.id]: item.insight }), {}),
          revenue: source.revenue,
          experimentSuggestion: source.contentExperimentSuggestion,
        }),
      })
      const payload = await response.json() as { prompts?: RecommendedPrompt[]; message?: string }
      if (!response.ok || !payload.prompts) throw new Error(payload.message || 'Prompt belum berhasil dipilih')
      setWorkspace(current => ({ ...current, contentRole: role, recommendedPrompts: payload.prompts || [] }))
    } catch {
      notify('Prompt belum berhasil dipilih. Coba lagi.')
    } finally {
      setPromptLoading(false)
    }
  }

  async function copyText(text: string, message: string) {
    await navigator.clipboard.writeText(text)
    notify(message)
  }

  function memoryMarkdown() {
    return [
      '# Brand Memory',
      '',
      `Updated: ${new Date().toLocaleDateString('id-ID')}`,
      '',
      '## Creator Voice',
      workspace.memory.voice,
      '',
      '## Redlines',
      workspace.memory.redLines,
      '',
      '## Audience Facts',
      workspace.memory.audienceFacts,
      '',
      '## Output Quality Gate',
      workspace.memory.qualityGate,
      '',
      '## Experiment Learnings',
      workspace.memory.experimentLearnings || 'Belum ada experiment learning yang diimpor.',
      '',
    ].join('\n')
  }

  function downloadMemory() {
    const blob = new Blob([memoryMarkdown()], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'brand-memory.md'
    anchor.click()
    URL.revokeObjectURL(url)
    notify('brand-memory.md sudah diunduh.')
  }

  function saveExperiment() {
    if (!experimentDraft.name.trim() || !experimentDraft.hypothesis.trim()) {
      notify('Nama dan hipotesis experiment wajib diisi.')
      return
    }
    setWorkspace(current => ({
      ...current,
      experiments: [{ ...experimentDraft, id: crypto.randomUUID(), contentUrl: cleanUrl(experimentDraft.contentUrl), createdAt: new Date().toISOString() }, ...current.experiments],
    }))
    setExperimentDraft(emptyExperiment())
    notify('Experiment tersimpan. Tambahkan result setelah konten berjalan.')
  }

  function updateExperiment(id: string, updater: (experiment: Experiment) => Experiment) {
    setWorkspace(current => ({ ...current, experiments: current.experiments.map(item => item.id === id ? updater(item) : item) }))
  }

  function saveMetric() {
    if (!metricDraft.month) {
      notify('Pilih bulan untuk snapshot ini.')
      return
    }
    const next: MetricSnapshot = { ...metricDraft, id: crypto.randomUUID() }
    setWorkspace(current => ({ ...current, metrics: [next, ...current.metrics.filter(item => item.month !== next.month)] }))
    setMetricDraft(emptyMetric())
    notify('Snapshot bulanan tersimpan.')
  }

  function importExperimentToContent() {
    const suggestion = experimentSuggestion(workspace.experiments)
    if (!suggestion) {
      notify('Masukkan result views dan engagement terlebih dahulu.')
      return
    }
    const next = { ...workspace, contentExperimentSuggestion: suggestion }
    setWorkspace(next)
    if (workspace.contentRole) void requestPrompts(workspace.contentRole, next)
    notify('Learning experiment diimpor ke rekomendasi Content IP.')
  }

  function importExperimentToMemory() {
    const suggestion = experimentSuggestion(workspace.experiments)
    if (!suggestion) {
      notify('Masukkan result views dan engagement terlebih dahulu.')
      return
    }
    setWorkspace(current => ({
      ...current,
      memory: {
        ...current.memory,
        experimentLearnings: current.memory.experimentLearnings.includes(suggestion)
          ? current.memory.experimentLearnings
          : [current.memory.experimentLearnings, suggestion].filter(Boolean).join('\n\n'),
      },
    }))
    notify('Learning experiment masuk ke brand-memory.md.')
  }

  function addCalendarItem() {
    if (!calendarDraft.title.trim()) {
      notify('Judul konten wajib diisi.')
      return
    }
    setWorkspace(current => ({
      ...current,
      calendar: [...current.calendar, { ...calendarDraft, id: crypto.randomUUID(), status: 'Idea' }],
    }))
    setCalendarDraft({ title: '', channel: '', contentIp: '', week: 1 })
  }

  async function confirmReset() {
    if (!resetAccepted) return
    const fresh = cloneDefaultData()
    skipAutosaveRef.current = true
    setWorkspace(fresh)
    setActiveSection('overview')
    setShowReset(false)
    setResetAccepted(false)
    await persistWorkspace(fresh, true)
    notify('Semua isi Creator Workspace sudah dihapus.')
  }

  if (!hydrated) {
    return <div className={styles.workspaceLoading}><RefreshCw size={18} /> Menyiapkan Creator Workspace...</div>
  }

  const activeMeta = workspaceSections.find(item => item.id === activeSection) || workspaceSections[0]

  return (
    <div className={styles.workspacePage}>
      <div className={`${styles.workspaceUnderlay} ${!unlocked ? styles.workspaceUnderlayBlurred : ''}`} aria-hidden={!unlocked}>
        <header className={styles.workspaceHeader}>
          <div>
            <span className={styles.kicker}>Creator Revenue OS</span>
            <h1>{activeMeta.label}</h1>
            <p>{activeMeta.description}</p>
          </div>
          <div className={styles.headerActions}>
            <span className={`${styles.saveSignal} ${saveStatus === 'error' ? styles.saveSignalError : ''}`}>
              <span /> {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'error' ? 'Belum tersimpan' : 'Tersimpan ke akunmu'}
            </span>
            <button type="button" className={styles.iconButton} onClick={() => setShowReset(true)} aria-label="Reset Creator Workspace"><RotateCcw size={16} /></button>
            <button type="button" className={styles.primaryButton} onClick={saveNow}><Save size={16} /> Simpan</button>
          </div>
        </header>

        <div className={styles.workspaceLayout}>
          <aside className={styles.moduleNav}>
            <div className={styles.progressCard}>
              <div><span>Workspace progress</span><strong>{progress}%</strong></div>
              <div className={styles.progressTrack}><i style={{ width: `${progress}%` }} /></div>
              <small>{progress === 99 ? 'Terisi penuh · terus berkembang' : `${journeyOrder.filter(item => workspace.onboarding.completedSections.includes(item)).length}/8 section dikenali`}</small>
            </div>
            <nav aria-label="Creator Workspace sections">
              {workspaceSections.map(item => {
                const Icon = sectionIcons[item.id]
                const locked = item.id === 'overview' && !unlocked
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`${activeSection === item.id ? styles.moduleActive : ''} ${locked ? styles.moduleLocked : ''}`}
                    onClick={() => !locked && setActiveSection(item.id)}
                    disabled={locked}
                  >
                    <span><Icon size={16} /></span>
                    <div><strong>{item.label}</strong><small>{item.description}</small></div>
                    {locked ? <LockKeyhole size={14} /> : workspace.onboarding.completedSections.includes(item.id as JourneySection) ? <Check size={14} /> : <ArrowRight size={14} />}
                  </button>
                )
              })}
            </nav>
          </aside>

          <main className={styles.moduleContent}>
            {renderSection(activeSection)}
          </main>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!unlocked && guidedSection && (
          <GuidedOverlay
            key={guidedSection}
            section={guidedSection}
            progress={progress}
            completedCount={workspace.onboarding.completedSections.length}
            onSaveAndQuit={saveAndQuit}
            quitting={quitting}
          >
            <AnimatePresence mode="wait">
              {showSectionTransition && guidedSection !== 'social' ? (
                <SectionTransitionCard key={`intro-${guidedSection}`} section={guidedSection} onContinue={() => setShowSectionTransition(false)} />
              ) : (
                <motion.div key={`form-${guidedSection}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
                  {renderGuidedStep(guidedSection)}
                </motion.div>
              )}
            </AnimatePresence>
          </GuidedOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReset && (
          <motion.div className={styles.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section className={styles.confirmModal} role="dialog" aria-modal="true" aria-labelledby="reset-title" initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}>
              <span className={styles.dangerIcon}><RotateCcw size={20} /></span>
              <h2 id="reset-title">Reset seluruh Creator Workspace?</h2>
              <p>Semua jawaban, social profile, prompt, Brand Memory, experiment, metric, dan status deliverable yang kamu tulis akan dihapus permanen dari akunmu.</p>
              <label className={styles.confirmCheck}>
                <input type="checkbox" checked={resetAccepted} onChange={event => setResetAccepted(event.target.checked)} />
                <span>Saya paham semua data yang saya tulis akan dihapus.</span>
              </label>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => { setShowReset(false); setResetAccepted(false) }}>Batal</button>
                <button type="button" className={styles.dangerButton} onClick={confirmReset} disabled={!resetAccepted}>Hapus dan mulai ulang</button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && <div className={styles.toast} role="status"><CheckCircle2 size={17} /> {toast}</div>}
    </div>
  )

  function renderGuidedStep(section: 'social' | JourneySection) {
    if (section === 'social') return renderSocialSetup()
    if (section === 'audience') return renderGuidedAudience()
    if (section === 'revenue') return renderGuidedRevenue()
    if (section === 'content') return renderGuidedContent()
    if (section === 'memory') return renderGuidedMemory()
    if (section === 'conversion') return renderGuidedConversion()
    if (section === 'experiments') return renderGuidedExperiment()
    if (section === 'metrics') return renderGuidedMetric()
    return renderGuidedDeliverables()
  }

  function renderSocialSetup() {
    return (
      <motion.div className={styles.guideBody} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <span className={styles.guideIcon}><Link2 size={26} /></span>
        <span className={styles.kicker}>Sebelum mulai</span>
        <h2>Hubungkan akun yang ingin kamu kembangkan.</h2>
        <p className={styles.guideLead}>Link dan jumlah audiens awal disimpan sebagai baseline. Marcatching tidak mengisi angka palsu—update count kapan pun datanya berubah.</p>
        <div className={styles.socialSetupGrid}>
          {workspace.socialProfiles.map(profile => {
            const Icon = profile.platform === 'instagram' ? Camera : profile.platform === 'youtube' ? Video : Play
            return (
              <div key={profile.platform} className={styles.socialSetupRow}>
                <span><Icon size={20} /></span>
                <label>
                  <b>{platformLabel(profile.platform)}</b>
                  <input value={profile.url} onChange={event => updateSocial(profile.platform, { url: event.target.value })} placeholder={`Link profile ${platformLabel(profile.platform)}`} />
                </label>
                <label className={styles.countField}>
                  <b>{profile.platform === 'youtube' ? 'Subscriber' : 'Followers'}</b>
                  <input type="number" min="0" value={profile.audienceCount || ''} onChange={event => updateSocial(profile.platform, { audienceCount: Math.max(0, Number(event.target.value)) })} placeholder="0" />
                </label>
              </div>
            )
          })}
        </div>
        <div className={styles.guideFooter}>
          <Link href="/" className={styles.quietLink}><ArrowLeft size={15} /> Kembali ke Learning Home</Link>
          <button type="button" className={styles.primaryButtonLarge} onClick={completeSocialSetup}>Simpan profile & mulai <ArrowRight size={17} /></button>
        </div>
      </motion.div>
    )
  }

  function renderGuidedAudience() {
    const item = workspace.audience[substep] || workspace.audience[0]
    const valid = item.insight.trim().length >= 30
    return (
      <GuidedQuestion
        icon={<Users size={25} />}
        eyebrow={`${item.label} · ${item.plainLabel}`}
        title={item.prompt}
        explanation={item.explanation}
        value={item.insight}
        onChange={value => updateAudience(item.id, value)}
        placeholder="Ceritakan situasi yang benar-benar terjadi. Semakin spesifik, semakin relevan output berikutnya."
        counter={`${Math.min(item.insight.trim().length, audienceTarget)}/${audienceTarget} karakter konteks`}
        canContinue={valid}
        backDisabled={substep === 0}
        onBack={() => setSubstep(current => Math.max(0, current - 1))}
        onContinue={() => substep < workspace.audience.length - 1 ? setSubstep(current => current + 1) : completeSection('audience')}
        continueLabel={substep === workspace.audience.length - 1 ? 'Simpan Audience OS' : 'Lanjut ke pertanyaan berikutnya'}
        subProgress={`${substep + 1}/${workspace.audience.length}`}
      />
    )
  }

  function renderGuidedRevenue() {
    const field = revenueFields[substep] || revenueFields[0]
    const value = workspace.revenue[field.key]
    return (
      <GuidedQuestion
        icon={<Target size={25} />}
        eyebrow={`${field.term} · ${field.plain}`}
        title={field.question}
        explanation={field.explanation}
        value={value}
        onChange={next => updateRevenue(field.key, next)}
        placeholder="Tulis dalam bahasa yang biasa kamu gunakan saat menjelaskan bisnismu."
        counter={`${Math.min(value.trim().length, 140)}/140 karakter konteks`}
        canContinue={value.trim().length >= 24}
        backDisabled={substep === 0}
        onBack={() => setSubstep(current => Math.max(0, current - 1))}
        onContinue={() => substep < revenueFields.length - 1 ? setSubstep(current => current + 1) : completeSection('revenue')}
        continueLabel={substep === revenueFields.length - 1 ? 'Simpan Revenue Thesis' : 'Lanjut'}
        subProgress={`${substep + 1}/${revenueFields.length}`}
      />
    )
  }

  function renderGuidedContent() {
    return (
      <motion.div className={styles.guideBodyWide} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <span className={styles.guideIcon}><Lightbulb size={26} /></span>
        <span className={styles.kicker}>Content IP · personal prompt stack</span>
        <h2>Kamu paling sering bekerja sebagai apa?</h2>
        <p className={styles.guideLead}>Pilih satu role utama. Audience OS dan Revenue Thesis kamu akan disisipkan ke tiga prompt yang paling relevan.</p>
        <div className={styles.roleChoices}>
          <button type="button" className={workspace.contentRole === 'content-creator' ? styles.choiceActive : ''} onClick={() => void requestPrompts('content-creator')}><Sparkles size={20} /><span><strong>Content Creator</strong><small>Ide, format, hook, storytelling, dan audience growth.</small></span></button>
          <button type="button" className={workspace.contentRole === 'digital-marketer' ? styles.choiceActive : ''} onClick={() => void requestPrompts('digital-marketer')}><Target size={20} /><span><strong>Digital Marketer</strong><small>Campaign, conversion, offer, trust, dan buyer journey.</small></span></button>
        </div>
        {promptLoading ? (
          <div className={styles.promptLoading}><RefreshCw size={18} /> Mencocokkan prompt dengan jawabanmu...</div>
        ) : workspace.recommendedPrompts.length > 0 ? (
          <PromptCards prompts={workspace.recommendedPrompts} onCopy={(prompt) => void copyText(prompt.prompt, `“${prompt.title}” disalin.`)} />
        ) : (
          <div className={styles.emptyGuideState}><LockKeyhole size={20} /><p>Tiga prompt akan muncul setelah kamu memilih role.</p></div>
        )}
        <div className={styles.guideFooter}>
          <button type="button" className={styles.quietButton} onClick={() => completeSection('content', true)}>Skip untuk sekarang</button>
          <button type="button" className={styles.primaryButtonLarge} disabled={!workspace.contentRole || workspace.recommendedPrompts.length < 3} onClick={() => completeSection('content')}>Simpan 3 prompt <ArrowRight size={17} /></button>
        </div>
      </motion.div>
    )
  }

  function renderGuidedMemory() {
    const field = memoryFields[substep] || memoryFields[0]
    const value = workspace.memory[field.key]
    return (
      <GuidedQuestion
        icon={<BrainCircuit size={25} />}
        eyebrow={`brand-memory.md · ${field.label}`}
        title={field.target}
        explanation={field.explanation}
        value={value}
        onChange={next => updateMemory(field.key, next)}
        placeholder={field.placeholder}
        counter={`${Math.min(value.trim().length, paragraphTarget)}/${paragraphTarget} karakter minimum konteks`}
        canContinue={value.trim().length >= 100}
        backDisabled={substep === 0}
        onBack={() => setSubstep(current => Math.max(0, current - 1))}
        onContinue={() => substep < memoryFields.length - 1 ? setSubstep(current => current + 1) : completeSection('memory')}
        continueLabel={substep === memoryFields.length - 1 ? 'Simpan AI Memory' : 'Simpan paragraf & lanjut'}
        subProgress={`${substep + 1}/${memoryFields.length}`}
        extraAction={substep === memoryFields.length - 1 ? <button type="button" className={styles.secondaryButton} onClick={downloadMemory}><Download size={15} /> Download brand-memory.md</button> : undefined}
      />
    )
  }

  function renderGuidedConversion() {
    const field = conversionFields[substep] || conversionFields[0]
    const value = workspace.conversion[field.key]
    return (
      <GuidedQuestion
        icon={<Network size={25} />}
        eyebrow={`${field.term} · ${field.plain}`}
        title={field.question}
        explanation="Gunakan satu langkah yang bisa diamati. Kamu bisa mengubah Primary CTA dan Success Point kapan pun setelah Overview terbuka."
        value={value}
        onChange={next => updateConversion(field.key, next)}
        placeholder="Contoh yang spesifik untuk jalur pembelimu..."
        counter={`${Math.min(value.trim().length, 90)}/90 karakter konteks`}
        canContinue={value.trim().length >= 8}
        backDisabled={substep === 0}
        onBack={() => setSubstep(current => Math.max(0, current - 1))}
        onContinue={() => substep < conversionFields.length - 1 ? setSubstep(current => current + 1) : completeSection('conversion')}
        continueLabel={substep === conversionFields.length - 1 ? 'Simpan Conversion Map' : 'Lanjut'}
        subProgress={`${substep + 1}/${conversionFields.length}`}
      />
    )
  }

  function renderGuidedExperiment() {
    return (
      <motion.div className={styles.guideBodyWide} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <span className={styles.guideIcon}><FlaskConical size={26} /></span>
        <span className={styles.kicker}>Experiment · learning loop</span>
        <h2>Uji satu hipotesis dari sistem yang sudah kamu buat.</h2>
        <p className={styles.guideLead}>Link bisa ditambahkan sekarang atau setelah konten di-upload. Result tetap bisa diisi nanti dari tab Experiment.</p>
        <ExperimentForm draft={experimentDraft} onChange={setExperimentDraft} onSave={saveExperiment} />
        {workspace.experiments[0] && <ContentPreview url={workspace.experiments[0].contentUrl} title={workspace.experiments[0].name} />}
        <div className={styles.guideFooter}>
          <span className={styles.guideHint}>{workspace.experiments.length ? `${workspace.experiments.length} experiment tersimpan` : 'Tambahkan minimal satu experiment.'}</span>
          <button type="button" className={styles.primaryButtonLarge} disabled={!workspace.experiments.length} onClick={() => completeSection('experiments')}>Lanjut ke scorecard <ArrowRight size={17} /></button>
        </div>
      </motion.div>
    )
  }

  function renderGuidedMetric() {
    return (
      <motion.div className={styles.guideBodyWide} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <span className={styles.guideIcon}><BarChart3 size={26} /></span>
        <span className={styles.kicker}>Metric Scorecard · monthly snapshot</span>
        <h2>Masukkan angka akunmu bulan ini.</h2>
        <p className={styles.guideLead}>Angka nol tetap valid jika memang belum ada hasil. Tidak ada score atau rating buatan di sini.</p>
        <MetricForm draft={metricDraft} onChange={setMetricDraft} onSave={saveMetric} />
        {workspace.metrics[0] && <MetricRow metric={workspace.metrics[0]} />}
        <div className={styles.guideFooter}>
          <span className={styles.guideHint}>{workspace.metrics.length ? 'Baseline bulanan sudah tersimpan.' : 'Tambahkan satu snapshot untuk melanjutkan.'}</span>
          <button type="button" className={styles.primaryButtonLarge} disabled={!workspace.metrics.length} onClick={() => completeSection('metrics')}>Lanjut ke deliverables <ArrowRight size={17} /></button>
        </div>
      </motion.div>
    )
  }

  function renderGuidedDeliverables() {
    return (
      <motion.div className={styles.guideBodyWide} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <span className={styles.guideIcon}><ClipboardCheck size={26} /></span>
        <span className={styles.kicker}>Deliverables · final checkpoint</span>
        <h2>Pastikan setiap output terlihat statusnya.</h2>
        <p className={styles.guideLead}>Kamu tidak harus menyelesaikan semuanya sekarang. Buka dropdown besar di setiap output dan set status yang benar.</p>
        <DeliverableList deliverables={workspace.deliverables} onStatus={(id, status) => setWorkspace(current => ({ ...current, deliverables: current.deliverables.map(item => item.id === id ? { ...item, status } : item) }))} />
        <div className={styles.guideFooter}>
          <span className={styles.guideHint}>Status ini bisa diubah kapan saja dari Overview.</span>
          <button type="button" className={styles.primaryButtonLarge} onClick={() => completeSection('deliverables')}>Simpan & buka Overview <Sparkles size={17} /></button>
        </div>
      </motion.div>
    )
  }

  function renderSection(section: WorkspaceSection) {
    if (section === 'overview') return renderOverview()
    if (section === 'audience') return renderAudienceSection()
    if (section === 'revenue') return renderRevenueSection()
    if (section === 'content') return renderContentSection()
    if (section === 'memory') return renderMemorySection()
    if (section === 'conversion') return renderConversionSection()
    if (section === 'experiments') return renderExperimentSection()
    if (section === 'metrics') return renderMetricsSection()
    if (section === 'deliverables') return <DeliverableList deliverables={workspace.deliverables} onStatus={(id, status) => setWorkspace(current => ({ ...current, deliverables: current.deliverables.map(item => item.id === id ? { ...item, status } : item) }))} />
    return renderCalendarSection()
  }

  function renderOverview() {
    const latestMetric = [...workspace.metrics].sort((a, b) => b.month.localeCompare(a.month))[0]
    const approved = workspace.deliverables.filter(item => item.status === 'Approved').length
    return (
      <div className={styles.sectionStack}>
        <section className={styles.overviewHero}>
          <div>
            <span className={styles.kicker}><Sparkles size={13} /> Workspace unlocked</span>
            <h2>Sistemmu sudah terbuka. Sekarang data yang membuatnya semakin tajam.</h2>
            <p>Progress dihitung dari jumlah field dan kedalaman konteks yang benar-benar kamu isi. Nilai maksimal 99% karena brand dan audience selalu berkembang.</p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryButton} onClick={() => setActiveSection('experiments')}>Tambah experiment <ArrowRight size={15} /></button>
              <button type="button" className={styles.secondaryButton} onClick={downloadMemory}><Download size={15} /> brand-memory.md</button>
            </div>
          </div>
          <div className={styles.progressNumber}><strong>{progress}%</strong><span>real data filled</span></div>
        </section>

        <SocialProfileStrip profiles={workspace.socialProfiles} onOpen={(url) => window.open(cleanUrl(url), '_blank', 'noopener,noreferrer')} />

        <section className={styles.overviewSignals}>
          <article><span><FlaskConical size={18} /></span><small>Experiments</small><strong>{workspace.experiments.length}</strong><p>{workspace.experiments.filter(item => item.result.views > 0).length} sudah punya result</p></article>
          <article><span><TrendingUp size={18} /></span><small>Latest followers</small><strong>{latestMetric ? latestMetric.followers.toLocaleString('id-ID') : '—'}</strong><p>{latestMetric ? latestMetric.month : 'Belum ada snapshot'}</p></article>
          <article><span><ClipboardCheck size={18} /></span><small>Deliverables</small><strong>{approved}/{workspace.deliverables.length}</strong><p>approved</p></article>
        </section>

        <section className={styles.sectionMap}>
          <div className={styles.sectionHeader}><div><span className={styles.kicker}>Your operating system</span><h3>Delapan section yang saling terhubung</h3></div></div>
          <div className={styles.sectionCardGrid}>
            {journeyOrder.map((section, index) => {
              const meta = workspaceSections.find(item => item.id === section)!
              const Icon = sectionIcons[section]
              return (
                <button key={section} type="button" onClick={() => setActiveSection(section)}>
                  <span className={styles.sectionCardIcon}><Icon size={19} /></span>
                  <small>0{index + 1}</small>
                  <strong>{meta.label}</strong>
                  <p>{meta.description}</p>
                  <ArrowRight size={15} />
                </button>
              )
            })}
          </div>
        </section>
      </div>
    )
  }

  function renderAudienceSection() {
    return (
      <div className={styles.sectionStack}>
        <SectionIntro section="audience" />
        <div className={styles.fieldCardGrid}>
          {workspace.audience.map((item, index) => (
            <article className={styles.fieldCard} key={item.id}>
              <div className={styles.fieldCardTop}><span>0{index + 1}</span><b>{item.label}</b><small>{item.plainLabel}</small></div>
              <p>{item.prompt}</p>
              <textarea value={item.insight} onChange={event => updateAudience(item.id, event.target.value)} rows={7} />
              <small>{item.insight.trim().length} karakter konteks</small>
            </article>
          ))}
        </div>
      </div>
    )
  }

  function renderRevenueSection() {
    return (
      <div className={styles.sectionStack}>
        <SectionIntro section="revenue" />
        <div className={styles.fieldCardGrid}>
          {revenueFields.map((field, index) => (
            <article className={styles.fieldCard} key={field.key}>
              <div className={styles.fieldCardTop}><span>0{index + 1}</span><b>{field.term}</b><small>{field.plain}</small></div>
              <p>{field.question}</p>
              <textarea value={workspace.revenue[field.key]} onChange={event => updateRevenue(field.key, event.target.value)} rows={7} />
            </article>
          ))}
        </div>
      </div>
    )
  }

  function renderContentSection() {
    return (
      <div className={styles.sectionStack}>
        <SectionIntro section="content" action={<button type="button" className={styles.secondaryButton} onClick={importExperimentToContent}><FlaskConical size={15} /> Suggestion from Experiments</button>} />
        {workspace.contentExperimentSuggestion && <div className={styles.suggestionBox}><Sparkles size={18} /><div><strong>Imported learning</strong><p>{workspace.contentExperimentSuggestion}</p></div></div>}
        <div className={styles.roleChoices}>
          <button type="button" className={workspace.contentRole === 'content-creator' ? styles.choiceActive : ''} onClick={() => void requestPrompts('content-creator')}><Sparkles size={20} /><span><strong>Content Creator</strong><small>Ide, hook, format, dan storytelling.</small></span></button>
          <button type="button" className={workspace.contentRole === 'digital-marketer' ? styles.choiceActive : ''} onClick={() => void requestPrompts('digital-marketer')}><Target size={20} /><span><strong>Digital Marketer</strong><small>Campaign, offer, trust, dan conversion.</small></span></button>
        </div>
        {promptLoading ? <div className={styles.promptLoading}><RefreshCw size={18} /> Memperbarui rekomendasi...</div> : <PromptCards prompts={workspace.recommendedPrompts} onCopy={(prompt) => void copyText(prompt.prompt, `“${prompt.title}” disalin.`)} />}
        <Link href="https://marcatching.com/prompt-library" target="_blank" className={styles.libraryLink}>Buka seluruh Prompt Library <ExternalLink size={15} /></Link>
      </div>
    )
  }

  function renderMemorySection() {
    return (
      <div className={styles.sectionStack}>
        <SectionIntro section="memory" action={<div className={styles.inlineActions}><button type="button" className={styles.secondaryButton} onClick={importExperimentToMemory}><FlaskConical size={15} /> Suggestion from Experiments</button><button type="button" className={styles.primaryButton} onClick={downloadMemory}><Download size={15} /> Download brand-memory.md</button></div>} />
        <div className={styles.memoryDocument}>
          <div className={styles.documentBar}><FileText size={15} /><span>brand-memory.md</span><b>{memoryFields.filter(field => workspace.memory[field.key].trim().length >= 100).length}/4 ready</b></div>
          {memoryFields.map((field, index) => (
            <label key={field.key}>
              <span><b>0{index + 1}</b><strong>{field.label}</strong><small>{field.target}</small></span>
              <textarea value={workspace.memory[field.key]} onChange={event => updateMemory(field.key, event.target.value)} rows={9} placeholder={field.placeholder} />
            </label>
          ))}
          {workspace.memory.experimentLearnings && <div className={styles.experimentMemory}><span>Experiment learnings</span><p>{workspace.memory.experimentLearnings}</p></div>}
        </div>
        <SkillLibrary compact />
      </div>
    )
  }

  function renderConversionSection() {
    return (
      <div className={styles.sectionStack}>
        <SectionIntro section="conversion" />
        <div className={styles.conversionGrid}>
          {conversionFields.map((field, index) => (
            <label key={field.key} className={(field.key === 'primaryCta' || field.key === 'successPoint') ? styles.conversionHighlight : ''}>
              <span>0{index + 1}</span><small>{field.plain}</small><strong>{field.term}</strong>
              <textarea value={workspace.conversion[field.key]} onChange={event => updateConversion(field.key, event.target.value)} rows={4} placeholder={field.question} />
              {index < conversionFields.length - 1 && field.key !== 'primaryCta' && <ArrowRight size={16} />}
            </label>
          ))}
        </div>
      </div>
    )
  }

  function renderExperimentSection() {
    return (
      <div className={styles.sectionStack}>
        <SectionIntro section="experiments" />
        <ExperimentForm draft={experimentDraft} onChange={setExperimentDraft} onSave={saveExperiment} />
        <div className={styles.experimentList}>
          {workspace.experiments.map(item => (
            <article key={item.id} className={styles.experimentCard}>
              <div className={styles.experimentHeader}>
                <div><span className={styles.kicker}>Experiment</span><h3>{item.name}</h3><p>{item.hypothesis}</p></div>
                <CustomDropdown value={item.status} options={experimentStatuses} onChange={value => updateExperiment(item.id, current => ({ ...current, status: value as ExperimentStatus }))} tone={statusTone(item.status)} />
              </div>
              <ContentPreview url={item.contentUrl} title={item.name} />
              <div className={styles.experimentActions}>
                <span>{item.result.views ? `${item.result.views.toLocaleString('id-ID')} views · ${(item.result.likes + item.result.comments + item.result.shares + item.result.saves).toLocaleString('id-ID')} engagement` : 'Result belum diisi'}</span>
                <button type="button" className={styles.secondaryButton} onClick={() => setResultExperimentId(current => current === item.id ? null : item.id)}><BarChart3 size={15} /> Masukkan result</button>
              </div>
              {resultExperimentId === item.id && (
                <ResultForm experiment={item} onChange={next => updateExperiment(item.id, () => next)} onDone={() => { setResultExperimentId(null); notify('Result experiment tersimpan.') }} />
              )}
            </article>
          ))}
          {!workspace.experiments.length && <EmptyState icon={<FlaskConical size={22} />} title="Belum ada experiment" text="Buat experiment pertama dari form di atas." />}
        </div>
      </div>
    )
  }

  function renderMetricsSection() {
    return (
      <div className={styles.sectionStack}>
        <SectionIntro section="metrics" />
        <MetricForm draft={metricDraft} onChange={setMetricDraft} onSave={saveMetric} />
        <div className={styles.metricList}>
          {[...workspace.metrics].sort((a, b) => b.month.localeCompare(a.month)).map(metric => <MetricRow key={metric.id} metric={metric} />)}
          {!workspace.metrics.length && <EmptyState icon={<BarChart3 size={22} />} title="Belum ada snapshot" text="Isi angka bulan ini untuk membuat baseline pertama." />}
        </div>
      </div>
    )
  }

  function renderCalendarSection() {
    return (
      <div className={styles.sectionStack}>
        <section className={styles.sectionIntro}>
          <div><span className={styles.kicker}>Optional execution layer</span><h2>30-Day Map</h2><p>Susun rencana setelah Audience OS, Revenue Thesis, dan prompt stack sudah jelas.</p></div>
        </section>
        <div className={styles.calendarForm}>
          <label><span>Judul konten</span><input value={calendarDraft.title} onChange={event => setCalendarDraft(current => ({ ...current, title: event.target.value }))} /></label>
          <label><span>Channel</span><input value={calendarDraft.channel} onChange={event => setCalendarDraft(current => ({ ...current, channel: event.target.value }))} placeholder="Instagram Reels" /></label>
          <label><span>Content IP</span><input value={calendarDraft.contentIp} onChange={event => setCalendarDraft(current => ({ ...current, contentIp: event.target.value }))} /></label>
          <label><span>Week</span><input type="number" min="1" max="4" value={calendarDraft.week} onChange={event => setCalendarDraft(current => ({ ...current, week: Math.max(1, Math.min(4, Number(event.target.value))) }))} /></label>
          <button type="button" className={styles.primaryButton} onClick={addCalendarItem}><Plus size={15} /> Tambah</button>
        </div>
        <div className={styles.calendarBoard}>
          {[1, 2, 3, 4].map(week => (
            <section key={week}><div className={styles.weekHead}><strong>Week {week}</strong><span>{workspace.calendar.filter(item => item.week === week).length} konten</span></div>
              {workspace.calendar.filter(item => item.week === week).map(item => (
                <article key={item.id}><div><small>{item.contentIp || 'Content IP belum dipilih'} · {item.channel || 'Channel'}</small><h3>{item.title}</h3></div><CustomDropdown value={item.status} options={calendarStatuses} onChange={value => setWorkspace(current => ({ ...current, calendar: current.calendar.map(calendar => calendar.id === item.id ? { ...calendar, status: value as CalendarItem['status'] } : calendar) }))} tone={statusTone(item.status)} /></article>
              ))}
            </section>
          ))}
        </div>
      </div>
    )
  }
}

function GuidedOverlay({ section, progress, completedCount, onSaveAndQuit, quitting, children }: { section: 'social' | JourneySection; progress: number; completedCount: number; onSaveAndQuit: () => void; quitting: boolean; children: React.ReactNode }) {
  const meta = section === 'social' ? null : journeyCopy[section]
  return (
    <motion.div className={styles.guidedOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className={styles.guideTopbar}>
        <div className={styles.guideBrand}><Sparkles size={16} /><span>Creator Workspace</span></div>
        <div className={styles.guideProgress}>
          <div><span>{section === 'social' ? 'Setup awal' : `Step ${journeyOrder.indexOf(section) + 1} of 8 · ${meta?.label}`}</span><strong>{progress}%</strong></div>
          <div><i style={{ width: `${progress}%` }} /></div>
        </div>
        <span className={styles.guideCompleted}>{completedCount}/8 selesai</span>
      </div>
      <div className={styles.guideStageRail} aria-hidden="true">
        {journeyOrder.map((item, index) => {
          const Icon = sectionIcons[item]
          const active = section === item
          const done = index < completedCount
          return <span key={item} className={`${active ? styles.stageActive : ''} ${done ? styles.stageDone : ''}`}><Icon size={14} /></span>
        })}
      </div>
      <main className={styles.guidedCard}>
        {children}
        <div className={styles.guideQuitFooter}>
          <button type="button" className={styles.saveQuitButton} onClick={onSaveAndQuit} disabled={quitting}><Save size={14} /> {quitting ? 'Menyimpan progress...' : 'Save & Quit'}</button>
        </div>
      </main>
    </motion.div>
  )
}

function SectionTransitionCard({ section, onContinue }: { section: JourneySection; onContinue: () => void }) {
  const copy = journeyCopy[section]
  const Icon = sectionIcons[section]
  const index = journeyOrder.indexOf(section)
  return (
    <motion.div className={styles.sectionTransitionCard} initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -12 }} transition={{ duration: 0.34 }}>
      <span className={styles.transitionStep}>0{index + 1}</span>
      <span className={styles.transitionIcon}><Icon size={29} /></span>
      <span className={styles.kicker}>{copy.eyebrow}</span>
      <h2>{copy.label}</h2>
      <p>{copy.intro}</p>
      <div className={styles.transitionLine}><i /></div>
      <button type="button" onClick={onContinue}>Mulai sekarang <ArrowRight size={15} /></button>
    </motion.div>
  )
}

function GuidedQuestion({ icon, eyebrow, title, explanation, value, onChange, placeholder, counter, canContinue, onBack, backDisabled, onContinue, continueLabel, subProgress, extraAction }: {
  icon: React.ReactNode
  eyebrow: string
  title: string
  explanation: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  counter: string
  canContinue: boolean
  onBack: () => void
  backDisabled: boolean
  onContinue: () => void
  continueLabel: string
  subProgress: string
  extraAction?: React.ReactNode
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={eyebrow} className={styles.guideBody} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }}>
        <div className={styles.questionMeta}><span className={styles.guideIcon}>{icon}</span><b>{subProgress}</b></div>
        <span className={styles.kicker}>{eyebrow}</span>
        <h2>{title}</h2>
        <div className={styles.explanationBox}><Lightbulb size={18} /><p>{explanation}</p></div>
        <label className={styles.guideTextarea}>
          <textarea autoFocus value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} rows={9} />
          <span>{counter}</span>
        </label>
        <div className={styles.guideFooter}>
          <button type="button" className={styles.quietButton} onClick={onBack} disabled={backDisabled}><ArrowLeft size={15} /> Kembali</button>
          <div className={styles.guideFooterActions}>{extraAction}<button type="button" className={styles.primaryButtonLarge} disabled={!canContinue} onClick={onContinue}>{continueLabel} <ArrowRight size={17} /></button></div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function SectionIntro({ section, action }: { section: JourneySection; action?: React.ReactNode }) {
  const copy = journeyCopy[section]
  const Icon = sectionIcons[section]
  return (
    <section className={styles.sectionIntro}>
      <div><span className={styles.kicker}><Icon size={13} /> {copy.eyebrow}</span><h2>{copy.label}</h2><p>{copy.intro}</p></div>
      {action}
    </section>
  )
}

function PromptCards({ prompts, onCopy }: { prompts: RecommendedPrompt[]; onCopy: (prompt: RecommendedPrompt) => void }) {
  if (!prompts.length) return <EmptyState icon={<Lightbulb size={22} />} title="Belum ada prompt" text="Pilih role untuk mengambil tiga rekomendasi terbaik." />
  return (
    <div className={styles.promptGrid}>
      {prompts.map((prompt, index) => (
        <article key={prompt.id}>
          <div><span>0{index + 1}</span><small>{prompt.category}</small></div>
          <h3>{prompt.title}</h3>
          <p>{prompt.why}</p>
          <button type="button" onClick={() => onCopy(prompt)}><Copy size={15} /> Copy prompt lengkap</button>
        </article>
      ))}
    </div>
  )
}

function ExperimentForm({ draft, onChange, onSave }: { draft: Omit<Experiment, 'id' | 'createdAt'>; onChange: React.Dispatch<React.SetStateAction<Omit<Experiment, 'id' | 'createdAt'>>>; onSave: () => void }) {
  return (
    <div className={styles.experimentForm}>
      <label><span>Nama experiment</span><input value={draft.name} onChange={event => onChange(current => ({ ...current, name: event.target.value }))} placeholder="Contoh: Hook pain vs hook result" /></label>
      <label><span>Hipotesis</span><textarea value={draft.hypothesis} onChange={event => onChange(current => ({ ...current, hypothesis: event.target.value }))} placeholder="Jika aku mengubah..., maka... karena..." rows={4} /></label>
      <label><span>Link konten</span><input value={draft.contentUrl} onChange={event => onChange(current => ({ ...current, contentUrl: event.target.value }))} placeholder="Instagram, TikTok, atau YouTube" /></label>
      <div className={styles.formActionRow}><CustomDropdown value={draft.status} options={experimentStatuses} onChange={value => onChange(current => ({ ...current, status: value as ExperimentStatus }))} tone={statusTone(draft.status)} /><button type="button" className={styles.primaryButton} onClick={onSave}><Plus size={15} /> Simpan experiment</button></div>
    </div>
  )
}

function ContentPreview({ url, title }: { url: string; title: string }) {
  if (!url) return null
  const embed = getEmbedUrl(url)
  if (embed) {
    return <div className={styles.contentEmbed}><iframe src={embed} title={`Preview ${title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" /></div>
  }
  return (
    <a className={styles.linkPreview} href={cleanUrl(url)} target="_blank" rel="noreferrer">
      <span><ExternalLink size={18} /></span><div><small>Content preview</small><strong>{title}</strong><p>{url}</p></div><Eye size={16} />
    </a>
  )
}

function getEmbedUrl(url: string) {
  try {
    const parsed = new URL(cleanUrl(url))
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop()
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }
    if (parsed.hostname === 'youtu.be') return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`
    if (parsed.hostname.includes('instagram.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean)
      if (['p', 'reel', 'tv'].includes(parts[0]) && parts[1]) return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed/`
    }
    if (parsed.hostname.includes('tiktok.com')) {
      const match = parsed.pathname.match(/\/video\/(\d+)/)
      if (match) return `https://www.tiktok.com/player/v1/${match[1]}`
    }
  } catch {
    return ''
  }
  return ''
}

function ResultForm({ experiment, onChange, onDone }: { experiment: Experiment; onChange: (experiment: Experiment) => void; onDone: () => void }) {
  const resultFields: Array<[keyof Experiment['result'], string]> = [['views', 'Views'], ['likes', 'Likes'], ['comments', 'Comments'], ['shares', 'Shares'], ['saves', 'Saves'], ['clicks', 'Clicks'], ['leads', 'Leads']]
  return (
    <div className={styles.resultForm}>
      <div className={styles.resultGrid}>
        {resultFields.map(([key, label]) => <label key={key}><span>{label}</span><input type="number" min="0" value={experiment.result[key] || ''} onChange={event => onChange({ ...experiment, result: { ...experiment.result, [key]: Math.max(0, Number(event.target.value)) } })} /></label>)}
      </div>
      <label><span>Apa yang kamu pelajari?</span><textarea rows={4} value={experiment.learning} onChange={event => onChange({ ...experiment, learning: event.target.value })} placeholder="Pola apa yang layak dipertahankan, diubah, atau dihentikan?" /></label>
      <button type="button" className={styles.primaryButton} onClick={onDone}><Save size={15} /> Simpan result</button>
    </div>
  )
}

function MetricForm({ draft, onChange, onSave }: { draft: Omit<MetricSnapshot, 'id'>; onChange: React.Dispatch<React.SetStateAction<Omit<MetricSnapshot, 'id'>>>; onSave: () => void }) {
  const fields: Array<[keyof Omit<MetricSnapshot, 'id' | 'month'>, string]> = [['followers', 'Followers / subscriber'], ['averageViews', 'Average views'], ['engagement', 'Total engagement'], ['leads', 'Qualified leads'], ['sales', 'Sales']]
  return (
    <div className={styles.metricForm}>
      <label><span>Bulan</span><input type="month" value={draft.month} onChange={event => onChange(current => ({ ...current, month: event.target.value }))} /></label>
      {fields.map(([key, label]) => <label key={key}><span>{label}</span><input type="number" min="0" value={draft[key] || ''} onChange={event => onChange(current => ({ ...current, [key]: Math.max(0, Number(event.target.value)) }))} placeholder="0" /></label>)}
      <button type="button" className={styles.primaryButton} onClick={onSave}><Save size={15} /> Simpan snapshot</button>
    </div>
  )
}

function MetricRow({ metric }: { metric: MetricSnapshot }) {
  return (
    <article className={styles.metricRow}>
      <div><CalendarDays size={18} /><strong>{metric.month}</strong></div>
      <span><small>Followers</small><b>{metric.followers.toLocaleString('id-ID')}</b></span>
      <span><small>Avg. views</small><b>{metric.averageViews.toLocaleString('id-ID')}</b></span>
      <span><small>Engagement</small><b>{metric.engagement.toLocaleString('id-ID')}</b></span>
      <span><small>Leads</small><b>{metric.leads.toLocaleString('id-ID')}</b></span>
      <span><small>Sales</small><b>{metric.sales.toLocaleString('id-ID')}</b></span>
    </article>
  )
}

function DeliverableList({ deliverables, onStatus }: { deliverables: Deliverable[]; onStatus: (id: string, status: Deliverable['status']) => void }) {
  return (
    <div className={styles.deliverableList}>
      {deliverables.map(item => (
        <article key={item.id}>
          <span className={styles.deliverableCode}>{item.code}</span>
          <span className={styles.deliverableFile}><FileText size={19} /></span>
          <div><h3>{item.name}</h3><p>{item.description}</p></div>
          <CustomDropdown value={item.status} options={deliverableStatuses} onChange={value => onStatus(item.id, value as Deliverable['status'])} tone={statusTone(item.status)} large />
        </article>
      ))}
    </div>
  )
}

function SocialProfileStrip({ profiles, onOpen }: { profiles: WorkspaceData['socialProfiles']; onOpen: (url: string) => void }) {
  const connected = profiles.filter(profile => profile.url)
  return (
    <section className={styles.socialStrip}>
      <div className={styles.socialStripLabel}><Link2 size={17} /><span><strong>Connected profiles</strong><small>Baseline audience tersimpan</small></span></div>
      <div className={styles.socialProfilesLine}>
        {connected.map(profile => {
          const Icon = profile.platform === 'instagram' ? Camera : profile.platform === 'youtube' ? Video : Play
          return <button type="button" key={profile.platform} onClick={() => onOpen(profile.url)}><Icon size={17} /><span><strong>{socialHandle(profile.url)}</strong><small>{profile.audienceCount.toLocaleString('id-ID')} {profile.platform === 'youtube' ? 'subscriber' : 'followers'}</small></span><ExternalLink size={13} /></button>
        })}
        {!connected.length && <span className={styles.noSocial}>Belum ada profile terhubung.</span>}
      </div>
    </section>
  )
}

function CustomDropdown({ value, options, onChange, tone, large = false }: { value: string; options: readonly string[]; onChange: (value: string) => void; tone?: string; large?: boolean }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 180, openUp: false })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const panelHeight = Math.min(options.length * 43 + 12, 240)
      const openUp = window.innerHeight - rect.bottom < panelHeight + 12 && rect.top > panelHeight
      setPosition({ top: openUp ? rect.top - panelHeight - 6 : rect.bottom + 6, left: Math.min(rect.left, window.innerWidth - Math.max(rect.width, 180) - 12), width: Math.max(rect.width, 180), openUp })
    }
    const closeOutside = (event: MouseEvent) => {
      const node = event.target as Node
      if (!triggerRef.current?.contains(node) && !panelRef.current?.contains(node)) setOpen(false)
    }
    place()
    document.addEventListener('mousedown', closeOutside)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      document.removeEventListener('mousedown', closeOutside)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, options.length])

  return (
    <>
      <button ref={triggerRef} type="button" className={`${styles.dropdownTrigger} ${tone || ''} ${large ? styles.dropdownLarge : ''}`} onClick={() => setOpen(current => !current)} aria-expanded={open}>
        <span>{value}</span><ChevronDown size={15} className={open ? styles.chevronOpen : ''} />
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div ref={panelRef} className={`${styles.dropdownPanel} ${position.openUp ? styles.dropdownPanelUp : ''}`} style={{ top: position.top, left: position.left, width: position.width }} role="menu">
          {options.map(option => <button type="button" key={option} className={option === value ? styles.dropdownOptionActive : ''} onClick={() => { onChange(option); setOpen(false) }}><span>{option}</span>{option === value && <Check size={14} />}</button>)}
        </div>,
        document.body
      )}
    </>
  )
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className={styles.emptyState}>{icon}<strong>{title}</strong><p>{text}</p></div>
}
