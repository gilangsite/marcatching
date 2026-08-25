'use client'

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Bot,
  Check,
  ChevronRight,
  CircleDollarSign,
  Compass,
  ExternalLink,
  FileText,
  Hammer,
  Mail,
  Network,
  PackageOpen,
  Send,
  Sparkles,
  Workflow,
  X,
} from 'lucide-react'
import type { NavLink } from '@/lib/supabaseClient'
import ExperienceNavigation from './ExperienceNavigation'
import { ExperienceRuntime } from './ExperienceStore'
import {
  CAPABILITIES,
  DATA_CHAPTERS,
  ECOSYSTEM_FLOW,
  NOISE_TERMS,
  SYSTEM_FLOW,
  type ArticleCardData,
  type ExperienceConfig,
  type ProductCardData,
  type ResolvedEcosystemItem,
  type ResolvedEcosystemSection,
  type SurveyCardData,
} from './experience-data'
import {
  AnimatedUnderlineLink,
  ExpandableCard,
  ImageMaskReveal,
  MagneticButton,
  SpotlightCard,
  TextReveal,
  TiltCard,
} from './Interactions'
import styles from './about.module.css'

type AboutClientProps = {
  navLinks: NavLink[]
  config: ExperienceConfig
  resolvedSections?: ResolvedEcosystemSection[]
}

