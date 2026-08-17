import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { getServerSupabase } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { NavLink, StorePageBlock, ProductCategory, Product, PromotionWithProduct } from '@/lib/supabaseClient'
import { expireIfPastDue } from '@/lib/promotionExpiry'
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
  const serverSupabase = await getServerSupabase()
  const { data: { user } } = await serverSupabase.auth.getUser()

  const [navLinksRes, blocksRes, productsRes, categoriesRes, promotionRes] = await Promise.all([
    supabase.from('nav_links').select('*').eq('is_active', true).order('order_index'),
    supabase.from('store_page_blocks').select('*').order('order_index'),
    supabase.from('products').select('*').eq('is_active', true),
    supabase.from('product_categories').select('*').order('order_index'),
    supabase
      .from('promotions')
      .select('*, product:products(id, name, slug, image_url, price_before_discount, price_after_discount, discount_percentage, is_coming_soon)')
      .eq('status', 'on_going')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const navLinks: NavLink[] = navLinksRes.data ?? []
  const blocks: StorePageBlock[] = blocksRes.data ?? []
  const products: Product[] = productsRes.data ?? []
  const categories: ProductCategory[] = categoriesRes.data ?? []
  const promotion: PromotionWithProduct | null = promotionRes.data
    ? await expireIfPastDue(promotionRes.data as PromotionWithProduct)
    : null

  let ownedProductIds: string[] = []
  if (user?.email) {
    const { data: accessRows } = await supabaseAdmin
      .from('course_access_emails')
      .select('product_id')
      .eq('email', user.email.toLowerCase().trim())
    ownedProductIds = [...new Set((accessRows || []).map(row => row.product_id).filter(Boolean))]
  }

  return (
    <StoreClient
      navLinks={navLinks}
      blocks={blocks}
      products={products}
      categories={categories}
      promotion={promotion && promotion.status === 'on_going' ? promotion : null}
      ownedProductIds={ownedProductIds}
    />
  )
}
