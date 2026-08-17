import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jimbydkqlputlvpcspjv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_rF4yCw9hMldmrawKp3tALg_Y0zO7MAD'

// For Server Components/Route Handlers that need to know the currently signed-in
// member (via the shared cross-subdomain session cookie, see lib/supabaseClient.ts).
// Read-only: cookie writes for token refresh happen in proxy.ts, not here — Server
// Components can't set cookies, so `setAll` is intentionally omitted.
export async function getServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
    },
  })
}
