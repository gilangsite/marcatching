import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'
import type { NavLink } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Filter, BrainCircuit, ScanEye, Database } from 'lucide-react'
import styles from './about.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About | Marcatching',
  description: 'Marketing isn\'t selling. It\'s system design. Kami membongkar cara kerja sistem di balik kebisingan pasar.',
  openGraph: {
    title: 'About | Marcatching',
    description: 'Marketing isn\'t selling. It\'s system design.',
    url: 'https://www.marcatching.com/about',
  }
}

export default async function AboutPage() {
  const { data: navLinksRes } = await supabase
    .from('nav_links')
    .select('*')
    .eq('is_active', true)
    .order('order_index')

  const navLinks: NavLink[] = navLinksRes || []

  return (
    <>
      <Navbar navLinks={navLinks} />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <span className={styles.heroTag}>What is Marcatching</span>
          <h1 className={styles.heroTitle}>Marketing isn&apos;t selling.<br />It&apos;s system design.</h1>
          <p className={styles.heroSubtitle}>
            Kami bukan sekadar membagikan trik viral. Kami membongkar cara kerja sistem di balik kebisingan pasar, menggabungkan AI, teknologi, dan psikologi untuk merancang bisnis yang layak diikuti.
          </p>
        </section>

        {/* Philosophy Section */}
        <section className={styles.section}>
          <div className={`${styles.container} ${styles.grid2}`}>
            <div>
              <span className={styles.sectionTag}>The Philosophy</span>
              <h2 className={styles.sectionTitle}>Decode the system behind the noise.</h2>
              <p className={styles.textBlock}>
                Di era ekonomi atensi saat ini, keberhasilan bisnis tidak lagi ditentukan oleh siapa yang berteriak paling kencang, melainkan oleh siapa yang merancang sistem terbaik. Kami percaya bahwa setiap keputusan pembelian konsumen dapat dibedah, diprediksi, dan dirancang secara sistematis.
              </p>
              <p className={styles.textBlock}>
                Different is better than better. Marcatching hadir untuk memecahkan *Confidence-Capability Paradox* di Indonesia—menjamin pengusaha tidak hanya sekadar \'paham\' tentang AI dan marketing, tetapi mampu mengintegrasikannya menjadi sistem otonom yang bekerja 24/7.
              </p>
            </div>
            <div>
              <blockquote className={styles.punchline}>
                &quot;We don&apos;t just teach marketing; we design systems that command attention.&quot;
              </blockquote>
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.container}>
            <span className={styles.sectionTag}>Our Pillars</span>
            <h2 className={styles.sectionTitle}>Membangun Bisnis Masa Depan</h2>
            
            <div className={styles.missionGrid}>
              <div className={styles.missionCard}>
                <div className={styles.missionIcon}><Filter size={24} /></div>
                <h3 className={styles.missionTitle}>Pemisah Kebisingan</h3>
                <p className={styles.missionDesc}>Mengubah data mentah dan tren yang terfragmentasi menjadi wawasan strategis yang tajam dan dapat dieksekusi.</p>
              </div>

              <div className={styles.missionCard}>
                <div className={styles.missionIcon}><BrainCircuit size={24} /></div>
                <h3 className={styles.missionTitle}>Human-Machine Integration</h3>
                <p className={styles.missionDesc}>Mempersiapkan pemimpin bisnis di era Agentic AI, mengorkestrasi alur kerja AI untuk mengeliminasi batasan operasional.</p>
              </div>

              <div className={styles.missionCard}>
                <div className={styles.missionIcon}><ScanEye size={24} /></div>
                <h3 className={styles.missionTitle}>Desain Persepsi</h3>
                <p className={styles.missionDesc}>Marketing bukan sekadar tentang menjual produk, melainkan mendesain sistem persupsi yang mengunci audiens secara organik.</p>
              </div>

              <div className={styles.missionCard}>
                <div className={styles.missionIcon}><Database size={24} /></div>
                <h3 className={styles.missionTitle}>Otoritas Berbasis Data</h3>
                <p className={styles.missionDesc}>Setiap landasan wawasan kami didukung oleh metrik konkret, behavioral economics, dan perilaku pasar yang terverifikasi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.founderBox}>
              <div className={styles.founderLabel}>The Architect</div>
              <h2 className={styles.founderName}>Gilang Ramadhan</h2>
              <p className={styles.textBlock}>
                Berdiri sebagai Intelligence Leader, Gilang memandang marketing melalui lensa *Artificial Intelligence*, psikologi, dan perilaku konsumen modern. Mengedepankan selera (*taste*) kelas menengah ke atas dan minimalisme terarah—fokus berbicara hanya saat memiliki gagasan mendalam, jauh dari *marketing bro gimmick* dan taktik dangkal.
              </p>
              <div className={styles.founderQuote}>
                &quot;Kesuksesan di era AI milik mereka yang mampu mensintesis raw data buatan mesin menjadi arah kreatif yang memiliki nyawa. Marketing bukan sekadar tentang barang apa yang kamu kemas, tapi sistem apa yang kamu desain untuk mengunci perhatian audiens secara elegan.&quot;
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>Upgrade Your Instinct.</h2>
            <p className={styles.ctaDesc}>
              Bergabung bersama komunitas pebisnis cerdas yang mendesain masa depan industri mereka secara sistematis. Saatnya tinggalkan kebiasaan berburu dan mulai merancang mesin panen kamu sendiri.
            </p>
            <a href="/store" className={styles.btnPrimary}>
              Jelajahi Marcatching Ekosistem
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
