import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

// GET /api/articles/[slug] — fetch single article + increment view count
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const isAdmin = new URL(req.url).searchParams.get('admin') === '1'

  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*, article_categories(id,name,slug), article_authors(id,name,photo_url)')
    .eq('slug', slug)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  // Only count views for public reads of published articles
  if (!isAdmin && data.status === 'published') {
    await supabaseAdmin
      .from('articles')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id)
  }

  return NextResponse.json(data)
}

// PATCH /api/articles/[slug] — update article
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await req.json()

  // Fetch existing to get id
  const { data: existing } = await supabaseAdmin
    .from('articles')
    .select('id, status, published_at')
    .eq('slug', slug)
    .single()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const payload = { ...body }

  // Auto-set published_at on first publish
  if (body.status === 'published' && existing.status !== 'published' && !existing.published_at) {
    payload.published_at = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .update(payload)
    .eq('id', existing.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/articles/[slug] — delete article + cleanup Drive images
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Fetch article to get image_urls before deletion
  const { data: article } = await supabaseAdmin
    .from('articles')
    .select('id, image_urls')
    .eq('slug', slug)
    .single()

  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete article from DB
  const { error } = await supabaseAdmin
    .from('articles')
    .delete()
    .eq('id', article.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Async cleanup: delete all associated images from Google Drive
  const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
  if (appScriptUrl && Array.isArray(article.image_urls) && article.image_urls.length > 0) {
    // Fire-and-forget — don't await so response is fast
    Promise.all(
      article.image_urls.map((url: string) =>
        fetch(appScriptUrl, {
          method: 'POST',
          body: JSON.stringify({ action: 'deleteFile', url }),
        }).catch(() => null)
      )
    )
  }

  return NextResponse.json({ success: true })
}
