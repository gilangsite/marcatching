import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { validateSlug } from '@/lib/landingPage'
import { LANDING_COLUMNS, rowToPage, type LandingRow } from '@/lib/landingServer'
import LandingPageView from '@/components/landing/LandingPageView'

// Served at page.marcatching.com/<brand> (proxy.ts rewrites page.* to /page-home/*). Creators' saves call
// revalidatePath for this route, so edits go live immediately; the window below is only a safety net.
export const revalidate = 60

type Props = { params: Promise<{ brand: string }> }

async function loadPage(brand: string) {
  const slug = decodeURIComponent(brand).toLowerCase()
  if (!validateSlug(slug).ok) return null
  const { data } = await supabaseAdmin.from('landing_pages').select(LANDING_COLUMNS).eq('slug', slug).eq('status', 'published').maybeSingle()
  return data ? rowToPage(data as LandingRow) : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await loadPage((await params).brand)
  if (!page) return { title: 'Halaman tidak ditemukan', robots: { index: false } }
  const title = page.headline || page.slug
  return {
    title: `${title} | Marcatching`,
    description: page.description || `Semua link resmi ${title}.`,
    openGraph: { title, description: page.description || undefined, url: `https://page.marcatching.com/${page.slug}`, type: 'website' },
    alternates: { canonical: `https://page.marcatching.com/${page.slug}` },
  }
}

export default async function BrandLandingPage({ params }: Props) {
  const page = await loadPage((await params).brand)
  if (!page) notFound()
  return <LandingPageView page={page} />
}
