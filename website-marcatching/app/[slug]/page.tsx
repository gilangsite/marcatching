import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabaseClient'
import CampaignPublicClient from './CampaignPublicClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('title, slug')
    .eq('slug', resolvedParams.slug)
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

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  // Try to load the campaign. Since Next.js router checks static routes first, this will only hit
  // if no static folder (like /admin, /store) matches the slug.
  const { data: campaign, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single()

  // If no campaign matches the slug, return native 404
  if (error || !campaign) {
    notFound()
  }

  // Fetch products if there are any product blocks to resolve product data
  const hasProducts = campaign.blocks?.some((b: any) => b.type === 'product')
  let products: any[] = []
  if (hasProducts) {
    const { data: prods } = await supabaseAdmin.from('products').select('*')
    products = prods || []
  }

  return <CampaignPublicClient campaign={campaign} products={products} />
}
