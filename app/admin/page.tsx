'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Plus, Pencil, Trash2, LogOut, Globe, Music2,
  Mail, Link as LinkIcon, Camera, Video,
  ShoppingBag, Check, X, ChevronRight, ExternalLink,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Link, Contact } from '@/lib/supabaseClient'
import styles from './admin.module.css'

// ─── Icon map ────────────────────────────────────────────────
const ICON_OPTIONS = [
  { value: 'Globe', label: 'Globe (Website)', Icon: Globe },
  { value: 'Instagram', label: 'Instagram (Camera)', Icon: Camera },
  { value: 'Video', label: 'YouTube (Video)', Icon: Video },
  { value: 'Music2', label: 'TikTok / Music', Icon: Music2 },
  { value: 'Mail', label: 'Email', Icon: Mail },
  { value: 'Link', label: 'Generic Link', Icon: LinkIcon },
  { value: 'ShoppingBag', label: 'Shop', Icon: ShoppingBag },
  { value: 'ExternalLink', label: 'External Link', Icon: ExternalLink },
]

const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(
  ICON_OPTIONS.map(({ value, Icon }) => [value, Icon])
)

// ─── Empty forms ─────────────────────────────────────────────
const emptyLink: Partial<Link> = {
  title: '', url: '', icon: 'Globe', status: 'active', order_index: 0,
}

