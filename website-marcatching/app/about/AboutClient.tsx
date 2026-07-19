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
  CircleDot,
  Compass,
  ExternalLink,
  FileText,
  Hammer,
  Lightbulb,
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
  AI_PIPELINE,
  CAPABILITIES,
  DATA_CHAPTERS,
  ECOSYSTEM_FLOW,
  NOISE_TERMS,
  PILLARS,
  SYSTEM_FLOW,
  type ArticleCardData,
  type ExperienceConfig,
  type ProductCardData,
  type ResolvedEcosystemItem,
  type ResolvedEcosystemSection,
  type SurveyCardData,
} from './experience-data'
import {
  AnimatedCounter,
  AnimatedUnderlineLink,
  ExpandableCard,
  ImageMaskReveal,
  MagneticButton,
  SpotlightCard,
  TextReveal,
  TiltCard,
  Tooltip,
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
    <div className={styles.contentEngine} aria-label="Alur otomatis dari ide, diproses AI, menjadi konten dan produk, lalu menghasilkan pendapatan">
      <div className={styles.engineNode}>
        <span>01</span>
        <Lightbulb aria-hidden="true" />
        <strong>Idea</strong>
        <small>Human direction</small>
      </div>

      <div className={styles.engineLink} aria-hidden="true"><i /></div>

      <div className={`${styles.engineNode} ${styles.engineAi}`}>
        <span>02</span>
        <Bot aria-hidden="true" />
        <strong>AI</strong>
        <small>Generate & refine</small>
      </div>

      <div className={`${styles.engineLink} ${styles.engineSplitLink}`} aria-hidden="true"><i /></div>

      <div className={styles.engineOutputs}>
        <div className={styles.engineOutput}>
          <FileText aria-hidden="true" />
          <div><strong>Content</strong><small>Attention</small></div>
        </div>
        <div className={styles.engineOutput}>
          <PackageOpen aria-hidden="true" />
          <div><strong>Product</strong><small>Offer</small></div>
        </div>
      </div>

      <div className={`${styles.engineLink} ${styles.engineMergeLink}`} aria-hidden="true"><i /></div>

      <div className={`${styles.engineNode} ${styles.engineMoney}`}>
        <span>04</span>
        <CircleDollarSign aria-hidden="true" />
        <strong>Money</strong>
        <small>Measured growth</small>
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

function ImpactMetric({ value, label, definition, qualifier }: {
  value: number
  label: string
  definition: string
  qualifier: string
}) {
  return (
    <SpotlightCard className={styles.impactCard}>
      <div className={styles.impactTop}><span>{qualifier}</span><CircleDot size={14} /></div>
      <AnimatedCounter value={value} suffix="+" className={styles.impactValue} />
      <div className={styles.impactLabel}>
        <h3>{label}</h3>
        <Tooltip text={definition}><button type="button" aria-label={`Definition of ${label}`}>i</button></Tooltip>
      </div>
      <div className={styles.metricChart} aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <span key={index} style={{ height: `${20 + ((index * 17 + value) % 70)}%` }} />)}</div>
    </SpotlightCard>
  )
}

