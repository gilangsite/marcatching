import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyVisualIdentity } from '../../app/course/visualIdentity'
import {
  addMissingProfileButtons,
  assetKeyFromUrl,
  emptyLandingStyle,
  cleanLink,
  emailLink,
  handleFromUrl,
  isRenderable,
  parseVideoUrl,
  profileButtons,
  resolveLandingStyle,
  sanitizeStyle,
  styleFromVisualIdentity,
  themeForBackground,
  sanitizeBlocks,
  sanitizeLandingPage,
  seedLandingPage,
  slugify,
  sniffImage,
  userAssetPrefix,
  validateSlug,
  whatsappLink,
  type LandingProfile,
} from '../../lib/landingPage'

const BASE = 'https://assets.marcatching.com'
const USER = '11111111-1111-1111-1111-111111111111'
const context = { imageAllowed: (url: string) => url.startsWith(userAssetPrefix(BASE, USER)) }

test('slugs are normalized, validated, and reserved words are refused', () => {
  assert.equal(slugify('Kopi Sore — Jakarta!'), 'kopi-sore-jakarta')
  assert.equal(slugify('  Café   Été  '), 'cafe-ete')
  assert.equal(slugify('a'.repeat(50)).length, 30)
  assert.equal(validateSlug('kopi-sore').ok, true)
  for (const bad of ['ab', 'a'.repeat(31), '-kopi', 'kopi-', 'kopi--sore', 'Kopi', 'kopi sore', 'kopi_sore', 'admin', 'marcatching', 'api']) {
    assert.equal(validateSlug(bad).ok, false, bad)
  }
})

test('links keep only http(s), mailto and tel; script-like schemes are dropped', () => {
  assert.equal(cleanLink('kopisore.id'), 'https://kopisore.id/')
  assert.equal(cleanLink('https://instagram.com/kopisore'), 'https://instagram.com/kopisore')
  assert.equal(cleanLink('mailto:halo@kopisore.id'), 'mailto:halo@kopisore.id')
  for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>', 'file:///etc/passwd', 'vbscript:x', 'http://user:pw@evil.com', 'localhost', 'mailto:not-an-email']) {
    assert.equal(cleanLink(bad), '', bad)
  }
  assert.equal(cleanLink('mailto:a@b.co', ['http']), '')
})

test('whatsapp numbers become wa.me links in the Indonesian formats people really type', () => {
  for (const input of ['0812-3456-7890', '+62 812 3456 7890', '6281234567890', '81234567890']) assert.equal(whatsappLink(input), 'https://wa.me/6281234567890', input)
  assert.equal(whatsappLink('123'), '')
  assert.equal(whatsappLink(''), '')
  assert.equal(emailLink('halo@kopisore.id'), 'mailto:halo@kopisore.id')
  assert.equal(emailLink('halo kopisore'), '')
  assert.equal(handleFromUrl('https://www.instagram.com/kopisore/'), '@kopisore')
  assert.equal(handleFromUrl('https://www.tiktok.com/@kopisore'), '@kopisore')
})

test('video: only public YouTube/TikTok/Instagram posts, and the iframe host is always rebuilt, never copied', () => {
  assert.equal(parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')?.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  assert.equal(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ?si=abc')?.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  assert.equal(parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')?.vertical, true)
  assert.equal(parseVideoUrl('https://www.tiktok.com/@kopisore/video/7234567890123456789')?.embedUrl, 'https://www.tiktok.com/player/v1/7234567890123456789')
  assert.equal(parseVideoUrl('https://www.instagram.com/reel/Cabc123xyz/?igsh=1')?.embedUrl, 'https://www.instagram.com/reel/Cabc123xyz/embed')
  assert.equal(parseVideoUrl('https://www.instagram.com/p/Cabc123xyz/')?.embedUrl, 'https://www.instagram.com/p/Cabc123xyz/embed')
  const attacks = [
    'https://evil.com/instagram.com/reel/Cabc123xyz/',
    'https://evil.com/?u=youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ',
    'https://evil.com/youtube.com/watch?v=dQw4w9WgXcQ',
    'javascript:alert(1)',
    'https://vm.tiktok.com/ZSabc123/',
    'https://www.youtube.com/watch?v=short',
    'https://vimeo.com/123456',
  ]
  for (const attack of attacks) assert.equal(parseVideoUrl(attack), null, attack)
})

test('images must live in the owner\'s own R2 folder; other users\' files and foreign hosts are cleared', () => {
  const own = `${userAssetPrefix(BASE, USER)}abc.webp`
  const blocks = sanitizeBlocks([
    { type: 'image', url: own },
    { type: 'image', url: `${BASE}/pages/22222222-2222-2222-2222-222222222222/abc.webp` },
    { type: 'image', url: 'https://evil.com/x.png' },
    { type: 'carousel', images: [{ url: own, link: 'javascript:alert(1)' }, { url: 'https://evil.com/y.png' }] },
  ], context)
  assert.equal((blocks[0] as { url: string }).url, own)
  assert.equal((blocks[1] as { url: string }).url, '')
  assert.equal((blocks[2] as { url: string }).url, '')
  const carousel = blocks[3] as { images: Array<{ url: string; link: string }> }
  assert.equal(carousel.images.length, 1)
  assert.equal(carousel.images[0].link, '')
  assert.equal(assetKeyFromUrl(BASE, own), `pages/${USER}/abc.webp`)
  assert.equal(assetKeyFromUrl(BASE, 'https://evil.com/x.png'), '')
})

test('image type comes from the real bytes, not the claimed type', () => {
  assert.equal(sniffImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0])), 'image/jpeg')
  assert.equal(sniffImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])), 'image/png')
  assert.equal(sniffImage(new Uint8Array([...Buffer.from('RIFF'), 1, 2, 3, 4, ...Buffer.from('WEBPVP8 ')])), 'image/webp')
  assert.equal(sniffImage(Buffer.from('<html><script>alert(1)</script></html>')), null)
  assert.equal(sniffImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>')), null)
  assert.equal(sniffImage(new Uint8Array([])), null)
})

