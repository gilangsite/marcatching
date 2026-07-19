export type ExperienceSectionId =
  | 'hero'
  | 'problem'
  | 'gap'
  | 'data'
  | 'build'
  | 'ecosystem'
  | 'impact'
  | 'pillars'
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
  { id: 'hero', label: 'Intelligence Core' },
  { id: 'problem', label: 'The Problem' },
  { id: 'gap', label: 'AI Adoption Gap' },
  { id: 'data', label: 'Data Urgency' },
  { id: 'build', label: 'What We Build' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'impact', label: 'Impact' },
  { id: 'pillars', label: 'Pillars' },
  { id: 'founder', label: 'Founder' },
  { id: 'paths', label: 'Choose Your Path' },
  { id: 'finale', label: 'Build the System' },
]

export const NOISE_TERMS = [
  'Content', 'Trends', 'Likes', 'AI', 'Ads',
  'Audience', 'Funnel', 'Conversion', 'Revenue', 'Data',
]

export const SYSTEM_FLOW = ['Content', 'Trust', 'Offer', 'Conversion', 'Revenue']

export const AI_PIPELINE = [
  'Research', 'Content', 'Campaign', 'Automation', 'Customer Journey', 'Decision',
]

export const DATA_CHAPTERS = [
  {
    id: 'economy',
    value: 146,
    prefix: 'USD ',
    suffix: 'B',
    label: 'Indonesia digital economy projection',
    source: 'Projection cited by the existing Marcatching homepage · 2025',
    visual: 'bars',
  },
  {
    id: 'internet',
    value: 212,
    prefix: '',
    suffix: ' juta',
    label: 'Internet users in Indonesia',
    source: 'Statista · 2024 · as cited by Marcatching',
    visual: 'network',
  },
  {
    id: 'integration',
    value: 26,
    prefix: '',
    suffix: '%',
    label: 'Businesses with real AI integration',
    source: 'Compared with 93% confidence · existing homepage figure',
    visual: 'rings',
  },
  {
    id: 'efficiency',
    value: 50,
    prefix: '+',
    suffix: '%',
    label: 'Potential workflow efficiency increase',
    source: 'McKinsey · 2023 · as cited by Marcatching',
    visual: 'flow',
  },
] as const

export const CAPABILITIES = [
  {
    number: '01',
    title: 'Market Intelligence',
    description: 'Membaca tren, kompetitor, perilaku audiens, dan peluang kategori agar bisnis tidak bergerak berdasarkan asumsi.',
    input: 'Market noise',
    process: 'Signal decoding',
    output: 'Strategic direction',
    flow: ['Noise', 'Signals', 'Strategic Direction'],
  },
  {
    number: '02',
    title: 'Brand Perception System',
    description: 'Membantu bisnis mendesain cara audiens melihat, memahami, dan mempercayai brand.',
    input: 'Product',
    process: 'Meaning design',
    output: 'Preference',
    flow: ['Product', 'Meaning', 'Trust', 'Preference'],
  },
  {
    number: '03',
    title: 'AI-Powered Marketing Workflow',
    description: 'Mengintegrasikan AI ke dalam proses riset, content ideation, copywriting, campaign planning, automation, dan decision-making.',
    input: 'Raw intelligence',
    process: 'Human + AI workflow',
    output: 'Faster decisions',
    flow: ['Research', 'Ideation', 'Production', 'Automation', 'Decision'],
  },
  {
    number: '04',
    title: 'Growth & Conversion Architecture',
    description: 'Menyusun sistem yang menghubungkan attention, trust, offer, funnel, dan revenue menjadi satu ekosistem yang terukur.',
    input: 'Attention',
    process: 'Conversion system',
    output: 'Revenue',
    flow: ['Attention', 'Trust', 'Offer', 'Conversion', 'Revenue'],
  },
] as const

export const ECOSYSTEM_FLOW = [
  'Insight', 'Article', 'Survey', 'Course', 'Tools', 'Implementation', 'Impact',
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
