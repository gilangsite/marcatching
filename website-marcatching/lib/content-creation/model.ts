export const RATIOS = { '9:16': [1080, 1920], '1:1': [1080, 1080], '16:9': [1920, 1080], '3:5': [1080, 1800], '3:4': [1080, 1440] } as const
export type Ratio = keyof typeof RATIOS
export type Font = 'poppins' | 'dm-sans' | 'palatino' | 'classic'
export type TextStyle = { bold: boolean; italic: boolean; fontSize: number; color: string }
export type TextMark = { start: number; end: number; bold: boolean; italic: boolean; fontSize?: number; color?: string }
export type TextElement = { id: string; type: 'text'; x: number; y: number; width: number; text: string; font: Font; fontSize: number; bold: boolean; italic: boolean; marks?: TextMark[]; color: string; align: 'left' | 'center' | 'right' | 'justify' }
export type ImageElement = { id: string; type: 'image'; x: number; y: number; width: number; height: number; asset: string }
export type Element = TextElement | ImageElement
export type Slide = { id: string; color: string; background: string | null; elements: Element[] }
export type Project = { version: 1; id: string; title: string; ratio: Ratio; slides: Slide[]; updatedAt: string }
export type ProjectSummary = Pick<Project, 'id' | 'title' | 'ratio' | 'updatedAt'> & { slideCount: number }
export const MAX_SLIDES = 40
export const MAX_ELEMENTS = 60
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024
export const MAX_PROJECT_BYTES = 2 * 1024 * 1024
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ASSET = /^(supabase|r2)\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(png|jpg|webp)$/i
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
export function textStyles(element: TextElement): TextStyle[] {
  const styles = Array.from({ length: element.text.length }, () => ({ bold: element.bold, italic: element.italic, fontSize: element.fontSize, color: element.color }))
  for (const mark of element.marks || []) {
    for (let index = clamp(Math.trunc(mark.start), 0, styles.length); index < clamp(Math.trunc(mark.end), 0, styles.length); index += 1) {
      styles[index] = { bold: mark.bold, italic: mark.italic, fontSize: mark.fontSize ?? element.fontSize, color: mark.color ?? element.color }
    }
  }
  return styles
}
export function marksFromStyles(styles: TextStyle[], base: TextStyle): TextMark[] {
  const marks: TextMark[] = []
  let start = -1
  let active: TextStyle | null = null
  for (let index = 0; index <= styles.length; index += 1) {
    const style = index < styles.length ? styles[index] : null
    const differs = Boolean(style && (style.bold !== base.bold || style.italic !== base.italic || style.fontSize !== base.fontSize || style.color !== base.color))
    if (differs && (!active || active.bold !== style!.bold || active.italic !== style!.italic || active.fontSize !== style!.fontSize || active.color !== style!.color)) {
      if (active) marks.push({ start, end: index, ...active })
      start = index; active = style
    } else if (!differs && active) {
      marks.push({ start, end: index, ...active }); start = -1; active = null
    }
  }
  return marks
}
export function selectionHasStyle(element: TextElement, start: number, end: number, style: 'bold' | 'italic') {
  const styles = textStyles(element)
  return end > start && styles.slice(start, end).every(value => value[style])
}
export function setTextSelectionStyle(element: TextElement, start: number, end: number, change: Partial<TextStyle>): TextElement {
  const safeStart = clamp(Math.trunc(start), 0, element.text.length)
  const safeEnd = clamp(Math.trunc(end), safeStart, element.text.length)
  if (safeEnd <= safeStart) return element
  const styles = textStyles(element)
  for (let index = safeStart; index < safeEnd; index += 1) styles[index] = { ...styles[index], ...change }
  return { ...element, marks: marksFromStyles(styles, element) }
}
export function toggleTextSelectionStyle(element: TextElement, start: number, end: number, style: 'bold' | 'italic'): TextElement {
  return setTextSelectionStyle(element, start, end, { [style]: !selectionHasStyle(element, start, end, style) })
}
export function replaceText(element: TextElement, text: string): TextElement {
  if (text === element.text) return element
  const previous = element.text
  const previousStyles = textStyles(element)
  let prefix = 0
  while (prefix < previous.length && prefix < text.length && previous[prefix] === text[prefix]) prefix += 1
  let suffix = 0
  while (suffix < previous.length - prefix && suffix < text.length - prefix && previous[previous.length - 1 - suffix] === text[text.length - 1 - suffix]) suffix += 1
  const insertedLength = text.length - prefix - suffix
  const insertedStyle = previousStyles[Math.max(0, prefix - 1)] || previousStyles[prefix] || { bold: element.bold, italic: element.italic, fontSize: element.fontSize, color: element.color }
  const styles = [
    ...previousStyles.slice(0, prefix),
    ...Array.from({ length: insertedLength }, () => ({ ...insertedStyle })),
    ...previousStyles.slice(previous.length - suffix),
  ]
  return { ...element, text, marks: marksFromStyles(styles, element) }
}
export function newSlide(): Slide { return { id: crypto.randomUUID(), color: '#ffffff', background: null, elements: [] } }
export function newProject(ratio: Ratio = '1:1'): Project { return { version: 1, id: crypto.randomUUID(), title: 'Untitled carousel', ratio, slides: [newSlide()], updatedAt: new Date().toISOString() } }
export function summary(p: Project): ProjectSummary { return { id: p.id, title: p.title, ratio: p.ratio, updatedAt: p.updatedAt, slideCount: p.slides.length } }
export function assetURL(asset: string) { return `/api/admin/content-creation/assets?key=${encodeURIComponent(asset)}` }
export function validAsset(asset: unknown, projectId?: string): asset is string { return typeof asset === 'string' && ASSET.test(asset) && (!projectId || asset.split('/')[1] === projectId) }
export function resizeProject(p: Project, ratio: Ratio): Project {
  const [w, h] = RATIOS[p.ratio], [nw, nh] = RATIOS[ratio]
  const sx = nw / w, sy = nh / h, scale = Math.min(sx, sy)
  return { ...p, ratio, slides: p.slides.map(s => ({ ...s, elements: s.elements.map(e => e.type === 'text'
    ? { ...e, x: clamp(e.x * sx, -3840, 3840), y: clamp(e.y * sy, -3840, 3840), width: clamp(e.width * sx, 16, 3840), fontSize: clamp(e.fontSize * scale, 8, 400), marks: e.marks?.map(mark => ({ ...mark, fontSize: mark.fontSize === undefined ? undefined : clamp(mark.fontSize * scale, 8, 400) })) }
    : { ...e, x: clamp(e.x * sx, -3840, 3840), y: clamp(e.y * sy, -3840, 3840), width: clamp(e.width * scale, 16, 3840), height: clamp(e.height * scale, 16, 3840) }) })) }
}
// Rebuild the document from an allowlist. No markup, inline images, or arbitrary URLs.
export function parseProject(value: unknown): Project {
  const fail = (): never => { throw new Error('Data project tidak valid atau melebihi batas editor.') }
  const object = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : fail()
  const str = (v: unknown, max: number) => typeof v === 'string' && v.length <= max ? v : fail()
  const num = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : fail()
  const id = (v: unknown) => typeof v === 'string' && UUID.test(v) ? v : fail()
  const color = (v: unknown) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : fail()
  const bool = (v: unknown) => typeof v === 'boolean' ? v : fail()
  const p = object(value)
  const projectId = id(p.id)
  const asset = (v: unknown) => validAsset(v, projectId) ? v : fail()
  if (p.version !== 1 || typeof p.ratio !== 'string' || !Object.hasOwn(RATIOS, p.ratio) || !Array.isArray(p.slides) || !p.slides.length || p.slides.length > MAX_SLIDES) fail()
  const slides = (p.slides as unknown[]).map(raw => {
    const s = object(raw)
    if (!Array.isArray(s.elements) || s.elements.length > MAX_ELEMENTS) fail()
    const elements = (s.elements as unknown[]).map(rawElement => {
      const e = object(rawElement)
      const base = { id: id(e.id), x: num(e.x, -3840, 3840), y: num(e.y, -3840, 3840), width: num(e.width, 16, 3840) }
      if (e.type === 'image') return { ...base, type: 'image', height: num(e.height, 16, 3840), asset: asset(e.asset) } as ImageElement
      if (e.type !== 'text' || !['poppins', 'dm-sans', 'palatino', 'classic'].includes(String(e.font)) || !['left', 'center', 'right', 'justify'].includes(String(e.align))) fail()
      const text = str(e.text, 10000)
      const bold = bool(e.bold), italic = bool(e.italic)
      if (e.marks !== undefined && !Array.isArray(e.marks)) fail()
      const rawMarks = (e.marks || []) as unknown[]
      if (rawMarks.length > text.length) fail()
      const marks = rawMarks.map(rawMark => {
        const mark = object(rawMark)
        const start = num(mark.start, 0, text.length), end = num(mark.end, 0, text.length)
        if (!Number.isInteger(start) || !Number.isInteger(end) || end <= start) fail()
        return { start, end, bold: bool(mark.bold), italic: bool(mark.italic), fontSize: mark.fontSize === undefined ? undefined : num(mark.fontSize, 8, 400), color: mark.color === undefined ? undefined : color(mark.color) }
      })
      const element = { ...base, type: 'text', text, font: e.font as Font, fontSize: num(e.fontSize, 8, 400), bold, italic, marks, color: color(e.color), align: e.align as TextElement['align'] } as TextElement
      return { ...element, marks: marksFromStyles(textStyles(element), element) }
    })
    if (new Set(elements.map(e => e.id)).size !== elements.length) fail()
    return { id: id(s.id), color: color(s.color), background: s.background === null ? null : asset(s.background), elements }
  })
  if (new Set(slides.map(s => s.id)).size !== slides.length || !Number.isFinite(Date.parse(str(p.updatedAt, 40)))) fail()
  return { version: 1, id: projectId, title: str(p.title, 120).trim() || 'Untitled carousel', ratio: p.ratio as Ratio, updatedAt: str(p.updatedAt, 40), slides }
}
