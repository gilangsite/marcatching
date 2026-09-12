import { NextRequest, NextResponse } from 'next/server'
import { sameOrigin } from '@/lib/content-creation/request'
import { hasValidAdminSession } from '@/lib/adminSession'
import { listProjects, readProject, saveProject, deleteProject, imageProvider } from '@/lib/content-creation/storage'
import { parseProject, UUID, MAX_PROJECT_BYTES } from '@/lib/content-creation/model'
export const runtime = 'nodejs'
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
export async function GET(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return json({ message: 'Unauthorized' }, 401)
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (id && !UUID.test(id)) return json({ message: 'ID tidak valid.' }, 400)
    const offset = Number(req.nextUrl.searchParams.get('offset') || 0)
    if (!Number.isSafeInteger(offset) || offset < 0) return json({ message: 'Offset tidak valid.' }, 400)
    return json(id ? { project: await readProject(id) } : { projects: await listProjects(offset), imageProvider: imageProvider() })
  } catch { return json({ message: 'Gagal memuat project. Periksa koneksi dan konfigurasi storage.' }, 500) }
}
export async function PUT(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return json({ message: 'Unauthorized' }, 401)
  if (!sameOrigin(req)) return json({ message: 'Origin tidak diizinkan.' }, 403)
  if (Number(req.headers.get('content-length')) > MAX_PROJECT_BYTES) return json({ message: 'Project terlalu besar.' }, 413)
  let project
  try {
    const body = await req.text()
    if (new TextEncoder().encode(body).length > MAX_PROJECT_BYTES) return json({ message: 'Project terlalu besar.' }, 413)
    project = parseProject(JSON.parse(body))
  } catch { return json({ message: 'Data project tidak valid atau melebihi batas editor.' }, 400) }
  try { return json({ project: await saveProject(project) }) }
  catch { return json({ message: 'Gagal menyimpan project. Draft tetap tersedia di browser ini.' }, 500) }
}
export async function DELETE(req: NextRequest) {
  if (!await hasValidAdminSession(req)) return json({ message: 'Unauthorized' }, 401)
  if (!sameOrigin(req)) return json({ message: 'Origin tidak diizinkan.' }, 403)
  const id = req.nextUrl.searchParams.get('id')
  if (!id || !UUID.test(id)) return json({ message: 'ID tidak valid.' }, 400)
  try { await deleteProject(id); return json({ success: true }) }
  catch { return json({ message: 'Gagal menghapus seluruh project. Coba lagi.' }, 500) }
}
