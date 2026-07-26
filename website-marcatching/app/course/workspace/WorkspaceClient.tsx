'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Copy,
  FileCheck2,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Network,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import {
  defaultWorkspaceData,
  programPhases,
  workspaceSections,
  type AudienceDimension,
  type CalendarItem,
  type Experiment,
  type WorkspaceData,
  type WorkspaceSection,
} from '../workspaceData'
import styles from './workspace.module.css'

// Legacy local-only draft key, kept only to migrate anyone who saved
// before the workspace was backed by Supabase.
const LEGACY_STORAGE_KEY = 'marcatching-creator-workspace-v1'

const sectionIcons: Record<WorkspaceSection, React.ComponentType<{ size?: number }>> = {
  overview: LayoutDashboard,
  audience: Users,
  revenue: Target,
  content: Lightbulb,
  calendar: CalendarDays,
  memory: BrainCircuit,
  conversion: Network,
  experiments: FlaskConical,
  metrics: BarChart3,
  deliverables: ClipboardCheck,
}

const deliverableStatusOrder: WorkspaceData['deliverables'][number]['status'][] = [
  'Not started',
  'In progress',
  'Review',
  'Approved',
]

function cloneDefaultData(): WorkspaceData {
  return JSON.parse(JSON.stringify(defaultWorkspaceData)) as WorkspaceData
}

function mergeWorkspaceData(parsed: unknown): WorkspaceData {
  const fallback = cloneDefaultData()

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return fallback
  }

  const saved = parsed as Partial<WorkspaceData>

  return {
    ...fallback,
    ...saved,
    audience: Array.isArray(saved.audience) ? saved.audience : fallback.audience,
    revenue: saved.revenue && typeof saved.revenue === 'object'
      ? { ...fallback.revenue, ...saved.revenue }
      : fallback.revenue,
    contentIps: Array.isArray(saved.contentIps) ? saved.contentIps : fallback.contentIps,
    calendar: Array.isArray(saved.calendar) ? saved.calendar : fallback.calendar,
    memory: saved.memory && typeof saved.memory === 'object'
      ? { ...fallback.memory, ...saved.memory }
      : fallback.memory,
    conversion: saved.conversion && typeof saved.conversion === 'object'
      ? { ...fallback.conversion, ...saved.conversion }
      : fallback.conversion,
    experiments: Array.isArray(saved.experiments) ? saved.experiments : fallback.experiments,
    metrics: Array.isArray(saved.metrics) ? saved.metrics : fallback.metrics,
    deliverables: Array.isArray(saved.deliverables) ? saved.deliverables : fallback.deliverables,
  }
}

function restoreLegacyWorkspaceData(serialized: string): WorkspaceData {
  try {
    return mergeWorkspaceData(JSON.parse(serialized))
  } catch {
    return cloneDefaultData()
  }
}

function statusClass(status: string) {
  if (status === 'Approved' || status === 'Published' || status === 'Keep') return styles.statusApproved
  if (status === 'Review' || status === 'Ready' || status === 'Running') return styles.statusReview
  if (status === 'In progress' || status === 'Draft' || status === 'Iterate') return styles.statusProgress
  if (status === 'Kill') return styles.statusDanger
  return styles.statusNeutral
}

