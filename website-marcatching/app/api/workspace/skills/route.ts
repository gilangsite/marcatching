import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberApiAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { customizeSkillZip, extractRequirementsDoc, isBrandMemoryReady } from '@/lib/skillZip'
import { parseSkillRequirements } from '@/lib/skillRequirements'
import { fetchSkillTemplate, loadWorkspace } from '@/lib/skillSource'

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

function safeZipFilename(value: string) {
  const base = value.replace(/\.zip$/i, '').replace(/[\r\n"\\/]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 110) || 'marcatching-skill'
  return `${base}.zip`
}

function zipDownload(buffer: Buffer, filename: string) {
  const asciiFilename = filename.replace(/[^a-z0-9.-]/gi, '-')
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'private, no-store',
    },
  })
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
        storeUrl: `/product/${product.slug}`,
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
    const body = await request.json() as { skillId?: unknown; mode?: unknown }
    const skillId = typeof body.skillId === 'string' ? body.skillId.trim() : ''
    const mode = body.mode === 'original' ? 'original' : 'personalized'
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
    const { data: entitlement, error: entitlementError } = await supabaseAdmin
      .from('course_access_emails')
      .select('id')
      .eq('email', email)
      .eq('product_id', skill.product_id)
      .maybeSingle()
    if (entitlementError) throw new Error('Akses Skill belum bisa diperiksa.')
    if (!entitlement) return NextResponse.json({ message: 'Skill ini belum kamu miliki. Selesaikan checkout terlebih dahulu.' }, { status: 403 })

    const template = await fetchSkillTemplate(skill.content_url)
    if (mode === 'original') return zipDownload(template, safeZipFilename(skill.title))

    const workspace = await loadWorkspace(user.id)
    if (!workspace || !isBrandMemoryReady(workspace)) {
      return NextResponse.json({ message: 'Lengkapi Creator Voice, Redlines, Audience Facts, dan Output Quality Gate sebelum membuat Skill.' }, { status: 409 })
    }

    const requirementsDoc = extractRequirementsDoc(template)
    const requirementFields = requirementsDoc ? parseSkillRequirements(requirementsDoc) : []
    const savedAnswers = workspace.skillRequirements?.[skill.product_id] || {}
    const missingRequirement = requirementFields.some(field => !savedAnswers[field.key]?.trim())
    if (missingRequirement) {
      return NextResponse.json({ message: 'Lengkapi Customize Skill terlebih dahulu sebelum membuat Skill ini.' }, { status: 409 })
    }

    const displayName = String(user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'Creator')
    const personalized = customizeSkillZip({
      template,
      templateSlug: skill.title,
      workspace,
      identity: { name: displayName, email },
      skillRequirements: requirementFields.length ? { skillLabel: skill.title, fields: requirementFields, answers: savedAnswers } : undefined,
    })
    return zipDownload(personalized.buffer, personalized.filename)
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Skill belum berhasil dibuat.' }, { status: 500 })
  }
}
