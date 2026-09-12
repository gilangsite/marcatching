import test from 'node:test'
import assert from 'node:assert/strict'
import { MAX_SLIDES, newProject, parseProject, replaceText, resizeProject, RATIOS, selectionHasStyle, setTextSelectionStyle, toggleTextSelectionStyle, validAsset, type Project, type TextElement } from '../../lib/content-creation/model'

test('all requested ratios produce exact export dimensions and preserve text content on resize', () => {
  const project = newProject()
  project.slides[0].elements.push({ id: crypto.randomUUID(), type: 'text', text: 'Hello\nMarcatching', x: 108, y: 108, width: 864, font: 'poppins', fontSize: 64, bold: true, italic: true, color: '#123456', align: 'center' })
  for (const ratio of Object.keys(RATIOS) as Project['ratio'][]) {
    const resized = parseProject(resizeProject(project, ratio))
    assert.equal(resized.ratio, ratio)
    assert.equal(resized.slides[0].elements[0].type, 'text')
    assert.equal(JSON.stringify(resized).includes('Hello\\nMarcatching'), true)
    assert.ok(RATIOS[ratio][0] >= 1080)
  }
})
test('stored document rejects arbitrary image URLs, foreign project assets and malformed objects', () => {
  const p = newProject(), slide = p.slides[0]
  for (const background of ['https://evil.example/image.png', 'data:image/png;base64,AA', '../secret.png', `r2/${crypto.randomUUID()}/${crypto.randomUUID()}.png`]) {
    assert.throws(() => parseProject({ ...p, slides: [{ ...slide, background }] }))
  }
  assert.throws(() => parseProject({ ...p, ratio: '__proto__' }))
  assert.throws(() => parseProject({ ...p, slides: [] }))
  assert.throws(() => parseProject({ ...p, slides: Array.from({ length: MAX_SLIDES + 1 }, () => slide) }))
  assert.throws(() => parseProject({ ...p, slides: [slide, slide] }))
  assert.equal(validAsset(`r2/${p.id}/${crypto.randomUUID()}.webp`, p.id), true)
})
test('validation rejects NaN and unsupported styles without mutating valid documents', () => {
  const p = newProject()
  const e = { id: crypto.randomUUID(), type: 'text', x: 1, y: 1, width: 500, text: '<script>plain text only</script>', font: 'classic', fontSize: 60, bold: false, italic: false, color: '#000000', align: 'left' }
  assert.doesNotThrow(() => parseProject({ ...p, slides: [{ ...p.slides[0], elements: [e] }] }))
  for (const patch of [{ x: NaN }, { fontSize: 0 }, { fontSize: 401 }, { font: 'comic' }, { bold: 'yes' }, { width: Infinity }]) {
    assert.throws(() => parseProject({ ...p, slides: [{ ...p.slides[0], elements: [{ ...e, ...patch }] }] }))
  }
})
test('inline text formatting supports mixed styles and follows text edits', () => {
  let element: TextElement = { id: crypto.randomUUID(), type: 'text', x: 0, y: 0, width: 600, text: 'Satu paragraf', font: 'poppins', fontSize: 48, bold: false, italic: false, marks: [], color: '#000000', align: 'justify' }
  element = toggleTextSelectionStyle(element, 0, 4, 'bold')
  element = setTextSelectionStyle(element, 5, 13, { italic: true, fontSize: 72, color: '#c026d3' })
  assert.equal(selectionHasStyle(element, 0, 4, 'bold'), true)
  assert.equal(selectionHasStyle(element, 5, 13, 'italic'), true)
  assert.equal(selectionHasStyle(element, 5, 13, 'bold'), false)
  assert.equal(element.marks?.some(mark => mark.fontSize === 72 && mark.color === '#c026d3'), true)
  element = replaceText(element, 'Satu isi paragraf')
  assert.equal(selectionHasStyle(element, 0, 4, 'bold'), true)
  assert.equal(element.align, 'justify')
  const parsed = parseProject({ ...newProject(), slides: [{ ...newProject().slides[0], id: crypto.randomUUID(), elements: [element] }] })
  assert.deepEqual((parsed.slides[0].elements[0] as TextElement).marks, element.marks)
})
test('old text elements remain valid while malformed inline marks are rejected', () => {
  const p = newProject()
  const legacy = { id: crypto.randomUUID(), type: 'text', x: 0, y: 0, width: 500, text: 'Legacy', font: 'classic', fontSize: 60, bold: false, italic: false, color: '#000000', align: 'left' }
  assert.deepEqual((parseProject({ ...p, slides: [{ ...p.slides[0], elements: [legacy] }] }).slides[0].elements[0] as TextElement).marks, [])
  assert.throws(() => parseProject({ ...p, slides: [{ ...p.slides[0], elements: [{ ...legacy, marks: [{ start: 4, end: 2, bold: true, italic: false }] }] }] }))
  assert.throws(() => parseProject({ ...p, slides: [{ ...p.slides[0], elements: [{ ...legacy, marks: [{ start: 0.5, end: 2, bold: true, italic: false }] }] }] }))
})
