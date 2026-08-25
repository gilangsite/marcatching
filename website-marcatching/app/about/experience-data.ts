export type ExperienceSectionId =
  | 'hero'
  | 'problem'
  | 'data'
  | 'build'
  | 'ecosystem'
  | 'founder'
  | 'paths'
  | 'finale'

export type CapabilityTier = 'A' | 'B' | 'C'

export type ArticleContentBlock = {
  type?: string
  url?: string
  text?: string
}

export type ArticleCardData = {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  content?: ArticleContentBlock[] | null
  published_at?: string | null
  view_count?: number | null
  article_categories?: { name: string; slug?: string } | null
  article_authors?: { name: string; photo_url?: string | null } | null
}

export type ProductCardData = {
  id: string
  slug: string
  name: string
  sub_headline?: string | null
  image_url?: string | null
  price_after_discount?: number | null
}

export type SurveyCardData = {
  id: string
  slug: string
  title: string
  description?: string | null
  image_url?: string | null
}

export type EcosystemItem = {
  id: string
  type: 'article' | 'product' | 'survey' | 'content'
  ref_id?: string | null
  content_url?: string | null
  content_title?: string | null
  content_image_url?: string | null
}

export type ResolvedEcosystemItem = EcosystemItem & {
  data?: ArticleCardData | ProductCardData | SurveyCardData
}

export type EcosystemSection = {
  id: string
  title: string
  items: EcosystemItem[]
}

export type ResolvedEcosystemSection = Omit<EcosystemSection, 'items'> & {
  items: ResolvedEcosystemItem[]
}

export type ExperienceConfig = {
  contact_email: string
  cta_text: string
  cta_url: string
  founder_name: string
  founder_photo_url: string
  founder_quote: string
  comparison_pros: string[]
  comparison_cons: string[]
  article_url: string
  instagram_url: string
  tiktok_url: string
  survey_url: string
  store_url: string
  stat_umkm_helped: number
  stat_total_reach: number
  stat_product_sold: number
  embed_social_title: string
  embed_survey_image_url: string
  embed_survey_title: string
  embed_product_id: string | null
  ecosystem_sections: EcosystemSection[]
}

export const EXPERIENCE_SECTIONS: { id: ExperienceSectionId; label: string }[] = [
  { id: 'hero', label: 'The Ecosystem' },
  { id: 'problem', label: 'Why It Matters' },
  { id: 'data', label: 'Why It Feels Different' },
  { id: 'build', label: 'Core System' },
  { id: 'ecosystem', label: 'Connected Growth' },
  { id: 'founder', label: 'Built by an Operator' },
  { id: 'paths', label: 'Built for You' },
  { id: 'finale', label: 'Start Building' },
]

export const NOISE_TERMS = [
  'Generic AI', 'Blank Brief', 'Lost Context',
  'Random Content', 'Split Tools', 'Zero Recall',
]

export const SYSTEM_FLOW = ['Brand Memory', 'Prompt Library', 'Skill Engine', 'Store', 'Affiliate']

export const AI_PIPELINE = [
  'Research', 'Content', 'Campaign', 'Automation', 'Customer Journey', 'Decision',
]

export const DATA_CHAPTERS = [
  {
    id: 'memory',
    display: 'Remembered',
    label: 'Brand Memory membuat setiap workflow dimulai dari identitasmu, bukan dari prompt kosong.',
    source: 'Positioning, audience, voice, offer, dan friction tetap hadir saat kamu berpindah dari satu pekerjaan ke pekerjaan berikutnya.',
    visual: 'bars',
  },
  {
    id: 'prompts',
    display: 'Ready',
    label: 'Prompt Library menghilangkan rasa buntu saat kamu harus mulai menulis, meriset, atau merancang campaign.',
    source: 'Pilih pekerjaan yang ingin diselesaikan. Konteks brand ikut terhubung agar output terasa lebih spesifik dan siap digunakan.',
    visual: 'network',
  },
  {
    id: 'skills',
    display: 'Repeatable',
    label: 'Marcatching Skill Engine mengubah keahlian menjadi workflow spesialis yang dapat dipakai berulang kali.',
    source: 'Gunakan versi original atau buat Skill yang dipersonalisasi dengan Brand Memory dan requirement milikmu sendiri.',
    visual: 'rings',
  },
  {
    id: 'affiliate',
    display: 'Earnable',
    label: 'Affiliate Program mengubah distribusi dan kepercayaan audiens menjadi channel penghasilan yang transparan.',
    source: 'Bagikan produk yang relevan, pantau klik dan komisi, lalu kelola payout dari workspace member yang sama.',
    visual: 'flow',
  },
] as const

