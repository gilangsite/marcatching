import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import ArticleClient from './ArticleClient'
import type { Article, Product, Link as LinkType } from '@/lib/supabaseClient'

type Props = {
  params: Promise<{ slug: string }>
}

// ── SEO Metadata ─────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  const { data: article } = await supabase
    .from('articles')
    .select('*, article_categories(name)')
    .eq('slug', slug)
    .single()

  if (!article) return { title: 'Article Not Found | Marcatching' }

  const title = `${article.title} | Marcatching`
  const description = article.excerpt || `Baca artikel lengkap tentang ${article.title} di Marcatching.`
  
  // Find first image for social preview
  let imageUrl = 'https://www.marcatching.com/opengraph-image.png'
  if (Array.isArray(article.content)) {
    const imgBlock = article.content.find((b: any) => b.type === 'image' && b.url)
    if (imgBlock) {
      const m = imgBlock.url.match(/id=([^&]+)/)
      if (m?.[1]) imageUrl = `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200-h630`
      else imageUrl = imgBlock.url
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.marcatching.com/article/${slug}`,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    }
  }
}

// ── Server Component ──────────────────────────────────────────
export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params

  // 1. Fetch Article with joined data
  const { data: article } = await supabase
    .from('articles')
    .select('*, article_categories(*), article_authors(*)')
    .eq('slug', slug)
    .single()

  if (!article) notFound()

  // 2. Fetch Navbar Links
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .order('order_index')

  // 3. Fetch Products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  return (
    <ArticleClient 
      article={article as any} 
      products={(products || []) as any} 
      navbarLinks={(links || []) as any} 
    />
  )
}
