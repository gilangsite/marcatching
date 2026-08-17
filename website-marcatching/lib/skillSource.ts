import 'server-only'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { WorkspaceData } from '@/app/course/workspaceData'

function getDriveFileId(url: string) {
  return url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1] || ''
}

export async function fetchSkillTemplate(url: string) {
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

export async function loadWorkspace(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('creator_workspaces')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error('Creator Workspace belum bisa dibaca')
  return data?.data as WorkspaceData | undefined
}
