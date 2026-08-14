import { NextRequest, NextResponse } from 'next/server'
import { hasValidAdminSession } from '@/lib/adminSession'
import { getAdminCreatorWorkspaces } from '@/lib/adminCreatorWorkspaces'
import { createWorkspaceMarkdown, createWorkspacePdf } from '@/lib/workspaceDocument'

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'creator-workspace'
}

export async function GET(request: NextRequest) {
  if (!await hasValidAdminSession(request)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const format = request.nextUrl.searchParams.get('format')
  const id = request.nextUrl.searchParams.get('id')
  if (!format || !['pdf', 'md', 'json'].includes(format)) {
    return NextResponse.json({ message: 'Format export tidak valid' }, { status: 400 })
  }

  try {
    const items = await getAdminCreatorWorkspaces(id || undefined)
    if (!items.length) return NextResponse.json({ message: 'Workspace tidak ditemukan' }, { status: 404 })

    const baseName = items.length === 1 ? `creator-workspace-${safeFilename(items[0].name || items[0].email)}` : 'marcatching-creator-workspaces'
    const commonHeaders = { 'Cache-Control': 'no-store', 'Content-Disposition': `attachment; filename="${baseName}.${format}"` }

    if (format === 'pdf') {
      const pdf = createWorkspacePdf(items)
      return new NextResponse(new Uint8Array(pdf), { headers: { ...commonHeaders, 'Content-Type': 'application/pdf' } })
    }
    if (format === 'md') {
      return new NextResponse(createWorkspaceMarkdown(items), { headers: { ...commonHeaders, 'Content-Type': 'text/markdown; charset=utf-8' } })
    }
    return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), workspaces: items }, null, 2), { headers: { ...commonHeaders, 'Content-Type': 'application/json; charset=utf-8' } })
  } catch {
    return NextResponse.json({ message: 'Export workspace gagal dibuat' }, { status: 500 })
  }
}
