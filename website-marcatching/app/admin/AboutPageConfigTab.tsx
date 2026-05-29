import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { showAdminToast } from './page'
import { Plus, X, Check, Camera, Upload } from 'lucide-react'
import Cropper from 'react-easy-crop'
import styles from './admin.module.css'

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

export default function AboutPageConfigTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadTarget, setUploadTarget] = useState<'founder' | string | null>(null)
  
  const [products, setProducts] = useState<{id: string, name: string}[]>([])
  const [articles, setArticles] = useState<{id: string, title: string}[]>([])
  const [surveys, setSurveys] = useState<{id: string, title: string}[]>([])

  const [cropData, setCropData] = useState<{ src: string, file?: File }>({ src: '' })
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => { setCroppedAreaPixels(croppedAreaPixels) }, [])

  const [form, setForm] = useState({
    contact_email: '',
    cta_text: '',
    cta_url: '',
    founder_name: '',
    founder_photo_url: '',
    founder_quote: '',
    comparison_pros: [] as string[],
    comparison_cons: [] as string[],
    // Ecosystem links
    article_url: '/article',
    instagram_url: 'https://www.instagram.com/marcatching.id/',
    tiktok_url: 'https://www.tiktok.com/@marcatching',
    survey_url: '/survey',
    store_url: '/store',
    // Impact stats
    stat_umkm_helped: 0,
    stat_total_reach: 0,
    stat_product_sold: 0,
    // Embed visuals (legacy, kept for fallback)
    embed_social_image_url: '',
    embed_social_title: 'Tonton di Instagram',
    embed_survey_image_url: '',
    embed_survey_title: 'Mulai Survey Gratis',
    embed_product_id: '',
    // Dynamic Ecosystem
    ecosystem_sections: [] as any[]
  })

  useEffect(() => {
    // Fetch available products, articles, surveys for dropdowns
    supabase.from('products').select('id, name').order('name').then(({ data }) => { if (data) setProducts(data) })
    supabase.from('articles').select('id, title').order('created_at', { ascending: false }).then(({ data }) => { if (data) setArticles(data) })
    supabase.from('surveys').select('id, title').order('created_at', { ascending: false }).then(({ data }) => { if (data) setSurveys(data) })

    fetch('/api/about-config')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setForm({
            contact_email: data.contact_email || '',
            cta_text: data.cta_text || '',
            cta_url: data.cta_url || '',
            founder_name: data.founder_name || '',
            founder_photo_url: data.founder_photo_url || '',
            founder_quote: data.founder_quote || '',
            comparison_pros: data.comparison_pros || [],
            comparison_cons: data.comparison_cons || [],
            article_url: data.article_url || '/article',
            instagram_url: data.instagram_url || 'https://www.instagram.com/marcatching.id/',
            tiktok_url: data.tiktok_url || 'https://www.tiktok.com/@marcatching',
            survey_url: data.survey_url || '/survey',
            store_url: data.store_url || '/store',
            stat_umkm_helped: data.stat_umkm_helped || 0,
            stat_total_reach: data.stat_total_reach || 0,
            stat_product_sold: data.stat_product_sold || 0,
            embed_social_image_url: data.embed_social_image_url || '',
            embed_social_title: data.embed_social_title || 'Tonton di Instagram',
            embed_survey_image_url: data.embed_survey_image_url || '',
            embed_survey_title: data.embed_survey_title || 'Mulai Survey Gratis',
            embed_product_id: data.embed_product_id || '',
            ecosystem_sections: data.ecosystem_sections || []
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/about-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) { setSuccessMsg('Konfigurasi berhasil disimpan!'); showAdminToast('Konfigurasi About Page disimpan') }
      else setErrorMsg(data.error || 'Gagal menyimpan konfigurasi.')
    } catch (err: any) {
      setErrorMsg('Network error.')
    }
    setSaving(false)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function handleGenericUpload(e: React.ChangeEvent<HTMLInputElement>, target: string) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadTarget(target)
    const reader = new FileReader()
    reader.onload = () => setCropData({ src: reader.result as string, file })
    reader.readAsDataURL(file)
  }

  // Builder Helpers
  function addSection() {
    setForm(f => ({
      ...f,
      ecosystem_sections: [
        ...f.ecosystem_sections,
        { id: `sec-${Date.now()}`, title: 'New Section', items: [] }
      ]
    }))
  }

  function removeSection(secIndex: number) {
    setForm(f => ({
      ...f,
      ecosystem_sections: f.ecosystem_sections.filter((_, i) => i !== secIndex)
    }))
  }

  function updateSection(secIndex: number, title: string) {
    setForm(f => {
      const newSec = [...f.ecosystem_sections]
      newSec[secIndex].title = title
      return { ...f, ecosystem_sections: newSec }
    })
  }

  function addItem(secIndex: number) {
    setForm(f => {
      const newSec = [...f.ecosystem_sections]
      newSec[secIndex].items.push({
        id: `item-${Date.now()}`,
        type: 'article',
        ref_id: '',
        content_url: '',
        content_title: '',
        content_image_url: ''
      })
      return { ...f, ecosystem_sections: newSec }
    })
  }

  function removeItem(secIndex: number, itemIndex: number) {
    setForm(f => {
      const newSec = [...f.ecosystem_sections]
      newSec[secIndex].items = newSec[secIndex].items.filter((_: any, i: number) => i !== itemIndex)
      return { ...f, ecosystem_sections: newSec }
    })
  }

  function updateItem(secIndex: number, itemIndex: number, field: string, value: any) {
    setForm(f => {
      const newSec = [...f.ecosystem_sections]
      newSec[secIndex].items[itemIndex][field] = value
      return { ...f, ecosystem_sections: newSec }
    })
  }

  function addPro(val: string) { if (val.trim()) setForm(f => ({ ...f, comparison_pros: [...f.comparison_pros, val.trim()] })) }
  function addCon(val: string) { if(val.trim()) setForm(f => ({ ...f, comparison_cons: [...f.comparison_cons, val.trim()] })) }
  function removePro(idx: number) { setForm(f => ({ ...f, comparison_pros: f.comparison_pros.filter((_, i) => i !== idx) })) }
  function removeCon(idx: number) { setForm(f => ({ ...f, comparison_cons: f.comparison_cons.filter((_, i) => i !== idx) })) }

  if (loading) return <div className={styles.loading}>Memuat Konfigurasi About...</div>

  return (
    <div className={styles.tabContent}>
      <div className={styles.contentHeader}>
        <div>
          <h1 className={styles.contentTitle}>About Page</h1>
          <p className={styles.contentDesc}>Kelola informasi public pada halaman marcatching.com</p>
        </div>
      </div>

      <form onSubmit={saveConfig} className={styles.formCard} style={{ maxWidth: 800 }}>
        {errorMsg && <p className={styles.formError}>{errorMsg}</p>}
        {successMsg && <p className={styles.statusActive} style={{ marginBottom: 16 }}>{successMsg}</p>}

        <h3 className={styles.formTitle}>Kontak & Action</h3>
        <div className={styles.formGrid}>
          <div className="form-group">
            <label className="label">Contact Email Target</label>
            <input className="input" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Button Text (Bottom CTA)</label>
            <input className="input" value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Button URL (Bottom CTA)</label>
            <input className="input" value={form.cta_url} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} />
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(0,0,0,0.05)', margin: '30px 0' }} />
        
        <h3 className={styles.formTitle}>Profil Founder</h3>
        <div className="form-group">
          <label className="label">Foto Co-Founder / The Architect</label>
          <div className={styles.uploadArea} style={{ maxWidth: 300 }}>
            <input type="file" accept="image/*" onChange={(e) => handleGenericUpload(e, 'founder')} disabled={uploadingImage} className={styles.fileInput} />
            <div className={styles.uploadLabel}><Upload size={20} />{uploadingImage && uploadTarget === 'founder' ? 'Mengupload...' : 'Pilih Foto Jelas'}</div>
          </div>
          {form.founder_photo_url && (
            <div style={{ marginTop: 12 }}>
              <img src={form.founder_photo_url.includes('drive.google.com') ? form.founder_photo_url.replace(/uc\?export=view&id=/, 'thumbnail?id=') + '&sz=w400-h400' : form.founder_photo_url} alt="Founder Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="label">Nama Founder</label>
          <input className="input" value={form.founder_name} onChange={e => setForm(f => ({ ...f, founder_name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="label">Kutipan / Quote Founder</label>
          <textarea className="input" rows={4} value={form.founder_quote} onChange={e => setForm(f => ({ ...f, founder_quote: e.target.value }))} />
        </div>

        <hr style={{ borderColor: 'rgba(0,0,0,0.05)', margin: '30px 0' }} />
        
        <div className={styles.formGrid}>
          <div className="form-group">
            <label className="label">Marcatching Cocok Untuk (Pro)</label>
            <ProsConsList items={form.comparison_pros} onAdd={addPro} onRemove={removePro} color="#16a34a" />
          </div>
          <div className="form-group">
            <label className="label">TIDAK Cocok Untuk (Kontra)</label>
            <ProsConsList items={form.comparison_cons} onAdd={addCon} onRemove={removeCon} color="#dc2626" />
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(0,0,0,0.05)', margin: '30px 0' }} />

        <h3 className={styles.formTitle}>Link Ekosistem</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>URL untuk setiap card di section "From Insight to Impact" dan tombol popup.</p>
        <div className={styles.formGrid}>
          <div className="form-group">
            <label className="label">Articles URL</label>
            <input className="input" value={form.article_url} onChange={e => setForm(f => ({ ...f, article_url: e.target.value }))} placeholder="/article" />
          </div>
          <div className="form-group">
            <label className="label">Instagram URL</label>
            <input className="input" value={form.instagram_url} onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))} placeholder="https://www.instagram.com/marcatching.id/" />
          </div>
          <div className="form-group">
            <label className="label">TikTok URL</label>
            <input className="input" value={form.tiktok_url} onChange={e => setForm(f => ({ ...f, tiktok_url: e.target.value }))} placeholder="https://www.tiktok.com/@marcatching" />
          </div>
          <div className="form-group">
            <label className="label">Survey URL</label>
            <input className="input" value={form.survey_url} onChange={e => setForm(f => ({ ...f, survey_url: e.target.value }))} placeholder="/survey" />
          </div>
          <div className="form-group">
            <label className="label">Store URL</label>
            <input className="input" value={form.store_url} onChange={e => setForm(f => ({ ...f, store_url: e.target.value }))} placeholder="/store" />
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(0,0,0,0.05)', margin: '30px 0' }} />

        <h3 className={styles.formTitle}>Dynamic Ecosystem Sections</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>Buat section-section baru yang membatasi tiap kelompok card. Kamu bisa menambah Artikel, Produk, Survey, atau custom link.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {form.ecosystem_sections.map((section, secIdx) => (
            <div key={section.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <input 
                  className="input" 
                  value={section.title} 
                  onChange={e => updateSection(secIdx, e.target.value)} 
                  placeholder="Nama Section (misal: Premium Store)" 
                  style={{ fontWeight: 600, fontSize: '1.05rem' }}
                />
                <button type="button" onClick={() => removeSection(secIdx)} className="btn btn-ghost" style={{ color: '#dc2626', borderColor: '#fca5a5' }}><X size={16}/></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 16, borderLeft: '2px solid #e2e8f0' }}>
                {section.items.map((item: any, itemIdx: number) => (
                  <div key={item.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <select 
                        className="input" 
                        value={item.type} 
                        onChange={e => {
                          updateItem(secIdx, itemIdx, 'type', e.target.value);
                          updateItem(secIdx, itemIdx, 'ref_id', ''); // reset ref
                        }} 
                        style={{ width: '200px', appearance: 'auto', WebkitAppearance: 'menulist' }}
                      >
                        <option value="article">Article</option>
                        <option value="product">Product</option>
                        <option value="survey">Survey</option>
                        <option value="content">Custom Content (Link)</option>
                      </select>
                      <button type="button" onClick={() => removeItem(secIdx, itemIdx)} className="btn btn-ghost" style={{ padding: '6px' }}><X size={14}/></button>
                    </div>

                    {item.type === 'article' && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label">Pilih Artikel</label>
                        <select className="input" value={item.ref_id} onChange={e => updateItem(secIdx, itemIdx, 'ref_id', e.target.value)} style={{ appearance: 'auto', WebkitAppearance: 'menulist' }}>
                          <option value="">-- Pilih Artikel --</option>
                          {articles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                        </select>
                      </div>
                    )}
                    
                    {item.type === 'product' && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label">Pilih Produk</label>
                        <select className="input" value={item.ref_id} onChange={e => updateItem(secIdx, itemIdx, 'ref_id', e.target.value)} style={{ appearance: 'auto', WebkitAppearance: 'menulist' }}>
                          <option value="">-- Pilih Produk --</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    )}

                    {item.type === 'survey' && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label">Pilih Survey</label>
                        <select className="input" value={item.ref_id} onChange={e => updateItem(secIdx, itemIdx, 'ref_id', e.target.value)} style={{ appearance: 'auto', WebkitAppearance: 'menulist' }}>
                          <option value="">-- Pilih Survey --</option>
                          {surveys.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                      </div>
                    )}

                    {item.type === 'content' && (
                      <div className={styles.formGrid}>
                        <div className="form-group">
                          <label className="label">Judul Card</label>
                          <input className="input" value={item.content_title || ''} onChange={e => updateItem(secIdx, itemIdx, 'content_title', e.target.value)} placeholder="Tonton di IG" />
                        </div>
                        <div className="form-group">
                          <label className="label">URL Tujuan</label>
                          <input className="input" value={item.content_url || ''} onChange={e => updateItem(secIdx, itemIdx, 'content_url', e.target.value)} placeholder="https://instagram.com/..." />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="label">Thumbnail (Rasio 16:9 disarankan)</label>
                          <div className={styles.uploadArea}>
                            <input type="file" accept="image/*" onChange={(e) => handleGenericUpload(e, `item-${secIdx}-${itemIdx}`)} disabled={uploadingImage} className={styles.fileInput} />
                            <div className={styles.uploadLabel}><Upload size={20} />{uploadingImage && uploadTarget === `item-${secIdx}-${itemIdx}` ? 'Mengupload...' : 'Pilih Gambar'}</div>
                          </div>
                          {item.content_image_url && (
                            <div style={{ marginTop: 12 }}>
                              <img src={item.content_image_url.includes('drive.google.com') ? item.content_image_url.replace(/uc\?export=view&id=/, 'thumbnail?id=') + '&sz=w400-h225' : item.content_image_url} alt="Preview" style={{ width: 160, height: 90, objectFit: 'cover', borderRadius: 8 }} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <button type="button" onClick={() => addItem(secIdx)} className="btn btn-outline" style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '0.8rem' }}><Plus size={14} /> Tambah Item</button>
              </div>
            </div>
          ))}
          
          <button type="button" onClick={addSection} className="btn btn-outline" style={{ alignSelf: 'center', borderStyle: 'dashed' }}><Plus size={18} /> Buat Section Baru</button>
        </div>

        <hr style={{ borderColor: 'rgba(0,0,0,0.05)', margin: '30px 0' }} />

        <h3 className={styles.formTitle}>Impact Stats (Live Count)</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>Angka yang ditampilkan di section "Marcatching Impact in Motion". Counter akan animate dari 0 ke angka ini.</p>
        <div className={styles.formGrid}>
          <div className="form-group">
            <label className="label">UMKM Terbantu</label>
            <input className="input" type="number" min={0} value={form.stat_umkm_helped} onChange={e => setForm(f => ({ ...f, stat_umkm_helped: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="form-group">
            <label className="label">Total Reached</label>
            <input className="input" type="number" min={0} value={form.stat_total_reach} onChange={e => setForm(f => ({ ...f, stat_total_reach: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="form-group">
            <label className="label">Products Sold</label>
            <input className="input" type="number" min={0} value={form.stat_product_sold} onChange={e => setForm(f => ({ ...f, stat_product_sold: parseInt(e.target.value) || 0 }))} />
          </div>
        </div>

        <div className={styles.formActions} style={{ marginTop: 40 }}>
          <button type="submit" className="btn btn-navy" disabled={saving}>
            {saving ? 'Menyimpan...' : <><Check size={16} /> Update Halaman About</>}
          </button>
        </div>
      </form>

      {cropData.src && (
        <div className={styles.cropModalOverlay}>
          <div className={styles.cropModalContent} style={{ width: 400, margin: '0 auto' }}>
            <div className={styles.cropModalHeader}>
              <h3 className={styles.cropModalTitle}>Potong Foto {uploadTarget === 'founder' ? 'Founder' : 'Konten'}</h3>
              <button onClick={() => setCropData({ src: '' })} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <div style={{ position: 'relative', height: 400, background: '#333' }}>
              <Cropper
                image={cropData.src}
                crop={crop}
                zoom={zoom}
                aspect={uploadTarget === 'founder' ? 9 / 16 : 16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ padding: '20px', display: 'flex', gap: 10, justifyContent: 'flex-end', background: '#fff' }}>
              <button disabled={uploadingImage} onClick={async () => {
                if (!croppedAreaPixels) return
                setUploadingImage(true)
                try {
                  const base64 = await getCroppedImg(cropData.src, croppedAreaPixels)
                  const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'
                  const res = await fetch(appScriptUrl, { 
                    method: 'POST', 
                    body: JSON.stringify({ action: 'upload', filename: cropData.file?.name || 'founder.jpg', mimeType: 'image/jpeg', base64 }) 
                  })
                  const data = await res.json()
                  if (data.status === 'success') {
                    if (uploadTarget === 'founder') {
                      setForm(f => ({ ...f, founder_photo_url: data.url }))
                    } else if (uploadTarget?.startsWith('item-')) {
                      // It's a custom content upload
                      const parts = uploadTarget.split('-')
                      const secIdx = parseInt(parts[1])
                      const itemIdx = parseInt(parts[2])
                      updateItem(secIdx, itemIdx, 'content_image_url', data.url)
                    }
                    setCropData({ src: '' })
                  } else alert('Gagal: ' + data.message)
                } catch (err) { alert('Gagal mengupload gambar.') }
                setUploadingImage(false)
              }} className="btn btn-navy">{uploadingImage ? 'Mengupload...' : 'Crop & Upload'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProsConsList({ items, onAdd, onRemove, color }: { items: string[], onAdd: (v:string)=>void, onRemove: (i:number)=>void, color: string }) {
  const [val, setVal] = useState('')
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <input className="input" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); onAdd(val); setVal(''); } }} placeholder="Tambahkan poin baru..." />
        <button type="button" className="btn btn-ghost" onClick={() => { onAdd(val); setVal('') }} style={{ color, borderColor: color }}><Plus size={16}/></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <span style={{ color, marginTop: 2 }}>✦</span>
            <span style={{ flex: 1, fontSize: '0.9rem' }}>{it}</span>
            <button type="button" onClick={() => onRemove(i)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14}/></button>
          </div>
        ))}
      </div>
    </div>
  )
}
