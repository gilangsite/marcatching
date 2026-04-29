import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

// POST – bulk insert questions for a survey
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { questions } = body
  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: 'questions array required' }, { status: 400 })
  }
  const rows = questions.map(({ id: _id, ...q }: any) => q) // strip client-side ids
  const { error } = await supabase.from('survey_questions').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE – delete all questions for a survey
export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { survey_id } = body
  if (!survey_id) return NextResponse.json({ error: 'survey_id required' }, { status: 400 })
  const { error } = await supabase.from('survey_questions').delete().eq('survey_id', survey_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
