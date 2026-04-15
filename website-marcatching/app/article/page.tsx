import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'
import ArticleListClient from './ArticleListClient'

export const metadata: Metadata = {
  title: 'Blog & Articles | Marcatching',
  description: 'Dapatkan insight terbaru, strategi marketing, dan tips produktivitas dari tim Marcatching untuk mengakselerasi bisnismu.',
  openGraph: {
    title: 'Blog & Articles | Marcatching',
    description: 'Dapatkan insight terbaru, strategi marketing, dan tips produktivitas dari tim Marcatching.',
    url: 'https://www.marcatching.com/article',
    images: [{ url: 'https://www.marcatching.com/opengraph-image.png' }],
  }
}

export default async function ArticleListPage() {
  // 1. Initial Fetch for SSR
  const { data: articles } = await supabase
    .from('articles')
    .select('*, article_categories(name, slug), article_authors(name, photo_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(12)

  // 2. Fetch Categories
  const { data: categories } = await supabase
    .from('article_categories')
    .select('*')
    .order('name')

  // 3. Fetch Navbar Links
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .order('order_index')

  return (
    <ArticleListClient 
      initialArticles={(articles || []) as any} 
      categories={(categories || []) as any} 
      navbarLinks={(links || []) as any} 
    />
  )
}
