import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberApiAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sniffImage } from '@/lib/landingPage'
import { HOUR_MS, takeQuota } from '@/lib/rateLimit'
import { deletePageObjects, pagesStorageConfigured, putPageImage } from '@/lib/pagesStorage'
import { LANDING_MAX_ASSETS, LANDING_MAX_FILE_BYTES, LANDING_QUOTA_BYTES, assetUsage, failLanding, unauthorized } from '@/lib/landingServer'

// Photos pass through here (instead of straight to R2) so the real file type can be checked and the quota
// counted exactly. The browser compresses to WebP first, so files are small enough for the request body limit.
export const maxDuration = 30

export async function POST(request: NextRequest) {
  const user = await getMemberFromRequest(request)
  if (!user?.email) return unauthorized()
  if (!pagesStorageConfigured()) return failLanding('Upload foto belum aktif di server.', 503)
  if (!takeQuota(`landing-upload:${user.id}`, 80, HOUR_MS)) return failLanding('Terlalu banyak upload dalam satu jam. Coba lagi nanti.', 429)
  if (Number(request.headers.get('content-length') || 0) > LANDING_MAX_FILE_BYTES + 64 * 1024) return failLanding('Foto terlalu besar. Maksimal 4 MB.', 413)

  let file: FormDataEntryValue | null
  try { file = (await request.formData()).get('file') } catch { return failLanding('Permintaan tidak valid.', 400) }
  if (!(file instanceof File)) return failLanding('Pilih foto yang ingin diupload.', 400)
  if (file.size === 0) return failLanding('File foto kosong.', 400)
  if (file.size > LANDING_MAX_FILE_BYTES) return failLanding('Foto terlalu besar. Maksimal 4 MB.', 413)

  const bytes = Buffer.from(await file.arrayBuffer())
  const type = sniffImage(bytes)
  if (!type) return failLanding('Format tidak didukung. Gunakan foto JPG, PNG, atau WebP.', 415)

  let objectKey = ''
  try {
    const usage = await assetUsage(user.id)
    if (usage.count >= LANDING_MAX_ASSETS) return failLanding('Jumlah foto sudah mencapai batas. Hapus foto yang tidak dipakai dulu.', 413)
    if (usage.usedBytes + bytes.length > LANDING_QUOTA_BYTES) {
      return failLanding('Penyimpanan foto penuh. Hapus foto yang tidak dipakai, lalu coba lagi.', 413, { usedBytes: usage.usedBytes, limitBytes: LANDING_QUOTA_BYTES })
    }

    const stored = await putPageImage(user.id, bytes, type)
    objectKey = stored.key
    const { error } = await supabaseAdmin.from('landing_page_assets').insert({ user_id: user.id, object_key: stored.key, size_bytes: bytes.length, content_type: type })
    if (error) throw new Error('Foto belum berhasil dicatat.')
    return NextResponse.json({ url: stored.url, usedBytes: usage.usedBytes + bytes.length, limitBytes: LANDING_QUOTA_BYTES }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    // A file that could not be recorded would never count toward the quota, so remove it again.
    if (objectKey) await deletePageObjects([objectKey]).catch(() => undefined)
    console.error('[landing] upload failed', error)
    return failLanding('Foto belum berhasil diupload. Coba lagi.', 500)
  }
}
