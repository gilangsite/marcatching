import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import type { Link, Contact } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import ButtonCard from '@/components/ButtonCard'
import TextBlock from '@/components/TextBlock'
import ImageCarousel from '@/components/ImageCarousel'
import VideoEmbed from '@/components/VideoEmbed'
import FloatingLogo from '@/components/FloatingLogo'
import Footer from '@/components/Footer'
import { Mail, ArrowRight } from 'lucide-react'
import styles from './page.module.css'

async function getLinks(): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching links:', error)
    return []
  }
  return data ?? []
}

async function getContact(): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .single()

  if (error) return null
  return data
}

export const revalidate = 0 // always fetch fresh data

export default async function HomePage() {
  const [links, contact] = await Promise.all([getLinks(), getContact()])

  return (
    <>
      <Navbar links={links} />

      <main className={styles.main}>
        {/* ── Main Content ────────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.heroDecor} />
          <div className={styles.heroContent}>
            
            <div className={styles.homeLogoWrap}>
              <Image
                src="/logo-type-navy.png"
                alt="Marcatching Logo"
                width={800}
                height={200}
                className={styles.homeLogoType}
                priority
              />
            </div>
            
            <p className={styles.homeTagline}>
              Learning to understand how marketing really works.
            </p>

            <div className={styles.linksList}>
              {links.length > 0 ? (
                links.map((link, i) => {
                  if (link.type === 'text') {
                    return <TextBlock key={link.id} link={link} />
                  }
                  if (link.type === 'carousel') {
                    return <ImageCarousel key={link.id} link={link} />
                  }
                  if (link.type === 'video') {
                    return <VideoEmbed key={link.id} link={link} />
                  }
                  return <ButtonCard key={link.id} link={link} index={i} />
                })
              ) : (
                <p className={styles.emptyState}>Belum ada link tersedia.</p>
              )}
            </div>
            
          </div>
        </section>

        {/* ── Contact ─────────────────────────────────────── */}
        <section className={styles.contactSection}>
          <div className={styles.heroContent}>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <Mail size={24} strokeWidth={1.75} />
              </div>
              <div className={styles.contactBody}>
                <h2 className={styles.contactTitle}>Get in touch with Marcatching</h2>
                <p className={styles.contactDesc}>
                  Punya pertanyaan atau ingin berkolaborasi? Kirimkan pesan ke kami.
                </p>
                {contact?.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className={styles.emailLink}
                  >
                    {contact.email}
                    <ArrowRight size={16} strokeWidth={2} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingLogo />
    </>
  )
}
