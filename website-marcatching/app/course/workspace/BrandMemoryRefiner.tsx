'use client'

import { useState } from 'react'
import { CheckCircle2, LoaderCircle, MessageCircleQuestion, RefreshCw, Sparkles, TriangleAlert, Undo2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import {
  brandMemorySections,
  collectBrandMemoryInputs,
  hashBrandMemoryInputs,
  type BrandInterviewQuestion,
  type BrandMemorySectionKey,
  type RefinedBrandMemory,
  type WorkspaceData,
} from '../workspaceData'
import styles from './workspace.module.css'

type Busy = 'analyze' | 'generate' | null

type Props = {
  workspace: WorkspaceData
  setWorkspace: React.Dispatch<React.SetStateAction<WorkspaceData>>
  /** Flushes the latest workspace to the account before asking the AI. */
  persist: () => Promise<boolean>
  notify: (message: string) => void
  /** Same gate as Skill creation: the four AI Memory paragraphs are filled. */
  ready: boolean
}

type GeneratePayload = Pick<RefinedBrandMemory, 'sections' | 'gaps' | 'warnings' | 'model'>

const topicLabel = Object.fromEntries(brandMemorySections.map(section => [section.key, section.title])) as Record<BrandMemorySectionKey, string>

export default function BrandMemoryRefiner({ workspace, setWorkspace, persist, notify, ready }: Props) {
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState('')
  const interview = workspace.brandInterview
  const refined = workspace.refinedMemory
  const stale = Boolean(refined && refined.inputHash !== hashBrandMemoryInputs(workspace))

  async function callApi<T>(action: 'analyze' | 'generate', snapshot: WorkspaceData, answers: BrandInterviewQuestion[]) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Login kembali untuk memakai AI.')
    const response = await fetch('/api/workspace/brand-memory', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        inputs: collectBrandMemoryInputs(snapshot),
        answers: answers.map(({ id, topic, question, answer }) => ({ id, topic, question, answer })),
      }),
    })
    const payload = await response.json().catch(() => ({})) as T & { message?: string }
    if (!response.ok) throw new Error(payload.message || 'Brand Memory belum berhasil dirapikan.')
    return payload
  }

  async function write(snapshot: WorkspaceData, questions: BrandInterviewQuestion[]) {
    const hash = hashBrandMemoryInputs(snapshot)
    const result = await callApi<GeneratePayload>('generate', snapshot, questions)
    setWorkspace(current => ({
      ...current,
      brandInterview: questions.length ? { status: 'done', inputHash: hash, questions } : null,
      refinedMemory: {
        status: 'draft',
        inputHash: hash,
        generatedAt: new Date().toISOString(),
        model: result.model,
        sections: result.sections,
        gaps: result.gaps,
        warnings: result.warnings,
      },
    }))
    notify('Draft Brand Memory siap. Baca dan edit dulu sebelum dipakai.')
  }

  async function start() {
    setError('')
    setBusy('analyze')
    try {
      await persist()
      const snapshot = workspace
      const answered = (snapshot.brandInterview?.questions || []).filter(question => question.answer.trim())
      const { questions } = await callApi<{ questions: Array<Pick<BrandInterviewQuestion, 'topic' | 'question' | 'why'>> }>('analyze', snapshot, answered)
      const fresh: BrandInterviewQuestion[] = questions.map((question, index) => ({ ...question, id: `q-${Date.now()}-${index}`, answer: '' }))
      if (!fresh.length) {
        setBusy('generate')
        await write(snapshot, answered)
        return
      }
      setWorkspace(current => ({
        ...current,
        brandInterview: { status: 'asking', inputHash: hashBrandMemoryInputs(snapshot), questions: [...answered, ...fresh] },
      }))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Brand Memory belum berhasil dirapikan.')
    } finally {
      setBusy(null)
    }
  }

  async function submitAnswers() {
    if (!interview) return
    setError('')
    setBusy('generate')
    try {
      await write(workspace, interview.questions)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Brand Memory belum berhasil dirapikan.')
    } finally {
      setBusy(null)
    }
  }

  function setAnswer(id: string, answer: string) {
    setWorkspace(current => current.brandInterview
      ? { ...current, brandInterview: { ...current.brandInterview, questions: current.brandInterview.questions.map(question => question.id === id ? { ...question, answer } : question) } }
      : current)
  }

  /** Keeps answers already given so they are not lost if the creator comes back later. */
  function cancelInterview() {
    setWorkspace(current => {
      const answered = (current.brandInterview?.questions || []).filter(question => question.answer.trim())
      return { ...current, brandInterview: current.brandInterview && answered.length ? { ...current.brandInterview, status: 'done', questions: answered } : null }
    })
  }

  function editSection(key: BrandMemorySectionKey, value: string) {
    setWorkspace(current => current.refinedMemory
      ? { ...current, refinedMemory: { ...current.refinedMemory, sections: { ...current.refinedMemory.sections, [key]: value } } }
      : current)
  }

  function approve() {
    setWorkspace(current => current.refinedMemory
      ? { ...current, refinedMemory: { ...current.refinedMemory, status: 'approved' } }
      : current)
    notify('Versi AI aktif. Download dan Skill sekarang memakai versi ini.')
  }

  function revertToOriginal() {
    setWorkspace(current => ({ ...current, refinedMemory: null }))
    notify('Kembali ke Brand Memory versi asli. Jawaban mentahmu tidak berubah.')
  }

  const working = busy !== null

  if (interview?.status === 'asking') {
    const answeredCount = interview.questions.filter(question => question.answer.trim()).length
    return (
      <section className={styles.aiPanel}>
        <header className={styles.aiPanelHead}>
          <MessageCircleQuestion size={18} />
          <div>
            <strong>Beberapa hal masih kurang jelas</strong>
            <p>Jawab yang kamu tahu. Kosongkan kalau belum tahu — AI akan mencatatnya sebagai &quot;belum diketahui&quot;, bukan menebak.</p>
          </div>
          <b>{answeredCount}/{interview.questions.length} dijawab</b>
        </header>
        <div className={styles.aiQuestions}>
          {interview.questions.map((question, index) => (
            <label key={question.id}>
              <span><b>{index + 1}</b><small>{topicLabel[question.topic]}</small></span>
              <strong>{question.question}</strong>
              {question.why && <em>{question.why}</em>}
              <textarea value={question.answer} onChange={event => setAnswer(question.id, event.target.value)} rows={3} placeholder="Tulis jawabanmu dengan kata-katamu sendiri..." disabled={working} />
            </label>
          ))}
        </div>
        {error && <p className={styles.aiError}><TriangleAlert size={14} /> {error}</p>}
        <div className={styles.aiActions}>
          <button type="button" className={styles.primaryButton} onClick={() => void submitAnswers()} disabled={working}>
            {working ? <LoaderCircle size={15} className={styles.spin} /> : <Sparkles size={15} />} {working ? 'AI sedang menulis...' : 'Buat Brand Memory'}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={cancelInterview} disabled={working}>Batal</button>
        </div>
      </section>
    )
  }

  if (refined) {
    const active = refined.status === 'approved' && !stale
    return (
      <section className={styles.aiPanel}>
        <header className={styles.aiPanelHead}>
          <Sparkles size={18} />
          <div>
            <strong>Brand Memory versi AI</strong>
            <p>
              {active && 'Aktif — dipakai saat kamu download brand-memory.md dan membuat Skill.'}
              {refined.status === 'draft' && 'Draft — belum dipakai. Baca, edit seperlunya, lalu aktifkan.'}
              {refined.status === 'approved' && stale && 'Jawabanmu berubah sejak dirapikan, jadi download dan Skill sementara memakai versi asli.'}
            </p>
          </div>
          <b className={active ? styles.aiBadgeActive : undefined}>{active ? 'Aktif' : refined.status === 'draft' ? 'Draft' : 'Perlu diperbarui'}</b>
        </header>

        {stale && refined.status === 'draft' && <p className={styles.aiNote}><TriangleAlert size={14} /> Jawabanmu berubah sejak draft ini dibuat. Rapikan ulang agar perubahan ikut masuk.</p>}
        {refined.warnings.map(warning => <p key={warning} className={styles.aiNote}><TriangleAlert size={14} /> {warning}</p>)}

        <div className={styles.memoryDocument}>
          {brandMemorySections.map(({ key, title }, index) => (
            <label key={key}>
              <span><b>0{index + 1}</b><strong>{title}</strong></span>
              <textarea value={refined.sections[key]} onChange={event => editSection(key, event.target.value)} rows={8} />
            </label>
          ))}
        </div>

        {refined.gaps.length > 0 && (
          <div className={styles.aiGaps}>
            <strong>Masih belum diketahui</strong>
            <ul>{refined.gaps.map(gap => <li key={gap}>{gap}</li>)}</ul>
            <p>Isi di jawaban Workspace atau lewat &quot;Rapikan ulang&quot; supaya AI punya gambaran yang lebih utuh.</p>
          </div>
        )}

        {error && <p className={styles.aiError}><TriangleAlert size={14} /> {error}</p>}
        <div className={styles.aiActions}>
          {refined.status === 'draft' && <button type="button" className={styles.primaryButton} onClick={approve} disabled={working}><CheckCircle2 size={15} /> Pakai versi ini</button>}
          <button type="button" className={styles.secondaryButton} onClick={() => void start()} disabled={working || !ready}>
            {working ? <LoaderCircle size={15} className={styles.spin} /> : <RefreshCw size={15} />} {working ? 'Memproses...' : 'Rapikan ulang'}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={revertToOriginal} disabled={working}><Undo2 size={15} /> Kembali ke versi asli</button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.aiPanel}>
      <header className={styles.aiPanelHead}>
        <Sparkles size={18} />
        <div>
          <strong>Rapikan dengan AI</strong>
          <p>AI membaca semua jawabanmu, menanyakan hal yang masih kurang jelas, lalu menyusun brand-memory.md yang utuh dan runut. Kamu tetap bisa mengedit sebelum dipakai.</p>
        </div>
      </header>
      <p className={styles.aiFine}>Jawabanmu dikirim ke Google Gemini (paket gratis; Google dapat memakai data tersebut untuk meningkatkan produknya). Jangan sertakan data pribadi pelanggan atau informasi rahasia.</p>
      {error && <p className={styles.aiError}><TriangleAlert size={14} /> {error}</p>}
      <div className={styles.aiActions}>
        <button type="button" className={styles.primaryButton} onClick={() => void start()} disabled={working || !ready}>
          {working ? <LoaderCircle size={15} className={styles.spin} /> : <Sparkles size={15} />} {busy === 'analyze' ? 'AI sedang membaca jawabanmu...' : busy === 'generate' ? 'AI sedang menulis...' : 'Rapikan dengan AI'}
        </button>
        {!ready && <small>Lengkapi dulu keempat paragraf AI Memory (minimal 100 karakter masing-masing).</small>}
      </div>
    </section>
  )
}
