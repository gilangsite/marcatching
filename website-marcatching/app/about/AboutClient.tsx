'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Filter, BrainCircuit, ScanEye, Database,
  ArrowRight, Check, X, Mail,
  TrendingUp, Layers, Cpu, Target,
  Hammer, Compass, BookOpen, Activity,
  ChevronDown
} from 'lucide-react'
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

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 55, damping: 18 } }
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.05 } }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
}

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 55, damping: 18 } }
}

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 55, damping: 18 } }
}

export default function AboutClient({ navLinks, config }: { navLinks: NavLink[], config: any }) {
  const { scrollYProgress } = useScroll()
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scaleZoom = useTransform(scrollYProgress, [0, 0.2], [1, 1.08])
  const blurFade = useTransform(scrollYProgress, [0, 0.2], ['blur(0px)', 'blur(8px)'])

  return (
    <>
      <Navbar navLinks={navLinks} />

      <main className={styles.main}>

        {/* ── 1. HERO ── */}
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
            transition={{ duration: 0.85, ease: 'easeOut' }}
          >
            <span className={styles.heroTag}>What is Marcatching</span>
            <h1 className={styles.heroTitle}>
              Build a Business That<br />Learns Faster Than<br />the Market.
            </h1>
            <p className={styles.heroSubtitle}>
              Marcatching membantu business owner membangun sistem marketing modern yang mampu membaca pasar, memahami perilaku audiens, dan mengubah atensi menjadi pertumbuhan bisnis yang terukur.
            </p>
          </motion.section>

          <motion.div
            className={styles.heroScroll}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>

        {/* ── 2. THE PROBLEM ── */}
        <section className={styles.section}>
          <div className={styles.container}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className={styles.problemWrap}
            >
              <motion.span className={styles.sectionTag} variants={fadeUp}>The Problem</motion.span>
              <motion.h2 className={styles.problemTitle} variants={fadeUp}>
                Most Businesses Are Not<br />Losing Because They Lack Content.<br />They Are Losing Because<br />They Lack System.
              </motion.h2>
              <motion.div className={styles.problemDivider} variants={fadeIn} />
              <motion.div className={styles.problemBody} variants={stagger}>
                <motion.p className={styles.textBlock} variants={fadeUp}>
                  Banyak bisnis hari ini sudah punya produk, sudah punya media sosial, bahkan sudah mulai menggunakan AI. Tapi sebagian besar masih berjalan secara reaktif: mengikuti tren tanpa membaca pola, membuat konten tanpa positioning yang jelas, dan mengejar exposure tanpa sistem konversi yang terukur.
                </motion.p>
                <motion.p className={styles.textBlock} variants={fadeUp}>
                  Di era AI, kecepatan bukan lagi keunggulan. Keunggulan sebenarnya adalah kemampuan mengubah data, teknologi, dan psikologi audiens menjadi keputusan marketing yang presisi.
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── 3. THE GAP / DATA ── */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={`${styles.container} ${styles.grid2}`}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={slideLeft}
            >
              <span className={styles.sectionTag}>The AI Adoption Gap</span>
              <h2 className={styles.sectionTitle}>
                Everyone Talks About AI.<br />Few Know How to<br />Operationalize It.
              </h2>
              <p className={styles.textBlock}>
                Banyak pemilik bisnis percaya bahwa AI akan mengubah cara mereka bekerja. Namun, keyakinan saja tidak cukup. Tantangan sebenarnya bukan lagi &quot;apakah bisnis harus menggunakan AI&quot;, melainkan &quot;bagaimana AI diintegrasikan ke dalam sistem marketing, content production, customer journey, dan decision-making sehari-hari.&quot;
              </p>
              <p className={styles.textBlock}>
                Ketimpangan ini disebabkan oleh kesenjangan talenta digital. Marcatching hadir untuk memecah kebuntuan ini — menjembatani ruang antara wacana integrasi AI dengan implementasi sistem cerdas pada marketing intelligence.
              </p>
              <p className={styles.dataNote}>
                Data should not decorate the page. Data should create urgency.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={slideRight}
              className={styles.dataBoxWrap}
            >
              <div className={styles.dataBox}>
                <div className={styles.dataItem}>
                  <h3>USD 146B</h3>
                  <p>Indonesia Digital Economy Projection</p>
                  <span className={styles.dataSource}>Projected 2025</span>
                </div>
                <div className={styles.dataItem}>
                  <h3>212 Juta</h3>
                  <p>Internet Users in Indonesia</p>
                  <span className={styles.dataSource}>Statista, 2024</span>
                </div>
                <div className={styles.dataItem}>
                  <h3>26%</h3>
                  <p>Businesses with Real AI Integration</p>
                  <span className={styles.dataSource}>vs. 93% confident</span>
                </div>
                <div className={styles.dataItem}>
                  <h3>+50%</h3>
                  <p>Potential Workflow Efficiency Increase</p>
                  <span className={styles.dataSource}>McKinsey, 2023</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── 4. WHAT MARCATCHING BUILDS (NEW) ── */}
        <section className={styles.section}>
          <div className={styles.container}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
            >
              <motion.span className={styles.sectionTag} variants={fadeUp}>What We Build</motion.span>
              <motion.h2 className={styles.sectionTitle} variants={fadeUp}>
                What Marcatching<br />Actually Does
              </motion.h2>
              <motion.p className={styles.sectionSubtitle} variants={fadeUp}>
                Bukan sekadar belajar marketing — ini sistem untuk business growth.
              </motion.p>
            </motion.div>

            <motion.div
              className={styles.buildGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
            >
              <motion.div className={styles.buildCard} variants={fadeUp}>
                <div className={styles.buildNumber}>01</div>
                <div className={styles.buildIconWrap}>
                  <TrendingUp size={22} />
                </div>
                <h3 className={styles.buildTitle}>Market Intelligence</h3>
                <p className={styles.buildDesc}>
                  Membaca tren, kompetitor, perilaku audiens, dan peluang kategori agar bisnis tidak bergerak berdasarkan asumsi.
                </p>
              </motion.div>

              <motion.div className={styles.buildCard} variants={fadeUp}>
                <div className={styles.buildNumber}>02</div>
                <div className={styles.buildIconWrap}>
                  <Layers size={22} />
                </div>
                <h3 className={styles.buildTitle}>Brand Perception System</h3>
                <p className={styles.buildDesc}>
                  Membantu bisnis mendesain cara audiens melihat, memahami, dan mempercayai brand.
                </p>
              </motion.div>

              <motion.div className={styles.buildCard} variants={fadeUp}>
                <div className={styles.buildNumber}>03</div>
                <div className={styles.buildIconWrap}>
                  <Cpu size={22} />
                </div>
                <h3 className={styles.buildTitle}>AI-Powered Marketing Workflow</h3>
                <p className={styles.buildDesc}>
                  Mengintegrasikan AI ke dalam proses riset, content ideation, copywriting, campaign planning, automation, dan decision-making.
                </p>
              </motion.div>

              <motion.div className={styles.buildCard} variants={fadeUp}>
                <div className={styles.buildNumber}>04</div>
                <div className={styles.buildIconWrap}>
                  <Target size={22} />
                </div>
                <h3 className={styles.buildTitle}>Growth & Conversion Architecture</h3>
                <p className={styles.buildDesc}>
                  Menyusun sistem yang menghubungkan attention, trust, offer, funnel, dan revenue menjadi satu ekosistem yang terukur.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── 5. PILLARS ── */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
            >
              <motion.span className={styles.sectionTag} variants={fadeUp}>Our Pillars</motion.span>
              <motion.h2 className={styles.sectionTitle} variants={fadeUp}>Marcatching Pillars</motion.h2>
            </motion.div>

            <motion.div
              className={styles.missionGrid}
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <motion.div className={styles.missionCard} variants={fadeUp}>
                <div className={styles.missionIcon}><Filter size={22} /></div>
                <h3 className={styles.missionTitle}>Noise Decoder</h3>
                <p className={styles.missionTagline}>From scattered information to strategic clarity.</p>
                <p className={styles.missionDesc}>Marcatching membantu bisnis memisahkan sinyal dari noise: mana tren yang layak diikuti, mana yang hanya distraksi, dan mana yang bisa menjadi peluang pertumbuhan.</p>
              </motion.div>

              <motion.div className={styles.missionCard} variants={fadeUp}>
                <div className={styles.missionIcon}><BrainCircuit size={22} /></div>
                <h3 className={styles.missionTitle}>Human &amp; Machine</h3>
                <p className={styles.missionTagline}>AI should accelerate human judgment, not replace it.</p>
                <p className={styles.missionDesc}>Masa depan marketing bukan tentang manusia melawan mesin, tapi tentang founder dan marketer yang mampu menggunakan AI untuk berpikir, mengeksekusi, dan mengambil keputusan lebih cepat.</p>
              </motion.div>

              <motion.div className={styles.missionCard} variants={fadeUp}>
                <div className={styles.missionIcon}><ScanEye size={22} /></div>
                <h3 className={styles.missionTitle}>Perception Design</h3>
                <p className={styles.missionTagline}>People do not buy the best product. They buy the clearest meaning.</p>
                <p className={styles.missionDesc}>Marcatching membantu brand merancang persepsi, narasi, visual, dan pesan yang membuat audiens memahami nilai bisnis dengan lebih cepat.</p>
              </motion.div>

              <motion.div className={styles.missionCard} variants={fadeUp}>
                <div className={styles.missionIcon}><Database size={22} /></div>
                <h3 className={styles.missionTitle}>Data Authority</h3>
                <p className={styles.missionTagline}>Strong brands are not built by guesswork.</p>
                <p className={styles.missionDesc}>Setiap strategi perlu ditopang oleh data, riset, behavioral insight, dan validasi pasar agar marketing tidak berhenti sebagai opini kreatif.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── 6. FOUNDER ── */}
        <section className={`${styles.section} ${styles.founderSection}`}>
          <div className={styles.container}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              style={{ textAlign: 'center', marginBottom: '64px' }}
            >
              <span className={styles.sectionTag}>Meet the Founder</span>
              <h2 className={styles.sectionTitle}>
                Built by a Marketer Who<br />Understands Content, Business,<br />and the New AI Economy.
              </h2>
            </motion.div>

            <motion.div
              className={styles.founderBox}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {config.founder_photo_url && (
                <motion.div
                  className={styles.founderPhotoWrapper}
                  variants={slideLeft}
                  style={{ position: 'relative' }}
                >
                  <Image
                    src={getDriveThumb(config.founder_photo_url) || config.founder_photo_url}
                    alt={config.founder_name}
                    fill
                    className={styles.founderPhoto}
                  />
                </motion.div>
              )}

              <motion.div className={styles.founderContent} variants={slideRight}>
                <h2 className={styles.founderName}>{config.founder_name}</h2>
                <p className={styles.founderRole}>Founder, Marcatching</p>

                <p className={styles.founderBio}>
                  Gilang Ramadhan is the founder of Marcatching, a marketing intelligence platform built to help business owners, entrepreneurs, and marketers adapt to the new era of AI-powered growth.
                </p>
                <p className={styles.founderBio}>
                  His work sits at the intersection of content strategy, consumer psychology, brand positioning, AI workflow, and business growth. Through Marcatching, he helps modern businesses move beyond random content creation and start building marketing systems that are sharper, faster, and more scalable.
                </p>

                <div className={styles.founderQuoteBox}>
                  <div className={styles.founderQuoteMark}>&ldquo;</div>
                  <p className={styles.founderQuote}>
                    {config.founder_quote}
                  </p>
                </div>

                <div className={styles.founderBelief}>
                  <p className={styles.founderBeliefText}>
                    Marcatching was created from one belief: most businesses do not need more noise. They need a clearer system — one that helps them understand their market, design stronger perception, produce better content, and turn attention into measurable business outcomes.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Credibility Blocks */}
            <motion.div
              className={styles.credGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
            >
              <motion.div className={styles.credCard} variants={fadeUp}>
                <div className={styles.credIcon}><Hammer size={20} /></div>
                <h4 className={styles.credTitle}>Builder</h4>
                <p className={styles.credDesc}>Builds marketing systems, content engines, and digital growth frameworks for modern businesses.</p>
              </motion.div>
              <motion.div className={styles.credCard} variants={fadeUp}>
                <div className={styles.credIcon}><Compass size={20} /></div>
                <h4 className={styles.credTitle}>Strategist</h4>
                <p className={styles.credDesc}>Focuses on positioning, consumer psychology, AI workflow, and market intelligence.</p>
              </motion.div>
              <motion.div className={styles.credCard} variants={fadeUp}>
                <div className={styles.credIcon}><BookOpen size={20} /></div>
                <h4 className={styles.credTitle}>Educator</h4>
                <p className={styles.credDesc}>Translates complex marketing and technology concepts into practical frameworks business owners can use.</p>
              </motion.div>
              <motion.div className={styles.credCard} variants={fadeUp}>
                <div className={styles.credIcon}><Activity size={20} /></div>
                <h4 className={styles.credTitle}>Operator</h4>
                <p className={styles.credDesc}>Understands marketing not only as theory, but as daily execution: content, funnel, offer, conversion, and scale.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── 7. AUDIENCE FILTER ── */}
        <section className={styles.section}>
          <div className={styles.container}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
              style={{ textAlign: 'center', marginBottom: '60px' }}
            >
              <motion.span className={styles.sectionTag} variants={fadeUp}>Audience Filtering</motion.span>
              <motion.h2 className={styles.sectionTitle} variants={fadeUp}>
                Marcatching Is Not for Everyone.<br />It Is for Builders.
              </motion.h2>
            </motion.div>

            <div className={styles.comparisonGrid}>
              <motion.div
                className={`${styles.comparisonCard} ${styles.cardPros}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideLeft}
              >
                <div className={styles.comparisonHeader}>
                  <Check size={26} color="#22c55e" />
                  <h3>Cocok untuk Builders</h3>
                </div>
                <ul className={styles.comparisonList}>
                  {config.comparison_pros.map((pro: string, i: number) => (
                    <li key={i}>
                      <Check size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 4 }} />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                className={`${styles.comparisonCard} ${styles.cardCons}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideRight}
              >
                <div className={styles.comparisonHeader}>
                  <X size={26} color="#ef4444" />
                  <h3>Tidak Cocok Untuk</h3>
                </div>
                <ul className={styles.comparisonList}>
                  {config.comparison_cons.map((con: string, i: number) => (
                    <li key={i}>
                      <X size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 4 }} />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 8. CTA ── */}
        <section className={styles.ctaSection}>
          <motion.div
            className={styles.ctaBox}
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <span className={styles.ctaTag}>Start Now</span>
            <h2 className={styles.ctaTitle}>
              Start Building Your<br />Marketing Intelligence System.
            </h2>
            <p className={styles.ctaDesc}>
              Join Marcatching and learn how to integrate AI, psychology, data, and strategy into a business growth system that works beyond trends.
            </p>
            <div className={styles.ctaButtons}>
              <Link href={config.cta_url || '/store'} className={styles.btnPrimary}>
                {config.cta_text || 'Explore Marcatching'} <ArrowRight size={18} />
              </Link>
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
