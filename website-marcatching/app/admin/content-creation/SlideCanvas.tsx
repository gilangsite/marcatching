'use client'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { clamp, RATIOS, type Element, type Ratio, type Slide } from '@/lib/content-creation/model'
import { elementBounds, renderSlide, type Fonts } from '@/lib/content-creation/render'
import styles from './content-creation.module.css'
type Props = { slide: Slide; ratio: Ratio; fonts: Fonts; selected?: string | null; onSelect?: (id: string | null) => void; onChange?: (e: Element) => void; onGestureStart?: () => void; onEdit?: () => void; thumbnail?: boolean }
export default function SlideCanvas({ slide, ratio, fonts, selected, onSelect, onChange, onGestureStart, onEdit, thumbnail }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const drag = useRef<{ element: Element; x: number; y: number; mode: 'move' | 'scale' | 'width-left' | 'width-right' } | null>(null)
  const [width, height] = RATIOS[ratio]
  useEffect(() => {
    let cancelled = false
    renderSlide(slide, ratio, fonts).then(rendered => {
      if (cancelled || !ref.current) return
      const canvas = ref.current
      canvas.width = thumbnail ? 160 : width
      canvas.height = thumbnail ? 160 * height / width : height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(rendered, 0, 0, canvas.width, canvas.height)
      rendered.width = 0; rendered.height = 0
      if (selected && !thumbnail) {
        const element = slide.elements.find(e => e.id === selected)
        if (element) {
          const b = elementBounds(ctx, element, fonts)
          const factor = width / (canvas.getBoundingClientRect().width || 500)
          ctx.strokeStyle = '#6d4aff'; ctx.lineWidth = 1.5 * factor
          ctx.strokeRect(b.x, b.y, b.width, b.height)
          ctx.fillStyle = '#6d4aff'
          ctx.fillRect(b.x + b.width - 5 * factor, b.y + b.height - 5 * factor, 10 * factor, 10 * factor)
          if (element.type === 'text') {
            ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#6d4aff'; ctx.lineWidth = 2 * factor
            for (const x of [b.x, b.x + b.width]) {
              ctx.beginPath(); ctx.roundRect(x - 4 * factor, b.y + b.height / 2 - 10 * factor, 8 * factor, 20 * factor, 4 * factor); ctx.fill(); ctx.stroke()
            }
          }
        }
      }
      setError('')
    }).catch(e => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [slide, ratio, fonts, selected, thumbnail, width, height, retry])
  function point(e: PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: (e.clientX - r.left) * width / r.width, y: (e.clientY - r.top) * height / r.height }
  }
  function down(e: PointerEvent<HTMLCanvasElement>) {
    if (!onSelect || !onChange || e.button !== 0) return
    e.preventDefault(); e.currentTarget.focus()
    const p = point(e), ctx = e.currentTarget.getContext('2d')!
    const current = slide.elements.find(el => el.id === selected)
    const b = current && elementBounds(ctx, current, fonts)
    const tolerance = 16 * width / e.currentTarget.getBoundingClientRect().width
    const scale = Boolean(b && Math.abs(p.x - b.x - b.width) < tolerance && Math.abs(p.y - b.y - b.height) < tolerance)
    const widthLeft = Boolean(current?.type === 'text' && b && Math.abs(p.x - b.x) < tolerance && Math.abs(p.y - b.y - b.height / 2) < tolerance * 1.5)
    const widthRight = Boolean(current?.type === 'text' && b && Math.abs(p.x - b.x - b.width) < tolerance && Math.abs(p.y - b.y - b.height / 2) < tolerance * 1.5)
    const mode = scale ? 'scale' : widthLeft ? 'width-left' : widthRight ? 'width-right' : 'move'
    const hit = mode !== 'move' ? current : [...slide.elements].reverse().find(el => {
      const box = elementBounds(ctx, el, fonts)
      return p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height
    })
    onSelect(hit?.id || null)
    if (hit) { onGestureStart?.(); drag.current = { element: hit, ...p, mode }; e.currentTarget.setPointerCapture(e.pointerId) }
  }
  function move(e: PointerEvent<HTMLCanvasElement>) {
    const d = drag.current
    if (!d || !onChange) return
    const p = point(e), el = d.element
    if (d.mode === 'scale') {
      const minScale = el.type === 'text' ? Math.max(16 / el.width, 8 / el.fontSize) : Math.max(16 / el.width, 16 / el.height)
      const maxScale = el.type === 'text' ? Math.min(3840 / el.width, 400 / el.fontSize) : Math.min(3840 / el.width, 3840 / el.height)
      const scale = clamp((el.width + p.x - d.x) / el.width, minScale, maxScale)
      onChange(el.type === 'text' ? { ...el, width: el.width * scale, fontSize: el.fontSize * scale } : { ...el, width: el.width * scale, height: el.height * scale })
    } else if (d.mode === 'width-right' && el.type === 'text') {
      onChange({ ...el, width: clamp(el.width + p.x - d.x, 32, 3840) })
    } else if (d.mode === 'width-left' && el.type === 'text') {
      const nextX = clamp(el.x + p.x - d.x, -3840, el.x + el.width - 32)
      onChange({ ...el, x: nextX, width: el.width + el.x - nextX })
    } else {
      const b = elementBounds(e.currentTarget.getContext('2d')!, el, fonts)
      onChange({ ...el, x: clamp(el.x + p.x - d.x, -el.width + 16, width - 16), y: clamp(el.y + p.y - d.y, Math.max(-3840, -b.height + 16), height - 16) })
    }
  }
  return <div className={styles.canvasWrap}>
    <canvas ref={ref} width={thumbnail ? 160 : width} height={thumbnail ? 160 * height / width : height} className={styles.canvas} tabIndex={thumbnail ? -1 : 0} aria-label={thumbnail ? 'Preview slide' : 'Canvas slide. Pilih elemen lalu drag untuk memindahkan; tarik handle kiri atau kanan untuk mengatur lebar teks; tarik kotak pojok untuk scale.'} onPointerDown={down} onPointerMove={move} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }} onDoubleClick={onEdit} />
    {error && <div className={styles.canvasError} role="alert">{error}{!thumbnail && <button onClick={() => setRetry(v => v + 1)}>Coba lagi</button>}</div>}
  </div>
}
