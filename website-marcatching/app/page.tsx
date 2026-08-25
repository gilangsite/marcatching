import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'
import type { NavLink } from '@/lib/supabaseClient'
import AboutClient from './about/AboutClient'
import type {
  ArticleCardData,
  ExperienceConfig,
  ProductCardData,
  ResolvedEcosystemItem,
  ResolvedEcosystemSection,
  SurveyCardData,
} from './about/experience-data'

// Public, non-personalized content can be served immediately from the edge.
// Revalidate frequently so dashboard edits become visible within one minute.
export const dynamic = 'force-static'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Marcatching — Build Your Brand, Workflow, and Revenue',
  description: 'Satu ecosystem untuk membangun brand yang diingat, menjalankan digital marketing dengan Brand Memory, Prompt Library, dan Skill Engine, lalu bertumbuh melalui Marcatching Affiliate Program.',
  openGraph: {
    title: 'Marcatching — Learn. Build. Earn.',
    description: 'Bangun brand yang diingat, jalankan workflow yang terasa milikmu, dan buka jalur penghasilan baru dalam satu ecosystem Marcatching.',
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
    cta_text: 'Marcatching Store',
    cta_url: '/store',
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

  const sections = config.ecosystem_sections || []
  const resolvedSections: ResolvedEcosystemSection[] = await Promise.all(sections.map(async section => {
    const resolvedItems = (await Promise.all((section.items || []).map(async item => {
      if (item.type === 'article' && item.ref_id) {
        const { data: article } = await supabase
          .from('articles')
          .select('*, article_categories(name, slug), article_authors(name, photo_url)')
          .eq('id', item.ref_id)
          .single()
        return article ? { ...item, data: article as ArticleCardData } as ResolvedEcosystemItem : null
      } else if (item.type === 'product' && item.ref_id) {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.ref_id)
          .single()
        return product ? { ...item, data: product as ProductCardData } as ResolvedEcosystemItem : null
      } else if (item.type === 'survey' && item.ref_id) {
        const { data: survey } = await supabase
          .from('surveys')
          .select('*')
          .eq('id', item.ref_id)
          .single()
        return survey ? { ...item, data: survey as SurveyCardData } as ResolvedEcosystemItem : null
      } else if (item.type === 'content') {
        return item as ResolvedEcosystemItem
      }
      return null
    }))).filter((item): item is ResolvedEcosystemItem => item !== null)

    return { ...section, items: resolvedItems }
  }))

  return (
    <AboutClient
      navLinks={navLinks}
      config={config}
      resolvedSections={resolvedSections}
    />
  )
}
