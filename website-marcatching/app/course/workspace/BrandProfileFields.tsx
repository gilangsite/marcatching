'use client'

import type { WorkspaceData } from '../workspaceData'
import styles from './workspace.module.css'

type Props = {
  workspace: WorkspaceData
  setWorkspace: React.Dispatch<React.SetStateAction<WorkspaceData>>
}

/**
 * Optional public details of the brand. Shared by the first-run setup and the landing page builder, and stored in
 * the workspace so they also feed Brand Memory (name, description) and the landing page's starter buttons.
 */
export default function BrandProfileFields({ workspace, setWorkspace }: Props) {
  const profile = workspace.brandProfile
  const patch = (partial: Partial<WorkspaceData['brandProfile']>) => setWorkspace(current => ({ ...current, brandProfile: { ...current.brandProfile, ...partial } }))

  return (
    <div className={styles.profileGrid}>
      <label>
        <b>Nama brand</b>
        <input value={workspace.creatorName} maxLength={80} onChange={event => setWorkspace(current => ({ ...current, creatorName: event.target.value }))} placeholder="Contoh: Kopi Sore" />
      </label>
      <label>
        <b>Official website</b>
        <input value={profile.website} maxLength={300} onChange={event => patch({ website: event.target.value })} placeholder="kopisore.id" inputMode="url" />
      </label>
      <label>
        <b>WhatsApp</b>
        <input value={profile.whatsapp} maxLength={40} onChange={event => patch({ whatsapp: event.target.value })} placeholder="0812-3456-7890" inputMode="tel" />
      </label>
      <label>
        <b>Email</b>
        <input value={profile.email} maxLength={120} onChange={event => patch({ email: event.target.value })} placeholder="halo@kopisore.id" inputMode="email" />
      </label>
      <label className={styles.profileWide}>
        <b>Deskripsi singkat brand</b>
        <textarea value={profile.description} maxLength={400} rows={3} onChange={event => patch({ description: event.target.value })} placeholder="Satu atau dua kalimat: brand ini menjual apa dan untuk siapa." />
        <small>{profile.description.length}/400</small>
      </label>
    </div>
  )
}