export const CAPABILITIES = [
  {
    number: '01',
    title: 'Brand Memory',
    description: 'Isi konteks brand sekali—positioning, audience, voice, offer, dan friction—lalu bawa identitas yang sama ke setiap workflow Marcatching.',
    input: 'Brand truth',
    process: 'brand-memory.md',
    output: 'Consistent context',
    flow: ['Brand Truth', 'Memory', 'Personalization', 'Recall'],
  },
  {
    number: '02',
    title: 'Prompt Library',
    description: 'Buka prompt untuk riset, copywriting, campaign, content, atau conversion dengan Brand Memory yang otomatis ikut memberi konteks.',
    input: 'Next marketing task',
    process: 'Context-aware prompt',
    output: 'Sharper first output',
    flow: ['Choose Task', 'Attach Memory', 'Run Prompt', 'Refine'],
  },
  {
    number: '03',
    title: 'Marcatching Skill Engine',
    description: 'Ubah produk Skill yang kamu miliki menjadi operating workflow original atau versi personal yang membawa Brand Memory milikmu.',
    input: 'Execution goal',
    process: 'Skill + Brand Memory',
    output: 'Repeatable workflow',
    flow: ['Own Skill', 'Add Memory', 'Personalize', 'Execute'],
  },
  {
    number: '04',
    title: 'Affiliate Revenue System',
    description: 'Aktifkan program sebagai member, bagikan link produk yang relevan, lalu pantau atribusi, komisi, dan payout dalam satu workspace.',
    input: 'Audience trust',
    process: 'Trackable affiliate link',
    output: 'Commission income',
    flow: ['Choose Product', 'Share Link', 'Track Sale', 'Earn'],
  },
] as const

export const ECOSYSTEM_FLOW = [
  'Course', 'Brand Memory', 'Prompt Library', 'Skill Engine', 'Store', 'Affiliate Income',
]

export const PILLARS = [
  {
    number: '01',
    title: 'Noise Decoder',
    tagline: 'From scattered information to strategic clarity.',
    description: 'Memisahkan sinyal dari noise: mana tren yang layak diikuti, mana yang hanya distraksi, dan mana yang bisa menjadi peluang pertumbuhan.',
    label: 'Signal isolation',
  },
  {
    number: '02',
    title: 'Human & Machine',
    tagline: 'AI should accelerate human judgment, not replace it.',
    description: 'Menggunakan AI untuk berpikir, mengeksekusi, dan mengambil keputusan lebih cepat tanpa menghilangkan penilaian manusia.',
    label: 'Judgment augmentation',
  },
  {
    number: '03',
    title: 'Perception Design',
    tagline: 'People buy the clearest meaning.',
    description: 'Merancang narasi, visual, konteks, dan pesan yang membuat audiens memahami nilai bisnis dengan lebih cepat.',
    label: 'Meaning architecture',
  },
  {
    number: '04',
    title: 'Data Authority',
    tagline: 'Strong brands are not built by guesswork.',
    description: 'Menopang strategi dengan data, riset, behavioral insight, dan validasi pasar agar marketing tidak berhenti sebagai opini kreatif.',
    label: 'Evidence network',
  },
] as const