export default function WorkspaceClient() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [workspace, setWorkspace] = useState<WorkspaceData>(() => cloneDefaultData())
  const [hydrated, setHydrated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [toast, setToast] = useState('')
  const [calendarFilter, setCalendarFilter] = useState<'All' | CalendarItem['status']>('All')
  const [showExperimentForm, setShowExperimentForm] = useState(false)
  const [experimentDraft, setExperimentDraft] = useState({
    name: '',
    hypothesis: '',
    metric: '',
  })
  const skipAutosaveRef = useRef(false)

  // Load this member's workspace from Supabase. If they have an old
  // local-only draft and no row yet, migrate it into their account once.
  useEffect(() => {
    let active = true

    async function hydrate() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return
      if (!user) {
        setHydrated(true)
        return
      }
      setUserId(user.id)

      const { data: row } = await supabase
        .from('creator_workspaces')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!active) return

      if (row?.data) {
        skipAutosaveRef.current = true
        setWorkspace(mergeWorkspaceData(row.data))
      } else {
        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)
        const initial = legacy ? restoreLegacyWorkspaceData(legacy) : cloneDefaultData()
        skipAutosaveRef.current = true
        setWorkspace(initial)
        await supabase
          .from('creator_workspaces')
          .upsert({ user_id: user.id, data: initial, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        if (legacy) window.localStorage.removeItem(LEGACY_STORAGE_KEY)
      }

      if (active) setHydrated(true)
    }

    void hydrate()
    return () => { active = false }
  }, [])

  // Autosave: persist edits to Supabase shortly after the member stops typing,
  // so nothing has to be re-entered next time they open the dashboard.
  useEffect(() => {
    if (!hydrated || !userId) return
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false
      return
    }

    const timeout = window.setTimeout(() => {
      void persistWorkspace(workspace, { silent: true })
    }, 1500)

    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, hydrated, userId])

  async function persistWorkspace(next: WorkspaceData, options: { silent?: boolean } = {}) {
    if (!userId) return

    setSaveStatus('saving')
    const { error } = await supabase
      .from('creator_workspaces')
      .upsert({ user_id: userId, data: next, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

    if (error) {
      setSaveStatus('error')
      if (!options.silent) notify('Gagal menyimpan. Coba lagi.')
      return
    }

    setSaveStatus('saved')
    if (!options.silent) notify('Draft tersimpan ke akunmu.')
  }

  const completedDeliverables = useMemo(
    () => workspace.deliverables.filter(item => item.status === 'Approved').length,
    [workspace.deliverables]
  )

  const activeSectionMeta = workspaceSections.find(item => item.id === activeSection) || workspaceSections[0]

  const filteredCalendar = useMemo(
    () => calendarFilter === 'All'
      ? workspace.calendar
      : workspace.calendar.filter(item => item.status === calendarFilter),
    [calendarFilter, workspace.calendar]
  )

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  function saveWorkspace() {
    void persistWorkspace(workspace)
  }

  async function resetWorkspace() {
    const fresh = cloneDefaultData()
    skipAutosaveRef.current = true
    setWorkspace(fresh)
    await persistWorkspace(fresh, { silent: true })
    notify('Workspace dikembalikan ke blueprint awal.')
  }

  function updateAudience(id: string, value: string) {
    setWorkspace(current => ({
      ...current,
      audience: current.audience.map(item => item.id === id ? { ...item, insight: value } : item),
    }))
  }

  function updateRevenue(field: keyof WorkspaceData['revenue'], value: string) {
    setWorkspace(current => ({ ...current, revenue: { ...current.revenue, [field]: value } }))
  }

  function updateMemory(field: keyof WorkspaceData['memory'], value: string) {
    setWorkspace(current => ({ ...current, memory: { ...current.memory, [field]: value } }))
  }

  function updateCalendarStatus(id: string, status: CalendarItem['status']) {
    setWorkspace(current => ({
      ...current,
      calendar: current.calendar.map(item => item.id === id ? { ...item, status } : item),
    }))
  }

  function cycleDeliverableStatus(id: string) {
    setWorkspace(current => ({
      ...current,
      deliverables: current.deliverables.map(item => {
        if (item.id !== id) return item
        const currentIndex = deliverableStatusOrder.indexOf(item.status)
        return { ...item, status: deliverableStatusOrder[(currentIndex + 1) % deliverableStatusOrder.length] }
      }),
    }))
  }

  function addExperiment(event: React.FormEvent) {
    event.preventDefault()
    if (!experimentDraft.name.trim() || !experimentDraft.hypothesis.trim()) return

    const newExperiment: Experiment = {
      id: `local-${Date.now()}`,
      name: experimentDraft.name.trim(),
      hypothesis: experimentDraft.hypothesis.trim(),
      control: 'Tentukan control',
      variant: 'Tentukan variant',
      metric: experimentDraft.metric.trim() || 'Tentukan primary metric',
      result: 'Belum dimulai',
      decision: 'Running',
    }

    setWorkspace(current => ({ ...current, experiments: [newExperiment, ...current.experiments] }))
    setExperimentDraft({ name: '', hypothesis: '', metric: '' })
    setShowExperimentForm(false)
    notify('Eksperimen baru ditambahkan ke draft.')
  }

  async function copyMemory() {
    const text = [
      'VOICE',
      workspace.memory.voice,
      '',
      'AUDIENCE FACTS',
      workspace.memory.audienceFacts,
      '',
      'RED LINES',
      workspace.memory.redLines,
      '',
      'QUALITY GATE',
      workspace.memory.qualityGate,
    ].join('\n')
    await navigator.clipboard.writeText(text)
    notify('AI Creator Memory disalin.')
  }

  function renderOverview() {
    const activePhase = programPhases[workspace.activePhase]
    const overallProgress = Math.round(((workspace.activePhase + 0.6) / programPhases.length) * 100)

    return (
      <div className={styles.sectionStack}>
        <section className={styles.overviewHero}>
          <div>
            <span className={styles.kicker}><Sparkles size={13} /> 21-day operating sprint</span>
            <h2>Sistem revenue-mu sedang dibangun, bukan sekadar dipelajari.</h2>
            <p>
              Fokus sekarang: selesaikan tiga Content IP sebelum membangun conversion path.
              Satu monetization path, satu scorecard, dan keputusan yang bisa dilacak.
            </p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryButton} onClick={() => setActiveSection('content')}>
                Lanjutkan Content IP <ArrowRight size={16} />
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => setActiveSection('deliverables')}>
                Lihat deliverables
              </button>
            </div>
          </div>
          <div className={styles.progressOrb}>
            <div style={{ '--progress': `${overallProgress * 3.6}deg` } as React.CSSProperties}>
              <strong>{overallProgress}%</strong>
              <span>System installed</span>
            </div>
            <small>Day 8 of 21</small>
          </div>
        </section>

        <section className={styles.overviewStats}>
          <article><span><Target size={17} /></span><div><small>Active phase</small><strong>{activePhase.name}</strong></div></article>
          <article><span><FileCheck2 size={17} /></span><div><small>Approved assets</small><strong>{completedDeliverables}/9</strong></div></article>
          <article><span><FlaskConical size={17} /></span><div><small>Experiments</small><strong>{workspace.experiments.length}</strong></div></article>
          <article><span><CalendarDays size={17} /></span><div><small>Next review</small><strong>Day 11</strong></div></article>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span className={styles.kicker}>Program journey</span><h3>Approval checkpoints</h3></div>
            <span className={styles.mutedLabel}>Day 1–21</span>
          </div>
          <div className={styles.phaseTimeline}>
            {programPhases.map((phase, index) => {
              const complete = index < workspace.activePhase
              const active = index === workspace.activePhase
              return (
                <article key={phase.name} className={`${styles.phaseCard} ${active ? styles.phaseCardActive : ''}`}>
                  <span className={styles.phaseNumber}>{complete ? <Check size={14} /> : index + 1}</span>
                  <small>{phase.timing}</small>
                  <strong>{phase.name}</strong>
                  <p>{phase.output}</p>
                  <span className={`${styles.statusBadge} ${complete ? styles.statusApproved : active ? styles.statusReview : styles.statusNeutral}`}>
                    {complete ? 'Approved' : active ? 'In progress' : 'Locked'}
                  </span>
                </article>
              )
            })}
          </div>
        </section>

        <div className={styles.twoColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.kicker}>Next actions</span><h3>Prioritas minggu ini</h3></div>
              <ListChecks size={19} />
            </div>
            <div className={styles.actionList}>
              {[
                ['Finalisasi tiga Content IP', 'Owner · Creator', 'Today'],
                ['Approve 12 priority angles', 'Owner · Marcatching', 'Tomorrow'],
                ['Siapkan dua CTA variants', 'Owner · Creator', 'Day 10'],
                ['Review Content IP score', 'Joint review', 'Day 11'],
              ].map(([title, owner, due], index) => (
                <button type="button" key={title} onClick={() => setActiveSection(index < 2 ? 'content' : 'experiments')}>
                  <span className={index === 0 ? styles.actionActive : ''}>{index + 1}</span>
                  <div><strong>{title}</strong><small>{owner}</small></div>
                  <b>{due}</b>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.kicker}>Signal health</span><h3>Audience confidence</h3></div>
              <Activity size={19} />
            </div>
            <div className={styles.signalList}>
              {workspace.audience.map(item => (
                <button type="button" key={item.id} onClick={() => setActiveSection('audience')}>
                  <span>{item.label}</span>
                  <i><b style={{ width: `${item.score}%` }} /></i>
                  <strong>{item.score}</strong>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  }

  function renderAudience() {
    const average = Math.round(workspace.audience.reduce((sum, item) => sum + item.score, 0) / workspace.audience.length)
    return (
      <div className={styles.sectionStack}>
        <section className={styles.moduleIntro}>
          <div>
            <span className={styles.kicker}>Evidence before output</span>
            <h2>Audience OS</h2>
            <p>AI hanya boleh membuat angle setelah enam dimensi ini memiliki bukti yang cukup.</p>
          </div>
          <div className={styles.scorePill}><strong>{average}</strong><span>Confidence score</span></div>
        </section>

        <div className={styles.audienceGrid}>
          {workspace.audience.map((item, index) => (
            <AudienceCard key={item.id} item={item} index={index} onChange={updateAudience} />
          ))}
        </div>

        <section className={styles.insightCallout}>
          <BrainCircuit size={22} />
          <div>
            <span className={styles.kicker}>Synthesis</span>
            <h3>Core audience tension</h3>
            <p>
              Mereka ingin dikenal sebagai praktisi yang punya sudut pandang, tetapi takut proses menjual
              membuat kontennya terasa generik. Sistem harus membuat offer terlihat sebagai kelanjutan natural
              dari insight, bukan interupsi.
            </p>
          </div>
        </section>
      </div>
    )
  }

  function renderRevenue() {
    const fields: Array<[keyof WorkspaceData['revenue'], string, string]> = [
      ['buyer', 'Who buys', 'Segmen pembeli paling spesifik'],
      ['whyNow', 'Why now', 'Trigger yang membuat masalah terasa mendesak'],
      ['offer', 'Core offer', 'Satu offer utama untuk sprint ini'],
      ['proof', 'Proof', 'Bukti yang membuat keputusan terasa aman'],
      ['path', 'Monetization path', 'Jalur paling pendek dari perhatian ke transaksi'],
      ['price', 'Price architecture', 'Harga, milestone, dan boundary'],
    ]

    return (
      <div className={styles.sectionStack}>
        <section className={styles.moduleIntro}>
          <div>
            <span className={styles.kicker}>One buyer · one offer · one path</span>
            <h2>Revenue Thesis</h2>
            <p>Dokumen keputusan satu halaman yang menjaga konten tidak kehilangan arah komersial.</p>
          </div>
          <span className={`${styles.statusBadge} ${styles.statusProgress}`}>Draft v1.2</span>
        </section>

        <section className={styles.revenueSheet}>
          <div className={styles.revenueSheetHead}>
            <div><small>Revenue thesis</small><strong>{workspace.businessType}</strong></div>
            <span>Review on Day 6</span>
          </div>
          <div className={styles.revenueFields}>
            {fields.map(([field, label, help]) => (
              <label key={field}>
                <span>{label}<small>{help}</small></span>
                <textarea value={workspace.revenue[field]} onChange={event => updateRevenue(field, event.target.value)} rows={3} />
              </label>
            ))}
          </div>
          <div className={styles.revenueDecision}>
            <CheckCircle2 size={20} />
            <div><strong>Decision rule</strong><p>Jangan menambah offer kedua sebelum path pertama menghasilkan qualified conversation.</p></div>
          </div>
        </section>
      </div>
    )
  }

  function renderContent() {
    return (
      <div className={styles.sectionStack}>
        <section className={styles.moduleIntro}>
          <div>
            <span className={styles.kicker}>Repetition is a feature</span>
            <h2>Content IP Playbook</h2>
            <p>Tiga seri yang masing-masing punya job, format, value, dan CTA yang jelas.</p>
          </div>
          <span className={styles.limitPill}>3/3 IP slots</span>
        </section>

        <div className={styles.contentIpGrid}>
          {workspace.contentIps.map((item, index) => (
            <article key={item.id} className={styles.contentIpCard}>
              <div className={styles.contentIpTop}>
                <span>IP 0{index + 1}</span>
                <span className={`${styles.statusBadge} ${statusClass(item.status)}`}>{item.status}</span>
              </div>
              <h3>{item.name}</h3>
              <p className={styles.contentRole}>{item.role}</p>
              <dl>
                <div><dt>Format</dt><dd>{item.format}</dd></div>
                <div><dt>Hook system</dt><dd>“{item.hook}”</dd></div>
                <div><dt>Value</dt><dd>{item.value}</dd></div>
                <div><dt>CTA role</dt><dd>{item.cta}</dd></div>
              </dl>
              <button type="button" onClick={() => setActiveSection('calendar')}>
                Lihat execution map <ChevronRight size={15} />
              </button>
            </article>
          ))}
        </div>

        <section className={styles.qualityRules}>
          <div><span>01</span><p><strong>Signal attached</strong>Setiap angle punya audience evidence.</p></div>
          <div><span>02</span><p><strong>Repeatable format</strong>Bisa diproduksi minimal empat kali.</p></div>
          <div><span>03</span><p><strong>Commercial role</strong>CTA sesuai intent, bukan hard sell acak.</p></div>
        </section>
      </div>
    )
  }

  function renderCalendar() {
    const statusOptions: Array<'All' | CalendarItem['status']> = ['All', 'Idea', 'Draft', 'Ready', 'Published']

    return (
      <div className={styles.sectionStack}>
        <section className={styles.moduleIntro}>
          <div>
            <span className={styles.kicker}>12 priority executions</span>
            <h2>30-Day Content Map</h2>
            <p>Kalender produksi yang menghubungkan setiap aset dengan Content IP dan CTA.</p>
          </div>
          <span className={styles.limitPill}>{workspace.calendar.filter(item => item.status === 'Published').length} published</span>
        </section>

        <div className={styles.filterRow} role="group" aria-label="Filter status konten">
          {statusOptions.map(status => (
            <button
              type="button"
              key={status}
              className={calendarFilter === status ? styles.filterActive : ''}
              onClick={() => setCalendarFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <section className={styles.calendarBoard}>
          {[1, 2, 3, 4].map(week => {
            const items = filteredCalendar.filter(item => item.week === week)
            return (
              <div key={week} className={styles.calendarWeek}>
                <div className={styles.calendarWeekHead}><span>Week {week}</span><small>{items.length} assets</small></div>
                <div className={styles.calendarItems}>
                  {items.length ? items.map(item => (
                    <article key={item.id}>
                      <div className={styles.calendarDate}><strong>{item.day}</strong><small>W{week}</small></div>
                      <div className={styles.calendarCopy}>
                        <span>{item.contentIp} · {item.format}</span>
                        <h3>{item.title}</h3>
                        <p>CTA: {item.cta}</p>
                      </div>
                      <select
                        value={item.status}
                        onChange={event => updateCalendarStatus(item.id, event.target.value as CalendarItem['status'])}
                        aria-label={`Status ${item.title}`}
                        className={statusClass(item.status)}
                      >
                        <option>Idea</option>
                        <option>Draft</option>
                        <option>Ready</option>
                        <option>Published</option>
                      </select>
                    </article>
                  )) : <p className={styles.noItems}>Tidak ada aset dengan filter ini.</p>}
                </div>
              </div>
            )
          })}
        </section>
      </div>
    )
  }

  function renderMemory() {
    const fields: Array<[keyof WorkspaceData['memory'], string, string]> = [
      ['voice', 'Creator voice', 'Cara brand berbicara dan membangun rasa.'],
      ['audienceFacts', 'Audience facts', 'Konteks yang sudah memiliki bukti.'],
      ['redLines', 'Red lines', 'Larangan, klaim, dan pola yang harus dihindari.'],
      ['qualityGate', 'Output quality gate', 'Syarat minimum sebelum output dipakai.'],
    ]

    return (
      <div className={styles.sectionStack}>
        <section className={styles.moduleIntro}>
          <div>
            <span className={styles.kicker}>Reusable AI context</span>
            <h2>AI Creator Memory</h2>
            <p>Satu sumber konteks agar AI tidak kembali menghasilkan output generik.</p>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={copyMemory}><Copy size={15} /> Copy memory</button>
        </section>

        <section className={styles.memoryTerminal}>
          <div className={styles.terminalBar}><span /><p>creator-memory.md</p><b>Ready for AI</b></div>
          <div className={styles.memoryFields}>
            {fields.map(([field, label, help], index) => (
              <label key={field}>
                <span><b>0{index + 1}</b><strong>{label}</strong><small>{help}</small></span>
                <textarea value={workspace.memory[field]} onChange={event => updateMemory(field, event.target.value)} rows={5} />
              </label>
            ))}
          </div>
        </section>
      </div>
    )
  }

  function renderConversion() {
    const nodes = [
      ['01', 'Attention', workspace.conversion.awareness, 'Content signal'],
      ['02', 'Profile', workspace.conversion.profile, 'Trust bridge'],
      ['03', 'Lead', workspace.conversion.lead, 'Value exchange'],
      ['04', 'Nurture', workspace.conversion.nurture, 'Fit confirmation'],
      ['05', 'Close', workspace.conversion.close, 'Revenue event'],
    ]

    return (
      <div className={styles.sectionStack}>
        <section className={styles.moduleIntro}>
          <div>
            <span className={styles.kicker}>Shortest credible path</span>
            <h2>Conversion Map</h2>
            <p>Definisikan apa yang harus terjadi setelah seseorang berhenti menonton kontenmu.</p>
          </div>
          <span className={`${styles.statusBadge} ${styles.statusProgress}`}>Build on Day 12</span>
        </section>

        <section className={styles.conversionFlow}>
          {nodes.map(([number, title, value, role], index) => (
            <article key={number}>
              <span>{number}</span>
              <small>{role}</small>
              <h3>{title}</h3>
              <p>{value}</p>
              {index < nodes.length - 1 && <ArrowRight className={styles.flowArrow} size={20} />}
            </article>
          ))}
        </section>

        <div className={styles.twoColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}><div><span className={styles.kicker}>Primary CTA</span><h3>“Ketik OS”</h3></div><Target size={20} /></div>
            <p className={styles.panelText}>Low-friction CTA untuk membuka diagnostic conversation sebelum mengirim link.</p>
          </section>
          <section className={styles.panel}>
            <div className={styles.panelHeader}><div><span className={styles.kicker}>Success event</span><h3>Qualified fit call</h3></div><CheckCircle2 size={20} /></div>
            <p className={styles.panelText}>Bukan sekadar link click. Lead harus punya offer, masalah, dan execution capacity.</p>
          </section>
        </div>
      </div>
    )
  }

  function renderExperiments() {
    return (
      <div className={styles.sectionStack}>
        <section className={styles.moduleIntro}>
          <div>
            <span className={styles.kicker}>Hypothesis before content</span>
            <h2>Experiment Log</h2>
            <p>Setiap perubahan punya control, variant, metric, dan keputusan berikutnya.</p>
          </div>
          <button type="button" className={styles.primaryButton} onClick={() => setShowExperimentForm(true)}>
            <Plus size={16} /> Add experiment
          </button>
        </section>

        <div className={styles.experimentList}>
          {workspace.experiments.map((item, index) => (
            <article key={item.id} className={styles.experimentCard}>
              <div className={styles.experimentIndex}>EXP-{String(index + 1).padStart(2, '0')}</div>
              <div className={styles.experimentMain}>
                <div className={styles.experimentTitle}>
                  <div><h3>{item.name}</h3><p>{item.hypothesis}</p></div>
                  <span className={`${styles.statusBadge} ${statusClass(item.decision)}`}>{item.decision}</span>
                </div>
                <div className={styles.experimentGrid}>
                  <div><small>Control</small><p>{item.control}</p></div>
                  <div><small>Variant</small><p>{item.variant}</p></div>
                  <div><small>Primary metric</small><p>{item.metric}</p></div>
                  <div><small>Latest result</small><p>{item.result}</p></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  }

  function renderMetrics() {
    return (
      <div className={styles.sectionStack}>
        <section className={styles.moduleIntro}>
          <div>
            <span className={styles.kicker}>Controllable signal first</span>
            <h2>Metrics Scorecard</h2>
            <p>Bandingkan baseline, posisi saat ini, dan target Day 21 tanpa menjadikan follower sebagai satu-satunya hasil.</p>
          </div>
          <span className={styles.limitPill}>Day 8 snapshot</span>
        </section>

        <section className={styles.metricsSummary}>
          <article><small>Production</small><strong>4 posts/week</strong><span className={styles.metricUp}><TrendingUp size={13} /> +100%</span></article>
          <article><small>Intent</small><strong>42 profile actions</strong><span className={styles.metricUp}><TrendingUp size={13} /> +133%</span></article>
          <article><small>Conversion</small><strong>3 qualified leads</strong><span className={styles.metricUp}><TrendingUp size={13} /> New signal</span></article>
        </section>

        <section className={styles.metricTable}>
          <div className={styles.metricTableHead}>
            <span>Metric</span><span>Baseline</span><span>Current</span><span>Day 21 target</span><span>Progress</span>
          </div>
          {workspace.metrics.map(metric => {
            const lowerIsBetter = metric.label === 'Production time'
            const progress = lowerIsBetter
              ? Math.min(100, Math.round(((metric.baseline - metric.current) / (metric.baseline - metric.target)) * 100))
              : Math.min(100, Math.round((metric.current / metric.target) * 100))
            return (
              <div key={metric.label} className={styles.metricRow}>
                <strong>{metric.label}</strong>
                <span>{metric.baseline.toLocaleString('id-ID')}{metric.suffix}</span>
                <span>{metric.current.toLocaleString('id-ID')}{metric.suffix}</span>
                <span>{metric.target.toLocaleString('id-ID')}{metric.suffix}</span>
                <div><i><b style={{ width: `${Math.max(0, progress)}%` }} /></i><small>{Math.max(0, progress)}%</small></div>
              </div>
            )
          })}
        </section>

        <section className={styles.metricNote}>
          <BarChart3 size={19} />
          <p><strong>Measurement rule:</strong> nilai keberhasilan dari pola yang bisa diulang, qualified intent, dan revenue proxy—bukan satu konten viral.</p>
        </section>
      </div>
    )
  }

  function renderDeliverables() {
    return (
      <div className={styles.sectionStack}>
        <section className={styles.moduleIntro}>
          <div>
            <span className={styles.kicker}>Nine decision assets</span>
            <h2>Program Deliverables</h2>
            <p>Setiap output memiliki status yang jelas: draft, review, atau approved.</p>
          </div>
          <div className={styles.deliveryCount}><strong>{completedDeliverables}/9</strong><span>Approved</span></div>
        </section>

        <section className={styles.deliverablesList}>
          {workspace.deliverables.map(item => (
            <article key={item.id}>
              <span className={styles.deliverableCode}>{item.code}</span>
              <span className={styles.deliverableIcon}><FileText size={18} /></span>
              <div><h3>{item.name}</h3><p>{item.description}</p></div>
              <button
                type="button"
                onClick={() => cycleDeliverableStatus(item.id)}
                className={`${styles.statusBadge} ${statusClass(item.status)}`}
                title="Klik untuk mengubah status"
              >
                {item.status}
              </button>
              <ChevronRight size={17} />
            </article>
          ))}
        </section>
      </div>
    )
  }

  function renderActiveSection() {
    switch (activeSection) {
      case 'audience': return renderAudience()
      case 'revenue': return renderRevenue()
      case 'content': return renderContent()
      case 'calendar': return renderCalendar()
      case 'memory': return renderMemory()
      case 'conversion': return renderConversion()
      case 'experiments': return renderExperiments()
      case 'metrics': return renderMetrics()
      case 'deliverables': return renderDeliverables()
      default: return renderOverview()
    }
  }

  return (
    <div className={styles.workspacePage}>
      <header className={styles.workspaceHeader}>
        <div>
          <span className={styles.kicker}>Creator Revenue OS</span>
          <h1>{activeSectionMeta.label}</h1>
          <p>{activeSectionMeta.description}</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.localBadge}>
            <span />
            {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'error' ? 'Gagal menyimpan' : 'Tersimpan ke akunmu'}
          </span>
          <button type="button" className={styles.iconButton} onClick={resetWorkspace} title="Reset workspace ke blueprint awal"><RotateCcw size={16} /></button>
          <button type="button" className={styles.saveButton} onClick={saveWorkspace} disabled={!hydrated || !userId}>
            <Save size={16} /> Simpan draft
          </button>
        </div>
      </header>

      <div className={styles.workspaceLayout}>
        <aside className={styles.moduleNav} aria-label="Creator Workspace modules">
          <div className={styles.programCard}>
            <span>Current program</span>
            <strong>Founding Creator Sprint</strong>
            <div><i style={{ width: '38%' }} /></div>
            <small>Day 8 of 21 · Content OS</small>
          </div>

          <nav>
            {workspaceSections.map(item => {
              const Icon = sectionIcons[item.id]
              return (
                <button
                  type="button"
                  key={item.id}
                  className={activeSection === item.id ? styles.moduleActive : ''}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span><Icon size={16} /></span>
                  <div><strong>{item.label}</strong><small>{item.description}</small></div>
                  <ChevronRight size={14} />
                </button>
              )
            })}
          </nav>
        </aside>

        <main className={styles.moduleContent}>{renderActiveSection()}</main>
      </div>

      {showExperimentForm && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setShowExperimentForm(false)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="experiment-title" onMouseDown={event => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div><span className={styles.kicker}>New learning loop</span><h2 id="experiment-title">Add experiment</h2></div>
              <button type="button" onClick={() => setShowExperimentForm(false)} aria-label="Tutup"><X size={18} /></button>
            </div>
            <form onSubmit={addExperiment}>
              <label><span>Experiment name</span><input value={experimentDraft.name} onChange={event => setExperimentDraft(current => ({ ...current, name: event.target.value }))} placeholder="Contoh: CTA keyword vs profile link" required /></label>
              <label><span>Hypothesis</span><textarea value={experimentDraft.hypothesis} onChange={event => setExperimentDraft(current => ({ ...current, hypothesis: event.target.value }))} placeholder="Jika kami mengubah..., maka..." rows={4} required /></label>
              <label><span>Primary metric</span><input value={experimentDraft.metric} onChange={event => setExperimentDraft(current => ({ ...current, metric: event.target.value }))} placeholder="Qualified DM per 1.000 views" /></label>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setShowExperimentForm(false)}>Batal</button>
                <button type="submit" className={styles.primaryButton}>Tambah experiment <ArrowRight size={15} /></button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && <div className={styles.toast} role="status"><CheckCircle2 size={17} /> {toast}</div>}
    </div>
  )
}

function AudienceCard({
  item,
  index,
  onChange,
}: {
  item: AudienceDimension
  index: number
  onChange: (id: string, value: string) => void
}) {
  return (
    <article className={styles.audienceCard}>
      <div className={styles.audienceCardTop}>
        <span>0{index + 1}</span>
        <div className={styles.miniScore}><i><b style={{ width: `${item.score}%` }} /></i><strong>{item.score}</strong></div>
      </div>
      <h3>{item.label}</h3>
      <p>{item.prompt}</p>
      <textarea value={item.insight} onChange={event => onChange(item.id, event.target.value)} rows={4} />
      <small>Evidence · {item.evidence}</small>
    </article>
  )
}
