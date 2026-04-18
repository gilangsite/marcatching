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
    comparison_cons: ['Menginginkan jalan pintas atau hasil instan semalam', 'Mencari trik kontroversi untuk viral', 'Hanya peduli pada likes tanpa melihat impact ke revenue', 'Malas beradaptasi dengan teknologi baru']
  }

  const config = configRes || defaultConfig

  return (
    <AboutClient navLinks={navLinks} config={config} />
  )
}
