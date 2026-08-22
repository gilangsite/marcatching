import 'server-only'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { PromotionWithProducts } from '@/lib/supabaseClient'

// If an on_going promotion's countdown has passed, flip it to 'off' in the DB
// and return the corrected object. Called wherever a promotion is read
// (admin list, public active-promotion endpoint, /store) so expiry needs no cron.
export async function expireIfPastDue<T extends PromotionWithProducts>(promotion: T): Promise<T> {
  if (promotion.status !== 'on_going' || !promotion.ends_at) return promotion
  if (new Date(promotion.ends_at).getTime() >= Date.now()) return promotion

  await supabaseAdmin.from('promotions').update({ status: 'off' }).eq('id', promotion.id)
  return { ...promotion, status: 'off' }
}
