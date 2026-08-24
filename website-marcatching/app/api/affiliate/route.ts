import { NextRequest, NextResponse } from 'next/server'
import {
  activateAffiliate,
  AffiliateError,
  getAffiliateDashboard,
  joinAffiliateProgram,
  saveAffiliatePayoutAccount,
  submitAffiliateDispute,
} from '@/lib/affiliateMember'
import { getServerSupabase } from '@/lib/supabaseServer'
import { storefrontOrigin } from '@/lib/storefrontOrigin'

async function currentUser() {
  const supabase = await getServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new AffiliateError('Silakan login kembali', 401)
  return user
}

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    return NextResponse.json(await getAffiliateDashboard(user, storefrontOrigin(req)))
  } catch (error) {
    const status = error instanceof AffiliateError ? error.status : 500
    if (!(error instanceof AffiliateError)) console.error('Affiliate dashboard failed', error)
    return NextResponse.json({ message: error instanceof AffiliateError ? error.message : 'Data affiliate belum dapat dimuat' }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    const body = await req.json() as Record<string, unknown>
    const action = clean(body.action, 40)
    if (action === 'activate' || action === 'accept_terms') await activateAffiliate(user)
    else if (action === 'join') await joinAffiliateProgram(user, clean(body.programId, 64))
    else if (action === 'save_payout_account') {
      await saveAffiliatePayoutAccount(user, {
        bankName: clean(body.bankName, 80),
        accountName: clean(body.accountName, 120),
        accountNumber: clean(body.accountNumber, 40),
        taxId: clean(body.taxId, 40),
      })
    } else if (action === 'submit_dispute') {
      await submitAffiliateDispute(user, {
        statementId: clean(body.statementId, 64),
        reason: clean(body.reason, 2000),
        disputedAmountRupiah: Number(body.disputedAmountRupiah) || 0,
        evidenceUrl: clean(body.evidenceUrl, 500),
      })
    } else throw new AffiliateError('Action tidak dikenali', 400)
    return NextResponse.json({ ok: true, data: await getAffiliateDashboard(user, storefrontOrigin(req)) })
  } catch (error) {
    const status = error instanceof AffiliateError ? error.status : 500
    if (!(error instanceof AffiliateError)) console.error('Affiliate member action failed', error)
    return NextResponse.json({ message: error instanceof AffiliateError ? error.message : 'Permintaan affiliate gagal' }, { status })
  }
}