test('a page can never be saved as suspended, and bad input is normalized instead of trusted', () => {
  const result = sanitizeLandingPage({ slug: 'Kopi-Sore', status: 'suspended', theme: 'neon', headline: ' Kopi Sore ', blocks: [{ type: 'script', src: 'x' }, { type: 'text', text: 'Halo', align: 'right', size: 'huge' }] }, context)
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.page.slug, 'kopi-sore')
  assert.equal(result.page.status, 'draft')
  assert.equal(result.page.theme, 'black')
  assert.equal(result.page.headline, 'Kopi Sore')
  assert.equal(result.page.blocks.length, 1)
  assert.deepEqual(result.page.blocks[0], { ...result.page.blocks[0], align: 'left', size: 'md' })
  assert.equal(sanitizeLandingPage({ slug: 'admin' }, context).ok, false)
  assert.equal(sanitizeLandingPage(null, context).ok, false)
})

test('block ids stay unique and the block count is capped', () => {
  const many = Array.from({ length: 80 }, () => ({ id: 'same', type: 'text', text: 'x' }))
  const blocks = sanitizeBlocks(many, context)
  assert.equal(blocks.length, 40)
  assert.equal(new Set(blocks.map(block => block.id)).size, 40)
})

test('half-finished blocks are kept for editing but hidden from visitors', () => {
  const [empty, button, video, ok] = sanitizeBlocks([
    { type: 'text', text: '   ' },
    { type: 'button', label: 'Beli', url: 'javascript:alert(1)' },
    { type: 'video', url: 'https://vimeo.com/1' },
    { type: 'button', label: 'Beli', url: 'https://kopisore.id' },
  ], context)
  assert.equal(isRenderable(empty), false)
  assert.equal(isRenderable(button), false)
  assert.equal(isRenderable(video), false)
  assert.equal(isRenderable(ok), true)
})

const profile: LandingProfile = {
  brandName: 'Kopi Sore',
  description: 'Kopi susu gula aren.',
  instagram: 'https://instagram.com/kopisore',
  tiktok: 'https://www.tiktok.com/@kopisore',
  youtube: '',
  website: 'kopisore.id',
  whatsapp: '0812-3456-7890',
  email: 'halo@kopisore.id',
}

test('profile fills the starter buttons in the requested order, skipping what is empty', () => {
  const buttons = profileButtons(profile)
  assert.deepEqual(buttons.map(button => button.source), ['instagram', 'tiktok', 'website', 'whatsapp', 'email'])
  assert.deepEqual(buttons.map(button => button.label), ['Instagram @kopisore', 'TikTok @kopisore', 'Official Website Kopi Sore', 'WhatsApp Kopi Sore', 'Email Kopi Sore'])
  assert.equal(buttons[3].url, 'https://wa.me/6281234567890')
  assert.deepEqual(profileButtons({ ...profile, instagram: '', tiktok: '', website: '', whatsapp: '', email: '' }), [])
  const page = seedLandingPage(profile, 'Kopi susu gula aren, dibuat tiap sore.', 'kopi-sore')
  assert.equal(page.headline, 'Kopi Sore')
  assert.equal(page.status, 'draft')
  assert.equal(page.blocks.length, 5)
})

test('syncing from the profile adds only missing buttons and never overwrites edited ones', () => {
  const edited = seedLandingPage(profile, '', 'kopi-sore').blocks.map(block => (block.type === 'button' && block.source === 'instagram' ? { ...block, label: 'Ikuti kami di IG' } : block))
  const withoutEmail = edited.filter(block => !(block.type === 'button' && block.source === 'email'))
  const synced = addMissingProfileButtons(withoutEmail, profile)
  assert.equal(synced.added, 1)
  assert.equal(synced.blocks.length, 5)
  assert.equal((synced.blocks[0] as { label: string }).label, 'Ikuti kami di IG')
  assert.equal(addMissingProfileButtons(synced.blocks, profile).added, 0)
})

