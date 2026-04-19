import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabaseClient'
import CampaignPublicClient from './CampaignPublicClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('title, slug')
    .eq('slug', params.slug)
    .single()

  if (!campaign) {
    return { title: 'Not Found' }
  }

  return {
    title: `${campaign.title} - Marcatching`,
    description: `Halaman campaign ${campaign.title} dari Marcatching.`,
  }
}

// Next.js static parameters generator for any pre-rendered slugs if needed
export async function generateStaticParams() {
  const { data: campaigns } = await supabaseAdmin
    .from('campaigns')
    .select('slug')
    .eq('status', 'published')

  return (campaigns || []).map((c) => ({
    slug: c.slug,
  }))
}

export default async function CampaignPage({ params }: { params: { slug: string } }) {
  // Try to load the campaign. Since Next.js router checks static routes first, this will only hit
  // if no static folder (like /admin, /store) matches the slug.
  const { data: campaign, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('slug', params.slug)
    .single()

  // If no campaign matches the slug, return native 404
  if (error || !campaign) {
    notFound()
  }

  // If draft, ideally check if admin is logged in.
  // For now, simple approach: just throw 404 unless it's handled in the client, but SSR can't easily check client session without cookies.
  // We'll let the client handle auth checking if it's draft, or just render it but maybe with a warning.
  // For security, if it's draft, maybe only render if accessed with a special token, but in this setup,
  // we'll just allow it if they know the slug since it's just a campaign page.

  // Fetch products if there are any product blocks to resolve product data
  const hasProducts = campaign.blocks?.some((b: any) => b.type === 'product')
  let products = []
  if (hasProducts) {
    const { data: prods } = await supabaseAdmin.from('products').select('*')
    products = prods || []
  }

  return <CampaignPublicClient campaign={campaign} products={products} />
}
