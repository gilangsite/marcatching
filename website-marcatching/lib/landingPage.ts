import { contrastRatio, findFont, googleFontsPreviewUrl, normalizeHex, type FontOption, type VisualIdentity } from '../app/course/visualIdentity'

/**
 * Shared (browser + server) model for member landing pages at page.marcatching.com/<slug>.
 * Everything a visitor can see passes through the sanitizers here, so the public page never renders
 * a URL scheme, video host, or image origin that was not explicitly allowed.
 */

export type LandingTheme = 'black' | 'white'
export type LandingStatus = 'draft' | 'published' | 'suspended'
export type ButtonSource = 'instagram' | 'tiktok' | 'youtube' | 'website' | 'whatsapp' | 'email' | 'link'
export type ImageAspect = '1:1' | '4:5' | '16:9' | 'auto'

export type CarouselImage = { url: string; link: string }

export type LandingBlock =
  | { id: string; type: 'text'; text: string; align: 'left' | 'center'; size: 'sm' | 'md' | 'lg'; bold: boolean }
  | { id: string; type: 'button'; label: string; url: string; source: ButtonSource }
  | { id: string; type: 'video'; url: string; caption: string }
  | { id: string; type: 'image'; url: string; alt: string; link: string; aspect: ImageAspect }
  | { id: string; type: 'carousel'; images: CarouselImage[]; aspect: ImageAspect }

export type LandingBlockType = LandingBlock['type']

export type BackgroundOverlay = 'none' | 'soft' | 'medium' | 'strong'

/** Look of the page. Empty strings mean "use the theme default". Copied from Brand Identity when the page is made. */
export type LandingStyle = {
  primary: string
  secondary: string
  background: string
  text: string
  headingFont: string
  bodyFont: string
  /** Portrait (9:16) photo from our bucket, shown behind the content column. */
  backgroundImage: string
  overlay: BackgroundOverlay
}

export type LandingPage = {
  slug: string
  status: LandingStatus
  theme: LandingTheme
  headline: string
  description: string
  blocks: LandingBlock[]
  style: LandingStyle
}

export const LANDING_LIMITS = {
  blocks: 40,
  text: 2000,
  label: 80,
  caption: 200,
  alt: 120,
  headline: 80,
  description: 400,
  url: 500,
  carouselImages: 10,
} as const

export const SLUG_LIMITS = { min: 3, max: 30 } as const

/** Words that would let someone impersonate Marcatching or collide with real paths. */
export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'login', 'logout', 'signin', 'signup', 'register', 'auth', 'course', 'store', 'page', 'pages',
  'home', 'www', 'app', 'a', 'inside', 'assets', 'static', 'public', 'cdn', 'product', 'products', 'article',
  'articles', 'about', 'payment', 'privacy', 'terms', 'terms-service', 'survey', 'prompt-library', 'data-deletion',
  'marcatching', 'official', 'support', 'help', 'contact', 'billing', 'checkout', 'affiliate', 'workspace',
  'robots', 'sitemap', 'manifest', 'favicon', 'opengraph-image', 'twitter-image', 'null', 'undefined', 'new', 'edit',
])

export const emptyLandingStyle: LandingStyle = {
  primary: '', secondary: '', background: '', text: '', headingFont: '', bodyFont: '', backgroundImage: '', overlay: 'medium',
}

export const OVERLAY_OPTIONS: Array<{ value: BackgroundOverlay; label: string; alpha: number }> = [
  { value: 'none', label: 'Tanpa', alpha: 0 },
  { value: 'soft', label: 'Ringan', alpha: 0.25 },
  { value: 'medium', label: 'Sedang', alpha: 0.5 },
  { value: 'strong', label: 'Kuat', alpha: 0.72 },
]

export const ASPECT_OPTIONS: Array<{ value: ImageAspect; label: string }> = [
  { value: '1:1', label: 'Kotak 1:1' },
  { value: '4:5', label: 'Potret 4:5' },
  { value: '16:9', label: 'Lebar 16:9' },
  { value: 'auto', label: 'Asli' },
]

// ---------------------------------------------------------------------------------------------
// Slug
// ---------------------------------------------------------------------------------------------

export function slugify(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_LIMITS.max)
    .replace(/-+$/g, '')
}

