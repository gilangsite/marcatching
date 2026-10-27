'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, LoaderCircle, TriangleAlert } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { memoryParagraphsReady, type WorkspaceData } from '../workspaceData'
import { applyBrandProfile, mergeWorkspaceData } from '../workspaceMerge'
import LandingPageBuilder from '../workspace/LandingPageBuilder'
import styles from '../workspace/workspace.module.css'

type Profile = { creatorName: string; brandProfile: WorkspaceData['brandProfile'] }

const profileKey = (profile: Profile) => JSON.stringify([profile.creatorName, profile.brandProfile])

/**
 * Standalone Landing Page screen (sidebar item). It reads the member's workspace for the brand profile and social
 * links, and sends members whose AI Memory is not finished to the AI Memory section instead of an empty builder.
 */
export default function LandingPageClient() {
  const router = useRouter()
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null)
  const [userId, setUserId] = useState('')
  const [phase, setPhase] = useState<'loading' | 'redirecting' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState('')
  const savedKey = useRef('')
  const latest = useRef<Profile | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return
      if (!user) { router.replace('/login'); return }
      const { data: row, error } = await supabase.from('creator_workspaces').select('data').eq('user_id', user.id).maybeSingle()
      if (!active) return
      if (error) { setMessage('Data workspace belum bisa dimuat. Muat ulang halaman ini.'); setPhase('error'); return }

      const loaded = mergeWorkspaceData(row?.data)
      if (!memoryParagraphsReady(loaded)) {
        // Not ready yet: take them to the step that unlocks this page, with a note explaining why.
        setPhase('redirecting')
        router.replace('/workspace?section=memory&from=landing')
        return
      }
      savedKey.current = profileKey(loaded)
      setUserId(user.id)
      setWorkspace(loaded)
      setPhase('ready')
    }
    void load().catch(() => { if (active) { setMessage('Data workspace belum bisa dimuat. Muat ulang halaman ini.'); setPhase('error') } })
    return () => { active = false }
  }, [router])

  // Only the brand profile is written from here, merged into whatever is stored right now, so edits made in
  // Creator Workspace in another tab are never overwritten with this page's older copy.
  async function flushProfile() {
    const profile = latest.current
    if (!profile || !userId || profileKey(profile) === savedKey.current) return true
    const { data: row } = await supabase.from('creator_workspaces').select('data').eq('user_id', userId).maybeSingle()
    const { error } = await supabase.from('creator_workspaces').upsert({ user_id: userId, data: applyBrandProfile(row?.data, profile), updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) return false
    savedKey.current = profileKey(profile)
    return true
  }

  const flush = useRef(flushProfile)
  useEffect(() => { flush.current = flushProfile })

  useEffect(() => {
    if (!workspace) return
    latest.current = { creatorName: workspace.creatorName, brandProfile: workspace.brandProfile }
    const timer = window.setTimeout(() => { void flush.current() }, 700)
    return () => window.clearTimeout(timer)
  }, [workspace])

  useEffect(() => {
    const save = () => { void flush.current() }
    window.addEventListener('pagehide', save)
    return () => window.removeEventListener('pagehide', save)
  }, [])

  function notify(text: string) {
    setToast(text)
    window.setTimeout(() => setToast(''), 2600)
  }

  return (
    <div className={styles.workspacePage}>
      <header className={styles.workspaceHeader}>
        <div>
          <span className={styles.kicker}>Landing Page</span>
          <h1>Halaman link brand-mu</h1>
          <p>Satu link untuk semua tombol, foto, dan video brand-mu di page.marcatching.com.</p>
        </div>
      </header>

      {(phase === 'loading' || phase === 'redirecting') && (
        <p className={styles.aiFine}><LoaderCircle size={14} className={styles.spin} /> {phase === 'redirecting' ? 'Melengkapi AI Memory dulu. Mengarahkan kamu ke sana...' : 'Memuat...'}</p>
      )}
      {phase === 'error' && <p className={styles.aiError}><TriangleAlert size={14} /> {message}</p>}
      {phase === 'ready' && workspace && (
        <LandingPageBuilder
          workspace={workspace}
          setWorkspace={setWorkspace as React.Dispatch<React.SetStateAction<WorkspaceData>>}
          persist={flushProfile}
          notify={notify}
          memoryReady
          onOpenMemory={() => router.push('/workspace?section=memory')}
        />
      )}
      {toast && <div className={styles.toast} role="status"><CheckCircle2 size={17} /> {toast}</div>}
    </div>
  )
}
