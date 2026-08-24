import { NextRequest } from 'next/server'
import { hasValidAdminSession } from '@/lib/adminSession'
import { getAffiliateReceipt } from '@/lib/affiliateReceipt'
import { getServerSupabase } from '@/lib/supabaseServer'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const receipt = await getAffiliateReceipt(id)
  if (!receipt) return new Response('Slip belum tersedia', { status: 404 })

  const isAdmin = await hasValidAdminSession(req)
  if (!isAdmin) {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== receipt.member.user_id) return new Response('Unauthorized', { status: 401 })
  }

  return new Response(new Uint8Array(receipt.pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="marcatching-affiliate-${id.slice(0, 8)}.pdf"`,
      'Cache-Control': 'private, no-store',
      'Content-Length': String(receipt.pdf.length),
    },
  })
}