test('style: only real hex, listed fonts, and the owner\'s own background photo survive', () => {
  const own = `${userAssetPrefix(BASE, USER)}bg.webp`
  const style = sanitizeStyle({ primary: 'red', secondary: '#f59e0b', background: '#0b0f14; background:url(x)', text: '#fff', headingFont: 'Playfair Display', bodyFont: 'Comic Sans Evil', backgroundImage: own, overlay: 'nuclear' }, context)
  assert.equal(style.primary, '')
  assert.equal(style.secondary, '#F59E0B')
  assert.equal(style.background, '')
  assert.equal(style.text, '#FFFFFF')
  assert.equal(style.headingFont, 'Playfair Display')
  assert.equal(style.bodyFont, '')
  assert.equal(style.backgroundImage, own)
  assert.equal(style.overlay, 'medium')
  assert.equal(sanitizeStyle({ backgroundImage: 'https://evil.com/bg.png' }, context).backgroundImage, '')
  assert.equal(sanitizeStyle({ backgroundImage: `${BASE}/pages/22222222-2222-2222-2222-222222222222/bg.webp` }, context).backgroundImage, '')
  assert.deepEqual(sanitizeStyle(undefined, context), emptyLandingStyle)
  const page = sanitizeLandingPage({ slug: 'kopi-sore', style: { backgroundImage: 'https://evil.com/bg.png', primary: '#123' } }, context)
  assert.equal(page.ok && page.page.style.backgroundImage, '')
  assert.equal(page.ok && page.page.style.primary, '#112233')
})

test('style resolver never ships unreadable text: weak brand colors fall back to safe ones', () => {
  // Dark navy brand on the default dark page: as an accent it would vanish, so it must not be used as one.
  const dark = resolveLandingStyle({ ...emptyLandingStyle, primary: '#0B1F4D', secondary: '#101826', text: '#1A1A1A' }, 'black')
  assert.equal(dark.vars['--bg'], '#0B0F14')
  assert.equal(dark.vars['--fg'], '#F4F7FA')
  assert.equal(dark.vars['--accent'], '#F4F7FA')
  assert.equal(dark.vars['--chip'], '#0B1F4D')
  assert.equal(dark.vars['--chip-ink'], '#FFFFFF')

  // A readable brand text color and accent are honored.
  const ok = resolveLandingStyle({ ...emptyLandingStyle, background: '#FFFFFF', text: '#111111', primary: '#1E3A8A', secondary: '#B45309' }, 'black')
  assert.equal(ok.vars['--bg'], '#FFFFFF')
  assert.equal(ok.vars['--fg'], '#111111')
  assert.equal(ok.vars['--accent'], '#B45309')

  // Light brand color on a light page: chip text flips to black.
  assert.equal(resolveLandingStyle({ ...emptyLandingStyle, primary: '#FDE68A' }, 'white').vars['--chip-ink'], '#000000')
  assert.equal(resolveLandingStyle(emptyLandingStyle, 'white').vars['--bg'], '#FFFFFF')
})

test('style resolver loads only the fonts in use and carries the overlay strength', () => {
  const none = resolveLandingStyle(emptyLandingStyle, 'black')
  assert.equal(none.fontHref, '')
  assert.equal(none.vars['--font-heading'], undefined)
  const fonts = resolveLandingStyle({ ...emptyLandingStyle, headingFont: 'Playfair Display', bodyFont: 'Inter' }, 'black')
  assert.match(fonts.fontHref, /family=Playfair\+Display/)
  assert.match(fonts.fontHref, /family=Inter/)
  assert.equal(fonts.vars['--font-heading'], "'Playfair Display', serif")
  assert.equal(resolveLandingStyle({ ...emptyLandingStyle, headingFont: 'Inter', bodyFont: 'Inter' }, 'black').fontHref.match(/family=Inter/g)?.length, 1)
  assert.match(resolveLandingStyle({ ...emptyLandingStyle, background: '#000000', overlay: 'strong' }, 'black').overlayColor, /^rgba\(0, 0, 0, 0\.72\)$/)
  assert.match(resolveLandingStyle({ ...emptyLandingStyle, overlay: 'none' }, 'black').overlayColor, /, 0\)$/)
})

test('a new page starts in the look the creator already chose in Brand Identity', () => {
  const fromIdentity = styleFromVisualIdentity({ ...emptyVisualIdentity, primaryColor: '#1e3a8a', secondaryColor: '#f59e0b', backgroundColor: '#fffbeb', headingFont: 'Poppins', bodyFont: 'Fontku Sendiri' })
  assert.equal(fromIdentity.primary, '#1E3A8A')
  assert.equal(fromIdentity.headingFont, 'Poppins')
  assert.equal(fromIdentity.bodyFont, '', 'free-typed fonts cannot be loaded on a public page')
  assert.equal(themeForBackground('#fffbeb'), 'white')
  assert.equal(themeForBackground('#0b0f14'), 'black')
  assert.equal(themeForBackground(''), 'black')
  const page = seedLandingPage(profile, '', 'kopi-sore', { ...emptyLandingStyle, ...fromIdentity })
  assert.equal(page.theme, 'white')
  assert.equal(page.style.secondary, '#F59E0B')
  assert.deepEqual(styleFromVisualIdentity(undefined), { primary: '', secondary: '', background: '', text: '', headingFont: '', bodyFont: '' })
})
