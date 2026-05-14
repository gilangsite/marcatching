'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Filter, BrainCircuit, ScanEye, Database,
  ArrowRight, Check, X, Mail,
  TrendingUp, Layers, Cpu, Target,
  Hammer, Compass, BookOpen, Activity,
  ChevronDown, Send,
  FileText, Share2, ClipboardList, ShoppingBag, ExternalLink, Eye
} from 'lucide-react'
import type { NavLink, Article } from '@/lib/supabaseClient'
import styles from './about.module.css'

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getFirstImageFromContent(content: any[]): string | null {
  if (!Array.isArray(content)) return null
  const block = content.find((b: any) => b.type === 'image' && b.url)
  return block ? getDriveThumb(block.url) : null
}

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

// ── Canvas particle types ──────────────────────────────────
interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number
  opacity: number; opacityDir: number; opacitySpeed: number
  color: string; blur: number
}

const COLORS = ['255,255,255', '165,243,252', '191,219,254', '203,213,225']

function makeParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    size: Math.random() * 2.2 + 0.4,
    opacity: Math.random(),
    opacityDir: Math.random() > 0.5 ? 1 : -1,
    opacitySpeed: Math.random() * 0.008 + 0.003,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    blur: Math.random() * 8 + 2,
  }
}

// ── Simple count-up hook ──────────────────────────────────────
function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView || target === 0) { setCount(target); return }
    let start = 0
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, target, duration])
  return count
}

