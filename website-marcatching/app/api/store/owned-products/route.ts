import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberApiAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Which products has this member already checked out — same source of truth as the
// Skill Library's owned/locked logic (app/api/workspace/skills/route.ts).
export async function GET(req: NextRequest) {
  const member = await getMemberFromRequest(req)
  if (!member?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const email = member.email.toLowerCase().trim()
  const { data, error } = await supabaseAdmin.from('course_access_emails').select('product_id').eq('email', email)
  if (error) return NextResponse.json({ message: 'Gagal memuat data produk' }, { status: 500 })

  const ownedProductIds = [...new Set((data || []).map(row => row.product_id).filter(Boolean))]
  return NextResponse.json({ ownedProductIds }, { headers: { 'Cache-Control': 'no-store' } })
}
