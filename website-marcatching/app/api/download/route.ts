import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const title = searchParams.get('title') || 'file'

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
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.md"`)
    headers.set('Content-Type', 'text/markdown; charset=utf-8')
    headers.set('Content-Length', buffer.length.toString())

    return new NextResponse(buffer, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('Download proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
