import { supabase } from '@/lib/supabaseClient'
import type { Link, Contact } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import ButtonCard from '@/components/ButtonCard'
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
      <Navbar />

      <main className={styles.main}>
        {/* ── Hero ────────────────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.dot} />
              Platform Marketing Indonesia
            </div>
            <h1 className={styles.heroTitle}>
              Find Your<br />
              <span className={styles.heroAccent}>Market Match</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Marcatching menghubungkan brand dengan audiens yang tepat.<br />
              Strategi, insight, dan tools untuk tumbuhkan bisnis Anda.
            </p>
          </div>
          <div className={styles.heroDecor} />
        </section>

        {/* ── Links ───────────────────────────────────────── */}
        <section className={styles.linksSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Temukan Kami</h2>
              <p className={styles.sectionDesc}>Platform dan kanal resmi Marcatching</p>
            </div>
            <div className={styles.linksList}>
              {links.length > 0 ? (
                links.map((link, i) => (
                  <ButtonCard key={link.id} link={link} index={i} />
                ))
              ) : (
                <p className={styles.emptyState}>Belum ada link tersedia.</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Contact ─────────────────────────────────────── */}
        <section className={styles.contactSection}>
          <div className={styles.container}>
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
