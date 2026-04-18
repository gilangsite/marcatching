import { useState, useEffect } from 'react'
import { Plus, X, Check, Camera, Upload } from 'lucide-react'
import styles from './admin.module.css'

export default function AboutPageConfigTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [form, setForm] = useState({
    contact_email: '',
    cta_text: '',
    cta_url: '',
    founder_name: '',
    founder_photo_url: '',
    founder_quote: '',
    comparison_pros: [] as string[],
    comparison_cons: [] as string[]
  })

  useEffect(() => {
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
            comparison_cons: data.comparison_cons || []
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingImage(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      // Base64 upload to server via existing app script or generic route?
      // Since App Script expects {action: 'upload', filename, mimeType, base64}
      const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'
      try {
        const res = await fetch(appScriptUrl, { 
          method: 'POST', 
          body: JSON.stringify({ action: 'upload', filename: file.name, mimeType: file.type, base64 }) 
        })
        const data = await res.json()
        if (data.status === 'success') {
          setForm(f => ({ ...f, founder_photo_url: data.url }))
        } else {
          alert('Gagal upload gambar: ' + data.message)
        }
      } catch (err) {
        alert('Gagal mengupload gambar.')
      }
      setUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  function addPro(val: string) { if(val.trim()) setForm(f => ({ ...f, comparison_pros: [...f.comparison_pros, val.trim()] })) }
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
            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingImage} className={styles.fileInput} />
            <div className={styles.uploadLabel}><Upload size={20} />{uploadingImage ? 'Mengupload...' : 'Pilih Foto Jelas'}</div>
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

        <div className={styles.formActions} style={{ marginTop: 40 }}>
          <button type="submit" className="btn btn-navy" disabled={saving}>
            {saving ? 'Menyimpan...' : <><Check size={16} /> Update Halaman About</>}
          </button>
        </div>
      </form>
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