export function validateSlug(slug: string): { ok: true } | { ok: false; reason: string } {
  if (slug.length < SLUG_LIMITS.min) return { ok: false, reason: `Minimal ${SLUG_LIMITS.min} karakter.` }
  if (slug.length > SLUG_LIMITS.max) return { ok: false, reason: `Maksimal ${SLUG_LIMITS.max} karakter.` }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, reason: 'Hanya huruf kecil, angka, dan tanda hubung (tanpa spasi, tanpa tanda hubung di awal/akhir).' }
  if (RESERVED_SLUGS.has(slug)) return { ok: false, reason: 'Nama ini dicadangkan. Pilih nama lain.' }
  return { ok: true }
}

// ---------------------------------------------------------------------------------------------
// Text & URLs
// ---------------------------------------------------------------------------------------------

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, maxLength) : ''
}

const EMAIL_PATTERN = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/

/**
 * Normalizes a link the creator typed. Only http(s), mailto and tel survive; anything else
 * (javascript:, data:, file: ...) becomes "" so it can never reach an href.
 */
export function cleanLink(value: unknown, allow: Array<'http' | 'mailto' | 'tel'> = ['http', 'mailto', 'tel']) {
  const raw = cleanText(value, LANDING_LIMITS.url)
  if (!raw) return ''
  if (/^mailto:/i.test(raw)) {
    const address = raw.slice(7).split('?')[0]
    return allow.includes('mailto') && EMAIL_PATTERN.test(address) ? `mailto:${address}` : ''
  }
  if (/^tel:/i.test(raw)) {
    const number = raw.slice(4).replace(/[^\d+]/g, '')
    return allow.includes('tel') && number.length >= 6 ? `tel:${number}` : ''
  }
  if (!allow.includes('http')) return ''
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw.replace(/^\/+/, '')}`
  try {
    const url = new URL(withScheme)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return ''
    if (!url.hostname.includes('.') || url.username || url.password) return ''
    return url.toString()
  } catch {
    return ''
  }
}

/** Indonesian-friendly: 0812..., +62812..., 812... all become https://wa.me/62812... */
export function whatsappLink(value: unknown) {
  let digits = cleanText(value, 40).replace(/[^\d]/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  else if (digits.startsWith('8')) digits = `62${digits}`
  return digits.length >= 8 && digits.length <= 15 ? `https://wa.me/${digits}` : ''
}

export function emailLink(value: unknown) {
  const email = cleanText(value, 120)
  return EMAIL_PATTERN.test(email) ? `mailto:${email}` : ''
}