function formatDate(dateString?: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getDriveThumb(url?: string | null, size = 'w1000-h1000') {
  if (!url) return null
  if (url.includes('drive.google.com/uc')) {
    const match = url.match(/id=([^&]+)/)
    if (match?.[1]) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=${size}`
  }
  return url
}

function getArticleImage(article: ArticleCardData) {
  const image = article.content?.find((block) => block.type === 'image' && block.url)
  return getDriveThumb(image?.url)
}

function stripHtml(value?: string | null) {
  if (!value) return ''
  return value.replace(/<[^>]*>?/gm, '').trim()
}

function isArticle(data: ResolvedEcosystemItem['data']): data is ArticleCardData {
  return Boolean(data && 'published_at' in data)
}

function isProduct(data: ResolvedEcosystemItem['data']): data is ProductCardData {
  return Boolean(data && 'name' in data && 'price_after_discount' in data)
}

function isSurvey(data: ResolvedEcosystemItem['data']): data is SurveyCardData {
  return Boolean(data && 'title' in data && 'description' in data && !('published_at' in data))
}

function SectionHeading({ eyebrow, title, body, align = 'left' }: {
  eyebrow: string
  title: ReactNode
  body?: ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <TextReveal className={`${styles.sectionHeading} ${align === 'center' ? styles.sectionHeadingCenter : ''}`}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </TextReveal>
  )
}

function FlowLine({ nodes, compact = false }: { nodes: readonly string[]; compact?: boolean }) {
  return (
    <div className={`${styles.flowLine} ${compact ? styles.flowCompact : ''}`}>
      {nodes.map((node, index) => (
        <div className={styles.flowUnit} key={node}>
          <span>{node}</span>
          {index < nodes.length - 1 && <ChevronRight aria-hidden="true" />}
        </div>
      ))}
    </div>
  )
}

function ContentEngineGraphic() {
  return (
    <div className={styles.contentEngine} aria-label="Brand Memory mengalir ke Prompt Library dan Skill Engine, menjadi konten, lalu membuka pertumbuhan dan penghasilan">
      <div className={styles.engineNode}>
        <span>01</span>
        <BrainCircuit aria-hidden="true" />
        <strong>Brand Memory</strong>
        <small>Your brand context</small>
      </div>

      <div className={styles.engineLink} aria-hidden="true"><i /></div>

      <div className={`${styles.engineNode} ${styles.engineAi}`}>
        <span>02</span>
        <Bot aria-hidden="true" />
        <strong>Prompt Library</strong>
        <small>Context-aware action</small>
      </div>

      <div className={`${styles.engineLink} ${styles.engineSplitLink}`} aria-hidden="true"><i /></div>

      <div className={styles.engineOutputs}>
        <div className={styles.engineOutput}>
          <FileText aria-hidden="true" />
          <div><strong>Content</strong><small>Stay on-brand</small></div>
        </div>
        <div className={styles.engineOutput}>
          <PackageOpen aria-hidden="true" />
          <div><strong>Skill Engine</strong><small>Repeatable workflow</small></div>
        </div>
      </div>

      <div className={`${styles.engineLink} ${styles.engineMergeLink}`} aria-hidden="true"><i /></div>

      <div className={`${styles.engineNode} ${styles.engineMoney}`}>
        <span>04</span>
        <CircleDollarSign aria-hidden="true" />
        <strong>Growth & Income</strong>
        <small>Build, sell & earn</small>
      </div>
    </div>
  )
}

function EcosystemCard({ item }: { item: ResolvedEcosystemItem }) {
  const data = item.data

  if (item.type === 'article' && isArticle(data)) {
    const image = getArticleImage(data)
    return (
      <TiltCard className={styles.ecoCardWrap}>
        <SpotlightCard className={styles.ecoCard}>
          <Link href={`/article/${data.slug}`} aria-label={`Read ${data.title}`}>
            <div className={styles.ecoMedia}>
              {image ? <Image src={image} alt={`Editorial image for ${data.title}`} fill sizes="(max-width: 760px) 82vw, 360px" className={styles.ecoImage} /> : <div className={styles.ecoPlaceholder}><Network /><span>Intelligence editorial</span></div>}
              <span className={styles.ecoType}>{data.article_categories?.name ?? 'Article'}</span>
            </div>
            <div className={styles.ecoBody}>
              <h3>{data.title}</h3>
              {data.excerpt && <p>{data.excerpt}</p>}
              <div className={styles.ecoMeta}><span>{formatDate(data.published_at)}</span><span>{data.view_count ?? 0} views</span></div>
            </div>
          </Link>
        </SpotlightCard>
      </TiltCard>
    )
  }

  if (item.type === 'product' && isProduct(data)) {
    return (
      <TiltCard className={styles.ecoCardWrap}>
        <SpotlightCard className={styles.ecoCard}>
          <Link href={`/product/${data.slug}`} aria-label={`Explore ${data.name}`}>
            <div className={styles.ecoMedia}>
              {data.image_url ? <Image src={data.image_url} alt={`${data.name} product cover`} fill sizes="(max-width: 760px) 82vw, 360px" className={`${styles.ecoImage} ${styles.productImage}`} /> : <div className={styles.ecoPlaceholder}><BookOpen /><span>Digital product</span></div>}
              <span className={styles.ecoType}>Store</span>
            </div>
            <div className={styles.ecoBody}>
              <h3>{data.name}</h3>
              {data.sub_headline && <p>{data.sub_headline}</p>}
              <div className={styles.ecoMeta}><span>Product system</span><span>{data.price_after_discount ? `Rp ${data.price_after_discount.toLocaleString('id-ID')}` : 'Explore'}</span></div>
            </div>
          </Link>
        </SpotlightCard>
      </TiltCard>
    )
  }

  if (item.type === 'survey' && isSurvey(data)) {
    const image = getDriveThumb(data.image_url)
    return (
      <TiltCard className={styles.ecoCardWrap}>
        <SpotlightCard className={styles.ecoCard}>
          <Link href={`/survey/${data.slug}`} aria-label={`Start ${data.title}`}>
            <div className={styles.ecoMedia}>
              {image ? <Image src={image} alt={`Survey cover for ${data.title}`} fill sizes="(max-width: 760px) 82vw, 360px" className={styles.ecoImage} /> : <div className={styles.ecoPlaceholder}><BarChart3 /><span>Business diagnosis</span></div>}
              <span className={styles.ecoType}>Survey</span>
            </div>
            <div className={styles.ecoBody}>
              <h3>{data.title}</h3>
              <p>{stripHtml(data.description).slice(0, 130) || 'Diagnosis marketing untuk menemukan titik ungkit berikutnya.'}</p>
              <div className={styles.ecoMeta}><span>UMKM intelligence</span><span>Start survey</span></div>
            </div>
          </Link>
        </SpotlightCard>
      </TiltCard>
    )
  }

  if (item.type === 'content') {
    const image = getDriveThumb(item.content_image_url)
    return (
      <TiltCard className={styles.ecoCardWrap}>
        <SpotlightCard className={styles.ecoCard}>
          <a href={item.content_url ?? '#'} target="_blank" rel="noopener noreferrer" aria-label={`View ${item.content_title ?? 'Marcatching content'}`}>
            <div className={styles.ecoMedia}>
              {image ? <Image src={image} alt={`${item.content_title ?? 'Marcatching'} content cover`} fill sizes="(max-width: 760px) 82vw, 360px" className={styles.ecoImage} /> : <div className={styles.ecoPlaceholder}><Sparkles /><span>Field note</span></div>}
              <span className={styles.ecoType}>Content</span>
            </div>
            <div className={styles.ecoBody}>
              <h3>{item.content_title ?? 'Marcatching field notes'}</h3>
              <p>Insight praktis dan edukasi marketing yang siap diaplikasikan.</p>
              <div className={styles.ecoMeta}><span>Social intelligence</span><span>View <ExternalLink size={12} /></span></div>
            </div>
          </a>
        </SpotlightCard>
      </TiltCard>
    )
  }

  return null
}

function SystemPreview({ number }: { number: string }) {
  const titles: Record<string, string> = {
    '01': 'Brand Memory',
    '02': 'Prompt Library',
    '03': 'Skill Engine',
    '04': 'Affiliate Revenue',
  }

  return (
    <div className={`${styles.systemPreview} ${styles[`systemPreview${number}`]}`} aria-hidden="true">
      <div className={styles.previewToolbar}>
        <div><span /><span /><span /></div>
        <strong>{titles[number]}</strong>
        <i>Marcatching workspace</i>
      </div>

      {number === '01' && (
        <div className={styles.marketUi}>
          <aside><b>M</b><span /><span /><span /><span /></aside>
          <div className={styles.marketMain}>
            <div className={styles.previewTitle}><span>Brand context</span><b>Synced</b></div>
            <div className={styles.previewStats}><span><i>Audience</i><b>Ready</b></span><span><i>Brand voice</i><b>Ready</b></span><span><i>Offer</i><b>Ready</b></span></div>
            <div className={styles.marketChart}>{Array.from({ length: 14 }, (_, index) => <span key={index} style={{ height: `${24 + ((index * 19) % 62)}%` }} />)}<i /></div>
          </div>
        </div>
      )}

      {number === '02' && (
        <div className={styles.perceptionUi}>
          <div className={styles.audienceProfile}><span>BM</span><div><b>Brand Memory attached</b><i>Context follows every prompt</i></div><em>Ready</em></div>
          <div className={styles.sentimentMap}>
            <div><span>Task</span><b>Copywriting</b><i style={{ width: '82%' }} /></div>
            <div><span>Channel</span><b>Campaign</b><i style={{ width: '68%' }} /></div>
            <div><span>Goal</span><b>Conversion</b><i style={{ width: '76%' }} /></div>
          </div>
          <div className={styles.perceptionTags}><span>Research</span><span>Content</span><span>Ads</span><span>Strategy</span></div>
        </div>
      )}

      {number === '03' && (
        <div className={styles.workflowUi}>
          <div><b>Input</b><span><i>Owned Skill</i><em>Ready</em></span><span><i>Brand Memory</i><em>Synced</em></span></div>
          <div><b>Engine</b><span><i>Requirements</i><em>Read</em></span><span><i>Personalization</i><em>Active</em></span></div>
          <div><b>Output</b><span><i>Your workflow</i><em>.ZIP</em></span><span><i>Ready to run</i><em>Now</em></span></div>
        </div>
      )}

      {number === '04' && (
        <div className={styles.growthUi}>
          <div className={styles.funnelUi}>
            <span style={{ width: '100%' }}><i>Affiliate link</i><b>Active</b></span>
            <span style={{ width: '78%' }}><i>Valid clicks</i><b>Tracked</b></span>
            <span style={{ width: '56%' }}><i>Eligible sales</i><b>Verified</b></span>
            <span style={{ width: '34%' }}><i>Commission</i><b>Earned</b></span>
          </div>
          <div className={styles.revenueUi}><span>Affiliate workspace</span><strong>Payout ready</strong><i>Clear history & status</i></div>
        </div>
      )}
    </div>
  )
}

const PROMPT_WORKFLOWS = [
  { handle: 'Copywriting', initials: 'CP' },
  { handle: 'Research', initials: 'RS' },
  { handle: 'Campaign', initials: 'CM' },
  { handle: 'KOL', initials: 'KL' },
  { handle: 'Email', initials: 'EM' },
  { handle: 'Strategy', initials: 'ST' },
] as const

function DataMotionGraphic({ type }: { type: (typeof DATA_CHAPTERS)[number]['visual'] }) {
  if (type === 'bars') {
    return (
      <div className={`${styles.dataVisual} ${styles.economyMotion}`} aria-hidden="true">
        <div className={styles.motionToolbar}><span><BrainCircuit /> Brand Memory</span><em>Synced</em></div>
        <div className={styles.economySummary}>
          <div><small>Context status</small><strong>READY</strong></div>
          <span><ArrowRight /> Reusable</span>
        </div>
        <div className={styles.economyChart}>
          <svg viewBox="0 0 420 118" preserveAspectRatio="none">
            <defs>
              <linearGradient id="economy-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8cc6ff" stopOpacity=".34" />
                <stop offset="1" stopColor="#8cc6ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className={styles.economyArea} d="M8 101 C54 98 62 83 103 86 S164 70 197 73 S247 51 282 55 S336 34 412 16 L412 116 L8 116 Z" />
            <path className={styles.economyLine} d="M8 101 C54 98 62 83 103 86 S164 70 197 73 S247 51 282 55 S336 34 412 16" />
            <circle className={styles.economyPulseDot} cx="412" cy="16" r="4" />
          </svg>
          <div className={styles.economyBars}>
            {[24, 32, 29, 46, 41, 58, 54, 72, 82].map((height, index) => (
              <i key={height} style={{ '--bar-height': `${height}%`, '--bar-index': index } as CSSProperties} />
            ))}
          </div>
          <div className={styles.chartAxis}><span>Audience</span><span>Voice</span><span>Offer</span></div>
        </div>
      </div>
    )
  }

  if (type === 'network') {
    return (
      <div className={`${styles.dataVisual} ${styles.networkMotion}`} aria-hidden="true">
        <div className={styles.motionToolbar}><span><BookOpen /> Prompt Library</span><em>Context attached</em></div>
        <div className={styles.networkStage}>
          <div className={styles.networkRadar}><i /><i /><i /></div>
          <div className={styles.networkCenter}><span><BookOpen /></span><strong>Ready</strong><small>to run</small></div>
          <div className={styles.profileCloud}>
            {PROMPT_WORKFLOWS.map((account, index) => (
              <div className={styles.profileChip} key={account.handle} style={{ '--profile-index': index } as CSSProperties}>
                <i>{account.initials}</i><span>{account.handle}</span><b />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.networkTicker}><span>Brand context</span><i /><strong>Connected</strong><em>without re-briefing</em></div>
      </div>
    )
  }

  if (type === 'rings') {
    return (
      <div className={`${styles.dataVisual} ${styles.aiMotion}`} aria-hidden="true">
        <div className={styles.motionToolbar}><span><Sparkles /> Marcatching Skill Engine</span><em>Personalizing</em></div>
        <div className={styles.aiProcess}>
          <div className={styles.taskQueue}>
            {[
              ['01', 'Read memory'],
              ['02', 'Load workflow'],
              ['03', 'Apply quality gate'],
            ].map(([number, label], index) => (
              <span key={number} style={{ '--task-index': index } as CSSProperties}><i>{number}</i><b>{label}</b><Check /></span>
            ))}
          </div>
          <div className={styles.aiStream}><i /><i /><i /></div>
          <div className={styles.aiCore}><span /><span /><Bot /><small>Skill</small></div>
          <div className={styles.aiResult}><small>Output</small><strong>Yours</strong><span>.zip</span></div>
        </div>
        <div className={styles.aiProgress}>
          {['Context', 'Workflow', 'Output'].map((label, index) => (
            <div key={label} style={{ '--progress-index': index } as CSSProperties}><span>{label}</span><i><b /></i><Check /></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.dataVisual} ${styles.efficiencyMotion}`} aria-hidden="true">
      <div className={styles.motionToolbar}><span><CircleDollarSign /> Affiliate Revenue</span><em>Tracking</em></div>
      <div className={styles.efficiencyMetrics}>
        <div className={styles.costCard}><span><CircleDollarSign /> Commission</span><strong>Tracked</strong><small><ArrowRight /> Clear status</small></div>
        <div className={styles.outputCard}><span><Sparkles /> Payout</span><strong>Ready</strong><small><Check /> Verified history</small></div>
      </div>
      <div className={styles.efficiencyStage}>
        <div className={styles.efficiencyLegend}><span>Referral traffic</span><span>Eligible sale</span></div>
        <div className={styles.efficiencyColumns}>
          <div><i className={styles.beforeCost} /><b>Clicks</b><em>Tracked</em></div>
          <div><i className={styles.afterCost} /><b>Sales</b><em>Verified</em></div>
          <div><i className={styles.beforeOutput} /><b>Hold</b><em>Visible</em></div>
          <div><i className={styles.afterOutput} /><b>Payout</b><em>Ready</em></div>
        </div>
        <div className={styles.optimizationSweep}><span>Commission tracked</span></div>
      </div>
    </div>
  )
}

