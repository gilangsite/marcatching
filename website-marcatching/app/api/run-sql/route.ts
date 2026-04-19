import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  try {
    // Attempt to add column
    // Wait, Supabase RPC must exist to run arbitrary SQL unless we use postgres connection
    // We can just try to run it via REST if it exists, or typically we can't run DDL via the JS client
    // But let's see if pg is installed in the project to run direct query
    return NextResponse.json({ error: 'Cannot run DDL via standard JS client without an RPC' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}