/** "@handle" from a profile URL, or "" when it cannot be told. */
export function handleFromUrl(value: unknown) {
  const link = cleanLink(value, ['http'])
  if (!link) return ''
  try {
    const first = new URL(link).pathname.split('/').filter(Boolean)[0] || ''
    const handle = decodeURIComponent(first).replace(/^@/, '')
    return /^[\w.]{1,40}$/.test(handle) ? `@${handle}` : ''
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------------------------
// Video (YouTube / TikTok / Instagram, public posts only)
// ---------------------------------------------------------------------------------------------

export type VideoEmbed = { provider: 'youtube' | 'tiktok' | 'instagram'; embedUrl: string; vertical: boolean }

/**
 * The iframe src is always rebuilt from an extracted id on a fixed host, never copied from user input,
 * so a crafted URL cannot point an iframe at another site.
 */
export function parseVideoUrl(raw: unknown): VideoEmbed | null {
  const link = cleanLink(raw, ['http'])
  if (!link) return null
  let url: URL
  try { url = new URL(link) } catch { return null }
  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '')
  const parts = url.pathname.split('/').filter(Boolean)

  if (host === 'youtu.be' || host === 'youtube.com') {
    let id = ''
    let vertical = false
    if (host === 'youtu.be') id = parts[0] || ''
    else if (url.pathname === '/watch') id = url.searchParams.get('v') || ''
    else if (['shorts', 'embed', 'live'].includes(parts[0])) { id = parts[1] || ''; vertical = parts[0] === 'shorts' }
    return /^[\w-]{11}$/.test(id) ? { provider: 'youtube', embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, vertical } : null
  }

  if (host === 'tiktok.com') {
    const index = parts.indexOf('video')
    const id = index > 0 ? parts[index + 1] || '' : ''
    return parts[0]?.startsWith('@') && /^\d{8,25}$/.test(id) ? { provider: 'tiktok', embedUrl: `https://www.tiktok.com/player/v1/${id}`, vertical: true } : null
  }

  if (host === 'instagram.com') {
    const kind = parts[0] === 'reels' ? 'reel' : parts[0]
    const code = parts[1] || ''
    if (!['reel', 'p', 'tv'].includes(kind) || !/^[\w-]{5,30}$/.test(code)) return null
    return { provider: 'instagram', embedUrl: `https://www.instagram.com/${kind === 'tv' ? 'reel' : kind}/${code}/embed`, vertical: true }
  }
  return null
}

// ---------------------------------------------------------------------------------------------
// Images (only our own R2 origin, only inside the owner's folder)
// ---------------------------------------------------------------------------------------------

export function userAssetPrefix(assetBaseUrl: string, userId: string) {
  return `${assetBaseUrl.replace(/\/+$/, '')}/pages/${userId}/`
}

export function assetKeyFromUrl(assetBaseUrl: string, url: string) {
  const base = `${assetBaseUrl.replace(/\/+$/, '')}/`
  return url.startsWith(base) ? url.slice(base.length) : ''
}

/** Real file type from the first bytes. Never trust the filename or the browser-sent Content-Type. */
export function sniffImage(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png'
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp'
  return null
}

// ---------------------------------------------------------------------------------------------
// Block / page sanitizers
// ---------------------------------------------------------------------------------------------

export type SanitizeContext = {
  /** Decides whether an image URL may be stored. Server: our R2 folder of this user. */
  imageAllowed: (url: string) => boolean
}

const buttonSources: ButtonSource[] = ['instagram', 'tiktok', 'youtube', 'website', 'whatsapp', 'email', 'link']
const aspects: ImageAspect[] = ['1:1', '4:5', '16:9', 'auto']

function blockId(value: unknown) {
  return typeof value === 'string' && /^[\w-]{1,40}$/.test(value) ? value : crypto.randomUUID()
}

function imageUrl(value: unknown, context: SanitizeContext) {
  const link = cleanLink(value, ['http'])
  return link && context.imageAllowed(link) ? link : ''
}

export function sanitizeBlock(raw: unknown, context: SanitizeContext): LandingBlock | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const block = raw as Record<string, unknown>
  const id = blockId(block.id)

  if (block.type === 'text') {
    return {
      id, type: 'text',
      text: cleanText(block.text, LANDING_LIMITS.text),
      align: block.align === 'center' ? 'center' : 'left',
      size: block.size === 'sm' || block.size === 'lg' ? block.size : 'md',
      bold: block.bold === true,
    }
  }
  if (block.type === 'button') {
    return {
      id, type: 'button',
      label: cleanText(block.label, LANDING_LIMITS.label),
      url: cleanLink(block.url),
      source: buttonSources.includes(block.source as ButtonSource) ? block.source as ButtonSource : 'link',
    }
  }
  if (block.type === 'video') {
    const url = cleanLink(block.url, ['http'])
    return { id, type: 'video', url: parseVideoUrl(url) ? url : '', caption: cleanText(block.caption, LANDING_LIMITS.caption) }
  }
  if (block.type === 'image') {
    return {
      id, type: 'image',
      url: imageUrl(block.url, context),
      alt: cleanText(block.alt, LANDING_LIMITS.alt),
      link: cleanLink(block.link, ['http']),
      aspect: aspects.includes(block.aspect as ImageAspect) ? block.aspect as ImageAspect : '4:5',
    }
  }
  if (block.type === 'carousel') {
    const images = (Array.isArray(block.images) ? block.images : []).slice(0, LANDING_LIMITS.carouselImages).flatMap((item): CarouselImage[] => {
      if (!item || typeof item !== 'object') return []
      const entry = item as Record<string, unknown>
      const url = imageUrl(entry.url, context)
      return url ? [{ url, link: cleanLink(entry.link, ['http']) }] : []
    })
    return { id, type: 'carousel', images, aspect: aspects.includes(block.aspect as ImageAspect) ? block.aspect as ImageAspect : '4:5' }
  }
  return null
}

const overlays = OVERLAY_OPTIONS.map(option => option.value)

/**
 * Colors must be real hex, fonts must come from the curated Google Fonts list (a free-typed font cannot be loaded
 * safely on a public page), and the background photo must be one of this member's own uploads.
 */
export function sanitizeStyle(raw: unknown, context: SanitizeContext): LandingStyle {
  const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
  return {
    primary: normalizeHex(input.primary),
    secondary: normalizeHex(input.secondary),
    background: normalizeHex(input.background),
    text: normalizeHex(input.text),
    headingFont: findFont(cleanText(input.headingFont, 60))?.name ?? '',
    bodyFont: findFont(cleanText(input.bodyFont, 60))?.name ?? '',
    backgroundImage: imageUrl(input.backgroundImage, context),
    overlay: overlays.includes(input.overlay as BackgroundOverlay) ? input.overlay as BackgroundOverlay : 'medium',
  }
}

