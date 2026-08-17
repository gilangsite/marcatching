import { NextRequest, NextResponse } from 'next/server'
import { getMemberFromRequest } from '@/lib/memberApiAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Prefill checkout form fields for a signed-in member from their most recent order —
// there's no dedicated profile table, so "last known" order details are the best source.
export async function GET(req: NextRequest) {
  const member = await getMemberFromRequest(req)
  if (!member?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const email = member.email.toLowerCase().trim()
  const { data: lastOrder } = await supabaseAdmin
    .from('orders')
    .select('full_name, whatsapp')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({
    email,
    full_name: lastOrder?.full_name || '',
    whatsapp: lastOrder?.whatsapp || '',
  }, { headers: { 'Cache-Control': 'no-store' } })
}
