import { NextRequest, NextResponse } from 'next/server'
import { hasValidAdminSession } from '@/lib/adminSession'
import { getAdminCreatorWorkspaces } from '@/lib/adminCreatorWorkspaces'

export async function GET(request: NextRequest) {
  if (!await hasValidAdminSession(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await getAdminCreatorWorkspaces()
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ message: 'Gagal memuat Creator Workspace' }, { status: 500 })
  }
}
