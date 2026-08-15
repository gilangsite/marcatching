import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberApiAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { customizeSkillZip, isBrandMemoryReady } from '@/lib/skillZip'
import type { WorkspaceData } from '@/app/course/workspaceData'

type SkillRow = {
  id: string
  product_id: string
  title: string
  content_url: string
  order_index: number
}

type SkillProduct = {
  id: string
  name: string
  slug: string
  sub_headline: string | null
  image_url: string | null
  is_active: boolean
  is_coming_soon: boolean
}

function unauthorized() {
  return NextResponse.json({ message: 'Sesi kamu sudah berakhir. Login kembali untuk melanjutkan.' }, { status: 401 })
}

function getDriveFileId(url: string) {
  return url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1] || ''
}

async function fetchSkillTemplate(url: string) {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || !['drive.google.com', 'docs.google.com'].includes(parsed.hostname)) {
    throw new Error('Lokasi template Skill tidak didukung')
  }
  const driveId = getDriveFileId(url)
  if (!driveId) throw new Error('Link template Skill tidak valid')

  const response = await fetch(`https://drive.google.com/uc?export=download&id=${driveId}`, { cache: 'no-store', redirect: 'follow' })
  if (!response.ok) throw new Error('Template Skill belum bisa diunduh')
  const template = Buffer.from(await response.arrayBuffer())
  if (template.length < 4 || template.readUInt32LE(0) !== 0x04034b50) throw new Error('File sumber bukan ZIP Skill yang valid')
  return template
}

async function loadWorkspace(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('creator_workspaces')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error('Creator Workspace belum bisa dibaca')
  return data?.data as WorkspaceData | undefined
}

export async function GET(request: NextRequest) {
  const user = await getMemberFromRequest(request)
  if (!user?.email) return unauthorized()

  try {
    const email = user.email.toLowerCase().trim()
    const [{ data: skillRows, error: skillError }, { data: accessRows, error: accessError }, workspace] = await Promise.all([
      supabaseAdmin.from('course_materials').select('id, product_id, title, content_url, order_index').eq('type', 'zip').order('order_index').order('id'),
      supabaseAdmin.from('course_access_emails').select('product_id').eq('email', email),
      loadWorkspace(user.id),
    ])
    if (skillError || accessError) throw new Error('Katalog Skill belum bisa dimuat')

    const seenProductIds = new Set<string>()
    const rows = (skillRows || []).filter(row => {
      if (!row.product_id || seenProductIds.has(row.product_id)) return false
      seenProductIds.add(row.product_id)
      return true
    }) as SkillRow[]
    const productIds = [...new Set(rows.map(row => row.product_id))]
    const { data: productRows, error: productError } = productIds.length
      ? await supabaseAdmin.from('products').select('id, name, slug, sub_headline, image_url, is_active, is_coming_soon').in('id', productIds)
      : { data: [], error: null }
    if (productError) throw new Error('Produk Skill belum bisa dimuat')

    const ownedProductIds = new Set((accessRows || []).map(row => row.product_id))
    const products = new Map((productRows || []).map(product => [product.id, product as SkillProduct]))
    const memoryReady = isBrandMemoryReady(workspace)
    const skills = rows.flatMap(row => {
      const product = products.get(row.product_id)
      if (!product) return []
      const owned = ownedProductIds.has(product.id)
      if (!product.is_active && !owned) return []
      return [{
        id: row.id,
        name: product.name,
        sourceName: row.title,
        description: product.sub_headline || 'Skill Marcatching yang bisa dipersonalisasi dengan Brand Memory kamu.',
        imageUrl: product.image_url,
        owned,
        memoryReady,
        canCreate: owned && memoryReady,
        storeUrl: `https://www.marcatching.com/product/${product.slug}`,
        status: !owned ? 'locked' : memoryReady ? 'ready' : 'memory_required',
      }]
    })

    return NextResponse.json({ skills, memoryReady }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Katalog Skill gagal dimuat' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getMemberFromRequest(request)
  if (!user?.email) return unauthorized()

  try {
    const body = await request.json() as { skillId?: unknown }
    const skillId = typeof body.skillId === 'string' ? body.skillId.trim() : ''
    if (!skillId) return NextResponse.json({ message: 'Pilih Skill yang ingin dibuat.' }, { status: 400 })

    const { data: skill, error: skillError } = await supabaseAdmin
      .from('course_materials')
      .select('id, product_id, title, content_url, order_index')
      .eq('id', skillId)
      .eq('type', 'zip')
      .maybeSingle()
    if (skillError || !skill?.product_id) return NextResponse.json({ message: 'Skill tidak ditemukan.' }, { status: 404 })

    const { data: canonicalSkill, error: canonicalError } = await supabaseAdmin
      .from('course_materials')
      .select('id')
      .eq('product_id', skill.product_id)
      .eq('type', 'zip')
      .order('order_index')
      .order('id')
      .limit(1)
      .maybeSingle()
    if (canonicalError || canonicalSkill?.id !== skill.id) {
      return NextResponse.json({ message: 'Satu produk hanya bisa membuka satu Skill.' }, { status: 409 })
    }

    const email = user.email.toLowerCase().trim()
    const [{ data: entitlement }, workspace] = await Promise.all([
      supabaseAdmin.from('course_access_emails').select('id').eq('email', email).eq('product_id', skill.product_id).maybeSingle(),
      loadWorkspace(user.id),
    ])
    if (!entitlement) return NextResponse.json({ message: 'Skill ini belum kamu miliki. Selesaikan checkout terlebih dahulu.' }, { status: 403 })
    if (!workspace || !isBrandMemoryReady(workspace)) {
      return NextResponse.json({ message: 'Lengkapi Creator Voice, Redlines, Audience Facts, dan Output Quality Gate sebelum membuat Skill.' }, { status: 409 })
    }

    const template = await fetchSkillTemplate(skill.content_url)
    const displayName = String(user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'Creator')
    const personalized = customizeSkillZip({
      template,
      templateSlug: skill.title,
      workspace,
      identity: { name: displayName, email },
    })
    const asciiFilename = personalized.filename.replace(/[^a-z0-9.-]/gi, '-')

    return new NextResponse(new Uint8Array(personalized.buffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(personalized.filename)}`,
        'Content-Length': String(personalized.buffer.length),
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Skill belum berhasil dibuat.' }, { status: 500 })
  }
}