export default function AboutClient({ navLinks, config, latestArticles }: { navLinks: NavLink[], config: any, latestArticles?: Article[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [waOpen, setWaOpen] = useState(false)
  const [waName, setWaName] = useState('')
  const [waMsg, setWaMsg] = useState('')
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [impactInView, setImpactInView] = useState(false)

  // ── Canvas particle animation ──────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let particles: Particle[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particles = Array.from({ length: 110 }, () => makeParticle(canvas.width, canvas.height))
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        // pulse opacity
        p.opacity += p.opacityDir * p.opacitySpeed
        if (p.opacity >= 1) { p.opacity = 1; p.opacityDir = -1 }
        if (p.opacity <= 0) { p.opacity = 0; p.opacityDir = 1 }

        // move
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // draw glow
        ctx.save()
        ctx.globalAlpha = p.opacity * 0.9
        ctx.shadowBlur = p.blur * 6
        ctx.shadowColor = `rgba(${p.color},0.9)`
        ctx.fillStyle = `rgba(${p.color},1)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // ── WA send handler ────────────────────────────────────
  const handleWaSend = () => {
    if (!waName.trim() && !waMsg.trim()) return
    const text = `Halo, nama saya ${waName.trim()}.\n\n${waMsg.trim()}`
    window.open(`https://wa.me/62895412747584?text=${encodeURIComponent(text)}`, '_blank')
  }

  const { scrollYProgress } = useScroll()
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  return (
    <>
      <Navbar navLinks={navLinks} />

      <main className={styles.main}>

        {/* ── 1. HERO (canvas particle animation) ── */}
        <div className={styles.heroWrapper}>
          <canvas ref={canvasRef} className={styles.heroCanvas} />
          <div className={styles.heroOverlay} />

          <motion.section
            className={styles.hero}
            style={{ opacity: opacityFade }}
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

        {/* ── 4b. FROM INSIGHT TO IMPACT (Ecosystem) ── */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
            >
              <motion.span className={styles.sectionTag} variants={fadeUp}>The Ecosystem</motion.span>
              <motion.h2 className={styles.sectionTitle} variants={fadeUp}>
                From Insight<br />to Impact
              </motion.h2>
              <motion.p className={styles.ecoIntro} variants={fadeUp}>
                Marcatching tidak berhenti sebagai ide. Kami membangun ekosistem yang bergerak dari edukasi, validasi, hingga implementasi — melalui artikel, konten sosial media, survey gratis untuk UMKM, dan course yang bisa langsung diakses.
              </motion.p>
            </motion.div>

            <motion.div
              className={styles.articleGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={stagger}
            >
              {latestArticles?.map(article => {
                const thumb = getFirstImageFromContent(article.content)
                const cat = (article as any).article_categories
                const author = (article as any).article_authors
                return (
                  <Link key={article.id} href={`/article/${article.slug}`} className={styles.articleCard}>
                    <div className={styles.articleThumb}>
                      {thumb
                        ? (
                          <Image
                            src={thumb}
                            alt={article.title}
                            fill
                            className={styles.articleThumbImg}
                            sizes="(max-width: 640px) 100vw, 300px"
                          />
                        )
                        : <div className={styles.articleThumbPlaceholder}><span>M</span></div>
                      }
                      {cat && <span className={styles.articleCatBadge}>{cat.name}</span>}
                    </div>
                    <div className={styles.articleBody}>
                      <h2 className={styles.articleTitle}>{article.title}</h2>
                      {article.excerpt && <p className={styles.articleExcerpt}>{article.excerpt}</p>}
                      <div className={styles.articleMeta}>
                        {author && (
                          <div className={styles.articleAuthor}>
                            {author.photo_url ? (
                              <div className={styles.articleAuthorAvatar} style={{ position: 'relative', overflow: 'hidden' }}>
                                <Image
                                  src={getDriveThumb(author.photo_url, 'w80-h80') || ''}
                                  alt={author.name}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                />
                              </div>
                            ) : (
                              <div className={styles.articleAuthorAvatarPlaceholder}>{author.name[0]}</div>
                            )}
                            <span className={styles.articleAuthorName}>{author.name}</span>
                          </div>
                        )}
                        <div className={styles.articleMetaRight}>
                          <span className={styles.articleDate}>{formatDate(article.published_at)}</span>
                          <span className={styles.articleViews}><Eye size={11} /> {article.view_count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </motion.div>

            <motion.div
              className={styles.ecoGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={stagger}
            >
              {/* Card 2 — Social Media */}
              <motion.button
                className={styles.ecoCard}
                variants={fadeUp}
                onClick={() => setActiveModal('social')}
                whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.22)' }}
              >
                <div className={styles.ecoIconWrap}><Share2 size={20} /></div>
                <h3 className={styles.ecoTitle}>Social Media Education</h3>
                <p className={styles.ecoDesc}>Menerjemahkan strategi marketing modern ke dalam konten Instagram dan TikTok yang lebih mudah dipahami, relatable, dan actionable.</p>
                <span className={styles.ecoCta}>Explore Content <ExternalLink size={13} /></span>
              </motion.button>

              {/* Card 3 — UMKM Survey */}
              <motion.button
                className={styles.ecoCard}
                variants={fadeUp}
                onClick={() => setActiveModal('survey')}
                whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.22)' }}
              >
                <div className={styles.ecoIconWrap}><ClipboardList size={20} /></div>
                <h3 className={styles.ecoTitle}>Free UMKM Survey</h3>
                <p className={styles.ecoDesc}>Membantu UMKM memahami tantangan bisnis dan marketing mereka melalui survey gratis sebagai langkah awal menuju strategi yang lebih terarah.</p>
                <span className={styles.ecoCta}>Join the Survey <ExternalLink size={13} /></span>
              </motion.button>

              {/* Card 4 — Store */}
              <motion.button
                className={styles.ecoCard}
                variants={fadeUp}
                onClick={() => setActiveModal('store')}
                whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.22)' }}
              >
                <div className={styles.ecoIconWrap}><ShoppingBag size={20} /></div>
                <h3 className={styles.ecoTitle}>Marcatching Store</h3>
                <p className={styles.ecoDesc}>Landing page untuk course dan produk digital yang membantu audience upgrade skill marketing, memahami AI workflow, dan membangun sistem pertumbuhan bisnis.</p>
                <span className={styles.ecoCta}>Visit Store <ExternalLink size={13} /></span>
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* ── 4c. IMPACT IN MOTION (Live Count) ── */}
        <section className={styles.section}>
          <div className={styles.container}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
              onViewportEnter={() => setImpactInView(true)}
            >
              <motion.span className={styles.sectionTag} variants={fadeUp}>Marcatching in Motion</motion.span>
              <motion.h2 className={styles.sectionTitle} variants={fadeUp}>
                Marcatching Impact<br />in Motion
              </motion.h2>
              <motion.p className={styles.sectionSubtitle} variants={fadeUp}>
                Setiap artikel, konten, survey, dan produk digital Marcatching dirancang untuk satu tujuan: membantu lebih banyak bisnis memahami marketing modern dan beradaptasi dengan era AI.
              </motion.p>
            </motion.div>

            <motion.div
              className={styles.impactGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={stagger}
            >
              <ImpactCard
                inView={impactInView}
                target={config.stat_umkm_helped || 0}
                label="UMKM Terbantu"
                sub="UMKM yang mengikuti survey, mendapatkan insight, atau terbantu melalui ekosistem Marcatching."
                suffix="+"
              />
              <ImpactCard
                inView={impactInView}
                target={config.stat_total_reach || 0}
                label="Total Reached"
                sub="Total estimasi audience yang dijangkau melalui artikel, Instagram, TikTok, dan kanal edukasi Marcatching."
                suffix="+"
              />
              <ImpactCard
                inView={impactInView}
                target={config.stat_product_sold || 0}
                label="Products Sold"
                sub="Course, produk digital, dan learning assets yang telah diakses untuk upgrade skill marketing."
                suffix="+"
              />
            </motion.div>
          </div>
        </section>
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

      {/* ── WhatsApp Floating Widget ── */}
      {/* Trigger button */}
      <motion.button
        className={styles.waBtn}
        onClick={() => setWaOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        title="Chat via WhatsApp"
        aria-label="Open WhatsApp contact"
      >
        <Image src="/logo-shape-white.png" alt="Marcatching" width={28} height={28} />
      </motion.button>

      {/* Popup */}
      <AnimatePresence>
        {waOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className={styles.waBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWaOpen(false)}
            />

            {/* Popup panel */}
            <motion.div
              className={styles.waPopup}
              initial={{ opacity: 0, scale: 0.25, x: '35vw', y: '35vh' }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.25, x: '35vw', y: '35vh' }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            >
              {/* Header */}
              <div className={styles.waHeader}>
                <div className={styles.waHeaderLeft}>
                  <Image src="/logo-shape-white.png" alt="Marcatching" width={24} height={24} />
                  <div>
                    <p className={styles.waHeaderName}>Marcatching</p>
                    <p className={styles.waHeaderSub}>via WhatsApp</p>
                  </div>
                </div>
                <button className={styles.waClose} onClick={() => setWaOpen(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <div className={styles.waBody}>
                <p className={styles.waGreeting}>Halo! Ada yang bisa kami bantu? Isi form di bawah, kami akan membalas via WhatsApp.</p>

                <div className={styles.waField}>
                  <label className={styles.waLabel}>Nama kamu</label>
                  <input
                    className={styles.waInput}
                    type="text"
                    placeholder="Masukkan nama kamu"
                    value={waName}
                    onChange={e => setWaName(e.target.value)}
                  />
                </div>

                <div className={styles.waField}>
                  <label className={styles.waLabel}>Pesan</label>
                  <textarea
                    className={styles.waTextarea}
                    rows={4}
                    placeholder="Tulis pesanmu di sini..."
                    value={waMsg}
                    onChange={e => setWaMsg(e.target.value)}
                  />
                </div>

                <button
                  className={styles.waSend}
                  onClick={handleWaSend}
                  disabled={!waName.trim() && !waMsg.trim()}
                >
                  <Send size={16} /> Kirim via WhatsApp
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Ecosystem Modals ── */}
      <AnimatePresence>
        {activeModal && (() => {
          const modals: Record<string, { title: string; body: string; btnLabel: string; href: string }> = {
            articles: {
              title: 'Marketing Intelligence, Made Practical.',
              body: 'Artikel Marcatching dirancang untuk membantu business owner dan marketer membaca perubahan pasar dengan lebih tajam. Topik yang dibahas mencakup AI marketing, branding, positioning, consumer behavior, digital growth, content strategy, dan business model thinking. Tujuannya bukan sekadar memberi inspirasi, tetapi membantu audience memahami pola di balik pertumbuhan bisnis modern.',
              btnLabel: 'Read Articles',
              href: config.article_url || '/article',
            },
            social: {
              title: 'Turning Complex Strategy Into Daily Learning.',
              body: 'Di Instagram dan TikTok, Marcatching mengubah konsep marketing yang kompleks menjadi konten edukasi yang lebih mudah dipahami. Konten sosial media digunakan sebagai pintu masuk bagi audience untuk mengenal AI, psikologi konsumen, brand perception, dan sistem pertumbuhan digital dengan format yang ringan, cepat, dan relevan.',
              btnLabel: 'Explore Instagram & TikTok',
              href: config.instagram_url || 'https://www.instagram.com/marcatching.id/',
            },
            survey: {
              title: 'Helping UMKM Start With Clarity.',
              body: 'Marcatching membantu UMKM secara gratis melalui survey untuk memahami kondisi bisnis, tantangan marketing, dan kesiapan mereka dalam mengadopsi teknologi. Survey ini menjadi jembatan antara masalah yang dirasakan business owner dengan insight yang lebih terstruktur, sehingga mereka bisa mulai mengambil keputusan yang lebih tepat.',
              btnLabel: 'Join Free Survey',
              href: config.survey_url || '/survey',
            },
            store: {
              title: 'Upgrade Your Marketing Capability.',
              body: 'Marcatching Store adalah tempat audience mengakses course, learning assets, dan produk digital yang dirancang untuk meningkatkan kemampuan marketing secara sistematis. Dari membangun akun bisnis, memahami content system, menggunakan AI, hingga menyusun strategi pertumbuhan yang lebih scalable.',
              btnLabel: 'Visit Store',
              href: config.store_url || '/store',
            },
          }
          const m = modals[activeModal]
          if (!m) return null
          return (
            <>
              <motion.div
                className={styles.ecoModalBackdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveModal(null)}
              />
              <motion.div
                className={styles.ecoModalBox}
                initial={{ opacity: 0, scale: 0.88, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 24 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <div className={styles.ecoModalHeader}>
                  <button className={styles.ecoModalClose} onClick={() => setActiveModal(null)} aria-label="Close"><X size={18} /></button>
                </div>
                <div className={styles.ecoModalBody}>
                  <h2 className={styles.ecoModalTitle}>{m.title}</h2>
                  <p className={styles.ecoModalText}>{m.body}</p>
                  <a href={m.href} target="_blank" rel="noopener noreferrer" className={styles.ecoModalBtn}>
                    {m.btnLabel} <ArrowRight size={16} />
                  </a>
                </div>
              </motion.div>
            </>
          )
        })()}
      </AnimatePresence>
    </>
  )
}

// ── ImpactCard sub-component ────────────────────────────────────
function ImpactCard({ inView, target, label, sub, suffix }: {
  inView: boolean; target: number; label: string; sub: string; suffix?: string
}) {
  const count = useCountUp(target, inView)
  return (
    <motion.div className={styles.impactCard} variants={fadeUp}>
      <div className={styles.impactNumber}>
        {count.toLocaleString('id-ID')}{suffix}
      </div>
      <div className={styles.impactLabel}>{label}</div>
      <p className={styles.impactSub}>{sub}</p>
    </motion.div>
  )
}