export function themeForBackground(background: string): LandingTheme {
  const hex = normalizeHex(background)
  return hex && contrastRatio('#FFFFFF', hex) < contrastRatio('#000000', hex) ? 'white' : 'black'
}

/** Colors and fonts the creator already chose in Brand Identity. Never touches the background photo. */
export function styleFromVisualIdentity(identity: VisualIdentity | undefined): Omit<LandingStyle, 'backgroundImage' | 'overlay'> {
  return {
    primary: normalizeHex(identity?.primaryColor),
    secondary: normalizeHex(identity?.secondaryColor),
    background: normalizeHex(identity?.backgroundColor),
    text: normalizeHex(identity?.textColor),
    headingFont: findFont(identity?.headingFont || '')?.name ?? '',
    bodyFont: findFont(identity?.bodyFont || '')?.name ?? '',
  }
}

function rgba(hex: string, alpha: number) {
  const value = normalizeHex(hex) || '#000000'
  return `rgba(${parseInt(value.slice(1, 3), 16)}, ${parseInt(value.slice(3, 5), 16)}, ${parseInt(value.slice(5, 7), 16)}, ${alpha})`
}

export type ResolvedStyle = {
  vars: Record<string, string>
  /** Google Fonts stylesheet for the fonts in use, or "" when none. */
  fontHref: string
  background: string
  overlayColor: string
}

/**
 * Turns the saved style into CSS variables that are always readable: a brand text color is only used when it has
 * enough contrast on the page background, and brand colors are only used for text-like accents when they do too.
 * Otherwise the page quietly falls back to a safe color instead of shipping unreadable text.
 */
export function resolveLandingStyle(style: LandingStyle, theme: LandingTheme): ResolvedStyle {
  const background = normalizeHex(style.background) || (theme === 'white' ? '#FFFFFF' : '#0B0F14')
  const autoText = contrastRatio('#F4F7FA', background) >= contrastRatio('#111827', background) ? '#F4F7FA' : '#111827'
  const chosenText = normalizeHex(style.text)
  const text = chosenText && contrastRatio(chosenText, background) >= 4.5 ? chosenText : autoText
  const primary = normalizeHex(style.primary)
  const secondary = normalizeHex(style.secondary)
  const chip = primary || text
  const chipInk = contrastRatio('#FFFFFF', chip) >= contrastRatio('#000000', chip) ? '#FFFFFF' : '#000000'
  const readable = (color: string) => Boolean(color) && contrastRatio(color, background) >= 3
  const accent = readable(secondary) ? secondary : readable(primary) ? primary : text

  const vars: Record<string, string> = {
    '--bg': background,
    '--fg': text,
    '--muted': rgba(text, 0.66),
    '--card': rgba(text, 0.07),
    '--card-hover': rgba(text, 0.12),
    '--line': rgba(text, 0.16),
    '--chip': chip,
    '--chip-ink': chipInk,
    '--accent': accent,
  }
  const heading = findFont(style.headingFont)
  const body = findFont(style.bodyFont)
  if (heading) vars['--font-heading'] = `'${heading.name}', ${heading.fallback}`
  if (body) vars['--font-body'] = `'${body.name}', ${body.fallback}`
  const fonts = [heading, body].filter((font, index, all): font is FontOption => Boolean(font) && all.findIndex(other => other?.name === font?.name) === index)

  const alpha = OVERLAY_OPTIONS.find(option => option.value === style.overlay)?.alpha ?? 0.5
  return { vars, fontHref: fonts.length ? googleFontsPreviewUrl(fonts) : '', background, overlayColor: rgba(background, alpha) }
}

export function sanitizeBlocks(value: unknown, context: SanitizeContext) {
  const seen = new Set<string>()
  return (Array.isArray(value) ? value : []).slice(0, LANDING_LIMITS.blocks).flatMap(item => {
    const block = sanitizeBlock(item, context)
    if (!block) return []
    if (seen.has(block.id)) block.id = crypto.randomUUID()
    seen.add(block.id)
    return [block]
  })
}

