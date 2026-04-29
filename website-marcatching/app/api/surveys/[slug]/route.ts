import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

// GET /api/surveys/[slug] – fetch one survey with its questions
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('surveys')
    .select('*, survey_questions(*)')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
  }

  // Sort questions by order_index
  data.survey_questions = (data.survey_questions ?? []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  )

  return NextResponse.json(data)
}