export default function AboutClient({ navLinks, config, resolvedSections = [] }: AboutClientProps) {
  const [waOpen, setWaOpen] = useState(false)
  const [waName, setWaName] = useState('')
  const [waMessage, setWaMessage] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!waOpen) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setWaOpen(false)
    }
    document.addEventListener('keydown', close)
    dialogRef.current?.focus()
    return () => document.removeEventListener('keydown', close)
  }, [waOpen])

  const sendWhatsApp = () => {
    if (!waName.trim() && !waMessage.trim()) return
    const text = `Halo, nama saya ${waName.trim()}.\n\n${waMessage.trim()}`
    window.open(`https://wa.me/62895412747584?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={styles.experience}>
      <ExperienceRuntime />
      <ExperienceNavigation navLinks={navLinks} ctaUrl={config.cta_url || config.store_url || '/store'} />

      <main className={styles.main}>
        <section className={`${styles.chapter} ${styles.hero}`} id="hero" data-experience-section="hero">
          <div className={styles.heroLayout}>
            <div className={styles.heroContent}>
              <span className={styles.heroLabel}>Marcatching ecosystem · Learn. Build. Earn.</span>
              <h1><span className={styles.heroTitleLine}>Build a brand people remember.</span><span className={`${styles.heroTitleLine} ${styles.heroTitleAccent}`}>Run it with a system that grows.</span></h1>
              <p>
                Marcatching menyatukan pengembangan brand, workflow digital marketing, pertumbuhan KOL, dan affiliate income—dengan Brand Memory yang menjaga setiap prompt, Skill, dan campaign tetap terasa seperti milikmu.
              </p>
              <div className={styles.heroActions}>
                <MagneticButton href={config.cta_url || config.store_url || '/store'}>Mulai dari Marcatching Store <ArrowRight size={17} /></MagneticButton>
                <AnimatedUnderlineLink href="#build">Lihat core system <ArrowRight size={15} /></AnimatedUnderlineLink>
              </div>
            </div>
            <ContentEngineGraphic />
          </div>
          <a href="#problem" className={styles.scrollCue} aria-label="Lihat mengapa Marcatching dibutuhkan"><span>See why it matters</span><ArrowDown size={15} /></a>
        </section>

        <section className={`${styles.chapter} ${styles.problem}`} id="problem" data-experience-section="problem">
          <div className={styles.shell}>
            <SectionHeading eyebrow="02 · The real friction" title={<>Your brand should not reset<br /><em>every time you open a new tool.</em></>} body="Kamu mungkin sudah punya ide, produk, audiens, dan AI. Yang menguras energi adalah menjelaskan semuanya dari awal lagi—lalu menerima output generik yang tidak terdengar seperti brand-mu, tidak nyambung ke workflow berikutnya, dan tidak ikut membangun revenue." />
            <div className={styles.noiseLab}>
              <div className={styles.noiseCloud} aria-label="Disconnected marketing concepts">
                {NOISE_TERMS.map((term, index) => <span key={term} style={{ '--noise-index': index } as CSSProperties}>{term}</span>)}
              </div>
              <div className={styles.systemPanel}>
                <div className={styles.systemPanelHeader}><span>Marcatching resolution</span><strong>One memory. Multiple workflows.</strong></div>
                <FlowLine nodes={SYSTEM_FLOW} />
                <p>Satu identitas brand mengalir dari strategi ke eksekusi, dari produk ke distribusi, hingga ke affiliate income. Kamu tidak lagi mengoleksi tools—kamu membangun sistem yang saling menguatkan.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.data}`} id="data" data-experience-section="data">
          <div className={styles.shell}>
            <SectionHeading eyebrow="03 · Why it feels different" title={<>The system remembers.<br /><em>You keep moving.</em></>} body="Marcatching dirancang untuk mengurangi beban memulai ulang. Setiap layer menjaga konteks, mempercepat next action, dan membuka lebih dari satu cara untuk bertumbuh." />
            <div className={styles.dataChapters}>
              {DATA_CHAPTERS.map((chapter, index) => (
                <article className={styles.dataChapter} key={chapter.id}>
                  <div className={styles.dataIndex}>Advantage {String(index + 1).padStart(2, '0')}</div>
                  <div className={styles.dataNumber}>{chapter.display}</div>
                  <div className={styles.dataCopy}><h3>{chapter.label}</h3><p>{chapter.source}</p></div>
                  <DataMotionGraphic type={chapter.visual} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.build}`} id="build" data-experience-section="build">
          <div className={styles.shell}>
            <div className={styles.buildLayout}>
              <div className={styles.buildSticky}><SectionHeading eyebrow="04 · The core system" title={<>One brand memory.<br /><em>Four ways to move forward.</em></>} body="Setiap bagian bisa dipakai sendiri. Nilai terbesarnya muncul saat semuanya bekerja dari konteks brand yang sama." /></div>
              <div className={styles.moduleList}>
                {CAPABILITIES.map((capability) => (
                  <SpotlightCard className={styles.moduleCard} key={capability.number}>
                    <ExpandableCard
                      label={`${capability.title} details`}
                      summary={<div className={styles.moduleSummary}><span className={styles.moduleNumber}>{capability.number}</span><h3>{capability.title}</h3><p>{capability.description}</p><SystemPreview number={capability.number} /><div className={styles.moduleOpen}>Explore the system <ArrowRight size={15} /></div></div>}
                    >
                      <span className={styles.drawerEyebrow}>System module {capability.number}</span>
                      <h2 className={styles.drawerTitle}>{capability.title}</h2>
                      <p className={styles.drawerBody}>{capability.description}</p>
                      <dl className={styles.ioGrid}><div><dt>Input</dt><dd>{capability.input}</dd></div><div><dt>Process</dt><dd>{capability.process}</dd></div><div><dt>Output</dt><dd>{capability.output}</dd></div></dl>
                      <FlowLine nodes={capability.flow} compact />
                    </ExpandableCard>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.ecosystem}`} id="ecosystem" data-experience-section="ecosystem">
          <div className={styles.shell}>
            <SectionHeading eyebrow="05 · The ecosystem" title={<>One ecosystem.<br /><em>Multiple ways to grow—and earn.</em></>} body="Belajar lewat Course, simpan konteks di Brand Memory, eksekusi dengan Prompt Library dan Skill Engine, lalu gunakan Store dan Affiliate Program untuk memperluas revenue." />
            <FlowLine nodes={ECOSYSTEM_FLOW} compact />

            <div className={styles.ecosystemGateways}>
              <GatewayCard href="/course" number="01" title="Course & Creator Workspace" body="Pelajari sistemnya, simpan Brand Memory, dan ubah insight menjadi next action yang jelas." />
              <GatewayCard href="/prompt-library" number="02" title="Prompt Library & Skill Engine" body="Mulai lebih cepat dengan prompt siap pakai dan Skill yang dapat dipersonalisasi untuk brand-mu." />
              <GatewayCard href={config.store_url || '/store'} number="03" title="Store & Affiliate Program" body="Checkout workflow pertamamu, lalu promosikan produk yang relevan melalui affiliate workspace member." />
            </div>

            {resolvedSections.map((section) => (
              <div className={styles.ecosystemGroup} key={section.id}>
                <div className={styles.ecosystemGroupHead}><h3>{section.title}</h3><span>{section.items.length.toString().padStart(2, '0')} modules</span></div>
                <div className={styles.ecosystemRail}>{section.items.map((item) => <EcosystemCard item={item} key={item.id} />)}</div>
              </div>
            ))}

          </div>
        </section>

        <section className={`${styles.chapter} ${styles.founder}`} id="founder" data-experience-section="founder">
          <div className={styles.shell}>
            <SectionHeading eyebrow="06 · Built by an operator" title={<>Not assembled from theory.<br /><em>Built from real execution.</em></>} body="Marcatching lahir dari kebutuhan yang sama yang dihadapi banyak brand dan creator: menjaga identitas tetap kuat sambil bergerak lebih cepat, menjual lebih baik, dan membangun penghasilan yang berkelanjutan." />
            <div className={styles.founderGrid}>
              <ImageMaskReveal className={styles.founderMedia}>
                {config.founder_photo_url ? (
                  <Image src={getDriveThumb(config.founder_photo_url) ?? config.founder_photo_url} alt={`${config.founder_name}, founder of Marcatching`} fill sizes="(max-width: 800px) 100vw, 48vw" className={styles.founderImage} />
                ) : (
                  <div className={styles.founderPlaceholder}><Image src="/logo-shape-white.png" alt="Marcatching symbol" width={76} height={76} /><span>Founder portrait</span></div>
                )}
              </ImageMaskReveal>
              <div className={styles.founderCopy}>
                <span className={styles.founderRole}>Founder · Marcatching</span>
                <h3>{config.founder_name}</h3>
                <p>Gilang Ramadhan membangun Marcatching di titik temu consumer psychology, brand positioning, content strategy, AI workflow, pertumbuhan KOL, dan revenue design.</p>
                <blockquote>{config.founder_quote}</blockquote>
                <div className={styles.roleGrid}>
                  <span><Hammer /> Brand system</span><span><Compass /> Growth strategy</span><span><BrainCircuit /> AI workflow</span><span><Workflow /> Revenue design</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.paths}`} id="paths" data-experience-section="paths">
          <div className={styles.shell}>
            <SectionHeading eyebrow="07 · Built for your next move" title={<>One ecosystem.<br /><em>Two powerful starting points.</em></>} body="Datang untuk membangun brand atau mengembangkan penghasilan dari audiensmu. Keduanya mendapat sistem, tools, dan ruang bertumbuh yang sama." align="center" />
            <div className={styles.pathGrid}>
              <SpotlightCard className={`${styles.pathCard} ${styles.builderPath}`}>
                <div className={styles.pathHead}><span>01</span><Network /></div><h3>For Brand Builders</h3><p>Untuk business owner, marketer, dan creator yang ingin brand-nya lebih mudah diingat tanpa kehilangan kecepatan eksekusi.</p>
                <ul>
                  <li><Check size={15} />Satu Brand Memory untuk menjaga positioning, voice, audience, dan offer.</li>
                  <li><Check size={15} />Prompt dan Skill yang mengubah strategi menjadi pekerjaan siap jalan.</li>
                  <li><Check size={15} />Course dan Store yang memperluas sistem sesuai fase pertumbuhanmu.</li>
                </ul>
                <MagneticButton href={config.cta_url || config.store_url || '/store'}>Temukan workflow pertamamu <ArrowRight size={16} /></MagneticButton>
              </SpotlightCard>
              <SpotlightCard className={styles.pathCard}>
                <div className={styles.pathHead}><span>02</span><CircleDollarSign /></div><h3>For KOL & Affiliates</h3><p>Untuk kamu yang sudah punya kepercayaan audiens dan ingin mengubah distribusi menjadi channel penghasilan yang lebih terstruktur.</p>
                <ul>
                  <li><Check size={15} />Pilih program dan produk Marcatching yang relevan untuk audiensmu.</li>
                  <li><Check size={15} />Bagikan link yang dapat dilacak tanpa kehilangan transparansi atribusi.</li>
                  <li><Check size={15} />Pantau klik, komisi, status hold, dan payout dalam satu workspace.</li>
                </ul>
                <MagneticButton href="/course/login">Masuk ke affiliate workspace <ArrowRight size={16} /></MagneticButton>
              </SpotlightCard>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.finale}`} id="finale" data-experience-section="finale">
          <div className={styles.finaleLogo} aria-hidden="true"><Image src="/logo-shape-white.png" alt="" width={74} height={74} /><span /><span /></div>
          <TextReveal className={styles.finaleContent}>
            <span className={styles.eyebrow}>08 · Your system starts here</span>
            <h2>Build the brand.<br /><em>Own the workflow. Earn from the growth.</em></h2>
            <p>Mulai dari satu produk atau course. Brand Memory, Prompt Library, Skill Engine, Store, dan Affiliate Program akan membantumu terus bergerak dari sana.</p>
            <div className={styles.finaleActions}>
              <MagneticButton href={config.cta_url || config.store_url || '/store'}>Mulai dari Marcatching Store <ArrowRight size={17} /></MagneticButton>
              <AnimatedUnderlineLink href="/course/login">Sudah jadi member? Masuk</AnimatedUnderlineLink>
            </div>
          </TextReveal>
        </section>
      </main>

      <footer className={styles.footer}>
        <div><Image src="/logo-type-white.png" alt="Marcatching" width={150} height={40} /><p>One ecosystem to learn, build, sell, and earn with a brand that stays unmistakably yours.</p></div>
        <nav aria-label="Footer navigation"><Link href="/prompt-library">Prompt Library</Link><Link href={config.store_url || '/store'}>Store</Link><Link href="/course/login">Member Login</Link><a href={`mailto:${config.contact_email}`}><Mail size={14} /> Contact</a></nav>
        <p>© {new Date().getFullYear()} Marcatching. All rights reserved.</p>
      </footer>

      <button type="button" className={styles.contactButton} onClick={() => setWaOpen(true)} aria-label="Open WhatsApp contact"><Image src="/logo-shape-white.png" alt="" width={25} height={25} /><span>Talk to Marcatching</span></button>

      <AnimatePresence>
        {waOpen && (
          <>
            <motion.button type="button" className={styles.contactBackdrop} onClick={() => setWaOpen(false)} aria-label="Close contact form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div ref={dialogRef} className={styles.contactDialog} role="dialog" aria-modal="true" aria-labelledby="contact-title" tabIndex={-1} initial={{ opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}>
              <div className={styles.contactDialogHead}><div><span>Direct channel</span><h2 id="contact-title">Talk to Marcatching</h2></div><button type="button" onClick={() => setWaOpen(false)} aria-label="Close contact form"><X /></button></div>
              <p>Ceritakan brand, workflow, atau jalur affiliate yang ingin kamu bangun. Pesanmu akan dibuka langsung di WhatsApp.</p>
              <label htmlFor="wa-name">Your name</label><input id="wa-name" value={waName} onChange={(event) => setWaName(event.target.value)} placeholder="Name" />
              <label htmlFor="wa-message">What do you need?</label><textarea id="wa-message" rows={5} value={waMessage} onChange={(event) => setWaMessage(event.target.value)} placeholder="Briefly describe your challenge" />
              <button type="button" className={styles.sendButton} onClick={sendWhatsApp} disabled={!waName.trim() && !waMessage.trim()}><Send size={16} /> Send via WhatsApp</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function GatewayCard({ href, number, title, body }: { href: string; number: string; title: string; body: string }) {
  return (
    <SpotlightCard className={styles.gatewayCard}>
      <Link href={href}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div><ArrowRight /></Link>
    </SpotlightCard>
  )
}
