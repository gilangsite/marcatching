'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Filter, BrainCircuit, ScanEye, Database, ArrowRight, Check, X, Mail } from 'lucide-react'
import type { NavLink } from '@/lib/supabaseClient'
import styles from './about.module.css'

function getDriveThumb(url: string | null | undefined, size = 'w800-h1000') {
  if (!url) return null
  if (url.includes('drive.google.com/uc')) {
    const m = url.match(/id=([^&]+)/)
    if (m?.[1]) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=${size}`
  }
  return url
}

export default function AboutClient({ navLinks, config }: { navLinks: NavLink[], config: any }) {
  const { scrollYProgress } = useScroll()
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scaleZoom = useTransform(scrollYProgress, [0, 0.2], [1, 1.1])
  const blurFade = useTransform(scrollYProgress, [0, 0.2], ['blur(0px)', 'blur(10px)'])

  // Variants for scroll elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2, delayChildren: 0.1 } 
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 60, damping: 20 } }
  }

  return (
    <>
      <Navbar navLinks={navLinks} />

      <main className={styles.main}>
        {/* Hero Section with AI background image */}
        <div className={styles.heroWrapper}>
          <motion.div 
            className={styles.heroBackground}
            style={{ opacity: opacityFade, scale: scaleZoom, filter: blurFade }}
          />
          <div className={styles.heroOverlay} />
          
          <motion.section 
            className={styles.hero}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className={styles.heroTag}>What is Marcatching</span>
            <h1 className={styles.heroTitle}>Marketing ain&apos;t just selling.<br />It&apos;s system design.</h1>
            <p className={styles.heroSubtitle}>
              Kami membongkar cara kerja sistem di balik kebisingan pasar, menggabungkan AI, teknologi, dan psikologi untuk merancang bisnis yang layak diikuti.
            </p>
          </motion.section>
        </div>

        {/* Philosophy Section */}
        <section className={styles.section}>
          <div className={`${styles.container} ${styles.grid2}`}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
            >
              <span className={styles.sectionTag}>The Philosophy</span>
              <h2 className={styles.sectionTitle}>Decode the system behind the noise.</h2>
              <p className={styles.textBlock}>
                Di era ekonomi atensi saat ini, keberhasilan bisnis tidak lagi ditentukan oleh siapa yang berteriak paling kencang, melainkan oleh siapa yang merancang sistem terbaik. Setiap keputusan pembelian dapat dirancang secara metodis.
              </p>
              <p className={styles.textBlock}>
                Different is better than better. Marcatching hadir menjamin pengusaha tidak sekadar paham tentang tren, tetapi mampu merajutnya menjadi ekosistem tertutup otomatis yang elegan.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
            >
              <blockquote className={styles.punchline}>
                "We don't just teach marketing; we design systems that command attention."
              </blockquote>
            </motion.div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.container}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <span className={styles.sectionTag}>Our Pillars</span>
              <h2 className={styles.sectionTitle}>Anatomi Platform Marcatching</h2>
            </motion.div>
            
            <motion.div 
              className={styles.missionGrid}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div className={styles.missionCard} variants={itemVariants}>
                <div className={styles.missionIcon}><Filter size={24} /></div>
                <h3 className={styles.missionTitle}>Noise Decoder</h3>
                <p className={styles.missionDesc}>Mengubah data mentah dan tren yang terfragmentasi menjadi insting bisnis dan wawasan tajam.</p>
              </motion.div>
              <motion.div className={styles.missionCard} variants={itemVariants}>
                <div className={styles.missionIcon}><BrainCircuit size={24} /></div>
                <h3 className={styles.missionTitle}>Human & Machine</h3>
                <p className={styles.missionDesc}>Mempersiapkan wirausahawan menuju era eksploratif Agentic AI tanpa menghilangkan insting manusia.</p>
              </motion.div>
              <motion.div className={styles.missionCard} variants={itemVariants}>
                <div className={styles.missionIcon}><ScanEye size={24} /></div>
                <h3 className={styles.missionTitle}>Perception Design</h3>
                <p className={styles.missionDesc}>Mendesain perjalanan psikologi audiens secara persuasif untuk mengunci atensi maksimal.</p>
              </motion.div>
              <motion.div className={styles.missionCard} variants={itemVariants}>
                <div className={styles.missionIcon}><Database size={24} /></div>
                <h3 className={styles.missionTitle}>Data Authority</h3>
                <p className={styles.missionDesc}>Strategi difabrikasi berbasis kalkulasi empiris, referensi riset eksklusif, dan keahlian behavioral economics.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Macro Data Section */}
        <section className={styles.section}>
          <div className={`${styles.container} ${styles.grid2}`}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
            >
              <span className={styles.sectionTag}>The Reality</span>
              <h2 className={styles.sectionTitle}>Confidence-Capability Paradox</h2>
              <p className={styles.textBlock}>
                Ekonomi digital Indonesia diproyeksikan melampaui USD 146 miliar pada 2025. Namun, analisis terhadap 65 juta UMKM mengungkapkan fakta yang keras: meskipun 93% bisnis yakin mampu menerapkan AI, nyatanya hanya 26% yang benar-benar telah mengintegrasikannya ke dalam operasional secara nyata.
              </p>
              <p className={styles.textBlock}>
                Ketimpangan ini disebabkan oleh kesenjangan talenta digital. Marcatching hadir untuk memecah kebuntuan ini. Kami tidak memberi tips motivasi dangkal, melainkan menjembatani ruang antara wacana integrasi AI dengan implementasi sistem cerdas pada marketing intelligence.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
              className={styles.dataBoxWrap}
            >
              <div className={styles.dataBox}>
                <div className={styles.dataItem}>
                  <h3>USD 146M</h3>
                  <p>Proyeksi Ekonomi Digital 2025</p>
                </div>
                <div className={styles.dataItem}>
                  <h3>26%</h3>
                  <p>Adopsi AI UMKM</p>
                </div>
                <div className={styles.dataItem}>
                  <h3>212 Juta</h3>
                  <p>Pengguna Internet Indonesia</p>
                </div>
                <div className={styles.dataItem}>
                  <h3>+50%</h3>
                  <p>Kenaikan Efisiensi AI Workflow</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Comparison Section (Cocok vs Tidak Cocok) */}
        <section className={styles.section}>
          <div className={styles.container}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', marginBottom: '60px' }}
            >
              <span className={styles.sectionTag}>Audience Filtering</span>
              <h2 className={styles.sectionTitle}>Siapa Kami Sebenarnya?</h2>
            </motion.div>

            <div className={styles.comparisonGrid}>
              <motion.div 
                className={`${styles.comparisonCard} ${styles.cardPros}`}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className={styles.comparisonHeader}>
                  <Check size={28} color="#22c55e" />
                  <h3>Marcatching Sangat Cocok Untuk Mereka...</h3>
                </div>
                <ul className={styles.comparisonList}>
                  {config.comparison_pros.map((pro: string, i: number) => (
                    <li key={i}><Check size={18} color="#22c55e" style={{flexShrink:0, marginTop:3}}/> <span>{pro}</span></li>
                  ))}
                </ul>
              </motion.div>

              <motion.div 
                className={`${styles.comparisonCard} ${styles.cardCons}`}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className={styles.comparisonHeader}>
                  <X size={28} color="#ef4444" />
                  <h3>Dan TIDAK Cocok Untuk Kalian...</h3>
                </div>
                <ul className={styles.comparisonList}>
                  {config.comparison_cons.map((con: string, i: number) => (
                    <li key={i}><X size={18} color="#ef4444" style={{flexShrink:0, marginTop:3}}/> <span>{con}</span></li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Founder Profile - Using dynamic image */}
        <section className={`${styles.section} ${styles.founderSection}`}>
          <div className={styles.container}>
            <motion.div 
              className={styles.founderBox}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={itemVariants}
            >
              {config.founder_photo_url && (
                <div className={styles.founderPhotoWrapper}>
                  <img src={getDriveThumb(config.founder_photo_url) || config.founder_photo_url} alt={config.founder_name} className={styles.founderPhoto} />
                </div>
              )}
              <div className={styles.founderContent}>
                <div className={styles.founderLabel}>The Architect</div>
                <h2 className={styles.founderName}>{config.founder_name}</h2>
                <div className={styles.founderQuote}>
                  "{config.founder_quote}"
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <motion.div 
            className={styles.ctaBox}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className={styles.ctaTitle}>Upgrade Insting Bisnismu.</h2>
            <p className={styles.ctaDesc}>
              Bergabung bersama sekumpulan perancang ekosistem bisnis modern. Buat sistem penopang konversi kamu hari ini.
            </p>
            <div className={styles.ctaButtons}>
              <a href={config.cta_url || '/store'} className={styles.btnPrimary}>
                {config.cta_text || 'Marcatching Store'} <ArrowRight size={18} />
              </a>
              <a href={`mailto:${config.contact_email || 'gilang@marcatching.com'}`} className={styles.btnSecondary}>
                <Mail size={18} /> Hubungi Kami
              </a>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  )
}