function PillarVisual({ number }: { number: string }) {
  if (number === '01') {
    return (
      <div className={`${styles.pillarGraphic} ${styles.pillarNoiseGraphic}`} aria-hidden="true">
        <div className={styles.noiseNodes}>
          {Array.from({ length: 12 }, (_, index) => <span key={index} style={{ '--node-index': index } as CSSProperties} />)}
        </div>
        <div className={styles.signalBeam}><span /></div>
        <i className={styles.signalTarget} />
        <b>signal</b>
      </div>
    )
  }

  if (number === '02') {
    return (
      <div className={`${styles.pillarGraphic} ${styles.pillarHumanGraphic}`} aria-hidden="true">
        <div className={styles.organicForm}><span /><span /><span /></div>
        <div className={styles.machineForm}>
          {Array.from({ length: 16 }, (_, index) => <span key={index} />)}
        </div>
        <div className={styles.convergenceLine}><i /></div>
        <strong>human</strong><b>machine</b>
      </div>
    )
  }

  if (number === '03') {
    return (
      <div className={`${styles.pillarGraphic} ${styles.pillarPerceptionGraphic}`} aria-hidden="true">
        <div className={`${styles.perceptionFrame} ${styles.frameOne}`}><span /><i>raw</i></div>
        <div className={`${styles.perceptionFrame} ${styles.frameTwo}`}><span /><i>context</i></div>
        <div className={`${styles.perceptionFrame} ${styles.frameThree}`}><span /><i>meaning</i></div>
        <div className={styles.perceptionSweep} />
      </div>
    )
  }

  return (
    <div className={`${styles.pillarGraphic} ${styles.pillarDataGraphic}`} aria-hidden="true">
      <div className={styles.evidenceNetwork}>
        {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
        <i /><i /><i /><i />
      </div>
      <div className={styles.authorityCore}><Check size={19} /><b>verified</b></div>
    </div>
  )
}

function SystemPreview({ number }: { number: string }) {
  const titles: Record<string, string> = {
    '01': 'Market pulse',
    '02': 'Perception workspace',
    '03': 'AI campaign flow',
    '04': 'Growth command',
  }

  return (
    <div className={`${styles.systemPreview} ${styles[`systemPreview${number}`]}`} aria-hidden="true">
      <div className={styles.previewToolbar}>
        <div><span /><span /><span /></div>
        <strong>{titles[number]}</strong>
        <i>Live workspace</i>
      </div>

      {number === '01' && (
        <div className={styles.marketUi}>
          <aside><b>M</b><span /><span /><span /><span /></aside>
          <div className={styles.marketMain}>
            <div className={styles.previewTitle}><span>Category intelligence</span><b>Last 30 days</b></div>
            <div className={styles.previewStats}><span><i>Share of voice</i><b>32.8%</b></span><span><i>Demand signal</i><b>+18.4%</b></span><span><i>Opportunity</i><b>High</b></span></div>
            <div className={styles.marketChart}>{Array.from({ length: 14 }, (_, index) => <span key={index} style={{ height: `${24 + ((index * 19) % 62)}%` }} />)}<i /></div>
          </div>
        </div>
      )}

      {number === '02' && (
        <div className={styles.perceptionUi}>
          <div className={styles.audienceProfile}><span>AM</span><div><b>Audience cluster A</b><i>1,284 conversations analyzed</i></div><em>+24%</em></div>
          <div className={styles.sentimentMap}>
            <div><span>Meaning</span><b>Clarity</b><i style={{ width: '82%' }} /></div>
            <div><span>Trust</span><b>Credibility</b><i style={{ width: '68%' }} /></div>
            <div><span>Preference</span><b>Distinctiveness</b><i style={{ width: '76%' }} /></div>
          </div>
          <div className={styles.perceptionTags}><span>Premium</span><span>Useful</span><span>Human</span><span>Modern</span></div>
        </div>
      )}

      {number === '03' && (
        <div className={styles.workflowUi}>
          <div><b>Research</b><span><i>Brief decoded</i><em>Done</em></span><span><i>Audience signals</i><em>Done</em></span></div>
          <div><b>Production</b><span><i>Campaign concept</i><em>AI</em></span><span><i>Content variants</i><em>12</em></span></div>
          <div><b>Decision</b><span><i>Human review</i><em>Now</em></span><span><i>Deploy assets</i><em>Next</em></span></div>
        </div>
      )}

      {number === '04' && (
        <div className={styles.growthUi}>
          <div className={styles.funnelUi}>
            <span style={{ width: '100%' }}><i>Attention</i><b>48,290</b></span>
            <span style={{ width: '78%' }}><i>Trust</i><b>18,420</b></span>
            <span style={{ width: '56%' }}><i>Offer</i><b>7,860</b></span>
            <span style={{ width: '34%' }}><i>Revenue</i><b>1,284</b></span>
          </div>
          <div className={styles.revenueUi}><span>Conversion value</span><strong>Rp 128.4M</strong><i>+21.8% this period</i></div>
        </div>
      )}
    </div>
  )
}

const SOCIAL_ACCOUNTS = [
  { handle: '@olivia.m', initials: 'OM' },
  { handle: '@jameswilson', initials: 'JW' },
  { handle: '@sophie.lee', initials: 'SL' },
  { handle: '@ethanbrown', initials: 'EB' },
  { handle: '@amelia.king', initials: 'AK' },
  { handle: '@noahscott', initials: 'NS' },
] as const

function DataMotionGraphic({ type }: { type: (typeof DATA_CHAPTERS)[number]['visual'] }) {
  if (type === 'bars') {
    return (
      <div className={`${styles.dataVisual} ${styles.economyMotion}`} aria-hidden="true">
        <div className={styles.motionToolbar}><span><BarChart3 /> Revenue projection</span><em>Live model</em></div>
        <div className={styles.economySummary}>
          <div><small>Digital economy</small><strong>$146B</strong></div>
          <span><ArrowRight /> +24.8%</span>
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
          <div className={styles.chartAxis}><span>2021</span><span>2023</span><span>2025</span></div>
        </div>
      </div>
    )
  }

  if (type === 'network') {
    return (
      <div className={`${styles.dataVisual} ${styles.networkMotion}`} aria-hidden="true">
        <div className={styles.motionToolbar}><span><Network /> Audience network</span><em>Indonesia</em></div>
        <div className={styles.networkStage}>
          <div className={styles.networkRadar}><i /><i /><i /></div>
          <div className={styles.networkCenter}><span><Network /></span><strong>212M</strong><small>connected users</small></div>
          <div className={styles.profileCloud}>
            {SOCIAL_ACCOUNTS.map((account, index) => (
              <div className={styles.profileChip} key={account.handle} style={{ '--profile-index': index } as CSSProperties}>
                <i>{account.initials}</i><span>{account.handle}</span><b />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.networkTicker}><span>Active now</span><i /><strong>+18,420</strong><em>in the last minute</em></div>
      </div>
    )
  }

  if (type === 'rings') {
    return (
      <div className={`${styles.dataVisual} ${styles.aiMotion}`} aria-hidden="true">
        <div className={styles.motionToolbar}><span><BrainCircuit /> AI workbench</span><em>Optimizing</em></div>
        <div className={styles.aiProcess}>
          <div className={styles.taskQueue}>
            {[
              ['01', 'Write script'],
              ['02', 'Analyze data'],
              ['03', 'Build report'],
            ].map(([number, label], index) => (
              <span key={number} style={{ '--task-index': index } as CSSProperties}><i>{number}</i><b>{label}</b><Check /></span>
            ))}
          </div>
          <div className={styles.aiStream}><i /><i /><i /></div>
          <div className={styles.aiCore}><span /><span /><Bot /><small>AI</small></div>
          <div className={styles.aiResult}><small>Speed</small><strong>10×</strong><span>faster</span></div>
        </div>
        <div className={styles.aiProgress}>
          {['Scripting', 'Research', 'Formatting'].map((label, index) => (
            <div key={label} style={{ '--progress-index': index } as CSSProperties}><span>{label}</span><i><b /></i><Check /></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.dataVisual} ${styles.efficiencyMotion}`} aria-hidden="true">
      <div className={styles.motionToolbar}><span><Workflow /> Performance optimizer</span><em>AI enabled</em></div>
      <div className={styles.efficiencyMetrics}>
        <div className={styles.costCard}><span><CircleDollarSign /> Operating cost</span><strong>$50K</strong><small><ArrowDown /> 50% lower</small></div>
        <div className={styles.outputCard}><span><Sparkles /> Team output</span><strong>150%</strong><small><ArrowRight /> 1.5× higher</small></div>
      </div>
      <div className={styles.efficiencyStage}>
        <div className={styles.efficiencyLegend}><span>Before AI</span><span>AI workflow</span></div>
        <div className={styles.efficiencyColumns}>
          <div><i className={styles.beforeCost} /><b>Cost</b><em>$100K</em></div>
          <div><i className={styles.afterCost} /><b>Cost</b><em>$50K</em></div>
          <div><i className={styles.beforeOutput} /><b>Output</b><em>100%</em></div>
          <div><i className={styles.afterOutput} /><b>Output</b><em>150%</em></div>
        </div>
        <div className={styles.optimizationSweep}><span>Efficiency +50%</span></div>
      </div>
    </div>
  )
}

export default function AboutClient({ navLinks, config, resolvedSections = [] }: AboutClientProps) {
  const [waOpen, setWaOpen] = useState(false)
  const [waName, setWaName] = useState('')
  const [waMessage, setWaMessage] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const ecosystemItems = resolvedSections.flatMap((section) => section.items)

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
              <span className={styles.heroLabel}>Marketing intelligence system · 01</span>
              <h1><span className={styles.heroTitleLine}>Turn one clear idea</span><span className={`${styles.heroTitleLine} ${styles.heroTitleAccent}`}>into a system for growth.</span></h1>
              <p>
                Marcatching helps business owners turn human direction and AI into content, products, and measurable business outcomes.
              </p>
              <div className={styles.heroActions}>
                <MagneticButton href={config.cta_url || config.store_url || '/store'}>Start Building Your System <ArrowRight size={17} /></MagneticButton>
                <AnimatedUnderlineLink href={config.article_url || '/article'}>Explore intelligence <ArrowRight size={15} /></AnimatedUnderlineLink>
              </div>
            </div>
            <ContentEngineGraphic />
          </div>
          <a href="#problem" className={styles.scrollCue} aria-label="Scroll to the problem"><span>Scroll to decode</span><ArrowDown size={15} /></a>
        </section>

        <section className={`${styles.chapter} ${styles.problem}`} id="problem" data-experience-section="problem">
          <div className={styles.shell}>
            <SectionHeading eyebrow="02 · The problem" title={<>More content is not the answer.<br /><em>A clearer system is.</em></>} body="Banyak bisnis sudah punya produk, media sosial, dan AI. Namun keputusan masih reaktif: mengejar tren tanpa membaca pola, membuat konten tanpa positioning, dan mengukur likes tanpa menghubungkannya ke revenue." />
            <div className={styles.noiseLab}>
              <div className={styles.noiseCloud} aria-label="Disconnected marketing concepts">
                {NOISE_TERMS.slice(0, 6).map((term, index) => <span key={term} style={{ '--noise-index': index } as CSSProperties}>{term}</span>)}
              </div>
              <div className={styles.systemPanel}>
                <div className={styles.systemPanelHeader}><span>System resolution</span><strong>Signal connected</strong></div>
                <FlowLine nodes={SYSTEM_FLOW} />
                <p>Di era AI, speed is abundant. The advantage is turning data, technology, and audience psychology into precise decisions.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.gap}`} id="gap" data-experience-section="gap">
          <div className={styles.shell}>
            <SectionHeading eyebrow="03 · AI adoption gap" title={<>AI hype is everywhere.<br /><em>Implementation is rare.</em></>} body="The real question is no longer whether a business should use AI. It is how AI becomes part of research, content, campaigns, customer journeys, and everyday decisions." />
            <div className={styles.bridge}>
              <div className={styles.bridgeSide}><span>01</span><strong>AI Hype</strong><p>Tools, prompts, possibility</p></div>
              <div className={styles.bridgeTrack}>
                <span className={styles.energyPulse} />
                {AI_PIPELINE.map((node, index) => <div className={styles.bridgeNode} key={node}><i>{String(index + 1).padStart(2, '0')}</i><span>{node}</span></div>)}
              </div>
              <div className={styles.bridgeSide}><span>02</span><strong>AI Implementation</strong><p>Workflow, judgment, outcomes</p></div>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.data}`} id="data" data-experience-section="data">
          <div className={styles.shell}>
            <SectionHeading eyebrow="04 · Data urgency" title={<>Four signals.<br /><em>One strategic window.</em></>} body="Data should not decorate the page. It should clarify what changes, what is at risk, and where action is needed." />
            <div className={styles.dataChapters}>
              {DATA_CHAPTERS.map((chapter, index) => (
                <article className={styles.dataChapter} key={chapter.id}>
                  <div className={styles.dataIndex}>{String(index + 1).padStart(2, '0')} / 04</div>
                  <div className={styles.dataNumber}><AnimatedCounter value={chapter.value} prefix={chapter.prefix} suffix={chapter.suffix} /></div>
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
              <div className={styles.buildSticky}><SectionHeading eyebrow="05 · What we build" title={<>Not another playbook.<br /><em>Four operating systems.</em></>} body="Each system connects an input to a decision and a decision to a business outcome." /></div>
              <div className={styles.moduleList}>
                {CAPABILITIES.map((capability) => (
                  <SpotlightCard className={styles.moduleCard} key={capability.number}>
                    <ExpandableCard
                      label={`${capability.title} details`}
                      summary={<div className={styles.moduleSummary}><span className={styles.moduleNumber}>{capability.number}</span><h3>{capability.title}</h3><p>{capability.description}</p><SystemPreview number={capability.number} /><div className={styles.moduleOpen}>Open system <ArrowRight size={15} /></div></div>}
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
            <SectionHeading eyebrow="06 · The ecosystem" title={<>Insight only matters<br /><em>when it moves.</em></>} body="Marcatching connects education, validation, tools, and implementation into one path from intelligence to impact." />
            <FlowLine nodes={ECOSYSTEM_FLOW} compact />

            {resolvedSections.map((section) => (
              <div className={styles.ecosystemGroup} key={section.id}>
                <div className={styles.ecosystemGroupHead}><h3>{section.title}</h3><span>{section.items.length.toString().padStart(2, '0')} modules</span></div>
                <div className={styles.ecosystemRail}>{section.items.map((item) => <EcosystemCard item={item} key={item.id} />)}</div>
              </div>
            ))}

            {ecosystemItems.length === 0 && (
              <div className={styles.ecosystemGateways}>
                <GatewayCard href={config.article_url || '/article'} number="01" title="Articles" body="Research and strategic field notes." />
                <GatewayCard href={config.survey_url || '/survey'} number="02" title="UMKM Survey" body="Business diagnosis and market validation." />
                <GatewayCard href={config.store_url || '/store'} number="03" title="Tools & Course" body="Systems ready for implementation." />
              </div>
            )}
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.impact}`} id="impact" data-experience-section="impact">
          <div className={styles.shell}>
            <div className={styles.impactHeader}>
              <SectionHeading eyebrow="07 · Impact intelligence" title={<>Measured movement.<br /><em>Clearly defined.</em></>} body="These are published CMS totals, not simulated live counters. Every metric states what it represents." />
              <span className={styles.updateLabel}><CircleDot size={12} /> Last updated: current published CMS values</span>
            </div>
            <div className={styles.impactGrid}>
              <ImpactMetric value={config.stat_umkm_helped || 0} label="UMKM supported" qualifier="Participants" definition="Businesses that joined a survey, received an insight, or used the Marcatching ecosystem." />
              <ImpactMetric value={config.stat_total_reach || 0} label="Estimated reach" qualifier="Estimated" definition="Estimated audience reached through articles, Instagram, TikTok, and education channels." />
              <ImpactMetric value={config.stat_product_sold || 0} label="Products accessed" qualifier="Verified sales" definition="Courses, digital products, and learning assets recorded as sold or accessed." />
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.pillars}`} id="pillars" data-experience-section="pillars">
          <div className={styles.shell}>
            <SectionHeading eyebrow="08 · Four pillars" title={<>How Marcatching<br /><em>sees the market.</em></>} />
            <div className={styles.pillarChapters}>
              {PILLARS.map((pillar) => (
                <article className={styles.pillarCard} key={pillar.number}>
                  <div className={styles.pillarIndex}>{pillar.number} / 04</div>
                  <PillarVisual number={pillar.number} />
                  <div className={styles.pillarCopy}><span>{pillar.label}</span><h3>{pillar.title}</h3><strong>{pillar.tagline}</strong><p>{pillar.description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.founder}`} id="founder" data-experience-section="founder">
          <div className={styles.shell}>
            <SectionHeading eyebrow="09 · Founder" title={<>Built at the intersection<br />of <em>strategy and execution.</em></>} />
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
                <p>Gilang Ramadhan builds at the intersection of content strategy, consumer psychology, brand positioning, AI workflow, and business growth.</p>
                <blockquote>{config.founder_quote}</blockquote>
                <div className={styles.roleGrid}>
                  <span><Hammer /> Builder</span><span><Compass /> Strategist</span><span><BrainCircuit /> Educator</span><span><Workflow /> Operator</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.paths}`} id="paths" data-experience-section="paths">
          <div className={styles.shell}>
            <SectionHeading eyebrow="10 · Choose your path" title={<>Marcatching is not for everyone.<br /><em>It is for builders.</em></>} align="center" />
            <div className={styles.pathGrid}>
              <SpotlightCard className={`${styles.pathCard} ${styles.builderPath}`}>
                <div className={styles.pathHead}><span>01</span><Network /></div><h3>For Builders</h3><p>For people who want durable systems, clearer judgment, and measurable growth.</p>
                <ul>{config.comparison_pros.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
                <MagneticButton href={config.cta_url || config.store_url || '/store'}>Build your system <ArrowRight size={16} /></MagneticButton>
              </SpotlightCard>
              <div className={`${styles.pathCard} ${styles.shortcutPath}`}>
                <div className={styles.pathHead}><span>02</span><X /></div><h3>Not for Shortcuts</h3><p>Momentum without a system becomes another loop of noise.</p>
                <ul>{config.comparison_cons.map((item) => <li key={item}><X size={15} />{item}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.finale}`} id="finale" data-experience-section="finale">
          <div className={styles.finaleLogo} aria-hidden="true"><Image src="/logo-shape-white.png" alt="" width={74} height={74} /><span /><span /></div>
          <TextReveal className={styles.finaleContent}>
            <span className={styles.eyebrow}>11 · The system is ready</span>
            <h2>Build a business that<br /><em>learns faster than the market.</em></h2>
            <p>Connect intelligence, perception, execution, and growth in one operating system.</p>
            <div className={styles.finaleActions}>
              <MagneticButton href={config.cta_url || config.store_url || '/store'}>Start Building Your System <ArrowRight size={17} /></MagneticButton>
              <AnimatedUnderlineLink href={config.article_url || '/article'}>Explore Marcatching</AnimatedUnderlineLink>
            </div>
          </TextReveal>
        </section>
      </main>

      <footer className={styles.footer}>
        <div><Image src="/logo-type-white.png" alt="Marcatching" width={150} height={40} /><p>Marketing intelligence for businesses that choose systems over noise.</p></div>
        <nav aria-label="Footer navigation"><Link href={config.article_url || '/article'}>Articles</Link><Link href={config.store_url || '/store'}>Store</Link><a href={`mailto:${config.contact_email}`}><Mail size={14} /> Contact</a></nav>
        <p>© {new Date().getFullYear()} Marcatching. All rights reserved.</p>
      </footer>

      <button type="button" className={styles.contactButton} onClick={() => setWaOpen(true)} aria-label="Open WhatsApp contact"><Image src="/logo-shape-white.png" alt="" width={25} height={25} /><span>Talk to Marcatching</span></button>

      <AnimatePresence>
        {waOpen && (
          <>
            <motion.button type="button" className={styles.contactBackdrop} onClick={() => setWaOpen(false)} aria-label="Close contact form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div ref={dialogRef} className={styles.contactDialog} role="dialog" aria-modal="true" aria-labelledby="contact-title" tabIndex={-1} initial={{ opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}>
              <div className={styles.contactDialogHead}><div><span>Direct channel</span><h2 id="contact-title">Talk to Marcatching</h2></div><button type="button" onClick={() => setWaOpen(false)} aria-label="Close contact form"><X /></button></div>
              <p>Tell us what you are building. Your message will open securely in WhatsApp.</p>
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
