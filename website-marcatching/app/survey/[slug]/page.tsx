import { Metadata } from 'next'
import SurveyClient from './SurveyClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://marcatching.com'}/api/surveys/${slug}`, { cache: 'no-store' })
    const survey = await res.json()
    return {
      title: survey.title ? `${survey.title} — Survey Marcatching` : 'Survey Marcatching',
      description: 'Isi survey dari Marcatching',
    }
  } catch {
    return { title: 'Survey Marcatching' }
  }
}

export default async function SurveyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <SurveyClient slug={slug} />
}
