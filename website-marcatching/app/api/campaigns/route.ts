import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert({
        title: body.title,
        slug: body.slug,
        theme: body.theme || 'black',
        status: body.status || 'draft',
        blocks: body.blocks || []
      })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
