export type ColorKey = 'primaryColor' | 'secondaryColor' | 'accentColor' | 'backgroundColor' | 'textColor'

/** Everything here is optional. Empty string means "not provided", never a default the AI should assume. */
export type VisualIdentity = Record<ColorKey, string> & {
  headingFont: string
  bodyFont: string
  mood: string
  logoNotes: string
  tagline: string
  contactFooter: string
  visualDonts: string
}

export const emptyVisualIdentity: VisualIdentity = {
  primaryColor: '',
  secondaryColor: '',
  accentColor: '',
  backgroundColor: '',
  textColor: '',
  headingFont: '',
  bodyFont: '',
  mood: '',
  logoNotes: '',
  tagline: '',
  contactFooter: '',
  visualDonts: '',
}

export const colorFields: Array<{ key: ColorKey; label: string; hint: string; role: string }> = [
  { key: 'primaryColor', label: 'Primary', hint: 'Warna utama brand: judul, tombol, elemen terpenting.', role: 'judul, tombol, dan elemen utama' },
  { key: 'secondaryColor', label: 'Secondary', hint: 'Pendamping primary: subjudul, blok pendukung, ikon.', role: 'subjudul, blok pendukung, dan ikon' },
  { key: 'accentColor', label: 'Accent', hint: 'Sorotan kecil: angka penting, highlight, badge.', role: 'sorotan kecil seperti angka penting dan badge' },
  { key: 'backgroundColor', label: 'Background', hint: 'Warna latar halaman atau slide.', role: 'latar halaman atau slide' },
  { key: 'textColor', label: 'Teks', hint: 'Warna teks isi. Pastikan terbaca di atas background.', role: 'teks isi' },
]

export type FontOption = {
  name: string
  kind: 'Sans-serif' | 'Serif' | 'Display' | 'Tulisan tangan'
  feel: string
  /** Fallback family for tools that do not have the font installed. */
  fallback: 'sans-serif' | 'serif' | 'cursive'
  /** Google Fonts weights that exist for this family; empty means a single regular weight. */
  weights: string
}

/** Curated, all on Google Fonts so ChatGPT/Claude (and the creator) can actually use them. */
export const fontOptions: FontOption[] = [
  { name: 'Poppins', kind: 'Sans-serif', feel: 'Bulat, ramah, modern', fallback: 'sans-serif', weights: '400;700' },
  { name: 'Inter', kind: 'Sans-serif', feel: 'Netral, bersih, sangat terbaca', fallback: 'sans-serif', weights: '400;700' },
  { name: 'Montserrat', kind: 'Sans-serif', feel: 'Tegas, geometris, percaya diri', fallback: 'sans-serif', weights: '400;700' },
  { name: 'DM Sans', kind: 'Sans-serif', feel: 'Ringan, minimalis, hangat', fallback: 'sans-serif', weights: '400;700' },
  { name: 'Plus Jakarta Sans', kind: 'Sans-serif', feel: 'Modern, profesional, akrab', fallback: 'sans-serif', weights: '400;700' },
  { name: 'Manrope', kind: 'Sans-serif', feel: 'Rapi, teknis, kontemporer', fallback: 'sans-serif', weights: '400;700' },
  { name: 'Outfit', kind: 'Sans-serif', feel: 'Geometris, segar, ringkas', fallback: 'sans-serif', weights: '400;700' },
  { name: 'Nunito Sans', kind: 'Sans-serif', feel: 'Lembut, bersahabat', fallback: 'sans-serif', weights: '400;700' },
  { name: 'Raleway', kind: 'Sans-serif', feel: 'Elegan, tipis, stylish', fallback: 'sans-serif', weights: '400;700' },
  { name: 'Space Grotesk', kind: 'Sans-serif', feel: 'Unik, tech, berkarakter', fallback: 'sans-serif', weights: '400;700' },
  { name: 'Playfair Display', kind: 'Serif', feel: 'Editorial, mewah, klasik', fallback: 'serif', weights: '400;700' },
  { name: 'Lora', kind: 'Serif', feel: 'Hangat, enak dibaca panjang', fallback: 'serif', weights: '400;700' },
  { name: 'Merriweather', kind: 'Serif', feel: 'Kokoh, tepercaya', fallback: 'serif', weights: '400;700' },
  { name: 'Cormorant Garamond', kind: 'Serif', feel: 'Anggun, halus, premium', fallback: 'serif', weights: '400;700' },
  { name: 'DM Serif Display', kind: 'Display', feel: 'Judul elegan dan kontras', fallback: 'serif', weights: '' },
  { name: 'Bebas Neue', kind: 'Display', feel: 'Tinggi, padat, berani', fallback: 'sans-serif', weights: '' },
  { name: 'Oswald', kind: 'Display', feel: 'Ramping, kuat, headline', fallback: 'sans-serif', weights: '400;700' },
  { name: 'Caveat', kind: 'Tulisan tangan', feel: 'Personal, santai (aksen saja)', fallback: 'cursive', weights: '400;700' },
]

