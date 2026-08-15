import { NextResponse } from 'next/server'

const downloadTypes = {
  md: { extension: 'md', contentType: 'text/markdown; charset=utf-8' },
  zip: { extension: 'zip', contentType: 'application/zip' },
  pdf: { extension: 'pdf', contentType: 'application/pdf' },
} as const

function safeFilename(value: string) {
  return value.replace(/[\r\n"\\/]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 120) || 'file'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const title = searchParams.get('title') || 'file'
  const requestedType = searchParams.get('type')
  const type = requestedType && requestedType in downloadTypes ? requestedType as keyof typeof downloadTypes : 'md'
  const download = downloadTypes[type]

  if (!id) {
    return NextResponse.json({ error: 'Missing file id' }, { status: 400 })
  }

  try {
    const driveUrl = `https://drive.google.com/uc?export=download&id=${id}`
    const response = await fetch(driveUrl)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Google Drive' }, { status: 500 })
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Create headers forcing a file download
    const headers = new Headers()
    const filename = `${safeFilename(title)}.${download.extension}`
    headers.set('Content-Disposition', `attachment; filename="${filename.replace(/[^\x20-\x7E]/g, '-')}"; filename*=UTF-8''${encodeURIComponent(filename)}`)
    headers.set('Content-Type', download.contentType)
    headers.set('Cache-Control', 'private, no-store')
    headers.set('Content-Length', buffer.length.toString())

    return new NextResponse(buffer, {
      status: 200,
      headers
    })
  } catch {
    console.error('Download proxy error')
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
