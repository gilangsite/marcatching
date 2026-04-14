import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

// GET /api/articles — fetch articles (admin: all; public: published only)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const sort = searchParams.get('sort') || 'newest'
  const search = searchParams.get('search') || ''
  const isAdmin = searchParams.get('admin') === '1'

  let query = supabaseAdmin
    .from('articles')
    .select('*, article_categories(id,name,slug), article_authors(id,name,photo_url)')

  // Public: only published articles
  if (!isAdmin) {
    query = query.eq('status', 'published')
  }

  // Filter by status (admin only)
  if (isAdmin && status && status !== 'all') {
    query = query.eq('status', status)
  }

  // Filter by category slug
  if (category && category !== 'all') {
    const { data: cat } = await supabaseAdmin
      .from('article_categories')
      .select('id')
      .eq('slug', category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  // Search by title
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  // Sort
  switch (sort) {
    case 'views':
      query = query.order('view_count', { ascending: false })
      break
    case 'oldest':
      query = query.order('published_at', { ascending: true })
      break
    default: // newest
      query = query.order('published_at', { ascending: false, nullsFirst: false })
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/articles — create new article
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, slug, status, category_id, author_id, content, image_urls, excerpt } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'title and slug are required' }, { status: 400 })
  }

  const payload: Record<string, unknown> = {
    title,
    slug,
    status: status || 'draft',
    category_id: category_id || null,
    author_id: author_id || null,
    content: content || [],
    image_urls: image_urls || [],
    excerpt: excerpt || null,
  }

  if (status === 'published') {
    payload.published_at = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .insert(payload)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
