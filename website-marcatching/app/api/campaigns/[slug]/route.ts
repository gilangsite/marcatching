import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function PATCH(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await req.json()
    
    // Convert undefined to null or omit the key, but Supabase handles it if we just pass the object
    const updatePayload: any = {}
    if (body.title !== undefined) updatePayload.title = body.title
    if (body.slug !== undefined) updatePayload.slug = body.slug
    if (body.theme !== undefined) updatePayload.theme = body.theme
    if (body.status !== undefined) updatePayload.status = body.status
    if (body.blocks !== undefined) updatePayload.blocks = body.blocks

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update(updatePayload)
      .eq('slug', params.slug)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { error } = await supabaseAdmin
    .from('campaigns')
    .delete()
    .eq('slug', params.slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
