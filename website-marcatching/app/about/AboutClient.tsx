'use client'

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Compass,
  Copy,
  Download,
  FileArchive,
  FileText,
  Hammer,
  Mail,
  MousePointer2,
  Network,
  PackageOpen,
  Paperclip,
  Quote,
  Send,
  Settings2,
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
  NOISE_TERMS,
  SYSTEM_FLOW,
  type ExperienceConfig,
  type ProductCardData,
} from './experience-data'
import {
  AnimatedCounter,
  AnimatedUnderlineLink,
  ExpandableCard,
  ImageMaskReveal,
  MagneticButton,
  SpotlightCard,
  TextReveal,
} from './Interactions'
import styles from './about.module.css'

type AboutClientProps = {
  navLinks: NavLink[]
  config: ExperienceConfig
  heroProduct?: ProductCardData | null
}

function getDriveThumb(url?: string | null, size = 'w1000-h1000') {
  if (!url) return null
  if (url.includes('drive.google.com/uc')) {
    const match = url.match(/id=([^&]+)/)
    if (match?.[1]) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=${size}`
  }
  return url
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
    <div className={styles.contentEngine} aria-label="Brand Memory mengalir ke Prompt Library dan Agentic Dashboard, lalu membuka revenue stream">
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
          <div><strong>Decision</strong><small>Clear next action</small></div>
        </div>
        <div className={styles.engineOutput}>
          <PackageOpen aria-hidden="true" />
          <div><strong>Agentic Dashboard</strong><small>Personal workflow</small></div>
        </div>
      </div>

      <div className={`${styles.engineLink} ${styles.engineMergeLink}`} aria-hidden="true"><i /></div>

      <div className={`${styles.engineNode} ${styles.engineMoney}`}>
        <span>04</span>
        <CircleDollarSign aria-hidden="true" />
        <strong>Revenue Stream</strong>
        <small>Build, sell, earn</small>
      </div>
    </div>
  )
}

function DemoSidebar({ active }: { active: 'memory' | 'skills' | 'prompts' }) {
  return (
    <aside className={styles.demoSidebar} aria-hidden="true">
      <div className={styles.demoSidebarBrand}><b>M</b><span>marcatching</span></div>
      <small>Member workspace</small>
      <nav>
        <span><i>01</i> Learning Home</span>
        <span className={active === 'memory' ? styles.demoNavActive : ''}><i>02</i> Creator Workspace</span>
        <span className={active === 'prompts' ? styles.demoNavActive : ''}><i>03</i> Prompt Library</span>
        <span className={active === 'skills' ? styles.demoNavActive : ''}><i>04</i> Skill Library</span>
      </nav>
      <div className={styles.demoMember}><b>G</b><span>Gilang&apos;s workspace<small>Brand system active</small></span></div>
    </aside>
  )
}

function BrandEcosystemHero() {
  const answerLines = [
    ['01', 'Core direction', 'Position Marcatching as the memory layer between brand thinking and AI execution.'],
    ['02', 'Audience tension', 'They do not need more outputs. They need answers that already understand the brand.'],
    ['03', 'Campaign idea', 'Build a 90-day narrative around “Stop briefing AI from zero.”'],
    ['04', 'Content system', 'Turn one strategic belief into research, carousel, short video, email, and landing page.'],
    ['05', 'Next action', 'Launch the proof-led campaign with one clear Brand Memory transformation.'],
    ['06', 'Measurement plan', 'Track message recall, qualified replies, assisted conversion, and repeated prompt quality.'],
  ] as const

  return (
    <figure className={styles.ecosystemDemo} aria-labelledby="ecosystem-demo-title">
      <figcaption className={styles.ecosystemDemoCaption}>
        <span id="ecosystem-demo-title">Brand Memory → Skill → Better answer</span>
        <span><i /> 15 sec · seamless loop</span>
      </figcaption>

      <div className={styles.demoViewport}>
        <div className={styles.demoBrowserBar} aria-hidden="true">
          <span><i /><i /><i /></span>
          <div><b>course.marcatching.com</b><em>Secure workspace</em></div>
          <Image src="/logo-shape-white.png" alt="" width={18} height={18} />
        </div>

        <div className={styles.demoFilm} aria-hidden="true">
          <section className={`${styles.demoScene} ${styles.demoSceneMemory}`} aria-label="Brand brief dibuat menjadi Brand Memory">
            <DemoSidebar active="memory" />
            <div className={styles.demoCourseCanvas}>
              <header><span><BrainCircuit /> Creator Workspace</span><b>Brand Memory</b></header>
              <div className={styles.demoMemoryBackground} aria-hidden="true">
                <div><span>Audience OS</span><b>Ready</b></div><div><span>Brand Voice</span><b>Syncing</b></div><div><span>Offer</span><b>Ready</b></div>
              </div>
              <div className={styles.demoBriefModal}>
                <span><Sparkles /> Brand Memory Builder</span>
                <h3>Tell us all about your brand.</h3>
                <p>Satu brief ini menjadi konteks yang ikut ke setiap workflow.</p>
                <div className={styles.demoBriefField}>
                  <span className={styles.demoTypedBrief}>
                    <span>Marcatching adalah marketing intelligence brand untuk founder,</span>
                    <span>marketer, dan creator yang ingin AI memahami brand mereka.</span>
                    <span>Tone: sharp, calm, premium. Fokus: consumer psychology,</span>
                    <span>brand positioning, AI workflow, dan execution clarity.</span>
                  </span>
                  <i />
                </div>
                <button type="button" tabIndex={-1}>Generate Brand Memory <ArrowRight /></button>
              </div>
            </div>
            <div className={styles.demoBeatLabel}><b>01</b><span>Capture the brand<small>One context, ready to reuse</small></span></div>
          </section>

          <section className={`${styles.demoScene} ${styles.demoSceneSkill}`} aria-label="Skill dikustomisasi dan dibuat dari Brand Memory">
            <DemoSidebar active="skills" />
            <div className={styles.demoCourseCanvas}>
              <header><span><Sparkles /> Marcatching Skill Builder</span><b>Ready to create</b></header>
              <div className={styles.demoSkillHeader}>
                <span>Personalized Skill</span>
                <h3>Ubah Brand Memory menjadi Skill yang benar-benar milikmu.</h3>
              </div>
              <article className={styles.demoSkillCard}>
                <div className={styles.demoSkillVisual}><FileArchive /><span>/marcatching-skill</span></div>
                <div className={styles.demoSkillMeta}><b><CheckCircle2 /> Ready to create</b><small>Original & personalized Skill · .zip</small></div>
                <h4>Marcatching Brand Strategist</h4>
                <p>Strategi, content, dan decision system yang membaca Brand Memory sebelum bekerja.</p>
                <div className={styles.demoSkillChecks}><span><Check /> Skill dimiliki</span><span><Check /> Brand Memory lengkap</span></div>
                <button type="button" tabIndex={-1}><Settings2 /> Customize Skill</button>
              </article>
              <div className={styles.demoCustomizeModal}>
                <span><Sparkles /> Customize Skill</span>
                <h3>Marcatching Brand Strategist</h3>
                <label>Prioritas brand saat ini<textarea readOnly tabIndex={-1} value="Menjaga premium clarity sambil mempercepat campaign execution." /></label>
                <label>Hal yang harus selalu dihindari<textarea readOnly tabIndex={-1} value="Generic tips, jargon tanpa konteks, dan hard-selling." /></label>
                <button type="button" tabIndex={-1}>Create personalized Skill</button>
              </div>
              <div className={styles.demoExportToast}><Download /><span><b>2 files downloaded</b><small>marcatching-skill.zip · brand-memory.md</small></span><CheckCircle2 /></div>
            </div>
            <div className={styles.demoBeatLabel}><b>02</b><span>Customize the Skill<small>Brand logic packaged inside</small></span></div>
          </section>

          <section className={`${styles.demoScene} ${styles.demoSceneInstall}`} aria-label="Brand Memory dan Marcatching Skill dipasang pada AI generatif">
            <div className={styles.demoAiShell}>
              <aside><Bot /><span>New chat</span><span>Projects</span><span>Skills</span><small>Generative AI</small></aside>
              <main>
                <header><span>Marcatching Brand System</span><b>Private workspace</b></header>
                <div className={styles.demoInstallCard}>
                  <div className={styles.demoInstallIcon}><Sparkles /></div>
                  <span>Connect your brand system</span>
                  <h3>Install context once.<br />Use it in every prompt.</h3>
                  <p>Drag Brand Memory into this workspace. Your installed Skill will read it before answering.</p>
                  <div className={styles.demoDropZone}>
                    <Paperclip />
                    <span><b>Drop brand-memory.md here</b><small>Brand context for this workspace</small></span>
                    <div className={styles.demoAttachedMemory}><FileText /><span><b>brand-memory.md</b><small>Context attached</small></span><Check /></div>
                  </div>
                  <div className={styles.demoInstalledSkill}><CheckCircle2 /><span><small>Installed Skill</small><b>/marcatching-skill</b></span></div>
                  <button type="button" tabIndex={-1}><Paperclip /> Insert files</button>
                  <div className={styles.demoDraggedFile}><FileText /><span><b>brand-memory.md</b><small>Markdown · Brand context</small></span></div>
                </div>
              </main>
            </div>
            <div className={styles.demoBeatLabel}><b>03</b><span>Install in generative AI<small>Memory and Skill connected</small></span></div>
          </section>

          <section className={`${styles.demoScene} ${styles.demoSceneAnswer}`} aria-label="Prompt Library menghasilkan jawaban AI yang panjang dan personal">
            <div className={styles.demoPromptRail}>
              <div className={styles.demoPromptBrand}><b>M</b><span>Prompt Library<small>Context-aware action</small></span></div>
              <article>
                <span>Brand strategy · Premium perception</span>
                <h3>Build a 90-day brand growth direction</h3>
                <p>Analyze our Brand Memory, identify the strongest strategic tension, then create a campaign system...</p>
                <button type="button" tabIndex={-1}><Copy /> Copy prompt</button>
                <em><Check /> Copied</em>
              </article>
            </div>
            <div className={styles.demoChat}>
              <header><span><Bot /> Generative AI</span><b><CheckCircle2 /> /marcatching-skill active</b></header>
              <div className={styles.demoChatBody}>
                <div className={styles.demoUserPrompt}>Using our Brand Memory and /marcatching-skill, build a 90-day brand growth direction. Identify the strongest audience tension, define the core narrative, map weekly content across carousel, short video, email, and landing page, then finish with priorities, KPIs, and the next action. Keep every recommendation specific, premium, and ready to execute.</div>
                <div className={styles.demoThinking}><span>M</span><div><i /><i /><i /></div><small>/marcatching-skill is thinking with Brand Memory</small></div>
                <div className={styles.demoAnswerCard}>
                  <div className={styles.demoAnswerIntro}><span>M</span><div><small>MARCATCHING STRATEGIC RESPONSE</small><h3>Your 90-Day Brand Growth System</h3><p>I read your Brand Memory first. The opportunity is not “more AI content”—it is owning the category of AI that remembers how a brand thinks.</p></div></div>
                  <div className={styles.demoAnswerScroll}>
                    {answerLines.map(([number, title, copy]) => <div key={number}><b>{number}</b><span><strong>{title}</strong><p>{copy}</p></span></div>)}
                  </div>
                </div>
              </div>
              <div className={styles.demoComposer}><span>Ask with your Brand Memory...</span><button type="button" tabIndex={-1}><Send /></button></div>
            </div>
            <div className={styles.demoBeatLabel}><b>04</b><span>Prompt with memory<small>Long, specific, on-brand answer</small></span></div>
          </section>
        </div>
        <span className={styles.demoCursor} aria-hidden="true"><MousePointer2 /></span>
      </div>
    </figure>
  )
}

function SystemPreview({ number }: { number: string }) {
  const titles: Record<string, string> = {
    '01': 'Brand Memory',
    '02': 'Prompt Library',
    '03': 'Agentic Dashboard',
    '04': 'Revenue Stream',
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
          <div><b>Context</b><span><i>Brand Memory</i><em>Synced</em></span><span><i>Objective</i><em>Ready</em></span></div>
          <div><b>Agent</b><span><i>Priority</i><em>Clear</em></span><span><i>Decision</i><em>Focused</em></span></div>
          <div><b>Action</b><span><i>Next move</i><em>Ready</em></span><span><i>Dashboard</i><em>Live</em></span></div>
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
          <div className={styles.revenueUi}><span>Revenue workspace</span><strong>Income visible</strong><i>Clear history and status</i></div>
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
        <div className={styles.motionToolbar}><span><Sparkles /> Agentic Dashboard</span><em>Personalizing</em></div>
        <div className={styles.aiProcess}>
          <div className={styles.taskQueue}>
            {[
              ['01', 'Read memory'],
              ['02', 'Set priority'],
              ['03', 'Choose next action'],
            ].map(([number, label], index) => (
              <span key={number} style={{ '--task-index': index } as CSSProperties}><i>{number}</i><b>{label}</b><Check /></span>
            ))}
          </div>
          <div className={styles.aiStream}><i /><i /><i /></div>
          <div className={styles.aiCore}><span /><span /><Bot /><small>Agent</small></div>
          <div className={styles.aiResult}><small>Decision</small><strong>Clear</strong><span>now</span></div>
        </div>
        <div className={styles.aiProgress}>
          {['Context', 'Priority', 'Action'].map((label, index) => (
            <div key={label} style={{ '--progress-index': index } as CSSProperties}><span>{label}</span><i><b /></i><Check /></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.dataVisual} ${styles.efficiencyMotion}`} aria-hidden="true">
      <div className={styles.motionToolbar}><span><CircleDollarSign /> Revenue Stream</span><em>Tracking</em></div>
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

const TESTIMONIAL_DRAFTS = [
  'Brand Memory bikin aku berhenti copy paste briefing yang sama. finally 😭',
  'Prompt Library-nya bukan cuma banyak. Pas dibuka tuh langsung kebayang mau ngerjain apa.',
  'Baru kali ini AI ngerti tone brand aku tanpa harus dijelasin muter muter.',
  'Agentic Dashboard bikin kerjaan yang tadinya rame di kepala jadi kelihatan next step-nya.',
  'jujur awalnya kupikir bakal ribet. ternyata tinggal isi konteks terus jalan.',
  'Yang paling kerasa itu keputusan konten jadi lebih cepet. Nggak bengong lama lagi.',
  'Brand Memory is the real deal. Output-nya jadi nggak berasa template internet.',
  'Prompt buat campaign-nya kepake bangettt. detail tapi masih gampang diikutin.',
  'Aku suka karena semuanya nyambung. Dari brand, prompt, action, sampai revenue.',
  'Dashboard-nya bikin aku sadar ternyata banyak kerjaan bisa diberesin lebih simple.',
  'Finally punya AI yang ngomongnya nggak berubah ubah tiap buka chat baru.',
  'Buat tim kecil ini ngebantu banget. Arah brand jadi nggak cuma ada di kepala founder.',
  'sumpah bagian revenue stream bikin affiliate jauh lebih enak dipantau wkwk',
  'Tidak terasa seperti membeli kumpulan prompt. Lebih seperti punya sistem kerja sendiri.',
  'My brand finally sounds like my brand. sesimpel itu sih.',
  'Aku paling suka Prompt Library karena nggak perlu mikir harus mulai nanya apa.',
  'Baru isi Brand Memory sekali, tapi efeknya kebawa ke mana mana. smart banget.',
  'Agent-nya bantu milih prioritas, bukan malah nambah seribu ide baru. I NEED THIS.',
  'Kalau lagi hectic, dashboard ini bikin aku balik fokus ke keputusan yang penting.',
  'bagussss bangettt buat yang capek hasil AI selalu generik 😭🫶',
  'Revenue stream-nya jelas. Klik kelihatan, komisi kelihatan, nggak nebak nebak.',
  'Sebagai marketer, aku appreciate konteksnya. Cepat, tapi tetap masuk akal buat brand.',
  'Nggak nyangka satu Brand Memory bisa bikin workflow terasa sepersonal ini.',
  'Prompt-nya enak dibaca dan nggak sok pinter. langsung bisa dipakai kerja.',
  'simple, kepake, dan bikin aku jauh lebih yakin pas ambil keputusan.',
] as const

const RANDOMIZED_TESTIMONIAL_DRAFTS = TESTIMONIAL_DRAFTS.map(
  (_, index) => TESTIMONIAL_DRAFTS[(index * 7) % TESTIMONIAL_DRAFTS.length],
)

function formatCurrency(value?: number | null) {
  return `Rp ${Math.max(0, Number(value) || 0).toLocaleString('id-ID')}`
}

function plainText(value?: string | null) {
  if (!value) return ''
  return value.replace(/<[^>]*>?/gm, '').trim()
}

function HeroProductSpotlight({ product }: { product: ProductCardData }) {
  const before = Math.max(0, Number(product.price_before_discount) || 0)
  const after = Math.max(0, Number(product.price_after_discount) || 0)
  const discount = Math.max(
    0,
    Number(product.discount_percentage) || (before > after && before > 0 ? Math.round((1 - after / before) * 100) : 0),
  )
  const image = getDriveThumb(product.image_url, 'w1200-h1200')

  return (
    <motion.div className={styles.heroProductCard} initial={{ opacity: 0, y: 34, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.28 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}>
      <p className={styles.heroProductUnlock}>Unlock the Full Marcatching System: Brand Memory, Prompt Library, Agentic Dashboard, and Affiliate Revenue, only by purchasing the product below.</p>
      <div className={styles.heroProductVisual}>
        {image ? <Image src={image} alt={`${product.name} product cover`} fill sizes="(max-width: 760px) 90vw, 48vw" className={styles.heroProductImage} /> : <div className={styles.heroProductFallback}><Bot /><span>Your first AI agent</span></div>}
        <span className={styles.heroProductBadge}>Hero Product</span>
      </div>
      <div className={styles.heroProductCopy}>
        <span>Built around your brand</span>
        <h2>{product.name}</h2>
        {(product.sub_headline || product.description) && <p>{product.sub_headline || plainText(product.description).slice(0, 180)}</p>}
        <div className={styles.heroProductPricing}>
          {before > after && <del>{formatCurrency(before)}</del>}
          <strong>{formatCurrency(after)}</strong>
          {discount > 0 && <em>Save {discount}%</em>}
        </div>
        <MagneticButton href={`/product/${product.slug}/checkout`}>Get Your First AI Agent <ArrowRight size={17} /></MagneticButton>
      </div>
    </motion.div>
  )
}

export default function AboutClient({ navLinks, config, heroProduct = null }: AboutClientProps) {
  const [waOpen, setWaOpen] = useState(false)
  const [waName, setWaName] = useState('')
  const [waMessage, setWaMessage] = useState('')
  const [showSkipTestimonials, setShowSkipTestimonials] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!waOpen) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setWaOpen(false)
    }
    document.addEventListener('keydown', close)
    dialogRef.current?.focus()
    return () => document.removeEventListener('keydown', close)
  }, [waOpen])

  useEffect(() => {
    const section = testimonialsRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowSkipTestimonials(entry.isIntersecting),
      { threshold: 0.02, rootMargin: '-8% 0px -8%' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const sendWhatsApp = () => {
    if (!waName.trim() && !waMessage.trim()) return
    const text = `Halo, nama saya ${waName.trim()}.\n\n${waMessage.trim()}`
    window.open(`https://wa.me/62895412747584?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  const skipTestimonials = () => {
    document.getElementById('founder')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const firstAgentUrl = heroProduct ? `/product/${heroProduct.slug}/checkout` : '/course/login'

  return (
    <div className={styles.experience}>
      <ExperienceRuntime />
      <ExperienceNavigation navLinks={navLinks} ctaUrl="/course/login" />

      <main className={styles.main}>
        <section className={`${styles.chapter} ${styles.hero}`} id="hero" data-experience-section="hero">
          <div className={styles.heroLayout}>
            <div className={styles.heroContent}>
              <span className={styles.heroLabel}>AI built around your brand</span>
              <h1><span className={styles.heroTitleLine}>Generic AI is dead.</span><span className={`${styles.heroTitleLine} ${styles.heroTitleAccent}`}>Yours remembers.</span></h1>
              <div className={styles.heroActions}>
                <MagneticButton href={firstAgentUrl}>Get Your First AI Agent <ArrowRight size={17} /></MagneticButton>
              </div>
            </div>
            <ContentEngineGraphic />
          </div>
          <a href="#problem" className={styles.scrollCue} aria-label="Lihat mengapa Marcatching dibutuhkan"><span>See why it matters</span><ArrowDown size={15} /></a>
        </section>

        <section className={`${styles.chapter} ${styles.problem}`} id="problem" data-experience-section="problem">
          <div className={styles.shell}>
            <SectionHeading eyebrow="02 · The real friction" title={<>Your brand deserves more<br /><em>than generic answers.</em></>} body="Marcatching mempersonalisasi AI dari kebutuhan brand-mu. Konteks yang tepat membuat setiap keputusan terasa lebih cepat, lebih jelas, dan lebih tepat." />
            <BrandEcosystemHero />
            <div className={styles.noiseLab}>
              <div className={styles.noiseCloud} aria-label="Disconnected marketing concepts">
                {NOISE_TERMS.map((term, index) => <span key={term} style={{ '--noise-index': index } as CSSProperties}>{term}</span>)}
              </div>
              <div className={styles.systemPanel}>
                <div className={styles.systemPanelHeader}><span>Marcatching resolution</span><strong>One memory. Multiple workflows.</strong></div>
                <FlowLine nodes={SYSTEM_FLOW} />
                <p>Satu identitas brand mengalir dari strategi ke eksekusi, lalu dari produk ke revenue. Bukan lebih banyak tools. Satu sistem yang tahu apa yang brand-mu butuhkan.</p>
              </div>
            </div>
            <div className={styles.liveMetrics} aria-label="Live Marcatching impact">
              <div><BrainCircuit /><AnimatedCounter value={config.stat_umkm_helped} className={styles.liveMetricValue} /><span>Brands Helped</span></div>
              <div><Network /><AnimatedCounter value={config.stat_total_reach} className={styles.liveMetricValue} /><span>Total Reach</span></div>
              <div><PackageOpen /><AnimatedCounter value={config.stat_product_sold} className={styles.liveMetricValue} /><span>Products Sold</span></div>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.data}`} id="data" data-experience-section="data">
          <div className={styles.shell}>
            <SectionHeading eyebrow="03 · Your advantage" title={<>What Do You<br /><em>Get Here?</em></>} body="Personalized to your brand. Built for faster, sharper decisions." />
            <div className={styles.dataChapters}>
              {DATA_CHAPTERS.map((chapter, index) => (
                <article className={styles.dataChapter} key={chapter.id}>
                  <div className={styles.dataIndex}><span>{String(index + 1).padStart(2, '0')}</span></div>
                  <div className={styles.dataNumber}>{chapter.display}</div>
                  <div className={styles.dataCopy}><h3>{chapter.label}</h3><p>{chapter.source}</p></div>
                  <DataMotionGraphic type={chapter.visual} />
                </article>
              ))}
            </div>
          </div>
        </section>

        {heroProduct && (
          <section className={`${styles.chapter} ${styles.heroProduct}`} id="hero-product" data-experience-section="hero-product">
            <div className={styles.shell}><HeroProductSpotlight product={heroProduct} /></div>
          </section>
        )}

        <section className={`${styles.chapter} ${styles.build}`} id="build" data-experience-section="build">
          <div className={styles.shell}>
            <div className={styles.buildLayout}>
              <div className={styles.buildSticky}>
                <SectionHeading eyebrow="04 · The core system" title={<>One brand memory.<br /><em>Four ways to move forward.</em></>} body="Setiap bagian bekerja dari konteks brand yang sama. Hasilnya lebih personal, keputusan lebih cepat, dan next action lebih jelas." />
                <MagneticButton href="/course/login" className={styles.buildCta}>Enter Your Agentic Dashboard <ArrowRight size={16} /></MagneticButton>
              </div>
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

        <section ref={testimonialsRef} className={`${styles.chapter} ${styles.ecosystem} ${styles.testimonials}`} id="ecosystem" data-experience-section="ecosystem">
          <div className={styles.shell}>
            <SectionHeading eyebrow="05 · Voice wall preview" title={<>The kind of relief<br /><em>your brand should feel.</em></>} body="25 human tone copy drafts for the testimonial experience. Replace each one with a verified customer quote before treating it as social proof." />
            <div className={styles.testimonialGrid}>
              {RANDOMIZED_TESTIMONIAL_DRAFTS.map((quote, index) => (
                <motion.article key={`${index}-${quote}`} className={styles.testimonialCard} initial={{ opacity: 0, x: index % 2 === 0 ? -38 : 38, y: 18, scale: 0.96 }} whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.62, delay: (index % 4) * 0.055, ease: [0.22, 1, 0.36, 1] }}>
                  <Quote aria-hidden="true" />
                  <p>{quote}</p>
                  <div><span>Review copy draft</span><b>{String(index + 1).padStart(2, '0')}</b></div>
                </motion.article>
              ))}
            </div>
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
                <MagneticButton href="/course/login">Build Your Brand System <ArrowRight size={16} /></MagneticButton>
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
            <p>One memory. Clearer decisions. More ways to grow.</p>
            <div className={styles.finaleActions}>
              <MagneticButton href={firstAgentUrl}>Get Your First AI Agent <ArrowRight size={17} /></MagneticButton>
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

      <AnimatePresence>
        {showSkipTestimonials && (
          <motion.button type="button" className={styles.skipTestimonials} onClick={skipTestimonials} initial={{ opacity: 0, y: 22, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 18, x: '-50%' }} transition={{ duration: 0.24 }}>
            Skip Testimonials <ArrowDown size={15} />
          </motion.button>
        )}
      </AnimatePresence>

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
