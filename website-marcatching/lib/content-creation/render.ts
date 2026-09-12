import { assetURL, RATIOS, textStyles, type Element, type Font, type Project, type Slide, type TextElement, type TextStyle } from './model'
export type Fonts = Record<Font, string>
export type Bounds = { x: number; y: number; width: number; height: number }
const images = new Map<string, Promise<HTMLImageElement>>()
export function clearImageCache() { images.clear() }
function loadImage(asset: string) {
  if (!images.has(asset)) {
    const pending = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => { images.delete(asset); reject(new Error('Gambar gagal dimuat. Periksa koneksi lalu coba lagi.')) }
      image.src = assetURL(asset)
    })
    images.set(asset, pending)
  }
  return images.get(asset)!
}
export function canvasFont(e: TextElement, fonts: Fonts, style: TextStyle = e) { return `${style.italic ? 'italic' : 'normal'} ${style.bold ? 700 : 400} ${style.fontSize}px ${fonts[e.font]}` }
type Glyph = TextStyle & { char: string; width: number }
type TextLine = { glyphs: Glyph[]; width: number; justify: boolean; fontSize: number; height: number }
function trimEnd(glyphs: Glyph[]) {
  let end = glyphs.length
  while (end && /\s/.test(glyphs[end - 1].char)) end -= 1
  return glyphs.slice(0, end)
}
function lineWidth(glyphs: Glyph[]) { return glyphs.reduce((total, glyph) => total + glyph.width, 0) }
export function textLines(ctx: CanvasRenderingContext2D, e: TextElement, fonts: Fonts): TextLine[] {
  const styles = textStyles(e)
  const lines: TextLine[] = []
  let textOffset = 0
  for (const paragraph of e.text.split('\n')) {
    const glyphs: Glyph[] = []
    let offset = textOffset
    for (const char of paragraph) {
      const style = styles[offset] || { bold: e.bold, italic: e.italic, fontSize: e.fontSize, color: e.color }
      ctx.font = canvasFont(e, fonts, style)
      glyphs.push({ char, ...style, width: ctx.measureText(char).width })
      offset += char.length
    }
    const paragraphLines: Glyph[][] = []
    let line: Glyph[] = []
    for (const glyph of glyphs) {
      line.push(glyph)
      if (line.length > 1 && lineWidth(line) > e.width) {
        let breakAt = -1
        for (let index = line.length - 2; index >= 0; index -= 1) if (/\s/.test(line[index].char)) { breakAt = index; break }
        if (breakAt >= 0) {
          const carry = line.slice(breakAt + 1)
          paragraphLines.push(trimEnd(line.slice(0, breakAt)))
          line = carry
          while (line.length && /\s/.test(line[0].char)) line.shift()
        } else {
          const carry = line.pop()!
          paragraphLines.push(trimEnd(line))
          line = [carry]
        }
      }
    }
    paragraphLines.push(trimEnd(line))
    paragraphLines.forEach((value, index) => {
      const fontSize = Math.max(e.fontSize, ...value.map(glyph => glyph.fontSize))
      lines.push({ glyphs: value, width: lineWidth(value), justify: e.align === 'justify' && index < paragraphLines.length - 1, fontSize, height: fontSize * 1.25 })
    })
    textOffset += paragraph.length + 1
  }
  return lines
}
export function elementBounds(ctx: CanvasRenderingContext2D, e: Element, fonts: Fonts): Bounds {
  return { x: e.x, y: e.y, width: e.width, height: e.type === 'image' ? e.height : Math.max(e.fontSize * 1.25, textLines(ctx, e, fonts).reduce((total, line) => total + line.height, 0)) }
}
export async function renderSlide(slide: Slide, ratio: Project['ratio'], fonts: Fonts): Promise<HTMLCanvasElement> {
  const [width, height] = RATIOS[ratio]
  await Promise.all(slide.elements.filter((e): e is TextElement => e.type === 'text').flatMap(e => {
    const variants = new Map<string, TextStyle>()
    for (const style of [{ bold: e.bold, italic: e.italic, fontSize: e.fontSize, color: e.color }, ...textStyles(e)]) variants.set(`${style.bold}-${style.italic}-${style.fontSize}`, style)
    return [...variants.values()].map(style => document.fonts.load(canvasFont(e, fonts, style), e.text || 'Aa'))
  }))
  const assets = [slide.background, ...slide.elements.filter(e => e.type === 'image').map(e => e.asset)].filter((x): x is string => Boolean(x))
  const loaded = new Map(await Promise.all([...new Set(assets)].map(async asset => [asset, await loadImage(asset)] as const)))
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = slide.color
  ctx.fillRect(0, 0, width, height)
  if (slide.background) {
    const img = loaded.get(slide.background)!
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
    ctx.drawImage(img, (width - img.naturalWidth * scale) / 2, (height - img.naturalHeight * scale) / 2, img.naturalWidth * scale, img.naturalHeight * scale)
  }
  for (const e of slide.elements) {
    if (e.type === 'image') { ctx.drawImage(loaded.get(e.asset)!, e.x, e.y, e.width, e.height); continue }
    const lines = textLines(ctx, e, fonts)
    ctx.textAlign = 'left'
    // Use a fixed baseline in both preview and export, with room for ascenders.
    ctx.textBaseline = 'alphabetic'
    let lineTop = e.y
    lines.forEach(line => {
      const spaces = line.glyphs.filter(glyph => /\s/.test(glyph.char)).length
      const extraSpace = line.justify && spaces ? Math.max(0, e.width - line.width) / spaces : 0
      let x = e.x + (e.align === 'center' ? (e.width - line.width) / 2 : e.align === 'right' ? e.width - line.width : 0)
      for (const glyph of line.glyphs) {
        ctx.font = canvasFont(e, fonts, glyph)
        ctx.fillStyle = glyph.color
        ctx.fillText(glyph.char, x, lineTop + line.fontSize)
        x += glyph.width + (/\s/.test(glyph.char) ? extraSpace : 0)
      }
      lineTop += line.height
    })
  }
  return canvas
}
export async function downloadProject(project: Project, fonts: Fonts, progress: (n: number) => void) {
  const { zipSync } = await import('fflate')
  const files: Record<string, Uint8Array> = {}
  for (let i = 0; i < project.slides.length; i++) {
    const canvas = await renderSlide(project.slides[i], project.ratio, fonts)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Gagal membuat PNG.')), 'image/png'))
    files[`slide-${String(i + 1).padStart(2, '0')}.png`] = new Uint8Array(await blob.arrayBuffer())
    canvas.width = 0; canvas.height = 0
    progress(i + 1)
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  const zip = zipSync(files, { level: 0 }) // PNG is already compressed.
  const url = URL.createObjectURL(new Blob([new Uint8Array(zip)], { type: 'application/zip' }))
  const a = document.createElement('a')
  a.href = url; a.download = `${project.title.replace(/[^a-z0-9_-]/gi, '-').slice(0, 80) || 'carousel'}.zip`
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
