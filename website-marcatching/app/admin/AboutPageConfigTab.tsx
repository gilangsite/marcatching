import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
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
  const [uploadTarget, setUploadTarget] = useState<'founder' | 'social' | 'survey' | null>(null)
  const [products, setProducts] = useState<{id: string, name: string}[]>([])

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
    // Embed visuals
    embed_social_image_url: '',
    embed_social_title: 'Tonton di Instagram',
    embed_survey_image_url: '',
    embed_survey_title: 'Mulai Survey Gratis',
    embed_product_id: ''
  })

  useEffect(() => {
    // Fetch available products for dropdown
    supabase.from('products').select('id, name').order('name').then(({ data }) => {
      if (data) setProducts(data)
    })

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
            embed_product_id: data.embed_product_id || ''
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
      if (res.ok) setSuccessMsg('Konfigurasi berhasil disimpan!')
      else setErrorMsg(data.error || 'Gagal menyimpan konfigurasi.')
    } catch (err: any) {
      setErrorMsg('Network error.')
    }
    setSaving(false)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function handleGenericUpload(e: React.ChangeEvent<HTMLInputElement>, target: 'founder' | 'social' | 'survey') {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadTarget(target)
    const reader = new FileReader()
    reader.onload = () => setCropData({ src: reader.result as string, file })
    reader.readAsDataURL(file)
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
          <p className={styles.contentDesc}>Kelola informasi public pada halaman marcatching.com/about</p>
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

        <h3 className={styles.formTitle}>Visual Embeds (Card Grid)</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>Konten visual yang akan ditampilkan di card ekosistem untuk membuka popup.</p>
        
        <div className={styles.formGrid}>
          {/* Social Media Embed */}
          <div className="form-group">
            <label className="label">Social Media Card Title</label>
            <input className="input" value={form.embed_social_title} onChange={e => setForm(f => ({ ...f, embed_social_title: e.target.value }))} />
            
            <label className="label" style={{ marginTop: 12 }}>Thumbnail Social Media</label>
            <div className={styles.uploadArea}>
              <input type="file" accept="image/*" onChange={(e) => handleGenericUpload(e, 'social')} disabled={uploadingImage} className={styles.fileInput} />
              <div className={styles.uploadLabel}><Upload size={20} />{uploadingImage && uploadTarget === 'social' ? 'Mengupload...' : 'Pilih Gambar Thumbnail'}</div>
            </div>
            {form.embed_social_image_url && (
              <div style={{ marginTop: 12 }}>
                <img src={form.embed_social_image_url.includes('drive.google.com') ? form.embed_social_image_url.replace(/uc\?export=view&id=/, 'thumbnail?id=') + '&sz=w600-h600' : form.embed_social_image_url} alt="Social Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              </div>
            )}
          </div>

          {/* Survey Embed */}
          <div className="form-group">
            <label className="label">Survey Card Title</label>
            <input className="input" value={form.embed_survey_title} onChange={e => setForm(f => ({ ...f, embed_survey_title: e.target.value }))} />
            
            <label className="label" style={{ marginTop: 12 }}>Thumbnail Survey</label>
            <div className={styles.uploadArea}>
              <input type="file" accept="image/*" onChange={(e) => handleGenericUpload(e, 'survey')} disabled={uploadingImage} className={styles.fileInput} />
              <div className={styles.uploadLabel}><Upload size={20} />{uploadingImage && uploadTarget === 'survey' ? 'Mengupload...' : 'Pilih Gambar Thumbnail'}</div>
            </div>
            {form.embed_survey_image_url && (
              <div style={{ marginTop: 12 }}>
                <img src={form.embed_survey_image_url.includes('drive.google.com') ? form.embed_survey_image_url.replace(/uc\?export=view&id=/, 'thumbnail?id=') + '&sz=w600-h600' : form.embed_survey_image_url} alt="Survey Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              </div>
            )}
          </div>

          {/* Store Product Embed */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="label">Featured Store Product</label>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 8 }}>Pilih produk yang akan di-embed di card Store. Gambar dan harga akan diambil otomatis.</p>
            <select className="input" value={form.embed_product_id} onChange={e => setForm(f => ({ ...f, embed_product_id: e.target.value }))} style={{ appearance: 'auto', WebkitAppearance: 'menulist' }}>
              <option value="">-- Pilih Produk --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
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
              <h3 className={styles.cropModalTitle}>Potong Foto {uploadTarget === 'founder' ? 'Founder' : uploadTarget === 'social' ? 'Social Media' : 'Survey'}</h3>
              <button onClick={() => setCropData({ src: '' })} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <div style={{ position: 'relative', height: 400, background: '#333' }}>
              <Cropper
                image={cropData.src}
                crop={crop}
                zoom={zoom}
                aspect={uploadTarget === 'founder' ? 9 / 16 : 1 / 1} /* 1:1 for social/survey */
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
                    } else if (uploadTarget === 'social') {
                      setForm(f => ({ ...f, embed_social_image_url: data.url }))
                    } else if (uploadTarget === 'survey') {
                      setForm(f => ({ ...f, embed_survey_image_url: data.url }))
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
