'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Reorder } from 'framer-motion'
import {
  Plus, Pencil, Trash2, LogOut, Globe, Music2,
  Mail, Link as LinkIcon, Camera, Video,
  ShoppingBag, Check, X, ChevronRight, ExternalLink,
  Upload, Image as ImageIcon, Type, MousePointerClick, GripVertical
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
  type: 'button', btn_color: '', text_color: '#000000', text_size: '1rem',
  text_align: 'center', text_bold: false, text_italic: false,
  carousel_aspect_ratio: '16:9', image_data: []
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

  // Upload state
  const [uploadingImage, setUploadingImage] = useState(false)

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
    // Merge existing link data with defaults in case we edit an old link
    setLinkForm({ ...emptyLink, ...link })
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
    if (linkForm.type === 'button' && linkForm.status === 'active' && !linkForm.url) {
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
      type: linkForm.type ?? 'button',
      btn_color: linkForm.btn_color || null,
      text_color: linkForm.text_color || null,
      text_size: linkForm.text_size || null,
      text_align: linkForm.text_align || null,
      text_bold: linkForm.text_bold ?? false,
      text_italic: linkForm.text_italic ?? false,
      carousel_aspect_ratio: linkForm.carousel_aspect_ratio || null,
      image_data: linkForm.image_data || [],
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbymLzpMUo1uT_TC8v96JbJLpQw49UX_o9we76fr4bdV6OCQOKQMrRL7Ehin04ukmXdg/exec'
    if (!appScriptUrl) {
      alert("Apps Script URL is not configured. Please add NEXT_PUBLIC_APPS_SCRIPT_URL to .env.local")
      return
    }

    setUploadingImage(true)
    const newImages = [...(linkForm.image_data || [])]
    
    for (let i = 0; i < files.length; i++) {
       const file = files[i]
       const reader = new FileReader()
       await new Promise<void>((resolve) => {
         reader.onload = async (event) => {
           const base64 = event.target?.result as string
           try {
             const res = await fetch(appScriptUrl, {
               method: 'POST',
               body: JSON.stringify({
                 filename: file.name,
                 mimeType: file.type,
                 base64: base64
               })
             })
             const data = await res.json()
             if (data.status === 'success') {
               newImages.push({ url: data.url, link: '' })
             } else {
               alert("Gagal upload: " + data.message)
             }
           } catch(err) {
             console.error(err)
             alert("Terjadi kesalahan saat upload gambar.")
           }
           resolve()
         }
         reader.readAsDataURL(file)
       })
    }
    setLinkForm(f => ({ ...f, image_data: newImages }))
    setUploadingImage(false)
  }

  function handleImageLinkChange(index: number, url: string) {
    const newImages = [...(linkForm.image_data || [])]
    if (newImages[index]) {
      newImages[index].link = url
      setLinkForm(f => ({ ...f, image_data: newImages }))
    }
  }

  function removeImage(index: number) {
    const newImages = [...(linkForm.image_data || [])]
    newImages.splice(index, 1)
    setLinkForm(f => ({ ...f, image_data: newImages }))
  }

  async function deleteLink(id: string) {
    if (!confirm('Hapus link ini?')) return
    await supabase.from('links').delete().eq('id', id)
    fetchLinks()
  }

  const [reordering, setReordering] = useState(false)

  async function handleReorder(newOrder: Link[]) {
    setLinks(newOrder)
    setReordering(true)

    const updates = newOrder.map((link, idx) => 
      supabase.from('links').update({ order_index: idx + 1 }).eq('id', link.id)
    )
    
    await Promise.all(updates)
    setReordering(false)
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
          <Image src="/logo-type-white.png" alt="Marcatching" width={140} height={34}
            style={{ objectFit: 'contain', height: '32px', width: 'auto' }} />
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
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="label">Tipe Block</label>
                      <div className={styles.typeSelector}>
                        <button type="button" className={`${styles.typeBtn} ${linkForm.type === 'button' ? styles.typeBtnActive : ''}`} onClick={() => setLinkForm(f => ({ ...f, type: 'button' }))}><MousePointerClick size={16}/> Link Button</button>
                        <button type="button" className={`${styles.typeBtn} ${linkForm.type === 'text' ? styles.typeBtnActive : ''}`} onClick={() => setLinkForm(f => ({ ...f, type: 'text' }))}><Type size={16}/> Text Block</button>
                        <button type="button" className={`${styles.typeBtn} ${linkForm.type === 'carousel' ? styles.typeBtnActive : ''}`} onClick={() => setLinkForm(f => ({ ...f, type: 'carousel' }))}><ImageIcon size={16}/> Image Carousel</button>
                      </div>
                    </div>

                    {linkForm.type === 'button' && (
                      <>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="label">Judul Tombol *</label>
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
                          <label className="label">Warna Tombol</label>
                          <div className={styles.colorInputWrap}>
                            <input type="color" className={styles.colorPicker} value={linkForm.btn_color || '#ffffff'} onChange={e => setLinkForm(f => ({ ...f, btn_color: e.target.value }))} />
                            <input type="text" className="input" style={{flex: 1}} placeholder="#0d3369 atau kosong" value={linkForm.btn_color || ''} onChange={e => setLinkForm(f => ({ ...f, btn_color: e.target.value }))} />
                          </div>
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
                      </>
                    )}

                    {linkForm.type === 'text' && (
                      <>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="label">Isi Text *</label>
                          <textarea className="input" placeholder="Masukkan text di sini..." rows={3}
                            value={linkForm.title ?? ''} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label className="label">Warna Text</label>
                          <div className={styles.colorInputWrap}>
                            <input type="color" className={styles.colorPicker} value={linkForm.text_color || '#000000'} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} />
                            <input type="text" className="input" style={{flex: 1}} placeholder="#000000 atau #ffffff" value={linkForm.text_color || ''} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="label">Ukuran Text</label>
                          <select className="select" value={linkForm.text_size || '1rem'} onChange={e => setLinkForm(f => ({ ...f, text_size: e.target.value }))}>
                            <option value="0.875rem">Kecil (Small)</option>
                            <option value="1rem">Normal (Base)</option>
                            <option value="1.25rem">Besar (Large)</option>
                            <option value="1.5rem">Lebih Besar (Extra Large)</option>
                            <option value="2rem">Judul Utama (Title)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Alignment</label>
                          <select className="select" value={linkForm.text_align || 'center'} onChange={e => setLinkForm(f => ({ ...f, text_align: e.target.value }))}>
                            <option value="left">Rata Kiri</option>
                            <option value="center">Rata Tengah</option>
                            <option value="right">Rata Kanan</option>
                            <option value="justify">Rata Kiri Kanan</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Style Font</label>
                          <div className={styles.checkboxGroup}>
                            <label className={styles.checkboxLabel}>
                              <input type="checkbox" checked={linkForm.text_bold || false} onChange={e => setLinkForm(f => ({ ...f, text_bold: e.target.checked }))} /> Bold
                            </label>
                            <label className={styles.checkboxLabel}>
                              <input type="checkbox" checked={linkForm.text_italic || false} onChange={e => setLinkForm(f => ({ ...f, text_italic: e.target.checked }))} /> Italic
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {linkForm.type === 'carousel' && (
                      <>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="label">Judul Internal (Hanya penanda) *</label>
                          <input className="input" placeholder="cth: Poster Event"
                            value={linkForm.title ?? ''} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label className="label">Aspect Ratio Gambar</label>
                          <select className="select" value={linkForm.carousel_aspect_ratio || '16:9'} onChange={e => setLinkForm(f => ({ ...f, carousel_aspect_ratio: e.target.value }))}>
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Potrait)</option>
                            <option value="4:5">4:5 (Standard IG)</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="label">Upload Gambar <small>(Bisa pilih lebih dari 1)</small></label>
                          <div className={styles.uploadArea}>
                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className={styles.fileInput} />
                            <div className={styles.uploadLabel}>
                              <Upload size={20} />
                              {uploadingImage ? 'Mengupload gambar...' : 'Klik atau Drag & Drop gambar di sini'}
                            </div>
                          </div>
                          <div className={styles.imageList}>
                            {(linkForm.image_data || []).map((img: any, idx: number) => {
                              let previewUrl = img.url;
                              if (previewUrl && previewUrl.includes('drive.google.com/uc')) {
                                const fileIdMatch = previewUrl.match(/id=([^&]+)/);
                                if (fileIdMatch && fileIdMatch[1]) {
                                  // Fix Google Drive generic hotlinking block in preview
                                  previewUrl = `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w500-h500`;
                                }
                              }
                              return (
                              <div key={idx} className={styles.imageItem}>
                                <div className={styles.imagePreviewWrap} style={{aspectRatio: linkForm.carousel_aspect_ratio?.replace(':', '/') || '16/9'}}>
                                  <img src={previewUrl} alt={`Preview ${idx}`} className={styles.imagePreview} />
                                </div>
                                <div className={styles.imageItemDetails}>
                                  <input type="text" className="input" style={{fontSize: '0.8rem', padding: '0.4rem 0.6rem'}} placeholder="Link tujuan saat di klik (opsional)" value={img.link || ''} onChange={(e) => handleImageLinkChange(idx, e.target.value)} />
                                  <button type="button" className="btn btn-ghost" style={{padding: '0.4rem', color: '#ff4444'}} onClick={() => removeImage(idx)}><Trash2 size={16}/></button>
                                </div>
                              </div>
                            )})}
                          </div>
                        </div>
                      </>
                    )}

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
              <Reorder.Group axis="y" values={links} onReorder={handleReorder} className={styles.linksList} style={{ listStyleType: 'none', padding: 0, margin: 0, gap: '12px', display: 'flex', flexDirection: 'column' }}>
                {links.map(link => {
                  const IconComp = ICON_MAP[link.icon] ?? LinkIcon
                  return (
                    <Reorder.Item value={link} key={link.id} className={styles.linkRow} initial={false} style={{ cursor: 'grab' }}>
                      <div className={styles.linkDragHandle} title="Tarik untuk memindahkan" style={{ padding: '0 12px 0 4px', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GripVertical size={16} color="var(--text-secondary)" />
                      </div>
                      <div className={styles.linkIcon}>
                        <IconComp size={18} strokeWidth={1.75} />
                      </div>
                      <div className={styles.linkInfo}>
                        <span className={styles.linkTypeBadge}>{link.type === 'carousel' ? 'Carousel' : link.type === 'text' ? 'Text Block' : 'Button'}</span>
                        <span className={styles.linkTitle} style={{marginTop: 4}}>{link.title}</span>
                        {link.type === 'button' && (
                          <span className={styles.linkUrl}>
                            {link.url ?? '—'} ·{' '}
                            <span className={link.status === 'active' ? styles.statusActive : styles.statusSoon}>
                              {link.status === 'active' ? 'Active' : 'Coming Soon'}
                            </span>
                          </span>
                        )}
                        {link.type === 'carousel' && (
                          <span className={styles.linkUrl}>
                            {link.carousel_aspect_ratio} · {Array.isArray(link.image_data) ? link.image_data.length : 0} Images
                          </span>
                        )}
                      </div>
                      <div className={styles.linkActions}>
                        <button className={styles.editBtn} onClick={() => openEditLink(link)} title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button className={styles.deleteBtn} onClick={() => deleteLink(link.id)} title="Hapus">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
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
