import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberApiAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { extractRequirementsDoc } from '@/lib/skillZip'
import { parseSkillRequirements } from '@/lib/skillRequirements'
import { fetchSkillTemplate, loadWorkspace } from '@/lib/skillSource'

function unauthorized() {
  return NextResponse.json({ message: 'Sesi kamu sudah berakhir. Login kembali untuk melanjutkan.' }, { status: 401 })
}

export async function GET(request: NextRequest) {
  const user = await getMemberFromRequest(request)
  if (!user?.email) return unauthorized()

  try {
    const skillId = request.nextUrl.searchParams.get('skillId')?.trim() || ''
    if (!skillId) return NextResponse.json({ message: 'Pilih Skill yang ingin di-customize.' }, { status: 400 })

    const { data: skill, error: skillError } = await supabaseAdmin
      .from('course_materials')
      .select('id, product_id, title, content_url')
      .eq('id', skillId)
      .eq('type', 'zip')
      .maybeSingle()
    if (skillError || !skill?.product_id) return NextResponse.json({ message: 'Skill tidak ditemukan.' }, { status: 404 })

    const email = user.email.toLowerCase().trim()
    const { data: entitlement, error: entitlementError } = await supabaseAdmin
      .from('course_access_emails')
      .select('id')
      .eq('email', email)
      .eq('product_id', skill.product_id)
      .maybeSingle()
    if (entitlementError) throw new Error('Akses Skill belum bisa diperiksa.')
    if (!entitlement) return NextResponse.json({ message: 'Skill ini belum kamu miliki.' }, { status: 403 })

    const [template, workspace] = await Promise.all([
      fetchSkillTemplate(skill.content_url),
      loadWorkspace(user.id),
    ])

    const requirementsDoc = extractRequirementsDoc(template)
    const fields = requirementsDoc ? parseSkillRequirements(requirementsDoc) : []
    const existingAnswers = workspace?.skillRequirements?.[skill.product_id] || {}

    return NextResponse.json(
      { fields, existingAnswers, productId: skill.product_id },
      { headers: { 'Cache-Control': 'private, no-store' } }
    )
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Skill Requirements belum bisa dimuat.' }, { status: 500 })
  }
}
