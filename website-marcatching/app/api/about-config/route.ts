import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const { data: config, error } = await supabase
      .from('about_config')
      .select('*')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Default configuration if no row exists yet
    const defaultConfig = {
      contact_email: 'gilang@marcatching.com',
      cta_text: 'Get Your First AI Agent',
      cta_url: '/course/login',
      founder_name: 'Gilang Ramadhan',
      founder_photo_url: '',
      founder_quote: 'Kesuksesan di era AI milik mereka yang mampu mensintesis raw data buatan mesin menjadi arah kreatif yang memiliki nyawa. Marketing bukan sekadar tentang barang apa yang kamu kemas, tapi sistem apa yang kamu desain untuk mengunci perhatian audiens secara elegan.',
      comparison_pros: ['Mencari hasil bisnis jangka panjang', 'Menginginkan sistem berbasis AI', 'Ingin memposisikan brand dengan estetika premium', 'Percaya pada data, bukan sekadar opini'],
      comparison_cons: ['Menginginkan jalan pintas atau hasil instan semalam', 'Mencari trik kontroversi untuk viral', 'Hanya peduli pada likes tanpa melihat impact ke revenue', 'Malas beradaptasi dengan teknologi baru'],
      // Ecosystem links
      article_url: '/article',
      instagram_url: 'https://www.instagram.com/marcatching.id/',
      tiktok_url: 'https://www.tiktok.com/@marcatching',
      survey_url: '/survey',
      store_url: '/store',
      // Impact stats
      stat_umkm_helped: 0,
      stat_total_reach: 0,
      stat_product_sold: 0,
      // Embed visuals
      embed_social_image_url: '',
      embed_social_title: 'Tonton di Instagram',
      embed_survey_image_url: '',
      embed_survey_title: 'Mulai Survey Gratis',
      embed_product_id: null,
      ecosystem_sections: []
    }

    return NextResponse.json(config || defaultConfig)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const payload = await req.json()
    
    // We assume there's only one row, so we upsert it using an ID or just update the first row
    // If the table is empty, we insert it
    const { data: existing } = await supabase.from('about_config').select('id').limit(1).single()
    
    let result;
    if (existing) {
      result = await supabase.from('about_config').update({ ...payload, updated_at: new Date() }).eq('id', existing.id)
    } else {
      result = await supabase.from('about_config').insert({ ...payload, updated_at: new Date() })
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
