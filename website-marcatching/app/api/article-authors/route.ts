import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

// GET /api/article-authors
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('article_authors')
    .select('*')
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/article-authors
export async function POST(req: NextRequest) {
  const { name, photo_url } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('article_authors')
    .insert({ name: name.trim(), photo_url: photo_url || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/article-authors
export async function PATCH(req: NextRequest) {
  const { id, name, photo_url } = await req.json()
  if (!id || !name) return NextResponse.json({ error: 'id and name required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('article_authors')
    .update({ name: name.trim(), photo_url: photo_url ?? null })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/article-authors
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('article_authors')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
