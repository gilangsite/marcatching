import { NextRequest, NextResponse } from 'next/server'
import { sameOrigin } from '@/lib/content-creation/request'
import { hasValidAdminSession } from '@/lib/adminSession'
import { putImage, readImage } from '@/lib/content-creation/storage'
import { MAX_IMAGE_BYTES, UUID, validAsset } from '@/lib/content-creation/model'
export const runtime = 'nodejs'
export async function GET(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const key = req.nextUrl.searchParams.get('key')
  if (!validAsset(key)) return NextResponse.json({ message: 'Aset tidak valid.' }, { status: 400 })
  try {
    const bytes = await readImage(key)
    const type = key.endsWith('.jpg') ? 'image/jpeg' : key.endsWith('.webp') ? 'image/webp' : 'image/png'
    return new Response(bytes, { headers: { 'Content-Type': type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
  } catch { return NextResponse.json({ message: 'Gagal memuat gambar.' }, { status: 404 }) }
}
export async function POST(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (!sameOrigin(req)) return NextResponse.json({ message: 'Origin tidak diizinkan.' }, { status: 403 })
  if (Number(req.headers.get('content-length')) > MAX_IMAGE_BYTES + 16384) return NextResponse.json({ message: 'Maksimum gambar 3 MB.' }, { status: 413 })
  try {
    const form = await req.formData()
    const file = form.get('file'), projectId = form.get('projectId')
    if (!(file instanceof File) || typeof projectId !== 'string' || !UUID.test(projectId) || !file.size || file.size > MAX_IMAGE_BYTES) return NextResponse.json({ message: 'Gambar tidak valid. Maksimum 3 MB.' }, { status: 400 })
    const bytes = new Uint8Array(await file.arrayBuffer())
    const png = bytes.slice(0, 8).every((b, i) => b === [137, 80, 78, 71, 13, 10, 26, 10][i]) && bytes.length > 24
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    const webp = new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP'
    const extension = png ? 'png' : jpg ? 'jpg' : webp ? 'webp' : null
    const contentType = png ? 'image/png' : jpg ? 'image/jpeg' : webp ? 'image/webp' : null
    if (!extension || file.type !== contentType) return NextResponse.json({ message: 'Gunakan gambar PNG, JPEG, atau WebP yang valid.' }, { status: 400 })
    return NextResponse.json({ asset: await putImage(projectId, bytes, extension, contentType!) })
  } catch { return NextResponse.json({ message: 'Upload gagal. Periksa koneksi dan konfigurasi storage.' }, { status: 500 }) }
}
