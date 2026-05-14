import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'
import type { NavLink } from '@/lib/supabaseClient'
import AboutClient from './AboutClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About | Marcatching',
  description: 'Marketing isn\'t selling. It\'s system design. Kami membongkar cara kerja sistem di balik kebisingan pasar.',
  openGraph: {
    title: 'About | Marcatching',
    description: 'Marketing isn\'t selling. It\'s system design.',
    url: 'https://www.marcatching.com/about',
  }
}

export default async function AboutPage() {
  // Fetch Navigation Links
  const { data: navLinksRes } = await supabase
    .from('nav_links')
    .select('*')
    .eq('is_active', true)
    .order('order_index')
  const navLinks: NavLink[] = navLinksRes || []

  // Fetch About Page Config
  const { data: configRes } = await supabase
    .from('about_config')
    .select('*')
    .limit(1)
    .single()

  const defaultConfig = {
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

  const config = configRes || defaultConfig

  // Resolve dynamic ecosystem sections
  const sections = config.ecosystem_sections || []
  const resolvedSections = []

  for (const section of sections) {
    const resolvedItems = []
    for (const item of section.items || []) {
      if (item.type === 'article' && item.ref_id) {
        const { data: article } = await supabase
          .from('articles')
          .select('*, article_categories(name, slug), article_authors(name, photo_url)')
          .eq('id', item.ref_id)
          .single()
        if (article) resolvedItems.push({ ...item, data: article })
      } else if (item.type === 'product' && item.ref_id) {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.ref_id)
          .single()
        if (product) resolvedItems.push({ ...item, data: product })
      } else if (item.type === 'survey' && item.ref_id) {
        const { data: survey } = await supabase
          .from('surveys')
          .select('*')
          .eq('id', item.ref_id)
          .single()
        if (survey) resolvedItems.push({ ...item, data: survey })
      } else if (item.type === 'content') {
        resolvedItems.push(item)
      }
    }
    resolvedSections.push({ ...section, items: resolvedItems })
  }

  return (
    <AboutClient 
      navLinks={navLinks} 
      config={config} 
      resolvedSections={resolvedSections}
    />
  )
}
