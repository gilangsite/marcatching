'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Palette, TriangleAlert, X } from 'lucide-react'
import {
  colorFields,
  contrastRatio,
  contrastWarnings,
  findFont,
  fontOptions,
  googleFontsPreviewUrl,
  moodOptions,
  normalizeHex,
  visualIdentityFilledCount,
  emptyVisualIdentity,
  type VisualIdentity,
} from '../visualIdentity'
import styles from './workspace.module.css'

type Props = {
  value: VisualIdentity
  onChange: (next: VisualIdentity) => void
}

const FONT_LINK_ID = 'marcatching-brand-font-preview'
const sampleText = 'Brand yang konsisten, 1234567890'

function fontFamily(name: string) {
  if (!name.trim()) return undefined
  const known = findFont(name)
  return `'${name.replace(/'/g, '')}', ${known?.fallback || 'sans-serif'}`
}

/** Readable text color (black or white) for a given background. */
function inkFor(background: string) {
  return contrastRatio('#FFFFFF', background) >= contrastRatio('#000000', background) ? '#FFFFFF' : '#000000'
}

export default function VisualIdentityEditor({ value, onChange }: Props) {
  const filled = visualIdentityFilledCount(value)
  const [open, setOpen] = useState(false)
  const warnings = contrastWarnings(value)

  // Google Fonts is only fetched once the card is opened, so the page stays light for people who skip this.
  useEffect(() => {
    if (!open || document.getElementById(FONT_LINK_ID)) return
    const link = document.createElement('link')
    link.id = FONT_LINK_ID
    link.rel = 'stylesheet'
    link.href = googleFontsPreviewUrl()
    document.head.appendChild(link)
  }, [open])

  function patch(partial: Partial<VisualIdentity>) {
    onChange({ ...value, ...partial })
  }

  const swatches = colorFields.map(field => normalizeHex(value[field.key])).filter(Boolean)

  return (
    <section className={styles.viCard}>
      <button type="button" className={styles.viHead} onClick={() => setOpen(current => !current)} aria-expanded={open}>
        <Palette size={18} />
        <span>
          <strong>Brand Identity <em>Opsional</em></strong>
          <small>Warna, font, dan gaya visual. Berguna kalau kamu mau ChatGPT/Claude langsung membuat PDF atau dokumen sesuai brand. Boleh dilewati.</small>
        </span>
        {swatches.length > 0 && (
          <span className={styles.viStrip} aria-hidden>{swatches.map((hex, index) => <i key={`${hex}-${index}`} style={{ background: hex }} />)}</span>
        )}
        <b>{filled ? `${filled} terisi` : 'Kosong'}</b>
        <ChevronDown size={16} className={open ? styles.viChevronOpen : undefined} />
      </button>

      {open && (
        <div className={styles.viBody}>
          <div className={styles.viGroup}>
            <h4>Warna <small>Hex code, contoh #1E3A8A</small></h4>
            <div className={styles.viColors}>
              {colorFields.map(field => (
                <ColorRow key={field.key} label={field.label} hint={field.hint} value={value[field.key]} onChange={next => patch({ [field.key]: next } as Partial<VisualIdentity>)} />
              ))}
            </div>
            {warnings.map(warning => <p key={warning} className={styles.aiNote}><TriangleAlert size={14} /> {warning}</p>)}
          </div>

          <div className={styles.viGroup}>
            <h4>Font <small>Semua tersedia gratis di Google Fonts</small></h4>
            <div className={styles.viFonts}>
              <FontPicker label="Font judul (heading)" value={value.headingFont} onChange={next => patch({ headingFont: next })} />
              <FontPicker label="Font isi (body)" value={value.bodyFont} onChange={next => patch({ bodyFont: next })} />
            </div>
          </div>

          <div className={styles.viGroup}>
            <h4>Mood visual <small>Pilih satu yang paling mendekati</small></h4>
            <div className={styles.viChips}>
              {moodOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={value.mood === option.value ? styles.viChipActive : undefined}
                  onClick={() => patch({ mood: value.mood === option.value ? '' : option.value })}
                  title={option.hint}
                >
                  {option.value}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.viGroup}>
            <h4>Detail lain <small>Semua boleh dikosongkan</small></h4>
            <div className={styles.viFields}>
              <label><span>Tagline / slogan</span><input value={value.tagline} maxLength={200} onChange={event => patch({ tagline: event.target.value })} placeholder="Contoh: Konten yang menjual tanpa terasa menjual" /></label>
              <label><span>Footer / kontak di dokumen</span><input value={value.contactFooter} maxLength={300} onChange={event => patch({ contactFooter: event.target.value })} placeholder="Contoh: marcatching.com · @marcatching · halo@marcatching.com" /></label>
              <label><span>Logo</span><textarea value={value.logoNotes} maxLength={600} rows={2} onChange={event => patch({ logoNotes: event.target.value })} placeholder="Contoh: Logo ada di link ini..., taruh di pojok kiri atas, jangan diubah warnanya." /></label>
              <label><span>Hindari secara visual</span><textarea value={value.visualDonts} maxLength={600} rows={2} onChange={event => patch({ visualDonts: event.target.value })} placeholder="Contoh: tanpa gradien, tanpa emoji di dokumen formal, tanpa foto stok yang kaku." /></label>
            </div>
          </div>

          <Preview value={value} />

          {filled > 0 && (
            <div className={styles.aiActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => onChange({ ...emptyVisualIdentity })}><X size={15} /> Kosongkan Brand Identity</button>
              <small>Tersimpan otomatis dan ikut masuk ke brand-memory.md serta Skill yang kamu download.</small>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function ColorRow({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (next: string) => void }) {
  const valid = normalizeHex(value)
  const invalid = Boolean(value.trim()) && !valid
  return (
    <div className={styles.viColorRow}>
      <label className={`${styles.viSwatch} ${valid ? '' : styles.viSwatchEmpty}`} style={valid ? { background: valid } : undefined} aria-label={`Pilih warna ${label}`}>
        <input type="color" value={valid || '#000000'} onChange={event => onChange(event.target.value.toUpperCase())} />
      </label>
      <div>
        <strong>{label}</strong>
        <small>{hint}</small>
      </div>
      <input
        className={invalid ? styles.viInvalid : undefined}
        value={value}
        maxLength={7}
        spellCheck={false}
        placeholder="#000000"
        aria-label={`Hex ${label}`}
        aria-invalid={invalid}
        onChange={event => onChange(event.target.value)}
        onBlur={() => { if (valid && valid !== value) onChange(valid) }}
      />
      {value && <button type="button" onClick={() => onChange('')} aria-label={`Hapus ${label}`}><X size={13} /></button>}
      {invalid && <p>Format hex: # lalu 3 atau 6 karakter, contoh #1E3A8A.</p>}
    </div>
  )
}

function FontPicker({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(Boolean(value) && !findFont(value))
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  const kinds = [...new Set(fontOptions.map(font => font.kind))]

  return (
    <div className={styles.viFontPicker} ref={root}>
      <span>{label}</span>
      <button type="button" className={styles.viFontButton} onClick={() => setOpen(current => !current)} aria-haspopup="listbox" aria-expanded={open}>
        {value ? <em style={{ fontFamily: fontFamily(value) }}>{value}</em> : <i>Pilih font (opsional)</i>}
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className={styles.viFontList} role="listbox" aria-label={label}>
          {value && <button type="button" role="option" aria-selected={false} className={styles.viFontClear} onClick={() => { onChange(''); setCustom(false); setOpen(false) }}>Kosongkan pilihan</button>}
          {kinds.map(kind => (
            <div key={kind}>
              <p>{kind}</p>
              {fontOptions.filter(font => font.kind === kind).map(font => (
                <button
                  key={font.name}
                  type="button"
                  role="option"
                  aria-selected={value === font.name}
                  className={value === font.name ? styles.viFontActive : undefined}
                  onClick={() => { onChange(font.name); setCustom(false); setOpen(false) }}
                >
                  <strong style={{ fontFamily: fontFamily(font.name) }}>{font.name}</strong>
                  <span style={{ fontFamily: fontFamily(font.name) }}>{sampleText}</span>
                  <small>{font.feel}</small>
                </button>
              ))}
            </div>
          ))}
          <button type="button" role="option" aria-selected={custom} className={styles.viFontClear} onClick={() => { setCustom(true); if (findFont(value)) onChange(''); setOpen(false) }}>Font lain (ketik sendiri)</button>
        </div>
      )}
      {custom && (
        <input value={value} maxLength={60} onChange={event => onChange(event.target.value)} placeholder="Nama font persis seperti di Google Fonts / Canva" aria-label={`${label}, nama font`} />
      )}
    </div>
  )
}

function Preview({ value }: { value: VisualIdentity }) {
  const primary = normalizeHex(value.primaryColor)
  const secondary = normalizeHex(value.secondaryColor)
  const accent = normalizeHex(value.accentColor)
  const background = normalizeHex(value.backgroundColor) || '#FFFFFF'
  const text = normalizeHex(value.textColor) || (inkFor(background) === '#FFFFFF' ? '#E5E7EB' : '#1F2937')
  const heading = fontFamily(value.headingFont || value.bodyFont)
  const body = fontFamily(value.bodyFont || value.headingFont)
  const accentColor = accent || primary || '#6B7280'

  return (
    <div className={styles.viPreviewWrap}>
      <small>Contoh tampilan dokumen</small>
      <div className={styles.viPreview} style={{ background, color: text, fontFamily: body }}>
        <div className={styles.viPreviewTop}>
          <span style={{ color: secondary || primary || text }}>LAPORAN · 2026</span>
          <i style={{ background: accentColor, color: inkFor(accentColor) }}>Baru</i>
        </div>
        <h5 style={{ color: primary || text, fontFamily: heading }}>Judul dokumen yang terasa seperti brand kamu</h5>
        <p style={{ fontFamily: body }}>Begini kira-kira paragraf isi dokumen yang dibuat AI dengan font dan warna pilihanmu. Cek apakah teks nyaman dibaca di atas latar ini.</p>
        <div className={styles.viPreviewRow}>
          <b style={{ background: primary || text, color: inkFor(primary || text) }}>Ajakan utama</b>
          <b style={{ background: secondary || 'transparent', color: secondary ? inkFor(secondary) : text, border: secondary ? 'none' : `1px solid ${text}` }}>Pendukung</b>
        </div>
        {(value.tagline || value.contactFooter) && (
          <footer style={{ borderTopColor: secondary || primary || text }}>{[value.tagline, value.contactFooter].filter(Boolean).join('  ·  ')}</footer>
        )}
      </div>
    </div>
  )
}