// ─── Main component ───────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()

  // Tab state
  const [tab, setTab] = useState<'links' | 'contact'>('links')

  // Links state
  const [links, setLinks] = useState<Link[]>([])
  const [linksLoading, setLinksLoading] = useState(true)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [linkForm, setLinkForm] = useState<Partial<Link>>(emptyLink)
  const [linkSaving, setLinkSaving] = useState(false)
  const [linkError, setLinkError] = useState('')

  // Contact state
  const [contact, setContact] = useState<Contact | null>(null)
  const [contactLoading, setContactLoading] = useState(true)
  const [contactEmail, setContactEmail] = useState('')
  const [contactSaving, setContactSaving] = useState(false)
  const [contactMsg, setContactMsg] = useState('')

  // ── Fetch links ─────────────────────────────────────────────
  async function fetchLinks() {
    setLinksLoading(true)
    const { data } = await supabase.from('links').select('*').order('order_index')
    setLinks(data ?? [])
    setLinksLoading(false)
  }

  // ── Fetch contact ────────────────────────────────────────────
  async function fetchContact() {
    setContactLoading(true)
    const { data } = await supabase.from('contact').select('*').limit(1).single()
    setContact(data)
    setContactEmail(data?.email ?? '')
    setContactLoading(false)
  }

  useEffect(() => {
    fetchLinks()
    fetchContact()
  }, [])

  // ── Logout ───────────────────────────────────────────────────
  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  // ── Link CRUD ─────────────────────────────────────────────────
  function openAddLink() {
    setEditingLink(null)
    setLinkForm({ ...emptyLink, order_index: links.length + 1 })
    setLinkError('')
    setShowLinkForm(true)
  }

  function openEditLink(link: Link) {
    setEditingLink(link)
    setLinkForm({ ...link })
    setLinkError('')
    setShowLinkForm(true)
  }

  function cancelLinkForm() {
    setShowLinkForm(false)
    setEditingLink(null)
    setLinkError('')
  }

  async function saveLink(e: FormEvent) {
    e.preventDefault()
    if (!linkForm.title) { setLinkError('Judul wajib diisi.'); return }
    if (linkForm.status === 'active' && !linkForm.url) {
      setLinkError('URL wajib diisi untuk link aktif.'); return
    }
    setLinkSaving(true)
    setLinkError('')

    const payload = {
      title: linkForm.title,
      url: linkForm.status === 'coming_soon' ? null : (linkForm.url || null),
      icon: linkForm.icon ?? 'Globe',
      status: linkForm.status ?? 'active',
      order_index: linkForm.order_index ?? links.length + 1,
    }

    let error
    if (editingLink) {
      ({ error } = await supabase.from('links').update(payload).eq('id', editingLink.id))
    } else {
      ({ error } = await supabase.from('links').insert(payload))
    }

    setLinkSaving(false)
    if (error) {
      setLinkError('Terjadi kesalahan: ' + error.message)
    } else {
      setShowLinkForm(false)
      setEditingLink(null)
      fetchLinks()
    }
  }

  async function deleteLink(id: string) {
    if (!confirm('Hapus link ini?')) return
    await supabase.from('links').delete().eq('id', id)
    fetchLinks()
  }

  // ── Contact CRUD ─────────────────────────────────────────────
  async function saveContact(e: FormEvent) {
    e.preventDefault()
    setContactSaving(true)
    setContactMsg('')

    if (contact) {
      const { error } = await supabase.from('contact').update({ email: contactEmail }).eq('id', contact.id)
      if (error) {
        setContactMsg('❌ Error: ' + error.message)
      } else {
        setContactMsg('✓ Email berhasil disimpan.')
        fetchContact()
      }
    } else {
      const { error } = await supabase.from('contact').insert({ email: contactEmail })
      if (error) {
        setContactMsg('❌ Error: ' + error.message)
      } else {
        setContactMsg('✓ Email berhasil disimpan.')
        fetchContact()
      }
    }
    setContactSaving(false)
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Image src="/logo-type-navy.png" alt="Marcatching" width={130} height={34}
            style={{ objectFit: 'contain', height: '28px', width: 'auto' }} />
          <span className={styles.adminBadge}>Admin</span>
        </div>

        <nav className={styles.sidenav}>
          <button
            className={`${styles.navItem} ${tab === 'links' ? styles.navActive : ''}`}
            onClick={() => setTab('links')}
          >
            <ExternalLink size={18} />
            Links & Buttons
          </button>
          <button
            className={`${styles.navItem} ${tab === 'contact' ? styles.navActive : ''}`}
            onClick={() => setTab('contact')}
          >
            <Mail size={18} />
            Contact Info
          </button>
        </nav>

        <div className={styles.sidebarBottom}>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.viewSite}>
            <ChevronRight size={14} />
            Lihat Website
          </a>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.content}>

        {/* ── LINKS TAB ─────────────────────────────────────── */}
        {tab === 'links' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.contentTitle}>Links & Buttons</h1>
                <p className={styles.contentDesc}>Kelola link yang tampil di landing page</p>
              </div>
              <button className="btn btn-navy" onClick={openAddLink}>
                <Plus size={16} />
                Tambah Link
              </button>
            </div>

            {/* Add/Edit Form */}
            {showLinkForm && (
              <div className={styles.formCard}>
                <div className={styles.formCardHeader}>
                  <h2 className={styles.formTitle}>
                    {editingLink ? 'Edit Link' : 'Tambah Link Baru'}
                  </h2>
                  <button onClick={cancelLinkForm} className={styles.closeBtn}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={saveLink} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className="form-group">
                      <label className="label">Judul *</label>
                      <input className="input" placeholder="cth: Instagram Marcatching"
                        value={linkForm.title ?? ''} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} />
                    </div>

                    <div className="form-group">
                      <label className="label">URL</label>
                      <input className="input" placeholder="https://..."
                        value={linkForm.url ?? ''}
                        disabled={linkForm.status === 'coming_soon'}
                        onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} />
                    </div>

                    <div className="form-group">
                      <label className="label">Icon</label>
                      <select className="select"
                        value={linkForm.icon ?? 'Globe'}
                        onChange={e => setLinkForm(f => ({ ...f, icon: e.target.value }))}>
                        {ICON_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Status</label>
                      <select className="select"
                        value={linkForm.status ?? 'active'}
                        onChange={e => setLinkForm(f => ({ ...f, status: e.target.value as 'active' | 'coming_soon' }))}>
                        <option value="active">Active</option>
                        <option value="coming_soon">Coming Soon</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Urutan</label>
                      <input className="input" type="number" min={1}
                        value={linkForm.order_index ?? 1}
                        onChange={e => setLinkForm(f => ({ ...f, order_index: Number(e.target.value) }))} />
                    </div>
                  </div>

                  {linkError && <p className={styles.formError}>{linkError}</p>}

                  <div className={styles.formActions}>
                    <button type="button" className="btn btn-ghost" onClick={cancelLinkForm}>Batal</button>
                    <button type="submit" className="btn btn-navy" disabled={linkSaving}>
                      {linkSaving ? 'Menyimpan...' : (
                        <><Check size={16} /> Simpan</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Links list */}
            {linksLoading ? (
              <div className={styles.loading}>Memuat data...</div>
            ) : links.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Belum ada link. Tambahkan link pertama Anda.</p>
              </div>
            ) : (
              <div className={styles.linksList}>
                {links.map(link => {
                  const IconComp = ICON_MAP[link.icon] ?? LinkIcon
                  return (
                    <div key={link.id} className={styles.linkRow}>
                      <div className={styles.linkIcon}>
                        <IconComp size={18} strokeWidth={1.75} />
                      </div>
                      <div className={styles.linkInfo}>
                        <span className={styles.linkTitle}>{link.title}</span>
                        <span className={styles.linkUrl}>
                          {link.url ?? '—'} ·{' '}
                          <span className={link.status === 'active' ? styles.statusActive : styles.statusSoon}>
                            {link.status === 'active' ? 'Active' : 'Coming Soon'}
                          </span>
                        </span>
                      </div>
                      <div className={styles.linkActions}>
                        <button className={styles.editBtn} onClick={() => openEditLink(link)} title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button className={styles.deleteBtn} onClick={() => deleteLink(link.id)} title="Hapus">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CONTACT TAB ───────────────────────────────────── */}
        {tab === 'contact' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.contentTitle}>Contact Info</h1>
                <p className={styles.contentDesc}>Kelola email kontak yang tampil di landing page</p>
              </div>
            </div>

            <div className={styles.formCard} style={{ maxWidth: 480 }}>
              <h2 className={styles.formTitle}>Email Kontak</h2>
              {contactLoading ? (
                <div className={styles.loading}>Memuat...</div>
              ) : (
                <form onSubmit={saveContact} className={styles.form}>
                  <div className="form-group">
                    <label className="label">Alamat Email *</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="email@marcatching.com"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                  {contactMsg && (
                    <p className={contactMsg.startsWith('✓') ? styles.successMsg : styles.formError}>
                      {contactMsg}
                    </p>
                  )}
                  <div className={styles.formActions}>
                    <button type="submit" className="btn btn-navy" disabled={contactSaving}>
                      {contactSaving ? 'Menyimpan...' : (
                        <><Check size={16} /> Simpan Email</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
