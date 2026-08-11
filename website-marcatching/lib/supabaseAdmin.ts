import 'server-only'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Server Supabase configuration is incomplete')
}

// This privileged client must never be included in a browser bundle. Keeping it
// in a server-only module also prevents a second GoTrue auth client from
// competing with the member-facing client for the same browser storage key.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
