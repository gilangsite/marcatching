import 'server-only'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { assetKeyFromUrl, sanitizeBlocks, sanitizeStyle, userAssetPrefix, type LandingPage, type SanitizeContext } from '@/lib/landingPage'
import { deletePageObjects, pagesPublicUrl } from '@/lib/pagesStorage'

export const LANDING_QUOTA_BYTES = 100 * 1024 * 1024
export const LANDING_MAX_FILE_BYTES = 4 * 1024 * 1024
export const LANDING_MAX_ASSETS = 300
const GARBAGE_GRACE_MS = 60 * 60 * 1000

export function failLanding(message: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ message, ...extra }, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export function unauthorized() {
  return failLanding('Sesi kamu sudah berakhir. Login kembali untuk melanjutkan.', 401)
}

/** Images are only accepted from this member's own folder in our public bucket. */
export function contextForUser(userId: string): SanitizeContext {
  const base = pagesPublicUrl()
  const prefix = base ? userAssetPrefix(base, userId) : ''
  return { imageAllowed: url => Boolean(prefix) && url.startsWith(prefix) }
}

export type LandingRow = { user_id: string; slug: string; status: LandingPage['status']; theme: LandingPage['theme']; headline: string; description: string; blocks: unknown; style: unknown }

export const LANDING_COLUMNS = 'user_id, slug, status, theme, headline, description, blocks, style'

export function rowToPage(row: LandingRow): LandingPage {
  return {
    slug: row.slug,
    status: row.status,
    theme: row.theme === 'white' ? 'white' : 'black',
    headline: row.headline || '',
    description: row.description || '',
    blocks: sanitizeBlocks(row.blocks, contextForUser(row.user_id)),
    style: sanitizeStyle(row.style, contextForUser(row.user_id)),
  }
}

export async function assetUsage(userId: string) {
  const { data, error } = await supabaseAdmin.from('landing_page_assets').select('size_bytes').eq('user_id', userId)
  if (error) throw new Error('Pemakaian penyimpanan belum bisa dibaca.')
  const rows = data || []
  return { usedBytes: rows.reduce((sum, row) => sum + (row.size_bytes as number), 0), count: rows.length }
}

function referencedKeys(page: LandingPage) {
  const base = pagesPublicUrl()
  const keys = new Set<string>()
  const add = (url: string) => { const key = base && assetKeyFromUrl(base, url); if (key) keys.add(key) }
  add(page.style.backgroundImage)
  for (const block of page.blocks) {
    if (block.type === 'image') add(block.url)
    if (block.type === 'carousel') block.images.forEach(image => add(image.url))
  }
  return keys
}

/**
 * Removes photos the page no longer uses so the quota reflects reality. Anything uploaded in the last hour is
 * left alone: the creator may have uploaded it but not saved the page yet. Best effort, never fails a save.
 */
export async function collectGarbage(userId: string, page: LandingPage) {
  try {
    const referenced = referencedKeys(page)
    const cutoff = new Date(Date.now() - GARBAGE_GRACE_MS).toISOString()
    const { data } = await supabaseAdmin.from('landing_page_assets').select('id, object_key').eq('user_id', userId).lt('created_at', cutoff)
    const garbage = (data || []).filter(row => !referenced.has(row.object_key as string))
    if (!garbage.length) return
    await deletePageObjects(garbage.map(row => row.object_key as string))
    await supabaseAdmin.from('landing_page_assets').delete().in('id', garbage.map(row => row.id as string))
  } catch (error) {
    console.error('[landing] garbage collection failed', error)
  }
}
