import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'
import type { NavLink, StorePageBlock, StoreProduct, ProductCategory, Product } from '@/lib/supabaseClient'
import StoreClient from './StoreClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Store | Marcatching',
  description: 'Temukan semua produk & course Marcatching. Tingkatkan skill marketing dan bisnis kamu bersama kami.',
  openGraph: {
    title: 'Store | Marcatching',
    description: 'Temukan semua produk & course Marcatching.',
    url: 'https://www.marcatching.com/store',
    images: [{ url: 'https://www.marcatching.com/opengraph-image.png' }],
  }
}

export default async function StorePage() {
  const [navLinksRes, blocksRes, storeProductsRes, categoriesRes] = await Promise.all([
    supabase.from('nav_links').select('*').eq('is_active', true).order('order_index'),
    supabase.from('store_page_blocks').select('*').eq('is_active', true).order('order_index'),
    supabase
      .from('store_products')
      .select('*, products(*)')
      .neq('store_status', 'hidden')
      .order('order_index'),
    supabase.from('product_categories').select('*').order('order_index'),
  ])

  const navLinks: NavLink[] = navLinksRes.data ?? []
  const blocks: StorePageBlock[] = blocksRes.data ?? []
  const storeProducts: StoreProduct[] = storeProductsRes.data ?? []
  const categories: ProductCategory[] = categoriesRes.data ?? []

  return (
    <StoreClient
      navLinks={navLinks}
      blocks={blocks}
      storeProducts={storeProducts}
      categories={categories}
    />
  )
}
