import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

// GET – list all surveys
export async function GET() {
  const { data, error } = await supabase
    .from('surveys')
    .select('*, survey_questions(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST – create a new survey
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, slug, description, image_url, image_aspect_ratio, status } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'title and slug are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('surveys')
    .insert({ title, slug, description, image_url, image_aspect_ratio, status: status ?? 'active' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH – update a survey
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('surveys')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE – delete a survey (cascades to questions) + cleanup Drive image
export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { id } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Fetch image_url before deleting so we can cleanup Drive
  const { data: survey } = await supabase
    .from('surveys')
    .select('image_url')
    .eq('id', id)
    .single()

  // Delete from Supabase (cascades to questions)
  const { error } = await supabase.from('surveys').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Cleanup Drive image in the background (don't fail the request if this errors)
  if (survey?.image_url) {
    try {
      const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
      if (appsScriptUrl) {
        await fetch(appsScriptUrl, {
          method: 'POST',
          body: JSON.stringify({ action: 'deleteFile', url: survey.image_url }),
          redirect: 'follow',
        })
      }
    } catch { /* silent – Drive cleanup is best-effort */ }
  }

  return NextResponse.json({ success: true })
}
