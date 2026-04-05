import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  try {
    let rawFileUrl = url
    // If it's a google drive URL, convert to download URL
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/)
    
    if (fileIdMatch && fileIdMatch[1]) {
      rawFileUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`
    }

    const response = await fetch(rawFileUrl, {
      method: 'GET',
    })

    if (!response.ok) {
      console.error('Failed to fetch from Google Drive:', response.statusText)
      return new NextResponse('Failed to fetch file', { status: response.status })
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline', // Display in browser instead of downloading
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('API /pdf Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
