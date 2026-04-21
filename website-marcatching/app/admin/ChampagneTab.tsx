'use client'

import React, { useState, useEffect, FormEvent, useRef } from 'react'
import { Plus, Pencil, Trash2, Check, X, GripVertical, Settings, Eye, EyeOff, LayoutTemplate, Upload } from 'lucide-react'
import { Reorder } from 'framer-motion'
import Cropper from 'react-easy-crop'
import { supabase } from '@/lib/supabaseClient'
import type { Campaign, CampaignBlock, Product } from '@/lib/supabaseClient'
import styles from './admin.module.css'
import RichTextEditor from '@/components/RichTextEditor'

export default function ChampagneTab({ products }: { products: Product[] }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Create / Edit Campaign Meta
  const [showMetaForm, setShowMetaForm] = useState(false)
  const [editingMeta, setEditingMeta] = useState<Campaign | null>(null)
  const [metaForm, setMetaForm] = useState({ title: '', slug: '', theme: 'black', status: 'draft' })
  const [metaError, setMetaError] = useState('')

  // Selected campaign for block editing
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  
  // Block Editing State
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [blockType, setBlockType] = useState<CampaignBlock['type']>('headline')
  const [blockContent, setBlockContent] = useState<any>({})
  const [uploadingImage, setUploadingImage] = useState(false)

  // Cropper State
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [cropData, setCropData] = useState<{ src: string; filename: string; mimeType: string; naturalWidth?: number; naturalHeight?: number } | null>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)

  async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image()
      img.addEventListener('load', () => resolve(img))
      img.addEventListener('error', err => reject(err))
      img.src = imageSrc
    })
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
      0, 0, pixelCrop.width, pixelCrop.height
    )
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  async function confirmCropOrDirect() {
    if (!cropData) return
    setUploadingImage(true)
    let base64: string
    if (blockContent.aspect_ratio === 'original') {
      // Skip crop — upload full original
      base64 = cropData.src
    } else {
      if (!croppedAreaPixels) { setUploadingImage(false); return }
      base64 = await getCroppedImg(cropData.src, croppedAreaPixels)
    }
    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'
    try {
      const res = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'upload', filename: cropData.filename, mimeType: cropData.mimeType, base64 }) })
      const data = await res.json()
      if (data.status === 'success') {
        setBlockContent((prev: any) => ({ ...prev, url: data.url }))
        setCropData(null)
        if (imgInputRef.current) imgInputRef.current.value = ''
      } else {
        alert('Gagal upload gambar: ' + data.message)
      }
    } catch {
      alert('Error upload gambar')
    }
    setUploadingImage(false)
  }

  function cancelCrop() {
    setCropData(null)
    if (imgInputRef.current) imgInputRef.current.value = ''
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCropData({
        src: ev.target?.result as string,
        filename: file.name,
        mimeType: file.type
      })
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns')
      const data = await res.json()
      setCampaigns(data || [])
      // Update selected campaign if it exists
      if (selectedCampaign) {
        const updated = data?.find((c: Campaign) => c.id === selectedCampaign.id)
        if (updated) setSelectedCampaign(updated)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function openCreateMeta() {
    setEditingMeta(null)
    setMetaForm({ title: '', slug: '', theme: 'black', status: 'draft' })
    setMetaError('')
    setShowMetaForm(true)
  }

  function openEditMeta(c: Campaign) {
    setEditingMeta(c)
    setMetaForm({ title: c.title, slug: c.slug, theme: c.theme, status: c.status })
    setMetaError('')
    setShowMetaForm(true)
  }

  async function saveMeta(e: FormEvent) {
    e.preventDefault()
    if (!metaForm.title.trim()) { setMetaError('Judul wajib diisi'); return }
    const slug = slugify(metaForm.slug || metaForm.title)
    if (!slug) { setMetaError('Slug tidak valid'); return }
    
    setSaving(true)
    setMetaError('')
    try {
      if (editingMeta) {
        const res = await fetch(`/api/campaigns/${editingMeta.slug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: metaForm.title, slug, theme: metaForm.theme, status: metaForm.status })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
      } else {
        const res = await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: metaForm.title, slug, theme: metaForm.theme, status: metaForm.status, blocks: [] })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
      }
      setShowMetaForm(false)
      fetchCampaigns()
    } catch (err: any) {
      setMetaError(err.message || 'Gagal menyimpan campaign')
    }
    setSaving(false)
  }

  async function deleteCampaign(c: Campaign) {
    if (!confirm(`Hapus campaign "${c.title}"?`)) return
    try {
      await fetch(`/api/campaigns/${c.slug}`, { method: 'DELETE' })
      if (selectedCampaign?.id === c.id) setSelectedCampaign(null)
      fetchCampaigns()
    } catch (err) {
      console.error(err)
    }
  }

  // --- Block Management ---
  function openAddBlock() {
    setEditingBlockId(null)
    setBlockType('headline')
    setBlockContent({ text: '', size: 'h2', color: selectedCampaign?.theme === 'white' ? '#000000' : '#ffffff', align: 'left' })
    setShowBlockForm(true)
  }

  function openEditBlock(b: CampaignBlock) {
    setEditingBlockId(b.id)
    setBlockType(b.type)
    setBlockContent(b.content)
    setShowBlockForm(true)
  }

  async function saveBlocks(newBlocks: CampaignBlock[]) {
    if (!selectedCampaign) return
    setSaving(true)
    try {
      await fetch(`/api/campaigns/${selectedCampaign.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: newBlocks })
      })
      fetchCampaigns()
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  async function saveBlockForm(e: FormEvent) {
    e.preventDefault()
    if (!selectedCampaign) return
    const id = editingBlockId || Math.random().toString(36).slice(2, 9)
    const newBlock: CampaignBlock = { id, type: blockType, content: { ...blockContent } }
    
    let updatedBlocks = [...(selectedCampaign.blocks || [])]
    if (editingBlockId) {
      updatedBlocks = updatedBlocks.map(b => b.id === editingBlockId ? newBlock : b)
    } else {
      updatedBlocks.push(newBlock)
    }
    await saveBlocks(updatedBlocks)
    setShowBlockForm(false)
  }

  async function deleteBlock(id: string) {
    if (!selectedCampaign || !confirm('Hapus block ini?')) return
    const updatedBlocks = (selectedCampaign.blocks || []).filter(b => b.id !== id)
    await saveBlocks(updatedBlocks)
  }

  async function handleBlockReorder(reordered: CampaignBlock[]) {
    if (!selectedCampaign) return
    // Optimistic update for UI smoothness
    setSelectedCampaign({ ...selectedCampaign, blocks: reordered })
    await saveBlocks(reordered)
  }

  // Render main list vs block editor
  if (selectedCampaign) {
    return (
      <div className={styles.tabContent} style={{ maxWidth: 840 }}>
        <div className={styles.contentHeader} style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setSelectedCampaign(null)}>← Kembali</button>
              <h1 className={styles.contentTitle}>{selectedCampaign.title}</h1>
            </div>
            <p className={styles.contentDesc} style={{ marginTop: 6 }}>
              marcatching.com/{selectedCampaign.slug} · Tema: <strong>{selectedCampaign.theme}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-navy" onClick={() => openEditMeta(selectedCampaign)}><Settings size={15}/> Konfigurasi</button>
          </div>
        </div>

        {/* --- Block Editor UI (Similar to E-commerce) --- */}
        {showBlockForm && (
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <h2 className={styles.formTitle}>{editingBlockId ? 'Edit Block' : 'Tambah Block'}</h2>
              <button onClick={() => setShowBlockForm(false)} className={styles.closeBtn}><X size={18} /></button>
            </div>
            <form onSubmit={saveBlockForm} className={styles.form}>
              <div className="form-group">
                <label className="label">Tipe Block</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['headline', 'text', 'button', 'image', 'video', 'product'] as const).map(t => (
                    <button type="button" key={t} onClick={() => { setBlockType(t); setBlockContent({}) }}
                      style={{ padding: '8px 14px', borderRadius: 8, border: blockType === t ? '2px solid #0d3369' : '1px solid #e2e8f0', background: blockType === t ? '#eff6ff' : '#fff', color: blockType === t ? '#0d3369' : '#64748b', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      {t === 'video' ? 'Online Video' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {blockType === 'headline' && (
                <div className={styles.formGrid}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Teks Headline (Pilih teks untuk format bold/italic/warna)</label>
                    <RichTextEditor
                      value={blockContent.text || ''}
                      onChange={html => setBlockContent({ ...blockContent, text: html })}
                      placeholder="Tulis headline... (pilih teks untuk format)"
                      minHeight={60}
                      style={{ fontSize: '1.25rem', fontWeight: 700, color: blockContent.color || (selectedCampaign.theme === 'white' ? '#000000' : '#ffffff'), textAlign: blockContent.align as any || 'left' }}
                    />
                    <p style={{ fontSize:'0.75rem', color:'#94a3b8', margin:'4px 0 0' }}>Pilih/select teks untuk bold, italic, warna, ukuran per bagian</p>
                  </div>
                  <div className="form-group"><label className="label">Ukuran (Class)</label>
                    <select className="select" value={blockContent.size || 'h2'} onChange={e => setBlockContent({ ...blockContent, size: e.target.value })}>
                      <option value="h1">H1 (Besar)</option><option value="h2">H2 (Sedang)</option><option value="h3">H3 (Kecil)</option>
                    </select></div>
                  <div className="form-group"><label className="label">Warna Teks Default</label>
                    <input type="color" className="input" style={{ padding: 4, height: 42 }} value={blockContent.color || (selectedCampaign.theme === 'white' ? '#000000' : '#ffffff')} onChange={e => setBlockContent({ ...blockContent, color: e.target.value })} /></div>
                  <div className="form-group"><label className="label">Align (Seluruh Block)</label>
                    <select className="select" value={blockContent.align || 'left'} onChange={e => setBlockContent({ ...blockContent, align: e.target.value })}>
                      <option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option><option value="justify">Rata Kanan-Kiri</option>
                    </select></div>
                </div>
              )}

              {blockType === 'text' && (
                <div className={styles.formGrid}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Isi Teks (Pilih teks untuk format bold/italic/warna)</label>
                    <RichTextEditor
                      value={blockContent.text || ''}
                      onChange={html => setBlockContent({ ...blockContent, text: html })}
                      placeholder="Tulis paragraf... (pilih teks untuk format)"
                      minHeight={120}
                      style={{ fontSize: blockContent.font_size || '1rem', color: blockContent.color || (selectedCampaign.theme === 'white' ? '#475569' : '#94a3b8'), textAlign: blockContent.align as any || 'left' }}
                    />
                    <p style={{ fontSize:'0.75rem', color:'#94a3b8', margin:'4px 0 0' }}>Pilih/select teks untuk bold, italic, warna, ukuran, highlight per kata</p>
                  </div>
                  <div className="form-group"><label className="label">Ukuran Default (rem)</label>
                    <select className="select" value={blockContent.font_size || '1rem'} onChange={e => setBlockContent({ ...blockContent, font_size: e.target.value })}>
                      <option value="1.25rem">Besar (1.25rem)</option><option value="1rem">Normal (1rem)</option><option value="0.9rem">Kecil (0.9rem)</option>
                    </select></div>
                  <div className="form-group"><label className="label">Warna Teks Default</label>
                    <input type="color" className="input" style={{ padding: 4, height: 42 }} value={blockContent.color || (selectedCampaign.theme === 'white' ? '#475569' : '#94a3b8')} onChange={e => setBlockContent({ ...blockContent, color: e.target.value })} /></div>
                  <div className="form-group"><label className="label">Align (Seluruh Block)</label>
                    <select className="select" value={blockContent.align || 'left'} onChange={e => setBlockContent({ ...blockContent, align: e.target.value })}>
                      <option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option><option value="justify">Rata Kanan-Kiri</option>
                    </select></div>
                </div>
              )}

              {blockType === 'button' && (
                <div className={styles.formGrid}>
                  <div className="form-group"><label className="label">Teks Button</label>
                    <input className="input" value={blockContent.btn_text || ''} onChange={e => setBlockContent({ ...blockContent, btn_text: e.target.value })} required /></div>
                  <div className="form-group"><label className="label">URL Tujuan</label>
                    <input className="input" placeholder="https://" value={blockContent.btn_url || ''} onChange={e => setBlockContent({ ...blockContent, btn_url: e.target.value })} required /></div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Warna Background Button</label>
                    {/* Color palette quick picks */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      {[
                        { label: 'Navy', value: '#0d3369' },
                        { label: 'Blue', value: '#2563eb' },
                        { label: 'Sky', value: '#0ea5e9' },
                        { label: 'Indigo', value: '#4f46e5' },
                        { label: 'Emerald', value: '#059669' },
                        { label: 'Orange', value: '#f97316' },
                        { label: 'Rose', value: '#e11d48' },
                        { label: 'Black', value: '#0f172a' },
                        { label: 'White', value: '#ffffff' },
                        { label: 'Grad Navy', value: 'linear-gradient(135deg, #0d3369, #3b82f6)' },
                        { label: 'Grad Gold', value: 'linear-gradient(135deg, #f97316, #fbbf24)' },
                        { label: 'Grad Purple', value: 'linear-gradient(135deg, #7c3aed, #e11d48)' },
                      ].map(p => (
                        <button
                          key={p.value}
                          type="button"
                          title={p.label}
                          onClick={() => setBlockContent({ ...blockContent, btn_color: p.value })}
                          style={{
                            width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                            background: p.value,
                            border: blockContent.btn_color === p.value ? '3px solid #0d3369' : '2px solid #e2e8f0',
                            transition: 'transform 0.15s',
                          }}
                        />
                      ))}
                    </div>
                    <input type="text" className="input" placeholder="atau masukkan kode warna / gradient" value={blockContent.btn_color || ''} onChange={e => setBlockContent({ ...blockContent, btn_color: e.target.value })} />
                  </div>
                  <div className="form-group"><label className="label">Warna Teks</label>
                    <input type="color" className="input" style={{ padding: 4, height: 42 }} value={blockContent.btn_text_color || '#ffffff'} onChange={e => setBlockContent({ ...blockContent, btn_text_color: e.target.value })} /></div>
                </div>
              )}

              {blockType === 'image' && (
                <div className={styles.formGrid}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Upload Gambar</label>
                    <div className={styles.uploadArea}>
                      <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className={styles.fileInput} />
                      <div className={styles.uploadLabel}>
                        <Upload size={20} />{uploadingImage ? 'Mengupload...' : 'Klik atau Drag & Drop Image'}
                      </div>
                    </div>
                  </div>
                  {blockContent.url && (
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label className="label">Preview</label>
                      <img src={blockContent.url} alt="preview" style={{width:100, borderRadius:8}} />
                    </div>
                  )}
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Aspect Ratio</label>
                    <select className="select" value={blockContent.aspect_ratio || 'original'} onChange={e => setBlockContent({ ...blockContent, aspect_ratio: e.target.value })}>
                      <option value="original">Original (ukuran asli)</option>
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="1:1">1:1 (Square)</option>
                      <option value="4:5">4:5 (Portrait)</option>
                      <option value="9:16">9:16 (Story)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1', display: 'flex', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <input type="checkbox" checked={blockContent.has_shadow ?? true} onChange={e => setBlockContent({...blockContent, has_shadow: e.target.checked})} />
                      Shadow (Bayangan)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <input type="checkbox" checked={blockContent.has_border ?? false} onChange={e => setBlockContent({...blockContent, has_border: e.target.checked})} />
                      Border (Garis Tepi)
                    </label>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Link Redirect (Opsional)</label>
                    <input className="input" placeholder="https://... (Kosongkan bila tidak ingin bisa diklik)" value={blockContent.redirect_url || ''} onChange={e => setBlockContent({ ...blockContent, redirect_url: e.target.value })} />
                  </div>
                </div>
              )}

              {blockType === 'video' && (
                <div className={styles.formGrid}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="label">Online Video</label>
                    <input className="input" placeholder="URL lengkap video (YouTube, TikTok, IG, Drive)" value={blockContent.video_url || ''} onChange={e => setBlockContent({ ...blockContent, video_url: e.target.value })} required /></div>
                </div>
              )}

              {blockType === 'product' && (
                <div className={styles.formGrid}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="label">Pilih Produk</label>
                    <select className="select" value={blockContent.product_id || ''} onChange={e => setBlockContent({ ...blockContent, product_id: e.target.value })} required>
                      <option value="">-- Pilih --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select></div>
                </div>
              )}

            </form>
          </div>
        )}

        {/* Existing Blocks List */}
        {!selectedCampaign.blocks || selectedCampaign.blocks.length === 0 ? (
          <div className={styles.emptyState}>Belum ada block. Tekan "+ Tambah Block" untuk mengisi halaman ini.</div>
        ) : (
          <Reorder.Group axis="y" values={selectedCampaign.blocks} onReorder={handleBlockReorder} style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedCampaign.blocks.map(b => {
              const pDetails = b.type === 'product' ? products.find(p => p.id === b.content.product_id) : null
              return (
                <Reorder.Item key={b.id} value={b} className={styles.linkRow} initial={false} style={{ cursor: 'default' }}>
                  <div style={{ padding: '0 12px 0 4px', cursor: 'grab', display: 'flex', alignItems: 'center', touchAction: 'none' }}><GripVertical size={16} color="#94a3b8" /></div>
                  <div style={{ width: 32, height: 32, minWidth: 32, background: '#f1f5f9', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, flexShrink: 0 }}>
                    {b.type.substring(0, 3).toUpperCase()}
                  </div>
                  <div className={styles.linkInfo} style={{ marginLeft: 12 }}>
                    <span className={styles.linkTitle}>
                      {b.type === 'product' ? (pDetails?.name || 'Produk tidak ditemukan') : (typeof (b.content.text || b.content.btn_text || b.content.url || b.content.video_url || '—') === 'string' ? (b.content.text || b.content.btn_text || b.content.url || b.content.video_url || '—').replace(/<[^>]*>?/gm, '') : '—')}
                    </span>
                    <span className={styles.linkUrl}>{b.type.toUpperCase()}</span>
                  </div>
                  <div className={styles.linkActions}>
                    <button className={styles.editBtn} onClick={() => openEditBlock(b)}><Pencil size={15} /></button>
                    <button className={styles.deleteBtn} onClick={() => deleteBlock(b.id)}><Trash2 size={15} /></button>
                  </div>
                </Reorder.Item>
              )
            })}
          </Reorder.Group>
        )}

        <div className={styles.spacer} />
        
        {/* Fixed bar for block editor ALWAYS visible */}
        <div className={styles.fixedActions}>
          {showBlockForm && (
            <button type="button" className="btn btn-ghost" onClick={() => setShowBlockForm(false)} style={{ padding: '10px 24px' }}>Batal</button>
          )}
          
          <button type="button" className="btn btn-navy" style={{ padding: '10px 24px', fontWeight: 700, borderRadius: 999 }} onClick={openAddBlock}>
            <Plus size={16} style={{ marginRight: 6 }} /> Tambah Block
          </button>

          {showBlockForm && (
            <button type="button" className="btn btn-navy" disabled={saving} style={{ padding: '10px 24px', fontWeight: 700 }} onClick={(e) => saveBlockForm(e as any)}>
              {saving ? 'Menyimpan...' : <><Check size={16} /> Simpan Block</>}
            </button>
          )}
        </div>

        {/* Shared meta form */}
        {showMetaForm && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }}>
            <div className={styles.formCard} style={{ margin: 0, width: '100%', maxWidth: 500 }}>
              <div className={styles.formCardHeader}><h2 className={styles.formTitle}>Pengaturan Campaign</h2><button onClick={() => setShowMetaForm(false)} className={styles.closeBtn}><X size={18} /></button></div>
              <form onSubmit={saveMeta} className={styles.form}>
                <div className="form-group"><label className="label">Nama Campaign</label><input className="input" value={metaForm.title} onChange={e => setMetaForm({...metaForm, title: e.target.value})} /></div>
                <div className="form-group"><label className="label">URL Slug</label><input className="input" value={metaForm.slug} onChange={e => setMetaForm({...metaForm, slug: e.target.value})} placeholder="kosongkan untuk generate otomatis dari nama" /></div>
                <div className="form-group"><label className="label">Tema (Black/White)</label>
                  <select className="select" value={metaForm.theme} onChange={e => setMetaForm({...metaForm, theme: e.target.value as any})}>
                    <option value="black">Dark Mode (Hitam)</option><option value="white">Light Mode (Putih)</option>
                  </select>
                </div>
                <div className="form-group"><label className="label">Status</label>
                  <select className="select" value={metaForm.status} onChange={e => setMetaForm({...metaForm, status: e.target.value as any})}>
                    <option value="published">Published</option><option value="draft">Draft</option>
                  </select>
                </div>
                {metaError && <p className={styles.formError}>{metaError}</p>}
                <div className={styles.formActions}><button type="submit" className="btn btn-navy" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button></div>
              </form>
            </div>
          </div>
        )}

        {/* --- Cropper Modal --- */}
        {cropData && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column' }}>
            {blockContent.aspect_ratio === 'original' ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <img src={cropData.src} alt="preview" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ position: 'relative', flex: 1 }}>
                <Cropper
                  image={cropData.src}
                  crop={crop}
                  zoom={zoom}
                  aspect={
                    blockContent.aspect_ratio === '1:1' ? 1 :
                    blockContent.aspect_ratio === '4:5' ? 4 / 5 :
                    blockContent.aspect_ratio === '9:16' ? 9 / 16 : 16 / 9
                  }
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_: any, croppedPixels: any) => setCroppedAreaPixels(croppedPixels)}
                />
              </div>
            )}
            <div style={{ padding: 24, background: '#1e293b', display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button className="btn btn-ghost" style={{ color: '#fff' }} onClick={cancelCrop}>Batal</button>
              <button className="btn btn-navy" onClick={confirmCropOrDirect} disabled={uploadingImage}>
                {uploadingImage ? 'Mengupload...' : <><Check size={16} /> {blockContent.aspect_ratio === 'original' ? 'Upload' : 'Crop & Upload'}</>}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.tabContent} style={{ maxWidth: 1000 }}>
      {showMetaForm && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }}>
          <div className={styles.formCard} style={{ margin: 0, width: '100%', maxWidth: 500 }}>
            <div className={styles.formCardHeader}><h2 className={styles.formTitle}>{editingMeta ? 'Edit Campaign' : 'Buat Campaign Baru'}</h2><button onClick={() => setShowMetaForm(false)} className={styles.closeBtn}><X size={18} /></button></div>
            <form onSubmit={saveMeta} className={styles.form}>
              <div className="form-group"><label className="label">Nama Campaign</label><input className="input" value={metaForm.title} onChange={e => setMetaForm({...metaForm, title: e.target.value})} /></div>
              <div className="form-group"><label className="label">URL Slug</label><input className="input" value={metaForm.slug} onChange={e => setMetaForm({...metaForm, slug: e.target.value})} placeholder="kosongkan untuk generate otomatis dari nama" /></div>
              <div className="form-group"><label className="label">Tema (Black/White)</label>
                <select className="select" value={metaForm.theme} onChange={e => setMetaForm({...metaForm, theme: e.target.value as any})}>
                  <option value="black">Dark Mode (Hitam)</option><option value="white">Light Mode (Putih)</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Status</label>
                <select className="select" value={metaForm.status} onChange={e => setMetaForm({...metaForm, status: e.target.value as any})}>
                  <option value="published">Published</option><option value="draft">Draft</option>
                </select>
              </div>
              {metaError && <p className={styles.formError}>{metaError}</p>}
              <div className={styles.formActions}><button type="submit" className="btn btn-navy" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button></div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.contentHeader}>
        <div>
          <h1 className={styles.contentTitle}>Champagne (Campaigns)</h1>
          <p className={styles.contentDesc}>Kelola halaman sub-landing page</p>
        </div>
        <button className="btn btn-navy" onClick={openCreateMeta}><Plus size={16} /> Buat Campaign</button>
      </div>

      {loading ? <div className={styles.loading}>Memuat...</div> : campaigns.length === 0 ? (
        <div className={styles.emptyState}>Belum ada campaign.</div>
      ) : (
        <div className={styles.linksList}>
          {campaigns.map(c => (
            <div key={c.id} className={styles.linkRow}>
              <div className={styles.linkIcon}><LayoutTemplate size={18} /></div>
              <div className={styles.linkInfo} style={{ cursor: 'pointer' }} onClick={() => setSelectedCampaign(c)}>
                <span className={styles.linkTitle}>{c.title}</span>
                <span className={styles.linkUrl}>
                  {c.status === 'published' ? <span className={styles.statusActive}>Published</span> : <span className={styles.statusSoon}>Draft</span>}
                  {' · '}marcatching.com/{c.slug}
                  {' · '}{c.theme === 'white' ? 'Light' : 'Dark'}
                </span>
              </div>
              <div className={styles.linkActions}>
                <a href={`/${c.slug}`} target="_blank" rel="noreferrer" className={styles.editBtn} title="Lihat Halaman"><Eye size={15}/></a>
                <button className={styles.editBtn} onClick={() => setSelectedCampaign(c)} title="Edit Konten"><Pencil size={15} /></button>
                <button className={styles.deleteBtn} onClick={() => deleteCampaign(c)} title="Hapus"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
