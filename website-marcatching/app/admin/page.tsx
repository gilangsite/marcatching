'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Reorder, useDragControls } from 'framer-motion'
import {
  Plus, Pencil, Trash2, LogOut, Globe, Music2,
  Mail, Link as LinkIcon, Camera, Video,
  ShoppingBag, Check, X, ChevronRight, ExternalLink,
  Upload, Image as ImageIcon, Type, MousePointerClick, GripVertical, Menu,
  Package, Tag, ClipboardList, Eye, EyeOff
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Link, Contact, Product, Voucher, Order } from '@/lib/supabaseClient'
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

const emptyLink: Partial<Link> = {
  title: '', url: '', icon: 'Globe', status: 'active', order_index: 0,
  type: 'button', btn_color: '', text_color: '#000000', text_size: '1rem',
  text_align: 'center', text_bold: false, text_italic: false,
  carousel_aspect_ratio: '16:9', image_data: []
}

// ─── Format helpers ──────────────────────────────────────────
function formatRp(num: number): string {
  return num.toLocaleString('id-ID')
}
function parseRp(str: string): number {
  return parseInt(str.replace(/\D/g, '')) || 0
}
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── Sortable Item ─────────────────────────────────────────
function SortableLinkItem({ link, onEdit, onDelete }: { link: Link, onEdit: (l: Link) => void, onDelete: (id: string) => void }) {
  const controls = useDragControls()
  const IconComp = ICON_MAP[link.icon] ?? LinkIcon
  return (
    <Reorder.Item value={link} dragListener={false} dragControls={controls} className={styles.linkRow} initial={false} style={{ cursor: 'default' }}>
      <div className={styles.linkDragHandle} title="Tarik untuk memindahkan" onPointerDown={(e) => controls.start(e)}
        style={{ padding: '0 12px 0 4px', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none' }}>
        <GripVertical size={16} color="var(--text-secondary)" />
      </div>
      <div onClick={() => onEdit(link)} style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer', gap: '16px' }}>
        <div className={styles.linkIcon} style={{ margin: 0 }}><IconComp size={18} strokeWidth={1.75} /></div>
        <div className={styles.linkInfo}>
          <span className={styles.linkTypeBadge}>{link.type === 'video' ? 'Video' : link.type === 'carousel' ? 'Carousel' : link.type === 'text' ? 'Text Block' : 'Button'}</span>
          <span className={styles.linkTitle} style={{marginTop: 4, display: 'block'}}>{link.title}</span>
          {link.type === 'button' && (
            <span className={styles.linkUrl}>{link.url ?? '—'} · <span className={link.status === 'active' ? styles.statusActive : styles.statusSoon}>{link.status === 'active' ? 'Active' : 'Coming Soon'}</span></span>
          )}
        </div>
      </div>
      <div className={styles.linkActions}>
        <button className={styles.editBtn} onClick={() => onEdit(link)} title="Edit"><Pencil size={15} /></button>
        <button className={styles.deleteBtn} onClick={() => onDelete(link.id)} title="Hapus"><Trash2 size={15} /></button>
      </div>
    </Reorder.Item>
  )
}

// ─── Main component ───────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  type TabType = 'links' | 'contact' | 'products' | 'vouchers' | 'orders'
  const [tab, setTab] = useState<TabType>('links')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Links state
  const [links, setLinks] = useState<Link[]>([])
  const [linksLoading, setLinksLoading] = useState(true)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [linkForm, setLinkForm] = useState<Partial<Link>>(emptyLink)
  const [linkSaving, setLinkSaving] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [contact, setContact] = useState<Contact | null>(null)
  const [contactLoading, setContactLoading] = useState(true)
  const [contactEmail, setContactEmail] = useState('')
  const [contactSaving, setContactSaving] = useState(false)
  const [contactMsg, setContactMsg] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [pf, setPf] = useState({ name: '', sub_headline: '', description: '', image_url: '', price_before: '', price_after: '', discount: '', features: [] as string[], is_active: true })
  const [newFeature, setNewFeature] = useState('')
  const [productSaving, setProductSaving] = useState(false)
  const [productError, setProductError] = useState('')
  const [uploadingPoster, setUploadingPoster] = useState(false)

  // Vouchers state
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [vouchersLoading, setVouchersLoading] = useState(true)
  const [showVoucherForm, setShowVoucherForm] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [vf, setVf] = useState({ code: '', discount_value: '', discount_type: 'fixed' as 'fixed' | 'percentage', is_active: true })
  const [voucherSaving, setVoucherSaving] = useState(false)
  const [voucherError, setVoucherError] = useState('')

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  // ── Fetch all ─────────────────────────────────────────────
  async function fetchLinks() { setLinksLoading(true); const { data } = await supabase.from('links').select('*').order('order_index'); setLinks(data ?? []); setLinksLoading(false) }
  async function fetchContact() { setContactLoading(true); const { data } = await supabase.from('contact').select('*').limit(1).single(); setContact(data); setContactEmail(data?.email ?? ''); setContactLoading(false) }
  async function fetchProducts() { setProductsLoading(true); const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }); setProducts(data ?? []); setProductsLoading(false) }
  async function fetchVouchers() { setVouchersLoading(true); const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false }); setVouchers(data ?? []); setVouchersLoading(false) }
  async function fetchOrders() { setOrdersLoading(true); const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }); setOrders(data ?? []); setOrdersLoading(false) }

  useEffect(() => { fetchLinks(); fetchContact(); fetchProducts(); fetchVouchers(); fetchOrders() }, [])

  async function handleLogout() { await fetch('/api/auth', { method: 'DELETE' }); router.push('/admin/login') }

  // ── Link CRUD (kept from original) ─────────────────────────
  function handleAddSpecific(type: 'button'|'text'|'carousel'|'video') { setShowAddMenu(false); setTab('links'); setEditingLink(null); setLinkForm({ ...emptyLink, type, order_index: links.length + 1 }); setLinkError(''); setShowLinkForm(true) }
  function openEditLink(link: Link) { setEditingLink(link); setLinkForm({ ...emptyLink, ...link }); setLinkError(''); setShowLinkForm(true) }
  function cancelLinkForm() { setShowLinkForm(false); setEditingLink(null); setLinkError('') }

  async function saveLink(e: FormEvent) {
    e.preventDefault()
    if (!linkForm.title) { setLinkError('Judul wajib diisi.'); return }
    if (linkForm.type === 'button' && linkForm.status === 'active' && !linkForm.url) { setLinkError('URL wajib diisi untuk link aktif.'); return }
    if (linkForm.type === 'video' && !linkForm.url) { setLinkError('URL Video wajib diisi.'); return }
    setLinkSaving(true); setLinkError('')
    const payload = { title: linkForm.title, url: linkForm.status === 'coming_soon' ? null : (linkForm.url || null), icon: linkForm.icon ?? 'Globe', status: linkForm.status ?? 'active', order_index: linkForm.order_index ?? links.length + 1, type: linkForm.type ?? 'button', btn_color: linkForm.btn_color || null, text_color: linkForm.text_color || null, text_size: linkForm.text_size || null, text_align: linkForm.text_align || null, text_bold: linkForm.text_bold ?? false, text_italic: linkForm.text_italic ?? false, carousel_aspect_ratio: linkForm.carousel_aspect_ratio || null, image_data: linkForm.image_data || [] }
    let error
    if (editingLink) { ({ error } = await supabase.from('links').update(payload).eq('id', editingLink.id)) } else { ({ error } = await supabase.from('links').insert(payload)) }
    setLinkSaving(false)
    if (error) { setLinkError('Terjadi kesalahan: ' + error.message) } else { setShowLinkForm(false); setEditingLink(null); fetchLinks() }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files; if (!files || files.length === 0) return
    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz9ieB6Tvnz6EBhUh-E2JSHbgL5Nxen7r50VgsGnycH3teRo5uWLCsST-x6I2NdV3Ku/exec'
    setUploadingImage(true)
    const newImages = [...(linkForm.image_data || [])]
    for (let i = 0; i < files.length; i++) {
      const file = files[i]; const reader = new FileReader()
      await new Promise<void>((resolve) => {
        reader.onload = async (event) => {
          const base64 = event.target?.result as string
          try { const res = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'upload', filename: file.name, mimeType: file.type, base64 }) }); const data = await res.json(); if (data.status === 'success') { newImages.push({ url: data.url, link: '' }) } else { alert("Gagal upload: " + data.message) } } catch { alert("Terjadi kesalahan saat upload gambar.") }
          resolve()
        }; reader.readAsDataURL(file)
      })
    }
    setLinkForm(f => ({ ...f, image_data: newImages })); setUploadingImage(false)
  }
  function handleImageLinkChange(index: number, url: string) { const n = [...(linkForm.image_data || [])]; if (n[index]) { n[index].link = url; setLinkForm(f => ({ ...f, image_data: n })) } }
  function removeImage(index: number) { const n = [...(linkForm.image_data || [])]; n.splice(index, 1); setLinkForm(f => ({ ...f, image_data: n })) }
  async function deleteLink(id: string) { if (!confirm('Hapus link ini?')) return; await supabase.from('links').delete().eq('id', id); fetchLinks() }
  const [reordering, setReordering] = useState(false)
  async function handleReorder(newOrder: Link[]) { setLinks(newOrder); setReordering(true); await Promise.all(newOrder.map((link, idx) => supabase.from('links').update({ order_index: idx + 1 }).eq('id', link.id))); setReordering(false) }

  async function saveContact(e: FormEvent) {
    e.preventDefault(); setContactSaving(true); setContactMsg('')
    if (contact) { const { error } = await supabase.from('contact').update({ email: contactEmail }).eq('id', contact.id); setContactMsg(error ? '❌ Error: ' + error.message : '✓ Email berhasil disimpan.'); fetchContact() }
    else { const { error } = await supabase.from('contact').insert({ email: contactEmail }); setContactMsg(error ? '❌ Error: ' + error.message : '✓ Email berhasil disimpan.'); fetchContact() }
    setContactSaving(false)
  }

  // ── Product CRUD ─────────────────────────────────────────────
  function openAddProduct() {
    setEditingProduct(null); setPf({ name: '', sub_headline: '', description: '', image_url: '', price_before: '', price_after: '', discount: '', features: [], is_active: true }); setProductError(''); setShowProductForm(true)
  }
  function openEditProduct(p: Product) {
    setEditingProduct(p); setPf({ name: p.name, sub_headline: p.sub_headline || '', description: p.description || '', image_url: p.image_url || '', price_before: p.price_before_discount?.toString() || '', price_after: p.price_after_discount?.toString() || '', discount: p.discount_percentage?.toString() || '', features: Array.isArray(p.features) ? p.features : [], is_active: p.is_active }); setProductError(''); setShowProductForm(true)
  }

  // Price interlinked calculator
  function handlePriceBefore(val: string) {
    const num = parseRp(val); setPf(f => {
      const d = parseRp(f.discount); const after = d > 0 ? Math.round(num * (1 - d / 100)) : parseRp(f.price_after)
      return { ...f, price_before: num.toString(), price_after: after.toString() }
    })
  }
  function handlePriceAfter(val: string) {
    const num = parseRp(val); setPf(f => {
      const before = parseRp(f.price_before); const d = before > 0 ? Math.round((1 - num / before) * 100) : 0
      return { ...f, price_after: num.toString(), discount: d > 0 ? d.toString() : '' }
    })
  }
  function handleDiscount(val: string) {
    const num = parseInt(val.replace(/\D/g, '')) || 0; setPf(f => {
      const before = parseRp(f.price_before); const after = before > 0 ? Math.round(before * (1 - num / 100)) : parseRp(f.price_after)
      return { ...f, discount: num.toString(), price_after: after.toString() }
    })
  }

  function addFeature() { if (!newFeature.trim()) return; setPf(f => ({ ...f, features: [...f.features, newFeature.trim()] })); setNewFeature('') }
  function removeFeature(i: number) { setPf(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) })) }

  async function handlePosterUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz9ieB6Tvnz6EBhUh-E2JSHbgL5Nxen7r50VgsGnycH3teRo5uWLCsST-x6I2NdV3Ku/exec'
    setUploadingPoster(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try { const res = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'upload', filename: file.name, mimeType: file.type, base64: event.target?.result }) }); const data = await res.json(); if (data.status === 'success') { setPf(f => ({ ...f, image_url: data.url })) } else { alert('Gagal upload: ' + data.message) } } catch { alert('Error upload poster') }
      setUploadingPoster(false)
    }; reader.readAsDataURL(file)
  }

  async function saveProduct(e: FormEvent) {
    e.preventDefault(); if (!pf.name) { setProductError('Nama product wajib diisi'); return }
    setProductSaving(true); setProductError('')
    const payload = { name: pf.name, slug: slugify(pf.name), sub_headline: pf.sub_headline || null, description: pf.description || null, image_url: pf.image_url || null, price_before_discount: parseRp(pf.price_before), price_after_discount: parseRp(pf.price_after), discount_percentage: parseInt(pf.discount) || 0, features: pf.features, is_active: pf.is_active }
    let error
    if (editingProduct) { ({ error } = await supabase.from('products').update(payload).eq('id', editingProduct.id)) } else { ({ error } = await supabase.from('products').insert(payload)) }
    setProductSaving(false); if (error) { setProductError('Error: ' + error.message) } else { setShowProductForm(false); fetchProducts() }
  }
  async function deleteProduct(id: string) { if (!confirm('Hapus product ini?')) return; await supabase.from('products').delete().eq('id', id); fetchProducts() }

  // ── Voucher CRUD ────────────────────────────────────────────
  function openAddVoucher() { setEditingVoucher(null); setVf({ code: '', discount_value: '', discount_type: 'fixed', is_active: true }); setVoucherError(''); setShowVoucherForm(true) }
  function openEditVoucher(v: Voucher) { setEditingVoucher(v); setVf({ code: v.code, discount_value: v.discount_value.toString(), discount_type: v.discount_type, is_active: v.is_active }); setVoucherError(''); setShowVoucherForm(true) }

  async function saveVoucher(e: FormEvent) {
    e.preventDefault(); if (!vf.code) { setVoucherError('Kode voucher wajib diisi'); return }
    setVoucherSaving(true); setVoucherError('')
    const payload = { code: vf.code.toUpperCase().trim(), discount_value: parseInt(vf.discount_value) || 0, discount_type: vf.discount_type, is_active: vf.is_active }
    let error
    if (editingVoucher) { ({ error } = await supabase.from('vouchers').update(payload).eq('id', editingVoucher.id)) } else { ({ error } = await supabase.from('vouchers').insert(payload)) }
    setVoucherSaving(false); if (error) { setVoucherError('Error: ' + error.message) } else { setShowVoucherForm(false); fetchVouchers() }
  }
  async function deleteVoucher(id: string) { if (!confirm('Hapus voucher ini?')) return; await supabase.from('vouchers').delete().eq('id', id); fetchVouchers() }
  async function toggleVoucher(v: Voucher) { await supabase.from('vouchers').update({ is_active: !v.is_active }).eq('id', v.id); fetchVouchers() }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button className={styles.hamburgerBtn} onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
        <Image src="/logo-type-white.png" alt="Marcatching" width={110} height={26} className={styles.mobileHeaderLogo} />
      </div>
      <div className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.sidebarOverlayOpen : ''}`} onClick={() => setIsSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '8px' }}>
          <button className={styles.hamburgerBtnSidebar} onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={24} color="#334155" /></button>
          <Image src="/logo-type-white.png" alt="Marcatching" width={110} height={26} style={{ objectFit: 'contain', margin: '0 auto' }} />
        </div>
        <hr style={{ borderColor: 'rgba(0,0,0,0.08)', marginBottom: 12 }} />
        <nav className={styles.sidenav}>
          <button className={`${styles.navItem} ${tab === 'links' ? styles.navActive : ''}`} onClick={() => { setTab('links'); setIsSidebarOpen(false) }}><ExternalLink size={18} /> Links & Buttons</button>
          <button className={`${styles.navItem} ${tab === 'products' ? styles.navActive : ''}`} onClick={() => { setTab('products'); setIsSidebarOpen(false) }}><Package size={18} /> Products</button>
          <button className={`${styles.navItem} ${tab === 'vouchers' ? styles.navActive : ''}`} onClick={() => { setTab('vouchers'); setIsSidebarOpen(false) }}><Tag size={18} /> Vouchers</button>
          <button className={`${styles.navItem} ${tab === 'orders' ? styles.navActive : ''}`} onClick={() => { setTab('orders'); setIsSidebarOpen(false) }}><ClipboardList size={18} /> Orders</button>
          <button className={`${styles.navItem} ${tab === 'contact' ? styles.navActive : ''}`} onClick={() => { setTab('contact'); setIsSidebarOpen(false) }}><Mail size={18} /> Contact Info</button>

          <div style={{ position: 'relative' }}>
            <button className={styles.navItem} onClick={() => setShowAddMenu(!showAddMenu)} style={{ background: '#e2e8f0', color: '#0f172a', fontWeight: 'bold' }}><Plus size={18} /> Tambah Link</button>
            {showAddMenu && (
              <div className={styles.addMenuDropdown} style={{position: 'relative', zIndex: 60}}>
                <button onClick={() => handleAddSpecific('button')}><MousePointerClick size={14}/> Link Button</button>
                <button onClick={() => handleAddSpecific('text')}><Type size={14}/> Text Block</button>
                <button onClick={() => handleAddSpecific('carousel')}><ImageIcon size={14}/> Image Carousel</button>
                <button onClick={() => handleAddSpecific('video')}><Video size={14}/> Video Embed</button>
              </div>
            )}
          </div>
        </nav>
        <hr style={{ borderColor: 'rgba(0,0,0,0.08)', marginTop: 'auto', marginBottom: 12 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 24 }}>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.navItem}><Globe size={18} /> Lihat Website</a>
          <button onClick={handleLogout} className={styles.navItem} style={{ color: '#dc2626' }}><LogOut size={18} /> Keluar</button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.content}>

        {/* ── LINKS TAB ─── */}
        {tab === 'links' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}><div><h1 className={styles.contentTitle}>Links & Buttons</h1><p className={styles.contentDesc}>Kelola link yang tampil di landing page</p></div></div>
            {showLinkForm && (
              <div className={styles.formCard}>
                <div className={styles.formCardHeader}><h2 className={styles.formTitle}>{editingLink ? 'Edit Link' : 'Tambah Link Baru'}</h2><button onClick={cancelLinkForm} className={styles.closeBtn}><X size={18} /></button></div>
                <form onSubmit={saveLink} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Tipe Block</label>
                      <div className={styles.typeSelector} style={{pointerEvents: 'none', opacity: 0.9}}><span className={`${styles.typeBtn} ${styles.typeBtnActive}`} style={{justifyContent: 'center', display: 'flex'}}>
                        {linkForm.type === 'button' && <><MousePointerClick size={16}/> Link Button</>}
                        {linkForm.type === 'text' && <><Type size={16}/> Text Block</>}
                        {linkForm.type === 'carousel' && <><ImageIcon size={16}/> Image Carousel</>}
                        {linkForm.type === 'video' && <><Video size={16}/> Video Embed</>}
                      </span></div>
                    </div>
                    {linkForm.type === 'button' && (<>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Judul Tombol *</label><input className="input" placeholder="cth: Instagram Marcatching" value={linkForm.title ?? ''} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">URL</label><input className="input" placeholder="https://..." value={linkForm.url ?? ''} disabled={linkForm.status === 'coming_soon'} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">Warna Tombol</label><div className={styles.colorInputWrap}><input type="color" className={styles.colorPicker} value={linkForm.btn_color || '#ffffff'} onChange={e => setLinkForm(f => ({ ...f, btn_color: e.target.value }))} /><input type="text" className="input" style={{flex: 1}} placeholder="#0d3369" value={linkForm.btn_color || ''} onChange={e => setLinkForm(f => ({ ...f, btn_color: e.target.value }))} /></div></div>
                      <div className="form-group"><label className="label">Icon</label><select className="select" value={linkForm.icon ?? 'Globe'} onChange={e => setLinkForm(f => ({ ...f, icon: e.target.value }))}>{ICON_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></div>
                      <div className="form-group"><label className="label">Status</label><select className="select" value={linkForm.status ?? 'active'} onChange={e => setLinkForm(f => ({ ...f, status: e.target.value as 'active' | 'coming_soon' }))}><option value="active">Active</option><option value="coming_soon">Coming Soon</option></select></div>
                    </>)}
                    {linkForm.type === 'text' && (<>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Isi Text *</label><textarea className="input" placeholder="Masukkan text..." rows={3} value={linkForm.title ?? ''} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">Warna Text</label><div className={styles.colorInputWrap}><input type="color" className={styles.colorPicker} value={linkForm.text_color || '#000000'} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /><input type="text" className="input" style={{flex: 1}} value={linkForm.text_color || ''} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /></div></div>
                      <div className="form-group"><label className="label">Ukuran Text</label><select className="select" value={linkForm.text_size || '1rem'} onChange={e => setLinkForm(f => ({ ...f, text_size: e.target.value }))}><option value="0.875rem">Kecil</option><option value="1rem">Normal</option><option value="1.25rem">Besar</option><option value="1.5rem">Extra Large</option><option value="2rem">Judul Utama</option></select></div>
                      <div className="form-group"><label className="label">Alignment</label><select className="select" value={linkForm.text_align || 'center'} onChange={e => setLinkForm(f => ({ ...f, text_align: e.target.value }))}><option value="left">Rata Kiri</option><option value="center">Rata Tengah</option><option value="right">Rata Kanan</option><option value="justify">Rata Kiri Kanan</option></select></div>
                      <div className="form-group"><label className="label">Style Font</label><div className={styles.checkboxGroup}><label className={styles.checkboxLabel}><input type="checkbox" checked={linkForm.text_bold || false} onChange={e => setLinkForm(f => ({ ...f, text_bold: e.target.checked }))} /> Bold</label><label className={styles.checkboxLabel}><input type="checkbox" checked={linkForm.text_italic || false} onChange={e => setLinkForm(f => ({ ...f, text_italic: e.target.checked }))} /> Italic</label></div></div>
                    </>)}
                    {linkForm.type === 'video' && (<>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Judul Video *</label><input className="input" placeholder="cth: Video TikTok Promo" value={linkForm.title ?? ''} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} /></div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">URL Video *</label><input className="input" placeholder="https://..." value={linkForm.url ?? ''} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} /></div>
                    </>)}
                    {linkForm.type === 'carousel' && (<>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Judul Internal *</label><input className="input" placeholder="cth: Poster Event" value={linkForm.title ?? ''} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">Aspect Ratio</label><select className="select" value={linkForm.carousel_aspect_ratio || '16:9'} onChange={e => setLinkForm(f => ({ ...f, carousel_aspect_ratio: e.target.value }))}><option value="16:9">16:9</option><option value="9:16">9:16</option><option value="4:5">4:5</option></select></div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Upload Gambar</label>
                        <div className={styles.uploadArea}><input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className={styles.fileInput} /><div className={styles.uploadLabel}><Upload size={20} />{uploadingImage ? 'Mengupload...' : 'Klik atau Drag & Drop'}</div></div>
                        <div className={styles.imageList}>{(linkForm.image_data || []).map((img: any, idx: number) => { let previewUrl = img.url; if (previewUrl?.includes('drive.google.com/uc')) { const m = previewUrl.match(/id=([^&]+)/); if (m?.[1]) previewUrl = `https://drive.google.com/thumbnail?id=${m[1]}&sz=w500-h500` } return (<div key={idx} className={styles.imageItem}><div className={styles.imagePreviewWrap} style={{aspectRatio: linkForm.carousel_aspect_ratio?.replace(':', '/') || '16/9'}}><img src={previewUrl} alt={`Preview ${idx}`} className={styles.imagePreview} /></div><div className={styles.imageItemDetails}><input type="text" className="input" style={{fontSize: '0.8rem', padding: '0.4rem 0.6rem'}} placeholder="Link tujuan (opsional)" value={img.link || ''} onChange={(e) => handleImageLinkChange(idx, e.target.value)} /><button type="button" className="btn btn-ghost" style={{padding: '0.4rem', color: '#ff4444'}} onClick={() => removeImage(idx)}><Trash2 size={16}/></button></div></div>) })}</div>
                      </div>
                    </>)}
                  </div>
                  {linkError && <p className={styles.formError}>{linkError}</p>}
                  <div className={styles.formActions}><button type="button" className="btn btn-ghost" onClick={cancelLinkForm}>Batal</button><button type="submit" className="btn btn-navy" disabled={linkSaving}>{linkSaving ? 'Menyimpan...' : <><Check size={16} /> Simpan</>}</button></div>
                </form>
              </div>
            )}
            {linksLoading ? <div className={styles.loading}>Memuat data...</div> : links.length === 0 ? <div className={styles.emptyState}><p>Belum ada link.</p></div> : (
              <Reorder.Group axis="y" values={links} onReorder={handleReorder} className={styles.linksList} style={{ listStyleType: 'none', padding: 0, margin: 0, gap: '12px', display: 'flex', flexDirection: 'column' }}>
                {links.map(link => <SortableLinkItem key={link.id} link={link} onEdit={openEditLink} onDelete={deleteLink} />)}
              </Reorder.Group>
            )}
          </div>
        )}

        {/* ── PRODUCTS TAB ─── */}
        {tab === 'products' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}>
              <div><h1 className={styles.contentTitle}>Products</h1><p className={styles.contentDesc}>Kelola produk digital yang dijual</p></div>
              <button className="btn btn-navy" onClick={openAddProduct}><Plus size={16} /> Tambah Product</button>
            </div>
            {showProductForm && (
              <div className={styles.formCard}>
                <div className={styles.formCardHeader}><h2 className={styles.formTitle}>{editingProduct ? 'Edit Product' : 'Tambah Product Baru'}</h2><button onClick={() => setShowProductForm(false)} className={styles.closeBtn}><X size={18} /></button></div>
                <form onSubmit={saveProduct} className={styles.form}>
                  <div className="form-group"><label className="label">Poster Product</label>
                    <div className={styles.uploadArea}><input type="file" accept="image/*" onChange={handlePosterUpload} disabled={uploadingPoster} className={styles.fileInput} /><div className={styles.uploadLabel}><Upload size={20} />{uploadingPoster ? 'Mengupload poster...' : 'Upload Poster (4:5)'}</div></div>
                    {pf.image_url && <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', maxWidth: 200 }}><img src={pf.image_url.includes('drive.google.com/uc') ? pf.image_url.replace(/uc\?export=view&id=/, 'thumbnail?id=') + '&sz=w300-h375' : pf.image_url} alt="Preview" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} /></div>}
                  </div>
                  <div className="form-group"><label className="label">Nama Product *</label><input className="input" placeholder="cth: Marketing Mastery" value={pf.name} onChange={e => setPf(f => ({...f, name: e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Sub Headline</label><input className="input" placeholder="cth: Panduan lengkap belajar marketing" value={pf.sub_headline} onChange={e => setPf(f => ({...f, sub_headline: e.target.value}))} /></div>
                  <div className={styles.formGrid}>
                    <div className="form-group"><label className="label">Harga Sebelum Diskon</label><div style={{display:'flex',alignItems:'center',gap:4}}><span style={{fontWeight:600,color:'#64748b'}}>Rp</span><input className="input" placeholder="1500000" value={pf.price_before ? formatRp(parseRp(pf.price_before)) : ''} onChange={e => handlePriceBefore(e.target.value)} /></div></div>
                    <div className="form-group"><label className="label">Harga Setelah Diskon</label><div style={{display:'flex',alignItems:'center',gap:4}}><span style={{fontWeight:600,color:'#64748b'}}>Rp</span><input className="input" placeholder="750000" value={pf.price_after ? formatRp(parseRp(pf.price_after)) : ''} onChange={e => handlePriceAfter(e.target.value)} /></div></div>
                    <div className="form-group"><label className="label">Discount</label><div style={{display:'flex',alignItems:'center',gap:4}}><input className="input" placeholder="50" value={pf.discount} onChange={e => handleDiscount(e.target.value)} /><span style={{fontWeight:600,color:'#64748b'}}>%</span></div></div>
                    <div className="form-group"><label className="label">Status</label><select className="select" value={pf.is_active ? 'active' : 'inactive'} onChange={e => setPf(f => ({...f, is_active: e.target.value === 'active'}))}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                  </div>
                  <div className="form-group"><label className="label">Features</label>
                    <div style={{display:'flex',gap:8}}><input className="input" placeholder="cth: Akses modul gratis seumur hidup" value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature() } }} /><button type="button" className="btn btn-navy" onClick={addFeature} style={{whiteSpace:'nowrap'}}><Plus size={14} /></button></div>
                    {pf.features.map((f, i) => (<div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'1px solid #f1f5f9'}}><Check size={14} color="#16a34a" /><span style={{flex:1,fontSize:'0.88rem'}}>{f}</span><button type="button" onClick={() => removeFeature(i)} style={{color:'#dc2626',background:'none',border:'none',cursor:'pointer'}}><X size={14} /></button></div>))}
                  </div>
                  <div className="form-group"><label className="label">Deskripsi Produk</label><textarea className="input" rows={5} placeholder="Deskripsikan detail produk di sini..." value={pf.description} onChange={e => setPf(f => ({...f, description: e.target.value}))} /></div>
                  {productError && <p className={styles.formError}>{productError}</p>}
                  <div className={styles.formActions}><button type="button" className="btn btn-ghost" onClick={() => setShowProductForm(false)}>Batal</button><button type="submit" className="btn btn-navy" disabled={productSaving}>{productSaving ? 'Menyimpan...' : <><Check size={16} /> Simpan Product</>}</button></div>
                </form>
              </div>
            )}
            {productsLoading ? <div className={styles.loading}>Memuat...</div> : products.length === 0 ? <div className={styles.emptyState}>Belum ada product.</div> : (
              <div className={styles.linksList}>{products.map(p => (
                <div key={p.id} className={styles.linkRow} style={{cursor:'pointer'}} onClick={() => openEditProduct(p)}>
                  <div className={styles.linkIcon}><Package size={18} /></div>
                  <div className={styles.linkInfo}>
                    <span className={styles.linkTitle}>{p.name}</span>
                    <span className={styles.linkUrl}>/product/{p.slug} · {p.is_active ? <span className={styles.statusActive}>Active</span> : <span className={styles.statusSoon}>Inactive</span>} · Rp {formatRp(p.price_after_discount)}</span>
                  </div>
                  <div className={styles.linkActions}>
                    <button className={styles.editBtn} onClick={(e) => { e.stopPropagation(); openEditProduct(p) }}><Pencil size={15} /></button>
                    <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); deleteProduct(p.id) }}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
        )}

        {/* ── VOUCHERS TAB ─── */}
        {tab === 'vouchers' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}>
              <div><h1 className={styles.contentTitle}>Vouchers</h1><p className={styles.contentDesc}>Kelola kode voucher diskon</p></div>
              <button className="btn btn-navy" onClick={openAddVoucher}><Plus size={16} /> Tambah Voucher</button>
            </div>
            {showVoucherForm && (
              <div className={styles.formCard}>
                <div className={styles.formCardHeader}><h2 className={styles.formTitle}>{editingVoucher ? 'Edit Voucher' : 'Tambah Voucher Baru'}</h2><button onClick={() => setShowVoucherForm(false)} className={styles.closeBtn}><X size={18} /></button></div>
                <form onSubmit={saveVoucher} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className="form-group"><label className="label">Kode Voucher *</label><input className="input" placeholder="MARCATCHING50" value={vf.code} onChange={e => setVf(f => ({...f, code: e.target.value.toUpperCase()}))} /></div>
                    <div className="form-group"><label className="label">Tipe Diskon</label><select className="select" value={vf.discount_type} onChange={e => setVf(f => ({...f, discount_type: e.target.value as 'fixed' | 'percentage'}))}><option value="fixed">Rupiah (Rp)</option><option value="percentage">Persen (%)</option></select></div>
                    <div className="form-group"><label className="label">Nilai Diskon</label><input className="input" placeholder={vf.discount_type === 'fixed' ? '50000' : '10'} value={vf.discount_value} onChange={e => setVf(f => ({...f, discount_value: e.target.value.replace(/\D/g, '')}))} /></div>
                    <div className="form-group"><label className="label">Status</label><select className="select" value={vf.is_active ? 'active' : 'inactive'} onChange={e => setVf(f => ({...f, is_active: e.target.value === 'active'}))}><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></div>
                  </div>
                  {voucherError && <p className={styles.formError}>{voucherError}</p>}
                  <div className={styles.formActions}><button type="button" className="btn btn-ghost" onClick={() => setShowVoucherForm(false)}>Batal</button><button type="submit" className="btn btn-navy" disabled={voucherSaving}>{voucherSaving ? 'Menyimpan...' : <><Check size={16} /> Simpan</>}</button></div>
                </form>
              </div>
            )}
            {vouchersLoading ? <div className={styles.loading}>Memuat...</div> : vouchers.length === 0 ? <div className={styles.emptyState}>Belum ada voucher.</div> : (
              <div className={styles.linksList}>{vouchers.map(v => (
                <div key={v.id} className={styles.linkRow}>
                  <div className={styles.linkIcon}><Tag size={18} /></div>
                  <div className={styles.linkInfo}>
                    <span className={styles.linkTitle} style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{v.code}</span>
                    <span className={styles.linkUrl}>{v.discount_type === 'fixed' ? `Rp ${formatRp(v.discount_value)}` : `${v.discount_value}%`} · {v.is_active ? <span className={styles.statusActive}>Aktif</span> : <span className={styles.statusSoon}>Nonaktif</span>}</span>
                  </div>
                  <div className={styles.linkActions}>
                    <button className={styles.editBtn} onClick={() => toggleVoucher(v)} title={v.is_active ? 'Nonaktifkan' : 'Aktifkan'}>{v.is_active ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    <button className={styles.editBtn} onClick={() => openEditVoucher(v)}><Pencil size={15} /></button>
                    <button className={styles.deleteBtn} onClick={() => deleteVoucher(v.id)}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ─── */}
        {tab === 'orders' && (
          <div className={styles.tabContent} style={{ maxWidth: 1000 }}>
            <div className={styles.contentHeader}><div><h1 className={styles.contentTitle}>Orders</h1><p className={styles.contentDesc}>Semua pembelian yang masuk</p></div></div>
            {ordersLoading ? <div className={styles.loading}>Memuat...</div> : orders.length === 0 ? <div className={styles.emptyState}>Belum ada order.</div> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead><tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: 600 }}>Tanggal</th>
                    <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: 600 }}>Nama</th>
                    <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: 600 }}>Product</th>
                    <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: 600 }}>Status</th>
                  </tr></thead>
                  <tbody>{orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{new Date(o.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: '10px 8px' }}><div style={{ fontWeight: 600 }}>{o.full_name}</div><div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{o.email}</div></td>
                      <td style={{ padding: '10px 8px' }}>{o.product_name}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>Rp {formatRp(o.total_paid)}</td>
                      <td style={{ padding: '10px 8px' }}><span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: o.status === 'confirmed' ? '#dcfce7' : '#fef3c7', color: o.status === 'confirmed' ? '#16a34a' : '#d97706' }}>{o.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CONTACT TAB ─── */}
        {tab === 'contact' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}><div><h1 className={styles.contentTitle}>Contact Info</h1><p className={styles.contentDesc}>Kelola email kontak</p></div></div>
            <div className={styles.formCard} style={{ maxWidth: 480 }}>
              <h2 className={styles.formTitle}>Email Kontak</h2>
              {contactLoading ? <div className={styles.loading}>Memuat...</div> : (
                <form onSubmit={saveContact} className={styles.form}>
                  <div className="form-group"><label className="label">Alamat Email *</label><input className="input" type="email" placeholder="email@marcatching.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required /></div>
                  {contactMsg && <p className={contactMsg.startsWith('✓') ? styles.successMsg : styles.formError}>{contactMsg}</p>}
                  <div className={styles.formActions}><button type="submit" className="btn btn-navy" disabled={contactSaving}>{contactSaving ? 'Menyimpan...' : <><Check size={16} /> Simpan Email</>}</button></div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