export const moodOptions: Array<{ value: string; hint: string }> = [
  { value: 'Minimalis & bersih', hint: 'banyak ruang kosong, sedikit elemen, tegas' },
  { value: 'Bold & berani', hint: 'kontras tinggi, judul besar, energik' },
  { value: 'Hangat & ramah', hint: 'warna lembut, sudut membulat, personal' },
  { value: 'Elegan & premium', hint: 'tenang, rapi, detail halus, kesan mahal' },
  { value: 'Playful & ceria', hint: 'warna cerah, santai, ekspresif' },
  { value: 'Profesional & korporat', hint: 'terstruktur, serius, tepercaya' },
  { value: 'Modern & tech', hint: 'tajam, geometris, futuristik' },
  { value: 'Natural & organik', hint: 'warna bumi, tekstur lembut, tenang' },
]

const googleFontsBase = 'https://fonts.googleapis.com/css2'

/** One stylesheet URL for the picker preview. Weights are per family because a missing weight fails the whole request. */
export function googleFontsPreviewUrl(fonts: FontOption[] = fontOptions) {
  const families = fonts.map(font => `family=${font.name.replace(/ /g, '+')}${font.weights ? `:wght@${font.weights}` : ''}`)
  return `${googleFontsBase}?${families.join('&')}&display=swap`
}

export function findFont(name: string) {
  return fontOptions.find(font => font.name.toLowerCase() === name.trim().toLowerCase())
}

