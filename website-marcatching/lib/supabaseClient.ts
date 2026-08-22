import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jimbydkqlputlvpcspjv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_rF4yCw9hMldmrawKp3tALg_Y0zO7MAD'

// Member session needs to be visible across course.marcatching.com, marcatching.com
// (store), and any other *.marcatching.com surface, so the browser client stores its
// session in a cookie scoped to the shared parent domain instead of per-origin localStorage.
// Local dev (*.localhost) intentionally does NOT get a cross-subdomain domain here —
// Chromium rejects `Domain=localhost` set from a subdomain like course.localhost
// (verified: the Set-Cookie is silently dropped, breaking login entirely), because it
// treats the single-label `localhost` host as a public-suffix boundary. Falling back to
// a host-only cookie keeps login working per-surface in dev; only real domains support
// the cross-subdomain sharing this is for, and marcatching.com is a real domain.
function computeCookieDomain(): string | undefined {
  const host = window.location.hostname
  if (host.endsWith('marcatching.com')) return '.marcatching.com'
  return undefined
}

function createMarcatchingClient() {
  if (typeof window === 'undefined') {
    // Server: stateless anon client for public reads only. Server Components/routes
    // that need the signed-in user go through lib/supabaseServer.ts instead.
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      domain: computeCookieDomain(),
      sameSite: 'lax',
      secure: window.location.protocol === 'https:',
    },
  })
}
type MarcatchingSupabaseClient = ReturnType<typeof createMarcatchingClient>

const globalForSupabase = globalThis as typeof globalThis & {
  marcatchingSupabase?: MarcatchingSupabaseClient
}

// Reuse one browser auth client across Next.js development hot reloads.
// Creating a fresh GoTrue client on every refresh can make getSession race
// against another instance using the same local-storage key.
export const supabase =
  globalForSupabase.marcatchingSupabase ??
  createMarcatchingClient()

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.marcatchingSupabase = supabase
}

export type Link = {
  id: string
  title: string
  url: string | null
  icon: string
  status: 'active' | 'coming_soon'
  order_index: number
  created_at: string

  // New fields for Text & Image blocks
  type: 'button' | 'text' | 'carousel' | 'video' | 'product' | string
  btn_color?: string | null
  text_color?: string | null
  text_size?: string | null
  text_align?: string | null
  text_bold?: boolean | null
  text_italic?: boolean | null
  carousel_aspect_ratio?: string | null
  image_data?: any // jsonb array of { url: string, link: string }
}

export type NavLink = {
  id: string
  title: string
  url: string | null
  icon: string
  text_color: string | null
  btn_color: string | null
  order_index: number
  is_active: boolean
  created_at: string
}

export type Contact = {
  id: string
  email: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  sub_headline: string | null
  description: string | null
  image_url: string | null
  price_before_discount: number
  price_after_discount: number
  discount_percentage: number
  features: string[]
  is_active: boolean
  is_coming_soon: boolean
  category_id: string | null
  checkout_clicks: number
  created_at: string
}

export type ProductCategory = {
  id: string
  name: string
  slug: string
  order_index: number
  created_at: string
}

export type Promotion = {
  id: string
  headline: string
  description: string | null
  // Deprecated: single-product promotions used this FK directly. Products now live in
  // promotion_products (many-to-many) — see PromotionWithProducts.products below.
  product_id: string | null
  status: 'on_going' | 'off'
  ends_at: string | null
  created_at: string
  updated_at: string
}

export type PromotionProductSummary = Pick<Product, 'id' | 'name' | 'slug' | 'image_url' | 'price_before_discount' | 'price_after_discount' | 'discount_percentage' | 'is_coming_soon'>

export type PromotionWithProducts = Promotion & {
  products: PromotionProductSummary[]
}

export type StorePageBlock = {
  id: string
  type: 'headline' | 'text' | 'image' | 'video' | 'button' | 'product' | 'promotion'
  content: {
    // headline
    text?: string
    size?: string
    color?: string
    align?: string
    // text
    weight?: string
    italic?: boolean
    font_size?: string
    // image
    url?: string
    aspect_ratio?: string
    caption?: string
    // video
    video_url?: string
    // button
    btn_text?: string
    btn_url?: string
    btn_color?: string
    btn_text_color?: string
    // product
    product_id?: string
    store_status?: 'active' | 'coming_soon' | 'hidden'
  }
  order_index: number
  is_active: boolean
  created_at: string
}

