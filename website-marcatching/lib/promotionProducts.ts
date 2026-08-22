import 'server-only'

import type { PromotionWithProducts, PromotionProductSummary } from '@/lib/supabaseClient'

export const PROMOTION_SELECT = '*, promotion_products(order_index, product:products(id, name, slug, image_url, price_before_discount, price_after_discount, discount_percentage, is_coming_soon))'

export type PromotionRow = Omit<PromotionWithProducts, 'products'> & {
  promotion_products: { order_index: number; product: PromotionProductSummary | null }[]
}

// Supabase returns the promotion_products join as a nested array; flatten it into an
// ordered `products` list matching PromotionWithProducts.
export function shapePromotion(row: PromotionRow): PromotionWithProducts {
  const { promotion_products, ...promotion } = row
  const products = [...(promotion_products || [])]
    .sort((a, b) => a.order_index - b.order_index)
    .map(pp => pp.product)
    .filter((p): p is PromotionProductSummary => Boolean(p))
  return { ...promotion, products }
}
