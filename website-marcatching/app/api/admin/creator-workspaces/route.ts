import { NextRequest, NextResponse } from 'next/server'
import { hasValidAdminSession } from '@/lib/adminSession'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  if (!await hasValidAdminSession(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: rows, error }, { data: authData }, { data: orders }] = await Promise.all([
    supabaseAdmin.from('creator_workspaces').select('id, user_id, data, created_at, updated_at').order('updated_at', { ascending: false }),
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabaseAdmin.from('orders').select('email, whatsapp').not('email', 'is', null).order('created_at', { ascending: false }),
  ])

  if (error) {
    return NextResponse.json({ message: 'Gagal memuat Creator Workspace' }, { status: 500 })
  }

  const users = new Map((authData?.users || []).map(user => [user.id, user]))
  const whatsappByEmail = new Map<string, string>()
  for (const order of orders || []) {
    const email = String(order.email || '').toLowerCase().trim()
    if (email && order.whatsapp && !whatsappByEmail.has(email)) whatsappByEmail.set(email, String(order.whatsapp))
  }

  const data = (rows || []).map(row => {
    const user = users.get(row.user_id)
    const email = user?.email || ''
    const workspace = row.data && typeof row.data === 'object' ? row.data as Record<string, unknown> : {}
    const onboarding = workspace.onboarding && typeof workspace.onboarding === 'object'
      ? workspace.onboarding as Record<string, unknown>
      : {}
    const completedSections = Array.isArray(onboarding.completedSections) ? onboarding.completedSections : []
    return {
      id: row.id,
      userId: row.user_id,
      email,
      whatsapp: whatsappByEmail.get(email.toLowerCase()) || String(user?.user_metadata?.whatsapp || ''),
      completedSections: completedSections.length,
      socialProfiles: Array.isArray(workspace.socialProfiles) ? workspace.socialProfiles : [],
      experiments: Array.isArray(workspace.experiments) ? workspace.experiments.length : 0,
      metrics: Array.isArray(workspace.metrics) ? workspace.metrics.length : 0,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
      data: row.data,
    }
  })

  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
}