/** Accepts #RGB / #RRGGBB (with or without #), returns "#RRGGBB" upper-case, or "" when invalid. */
export function normalizeHex(value: unknown) {
  if (typeof value !== 'string') return ''
  const match = value.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!match) return ''
  const digits = match[1].length === 3 ? match[1].split('').map(char => char + char).join('') : match[1]
  return `#${digits.toUpperCase()}`
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map(offset => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/** WCAG contrast ratio between two hex colors, or 0 when either is invalid. */
export function contrastRatio(a: string, b: string) {
  const first = normalizeHex(a)
  const second = normalizeHex(b)
  if (!first || !second) return 0
  const [light, dark] = [luminance(first), luminance(second)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

/** Readable-text warnings shown next to the palette. 4.5 is the WCAG AA bar for body text, 3 for large headings. */
export function contrastWarnings(identity: VisualIdentity) {
  const warnings: string[] = []
  const background = normalizeHex(identity.backgroundColor) || '#FFFFFF'
  const checks: Array<[string, string, number]> = [
    ['Teks', identity.textColor, 4.5],
    ['Primary', identity.primaryColor, 3],
  ]
  for (const [label, color, minimum] of checks) {
    const ratio = contrastRatio(color, background)
    if (ratio > 0 && ratio < minimum) {
      warnings.push(`${label} di atas ${normalizeHex(identity.backgroundColor) ? 'background' : 'putih'} kontrasnya ${ratio.toFixed(1)}:1, di bawah ${minimum}:1 sehingga sulit dibaca.`)
    }
  }
  return warnings
}

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.replace(/\u0000/g, '').trim().slice(0, maxLength) : ''
}

export function sanitizeVisualIdentity(value: unknown): VisualIdentity {
  const saved = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  return {
    primaryColor: normalizeHex(saved.primaryColor),
    secondaryColor: normalizeHex(saved.secondaryColor),
    accentColor: normalizeHex(saved.accentColor),
    backgroundColor: normalizeHex(saved.backgroundColor),
    textColor: normalizeHex(saved.textColor),
    headingFont: clean(saved.headingFont, 60),
    bodyFont: clean(saved.bodyFont, 60),
    mood: clean(saved.mood, 60),
    logoNotes: clean(saved.logoNotes, 600),
    tagline: clean(saved.tagline, 200),
    contactFooter: clean(saved.contactFooter, 300),
    visualDonts: clean(saved.visualDonts, 600),
  }
}

export function visualIdentityFilledCount(identity: VisualIdentity) {
  const colors = colorFields.filter(field => normalizeHex(identity[field.key])).length
  const others = [identity.headingFont, identity.bodyFont, identity.mood, identity.logoNotes, identity.tagline, identity.contactFooter, identity.visualDonts]
    .filter(item => item.trim()).length
  return colors + others
}

function fontLine(label: string, name: string) {
  if (!name) return ''
  const known = findFont(name)
  return known
    ? `- ${label}: **${known.name}** (Google Fonts, ${known.kind.toLowerCase()}). Fallback: ${known.fallback}.`
    : `- ${label}: **${name}**. Jika font ini tidak tersedia di alat yang dipakai, gunakan font yang paling mirip dan beri tahu pengguna.`
}

/**
 * Written for the AI that will read brand-memory.md and build documents/PDFs/slides. Deterministic on purpose:
 * hex codes and font names must reach the file exactly as the creator chose them.
 */
export function createVisualIdentityMarkdown(source: unknown) {
  const identity = sanitizeVisualIdentity(source)
  const colors = colorFields.filter(field => identity[field.key])
  const lines = ['## Visual Identity']

  if (!visualIdentityFilledCount(identity)) {
    lines.push('Belum diisi creator. Jangan mengarang warna, font, atau gaya visual brand — tanyakan dulu ke creator sebelum membuat desain, dokumen, atau PDF.', '')
    return lines.join('\n')
  }

  lines.push('Gunakan ini setiap kali membuat dokumen, PDF, slide, atau desain untuk brand ini. Hex code dan nama font di bawah adalah nilai pasti, jangan diubah atau diganti yang "mirip".', '')

  if (colors.length) {
    lines.push('### Warna', '| Peran | Hex |', '| --- | --- |', ...colors.map(field => `| ${field.label} | ${identity[field.key]} |`), '')
    lines.push(
      'Aturan pemakaian warna:',
      ...colors.map(field => `- ${field.label} untuk ${field.role}.`),
      '- Selain palet ini, hanya boleh memakai netral (putih, hitam, abu-abu). Jangan menambah warna merek baru.',
      ...(identity.backgroundColor && identity.textColor ? [] : ['- Warna latar/teks belum ditentukan: pakai putih dan hitam/abu tua, pastikan kontras teks cukup.']),
      ''
    )
  }

  if (identity.headingFont || identity.bodyFont) {
    lines.push('### Tipografi', ...[fontLine('Heading', identity.headingFont), fontLine('Body', identity.bodyFont)].filter(Boolean))
    if (identity.headingFont && !identity.bodyFont) lines.push('- Body belum ditentukan: pakai font heading atau font sans-serif netral yang mudah dibaca.')
    if (identity.bodyFont && !identity.headingFont) lines.push('- Heading belum ditentukan: pakai font body dengan weight bold.')
    lines.push('')
  }

  const style = [
    identity.mood && `- Mood: ${identity.mood}${moodOptions.find(option => option.value === identity.mood)?.hint ? ` (${moodOptions.find(option => option.value === identity.mood)?.hint})` : ''}.`,
    identity.tagline && `- Tagline: "${identity.tagline}"`,
    identity.contactFooter && `- Footer/kontak (untuk cover atau footer dokumen): ${identity.contactFooter}`,
    identity.logoNotes && `- Logo: ${identity.logoNotes}`,
    identity.visualDonts && `- Hindari secara visual: ${identity.visualDonts}`,
  ].filter(Boolean) as string[]
  if (style.length) lines.push('### Gaya & Aset', ...style, '')

  return lines.filter((line, index, all) => !(line === '' && all[index - 1] === '')).join('\n')
}
