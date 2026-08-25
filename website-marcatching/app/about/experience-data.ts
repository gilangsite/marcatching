export type ExperienceSectionId =
  | 'hero'
  | 'problem'
  | 'data'
  | 'hero-product'
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
  description?: string | null
  image_url?: string | null
  price_before_discount?: number | null
  price_after_discount?: number | null
  discount_percentage?: number | null
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
  { id: 'data', label: 'What You Get' },
  { id: 'hero-product', label: 'Hero Product' },
  { id: 'build', label: 'Core System' },
  { id: 'ecosystem', label: 'Testimonials' },
  { id: 'founder', label: 'Built by an Operator' },
  { id: 'paths', label: 'Built for You' },
  { id: 'finale', label: 'Start Building' },
]

export const NOISE_TERMS = [
  'Generic AI', 'Blank Brief', 'Lost Context',
  'Random Content', 'Split Tools', 'Zero Recall',
]

export const SYSTEM_FLOW = ['Brand Memory', 'Prompt Library', 'Agentic Dashboard', 'Revenue Stream']

export const AI_PIPELINE = [
  'Research', 'Content', 'Campaign', 'Automation', 'Customer Journey', 'Decision',
]

export const DATA_CHAPTERS = [
  {
    id: 'memory',
    display: 'Brand Memory',
    label: 'AI yang mengenali cara brand-mu berpikir, berbicara, dan memilih.',
    source: 'Simpan positioning, audience, voice, offer, dan friction sekali. Setiap workflow berikutnya dimulai dengan konteks yang sudah siap.',
    visual: 'bars',
  },
  {
    id: 'prompts',
    display: 'Prompt Library',
    label: 'Titik mulai yang tepat untuk setiap kebutuhan marketing brand-mu.',
    source: 'Pilih tujuanmu. Brand Memory langsung memberi konteks agar riset, copy, dan campaign terasa spesifik sejak output pertama.',
    visual: 'network',
  },
  {
    id: 'skills',
    display: 'Agentic Dashboard',
    label: 'Satu ruang untuk melihat konteks, prioritas, dan next action tanpa berpindah arah.',
    source: 'Agent-mu membawa kebutuhan brand ke dalam workflow yang terstruktur, sehingga keputusan penting bisa dibuat lebih cepat dan tepat.',
    visual: 'rings',
  },
  {
    id: 'affiliate',
    display: 'Revenue Stream',
    label: 'Pertumbuhan brand yang tidak berhenti di attention.',
    source: 'Jual produk, bagikan solusi yang relevan, pantau affiliate income, dan lihat setiap peluang revenue dari dashboard yang sama.',
    visual: 'flow',
  },
] as const

export const CAPABILITIES = [
  {
    number: '01',
    title: 'Brand Memory',
    description: 'Isi positioning, audience, voice, offer, dan friction sekali. Setiap agent dan prompt langsung bekerja dari identitas brand-mu.',
    input: 'Brand truth',
    process: 'brand-memory.md',
    output: 'Consistent context',
    flow: ['Brand Truth', 'Memory', 'Personalization', 'Recall'],
  },
  {
    number: '02',
    title: 'Prompt Library',
    description: 'Pilih kebutuhanmu dan mulai dari prompt yang sudah punya arah. Brand Memory membuat output pertama terasa lebih dekat dengan keputusan final.',
    input: 'Next marketing task',
    process: 'Context-aware prompt',
    output: 'Sharper first output',
    flow: ['Choose Task', 'Attach Memory', 'Run Prompt', 'Refine'],
  },
  {
    number: '03',
    title: 'Agentic Dashboard',
    description: 'Kelola agent, Brand Memory, workflow, dan prioritas dari satu dashboard yang memahami kebutuhan brand-mu sebelum memberi next action.',
    input: 'Brand objective',
    process: 'Context + Agent',
    output: 'Clear next action',
    flow: ['Set Objective', 'Read Memory', 'Choose Action', 'Move'],
  },
  {
    number: '04',
    title: 'Revenue Stream',
    description: 'Ubah produk, distribusi, dan kepercayaan audiens menjadi revenue yang bisa dilacak melalui store dan affiliate workspace.',
    input: 'Product or audience',
    process: 'Store + Affiliate',
    output: 'Trackable revenue',
    flow: ['Choose Offer', 'Share Value', 'Track Revenue', 'Earn'],
  },
] as const

export const ECOSYSTEM_FLOW = [
  'Brand Memory', 'Prompt Library', 'Agentic Dashboard', 'Revenue Stream',
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
