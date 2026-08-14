import 'server-only'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

export type AdminCreatorWorkspace = {
  id: string
  userId: string
  name: string
  email: string
  whatsapp: string
  completedSections: number
  socialProfiles: Array<{ platform?: string; url?: string; audienceCount?: number }>
  experiments: number
  metrics: number
  updatedAt: string
  createdAt: string
  data: Record<string, unknown>
}

export async function getAdminCreatorWorkspaces(workspaceId?: string): Promise<AdminCreatorWorkspace[]> {
  let workspaceQuery = supabaseAdmin
    .from('creator_workspaces')
    .select('id, user_id, data, created_at, updated_at')
    .order('updated_at', { ascending: false })
  if (workspaceId) workspaceQuery = workspaceQuery.eq('id', workspaceId)

  const [{ data: rows, error }, { data: authData }, { data: orders }] = await Promise.all([
    workspaceQuery,
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabaseAdmin.from('orders').select('full_name, email, whatsapp').not('email', 'is', null).order('created_at', { ascending: false }),
  ])

  if (error) throw new Error('Gagal memuat Creator Workspace')

  const users = new Map((authData?.users || []).map(user => [user.id, user]))
  const contactByEmail = new Map<string, { name: string; whatsapp: string }>()
  for (const order of orders || []) {
    const email = String(order.email || '').toLowerCase().trim()
    if (email && !contactByEmail.has(email)) {
      contactByEmail.set(email, { name: String(order.full_name || ''), whatsapp: String(order.whatsapp || '') })
    }
  }

  return (rows || []).map(row => {
    const user = users.get(row.user_id)
    const email = user?.email || ''
    const contact = contactByEmail.get(email.toLowerCase())
    const userName = String(user?.user_metadata?.full_name || user?.user_metadata?.name || '')
    const workspace = row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? row.data as Record<string, unknown> : {}
    const onboarding = workspace.onboarding && typeof workspace.onboarding === 'object' && !Array.isArray(workspace.onboarding)
      ? workspace.onboarding as Record<string, unknown>
      : {}
    const completedSections = Array.isArray(onboarding.completedSections) ? onboarding.completedSections : []
    const fallbackName = email.split('@')[0]?.split(/[._-]/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || 'Creator'

    return {
      id: row.id,
      userId: row.user_id,
      name: contact?.name || userName || fallbackName,
      email,
      whatsapp: contact?.whatsapp || String(user?.user_metadata?.whatsapp || ''),
      completedSections: completedSections.length,
      socialProfiles: Array.isArray(workspace.socialProfiles) ? workspace.socialProfiles as AdminCreatorWorkspace['socialProfiles'] : [],
      experiments: Array.isArray(workspace.experiments) ? workspace.experiments.length : 0,
      metrics: Array.isArray(workspace.metrics) ? workspace.metrics.length : 0,
      updatedAt: String(row.updated_at || ''),
      createdAt: String(row.created_at || ''),
      data: workspace,
    }
  })
}
