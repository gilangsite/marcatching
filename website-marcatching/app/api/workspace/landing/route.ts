import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getMemberFromRequest } from '@/lib/memberApiAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { loadWorkspace } from '@/lib/skillSource'
import { isBrandMemoryReady } from '@/lib/skillZip'
import { sanitizeLandingPage } from '@/lib/landingPage'
import { HOUR_MS, takeQuota } from '@/lib/rateLimit'
import { deletePageObjects, pagesStorageConfigured } from '@/lib/pagesStorage'
import {
  LANDING_COLUMNS, LANDING_MAX_FILE_BYTES, LANDING_QUOTA_BYTES, assetUsage, collectGarbage, contextForUser,
  failLanding, rowToPage, unauthorized, type LandingRow,
} from '@/lib/landingServer'

const MAX_BODY_BYTES = 200_000

async function loadRow(userId: string) {
  const { data, error } = await supabaseAdmin.from('landing_pages').select(LANDING_COLUMNS).eq('user_id', userId).maybeSingle()
  if (error) throw new Error('Landing page belum bisa dimuat.')
  return data as LandingRow | null
}

export async function GET(request: NextRequest) {
  const user = await getMemberFromRequest(request)
  if (!user?.email) return unauthorized()
  try {
    const [row, usage] = await Promise.all([loadRow(user.id), assetUsage(user.id)])
    return NextResponse.json({
      page: row ? rowToPage(row) : null,
      quota: { usedBytes: usage.usedBytes, limitBytes: LANDING_QUOTA_BYTES, maxFileBytes: LANDING_MAX_FILE_BYTES },
      uploadsEnabled: pagesStorageConfigured(),
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return failLanding(error instanceof Error ? error.message : 'Landing page belum bisa dimuat.', 500)
  }
}

export async function PUT(request: NextRequest) {
  const user = await getMemberFromRequest(request)
  if (!user?.email) return unauthorized()
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) return failLanding('Isi landing page terlalu besar.', 413)
  if (!takeQuota(`landing-save:${user.id}`, 240, HOUR_MS)) return failLanding('Terlalu banyak penyimpanan dalam satu jam. Coba lagi nanti.', 429)

  let body: { page?: unknown }
  try { body = await request.json() } catch { return failLanding('Permintaan tidak valid.', 400) }

  const parsed = sanitizeLandingPage(body.page, contextForUser(user.id))
  if (!parsed.ok) return failLanding(parsed.message, 400)
  const { page } = parsed

  try {
    const existing = await loadRow(user.id)
    if (existing?.status === 'suspended') return failLanding('Halaman ini sedang ditangguhkan oleh Marcatching. Hubungi tim kami untuk bantuan.', 403)

    // Creating or publishing needs a finished Brand Memory, checked against what is actually saved.
    if (!existing || page.status === 'published') {
      const workspace = await loadWorkspace(user.id)
      if (!workspace || !isBrandMemoryReady(workspace)) {
        return failLanding('Lengkapi keempat paragraf AI Memory dulu sebelum membuat atau menerbitkan landing page.', 409, { code: 'memory_not_ready' })
      }
    }

    const fields = { slug: page.slug, status: page.status, theme: page.theme, headline: page.headline, description: page.description, blocks: page.blocks, style: page.style, updated_at: new Date().toISOString() }
    const result = existing
      ? await supabaseAdmin.from('landing_pages').update(fields).eq('user_id', user.id)
      : await supabaseAdmin.from('landing_pages').insert({ user_id: user.id, ...fields })

    if (result.error) {
      if (result.error.code === '23505') {
        const isSlug = `${result.error.message} ${result.error.details || ''}`.includes('slug')
        return isSlug
          ? failLanding('Link ini sudah dipakai brand lain. Coba nama yang berbeda.', 409, { code: 'slug_taken' })
          : failLanding('Landing page kamu sudah ada. Muat ulang halaman ini.', 409)
      }
      throw new Error('Landing page belum berhasil disimpan.')
    }

    revalidatePath(`/page-home/${page.slug}`)
    if (existing && existing.slug !== page.slug) revalidatePath(`/page-home/${existing.slug}`)
    void collectGarbage(user.id, page)
    return NextResponse.json({ page }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    console.error('[landing] save failed', error)
    return failLanding(error instanceof Error ? error.message : 'Landing page belum berhasil disimpan.', 500)
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getMemberFromRequest(request)
  if (!user?.email) return unauthorized()
  try {
    const existing = await loadRow(user.id)
    if (existing?.status === 'suspended') return failLanding('Halaman ini sedang ditangguhkan oleh Marcatching.', 403)

    const { data: assets } = await supabaseAdmin.from('landing_page_assets').select('object_key').eq('user_id', user.id)
    const keys = (assets || []).map(row => row.object_key as string)
    if (keys.length && pagesStorageConfigured()) await deletePageObjects(keys)
    await supabaseAdmin.from('landing_page_assets').delete().eq('user_id', user.id)
    const { error } = await supabaseAdmin.from('landing_pages').delete().eq('user_id', user.id)
    if (error) throw new Error('Landing page belum berhasil dihapus.')
    if (existing) revalidatePath(`/page-home/${existing.slug}`)
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return failLanding(error instanceof Error ? error.message : 'Landing page belum berhasil dihapus.', 500)
  }
}
