import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jimbydkqlputlvpcspjv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_rF4yCw9hMldmrawKp3tALg_Y0zO7MAD'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Link = {
  id: string
  title: string
  url: string | null
  icon: string
  status: 'active' | 'coming_soon'
  order_index: number
  created_at: string

  // New fields for Text & Image blocks
  type: 'button' | 'text' | 'carousel'
  btn_color?: string | null
  text_color?: string | null
  text_size?: string | null
  text_align?: string | null
  text_bold?: boolean | null
  text_italic?: boolean | null
  carousel_aspect_ratio?: string | null
  image_data?: any // jsonb array of { url: string, link: string }
}

export type Contact = {
  id: string
  email: string
  created_at: string
}
