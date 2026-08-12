import type { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

type ProductLayoutProps = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

function getSocialImageUrl(url: string | null): string {
  const fallback = 'https://www.marcatching.com/opengraph-image.png'
  if (!url) return fallback

  const driveId = url.match(/[?&]id=([^&]+)/)?.[1]
    || url.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1]

  return driveId
    ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200-h1200`
    : url
}

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  const { slug } = await params
  const { data: product } = await supabase
    .from('products')
    .select('name, slug, sub_headline, description, image_url')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan | Marcatching',
      robots: { index: false, follow: false },
    }
  }

  const title = `${product.name} | Marcatching`
  const description = product.sub_headline
    || product.description
    || `Lihat detail dan penawaran ${product.name} di Marcatching.`
  const productUrl = `https://www.marcatching.com/product/${product.slug}`
  const imageUrl = getSocialImageUrl(product.image_url)

  return {
    title,
    description,
    alternates: { canonical: productUrl },
    openGraph: {
      title,
      description,
      type: 'website',
      url: productUrl,
      locale: 'id_ID',
      siteName: 'Marcatching',
      images: [{
        url: imageUrl,
        alt: `Cover ${product.name}`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return children
}