export type StoreProduct = {
  id: string
  product_id: string
  order_index: number
  store_status: 'active' | 'coming_soon' | 'hidden'
  created_at: string
  // Joined
  products?: Product
}

export type Voucher = {
  id: string
  code: string
  discount_value: number
  discount_type: 'fixed' | 'percentage'
  is_active: boolean
  applicable_products: string[] | null // null = all products; array of product IDs = restricted
  created_at: string
}

export type AddonItem = {
  id: string
  name: string
  priceOriginal: number
  priceDiscounted: number
}

export type Order = {
  id: string
  product_id: string | null
  product_name: string
  full_name: string
  email: string
  whatsapp: string
  background: string | null
  referral_source: string | null
  voucher_code: string | null
  price_original: number
  price_discounted: number
  voucher_discount: number
  total_paid: number
  addon_items: AddonItem[] | null
  status: string
  midtrans_order_id: string | null
  midtrans_transaction_id: string | null
  payment_status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'creation_failed' | 'legacy_confirmed'
  payment_type: string | null
  fraud_status: string | null
  snap_token: string | null
  payment_redirect_url: string | null
  paid_at: string | null
  payment_updated_at: string | null
  fulfillment_status: string
  confirmation_sent_at: string | null
  public_status_token: string
  created_at: string
}

export type CourseMaterial = {
  id: string
  product_id: string
  title: string
  type: 'pdf' | 'video' | 'md' | 'zip'
  content_url: string
  order_index: number
  created_at: string
}

export type CourseEnrollment = {
  id: string
  user_id: string
  product_id: string
  order_id: string | null
  email: string
  created_at: string
}

export type LearningProgress = {
  id: string
  user_id: string
  material_id: string
  completed_at: string
  created_at: string
}

export type CourseAccessEmail = {
  id: string
  email: string
  product_id: string
  order_id: string
  created_at: string
}

export type AnalyticsEvent = {
  id: string
  event_type: 'page_view' | 'click'
  page_path: string | null
  link_id: string | null
  link_title: string | null
  session_id: string | null
  referrer: string | null
  user_agent: string | null
  created_at: string
}

// ── Article System ──────────────────────────────────────────

export type ArticleCategory = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type ArticleAuthor = {
  id: string
  name: string
  photo_url: string | null
  created_at: string
}

export type ArticleBlock =
  | {
      type: 'headline'
      id: string
      text: string
      size: 'hero' | 'h1' | 'h2' | 'h3' | 'sub'
      color: string
      font_family: string
      align: 'left' | 'center' | 'right'
    }
  | {
      type: 'text'
      id: string
      text: string
      size: '2rem' | '1.5rem' | '1.25rem' | '1rem' | '0.875rem' | '0.75rem'
      weight: 'normal' | 'bold' | 'semibold'
      italic: boolean
      color: string
      font_family: string
      align: 'left' | 'center' | 'right' | 'justify'
    }
  | {
      type: 'image'
      id: string
      url: string
      aspect_ratio: '1:3' | '3:5' | '4:5' | '5:3' | '5:4' | '9:16' | '16:9'
      caption?: string
    }
  | {
      type: 'product'
      id: string
      product_id: string
    }
  | {
      type: 'video'
      id: string
      url: string
      caption?: string
    }

export type Article = {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'unpublished'
  category_id: string | null
  author_id: string | null
  view_count: number
  content: ArticleBlock[]
  image_urls: string[]
  excerpt: string | null
  created_at: string
  updated_at: string
  published_at: string | null
  // Joined
  article_categories?: ArticleCategory | null
  article_authors?: ArticleAuthor | null
}

// ── Champagne (Campaigns) System ──────────────────────────────

export type CampaignBlock = {
  id: string
  type: 'headline' | 'text' | 'image' | 'video' | 'button' | 'product'
  content: {
    // headline
    text?: string
    size?: string
    color?: string
    align?: string
    font_family?: string
    // text
    weight?: string
    italic?: boolean
    font_size?: string
    // image
    url?: string
    aspect_ratio?: string
    caption?: string
    // video
    video_url?: string
    // button
    btn_text?: string
    btn_url?: string
    btn_color?: string
    btn_text_color?: string
    // product
    product_id?: string
    store_status?: 'active' | 'coming_soon' | 'hidden'
  }
}

export type Campaign = {
  id: string
  title: string
  slug: string
  theme: 'black' | 'white'
  status: 'draft' | 'published'
  blocks: CampaignBlock[]
  created_at: string
  updated_at: string
}
