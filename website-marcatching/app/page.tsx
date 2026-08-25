import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'
import type { NavLink } from '@/lib/supabaseClient'
import AboutClient from './about/AboutClient'
import type {
  ExperienceConfig,
  ProductCardData,
} from './about/experience-data'

// Public, non-personalized content can be served immediately from the edge.
// Revalidate frequently so dashboard edits become visible within one minute.
export const dynamic = 'force-static'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Marcatching | AI That Remembers Your Brand',
  description: 'Personalized AI for sharper brand decisions, faster marketing execution, and new revenue streams through one Marcatching ecosystem.',
  openGraph: {
    title: 'Generic AI Is Dead. Yours Remembers.',
    description: 'Brand Memory, Prompt Library, Agentic Dashboard, and Revenue Stream in one personalized ecosystem.',
    url: 'https://marcatching.com',
  },
}

export default async function HomePage() {
  const [{ data: navLinksRes }, { data: configRes }] = await Promise.all([
    supabase
      .from('nav_links')
      .select('*')
      .eq('is_active', true)
      .order('order_index'),
    supabase
      .from('about_config')
      .select('*')
      .limit(1)
      .single(),
  ])
  const navLinks: NavLink[] = navLinksRes || []

  const defaultConfig: ExperienceConfig = {
    contact_email: 'gilang@marcatching.com',
    cta_text: 'Get Your First AI Agent',
    cta_url: '/course/login',
    founder_name: 'Gilang Ramadhan',
    founder_photo_url: '',
    founder_quote: 'Kesuksesan di era AI milik mereka yang mampu mensintesis raw data buatan mesin menjadi arah kreatif yang memiliki nyawa. Marketing bukan sekadar tentang barang apa yang kamu kemas, tapi sistem apa yang kamu desain untuk mengunci perhatian audiens secara elegan.',
    comparison_pros: ['Mencari hasil bisnis jangka panjang', 'Menginginkan sistem berbasis AI', 'Ingin memposisikan brand dengan estetika premium', 'Percaya pada data, bukan sekadar opini'],
    comparison_cons: ['Menginginkan jalan pintas atau hasil instan semalam', 'Mencari trik kontroversi untuk viral', 'Hanya peduli pada likes tanpa melihat impact ke revenue', 'Malas beradaptasi dengan teknologi baru'],
    // Ecosystem links
    article_url: '/article',
    instagram_url: 'https://www.instagram.com/marcatching.id/',
    tiktok_url: 'https://www.tiktok.com/@marcatching',
    survey_url: '/survey',
    store_url: '/store',
    // Impact stats
    stat_umkm_helped: 0,
    stat_total_reach: 0,
    stat_product_sold: 0,
    // Embed visuals
    embed_social_title: 'Tonton di Instagram',
    embed_survey_image_url: '',
    embed_survey_title: 'Mulai Survey Gratis',
    embed_product_id: null,
    ecosystem_sections: []
  }

  const config: ExperienceConfig = {
    ...defaultConfig,
    ...((configRes ?? {}) as Partial<ExperienceConfig>),
  }

  let heroProduct: ProductCardData | null = null
  if (config.embed_product_id) {
    const { data } = await supabase
      .from('products')
      .select('id, slug, name, sub_headline, description, image_url, price_before_discount, price_after_discount, discount_percentage')
      .eq('id', config.embed_product_id)
      .eq('is_active', true)
      .eq('is_coming_soon', false)
      .maybeSingle()
    heroProduct = data as ProductCardData | null
  }

  return (
    <AboutClient
      navLinks={navLinks}
      config={config}
      heroProduct={heroProduct}
    />
  )
}