/** A block the visitor should actually see. Half-finished blocks stay in the editor but are hidden publicly. */
export function isRenderable(block: LandingBlock) {
  if (block.type === 'text') return Boolean(block.text)
  if (block.type === 'button') return Boolean(block.label && block.url)
  if (block.type === 'video') return Boolean(parseVideoUrl(block.url))
  if (block.type === 'image') return Boolean(block.url)
  return block.images.length > 0
}

export type PageInput = { ok: true; page: LandingPage } | { ok: false; message: string }

export function sanitizeLandingPage(raw: unknown, context: SanitizeContext): PageInput {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, message: 'Data landing page tidak valid.' }
  const input = raw as Record<string, unknown>
  const slug = cleanText(input.slug, 60).toLowerCase()
  const slugCheck = validateSlug(slug)
  if (!slugCheck.ok) return { ok: false, message: slugCheck.reason }
  return {
    ok: true,
    page: {
      slug,
      // A creator can only choose draft or published; "suspended" is set by admin and never accepted from input.
      status: input.status === 'published' ? 'published' : 'draft',
      theme: input.theme === 'white' ? 'white' : 'black',
      headline: cleanText(input.headline, LANDING_LIMITS.headline),
      description: cleanText(input.description, LANDING_LIMITS.description),
      blocks: sanitizeBlocks(input.blocks, context),
      style: sanitizeStyle(input.style, context),
    },
  }
}

// ---------------------------------------------------------------------------------------------
// Seed from the creator's profile (auto-filled buttons)
// ---------------------------------------------------------------------------------------------

export type LandingProfile = {
  brandName: string
  description: string
  instagram: string
  tiktok: string
  youtube: string
  website: string
  whatsapp: string
  email: string
}

export function newBlock(type: LandingBlockType): LandingBlock {
  const id = crypto.randomUUID()
  if (type === 'text') return { id, type, text: '', align: 'left', size: 'md', bold: false }
  if (type === 'button') return { id, type, label: '', url: '', source: 'link' }
  if (type === 'video') return { id, type, url: '', caption: '' }
  if (type === 'image') return { id, type, url: '', alt: '', link: '', aspect: '4:5' }
  return { id, type: 'carousel', images: [], aspect: '4:5' }
}

/** Buttons the profile can fill automatically, in display order. A source with no valid data is skipped. */
export function profileButtons(profile: LandingProfile): Array<Extract<LandingBlock, { type: 'button' }>> {
  const brand = profile.brandName.trim()
  const named = (prefix: string) => (brand ? `${prefix} ${brand}` : prefix)
  const make = (source: ButtonSource, label: string, url: string) => ({ id: crypto.randomUUID(), type: 'button' as const, label, url, source })
  const instagram = cleanLink(profile.instagram, ['http'])
  const tiktok = cleanLink(profile.tiktok, ['http'])
  const youtube = cleanLink(profile.youtube, ['http'])
  const website = cleanLink(profile.website, ['http'])
  const whatsapp = whatsappLink(profile.whatsapp)
  const email = emailLink(profile.email)
  return [
    instagram && make('instagram', handleFromUrl(instagram) ? `Instagram ${handleFromUrl(instagram)}` : named('Instagram'), instagram),
    tiktok && make('tiktok', handleFromUrl(tiktok) ? `TikTok ${handleFromUrl(tiktok)}` : named('TikTok'), tiktok),
    youtube && make('youtube', named('YouTube'), youtube),
    website && make('website', named('Official Website'), website),
    whatsapp && make('whatsapp', named('WhatsApp'), whatsapp),
    email && make('email', named('Email'), email),
  ].filter(Boolean) as Array<Extract<LandingBlock, { type: 'button' }>>
}

/** Adds only the profile buttons that are not already on the page; never rewrites buttons the creator edited. */
export function addMissingProfileButtons(blocks: LandingBlock[], profile: LandingProfile) {
  const present = new Set(blocks.flatMap(block => (block.type === 'button' ? [block.source] : [])))
  const additions = profileButtons(profile).filter(button => !present.has(button.source))
  return { blocks: [...blocks, ...additions].slice(0, LANDING_LIMITS.blocks), added: additions.length }
}

export function seedLandingPage(profile: LandingProfile, description: string, slug: string, style: LandingStyle = emptyLandingStyle): LandingPage {
  return {
    slug,
    status: 'draft',
    theme: themeForBackground(style.background),
    style,
    headline: cleanText(profile.brandName, LANDING_LIMITS.headline),
    description: cleanText(description, LANDING_LIMITS.description),
    blocks: profileButtons(profile),
  }
}
