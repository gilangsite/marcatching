'use client'

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { EXPERIENCE_SECTIONS, type ExperienceSectionId } from './experience-data'
import { useExperience } from './ExperienceStore'
import styles from './Interactions.module.css'

export function MagneticButton({ href, children, className = '' }: {
  href: string
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reducedMotion = useReducedMotion()

  const move = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (reducedMotion || event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left - bounds.width / 2) * 0.16
    const y = (event.clientY - bounds.top - bounds.height / 2) * 0.16
    event.currentTarget.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  const reset = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <Link ref={ref} href={href} className={`${styles.magnetic} ${className}`} onPointerMove={move} onPointerLeave={reset}>
      {children}
    </Link>
  )
}

export function AnimatedUnderlineLink({ href, children, className = '', external = false }: {
  href: string
  children: ReactNode
  className?: string
  external?: boolean
}) {
  if (external) {
    return <a href={href} className={`${styles.underline} ${className}`} target="_blank" rel="noopener noreferrer">{children}</a>
  }
  return <Link href={href} className={`${styles.underline} ${className}`}>{children}</Link>
}

export function TextReveal({ children, className = '', delay = 0 }: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  void delay
  return <div className={`${styles.reveal} ${className}`}>{children}</div>
}

export function SplitLineReveal({ lines, className = '' }: { lines: string[]; className?: string }) {
  return (
    <span className={className}>
      {lines.map((line, index) => (
        <span className={styles.splitLine} key={line}>
          <motion.span
            className={styles.splitLineInner}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: 0.08 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export function ImageMaskReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.imageMask} ${className}`}>{children}</div>
}

export function ParallaxImage({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reducedMotion ? ['0%', '0%'] : ['-4%', '4%'])
  return <div ref={ref} className={`${styles.parallax} ${className}`}><motion.div className={styles.parallaxInner} style={{ y }}>{children}</motion.div></div>
}

export function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--tilt-x', `${((event.clientY - rect.top) / rect.height - 0.5) * -3}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - 0.5) * 3}deg`)
  }
  return <div className={`${styles.tilt} ${className}`} onPointerMove={move} onPointerLeave={(event) => event.currentTarget.removeAttribute('style')}>{children}</div>
}

export function SpotlightCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
  }
  return <div className={`${styles.spotlight} ${className}`} onPointerMove={move}>{children}</div>
}

export function ExpandableCard({ summary, children, label }: {
  summary: ReactNode
  children: ReactNode
  label: string
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  const closeDrawer = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', close)
    const focusFrame = requestAnimationFrame(() => drawerRef.current?.focus())
    return () => {
      cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', close)
    }
  }, [open, closeDrawer])

  return (
    <>
      <button ref={triggerRef} type="button" className={styles.expandButton} onClick={() => setOpen(true)} aria-haspopup="dialog">{summary}</button>
      <AnimatePresence>
        {open && (
          <>
            <motion.button type="button" className={styles.drawerBackdrop} aria-label="Close details" onClick={closeDrawer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside ref={drawerRef} tabIndex={-1} className={styles.drawer} role="dialog" aria-modal="true" aria-label={label} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
              <button type="button" className={styles.drawerClose} onClick={closeDrawer} aria-label="Close details">×</button>
              {children}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function ScrollProgress() {
  const { pageProgress } = useExperience()
  return <div className={styles.progress} style={{ transform: `scaleX(${pageProgress})` }} aria-hidden="true" />
}

export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const { tier, reducedMotion } = useExperience()

  useEffect(() => {
    if (tier !== 'A' || reducedMotion) return
    let frame = 0
    let x = -100
    let y = -100
    let ringX = -100
    let ringY = -100

    const move = (event: PointerEvent) => { x = event.clientX; y = event.clientY }
    const draw = () => {
      ringX += (x - ringX) * 0.14
      ringY += (y - ringY) * 0.14
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (ring.current) ring.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      frame = requestAnimationFrame(draw)
    }
    window.addEventListener('pointermove', move, { passive: true })
    frame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('pointermove', move) }
  }, [tier, reducedMotion])

  if (tier !== 'A' || reducedMotion) return null
  return <><div ref={dot} className={styles.cursor} /><div ref={ring} className={styles.cursorRing} /></>
}

export function SectionIndicator() {
  const { activeSection } = useExperience()
  return (
    <nav className={styles.indicator} aria-label="Homepage sections">
      {EXPERIENCE_SECTIONS.map((section) => (
        <a key={section.id} href={`#${section.id}`} className={`${styles.indicatorLink} ${activeSection === section.id ? styles.indicatorActive : ''}`} aria-label={`Go to ${section.label}`} aria-current={activeSection === section.id ? 'location' : undefined}>
          <span className={styles.indicatorLabel}>{section.label}</span><span className={styles.indicatorDot} />
        </a>
      ))}
    </nav>
  )
}

export function AnimatedCounter({ value, prefix = '', suffix = '', className = '' }: {
  value: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const reducedMotion = useReducedMotion()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView || reducedMotion) return
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1400, 1)
      setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reducedMotion, value])

  const display = reducedMotion ? value : count
  return <span ref={ref} className={className}>{prefix}{display.toLocaleString('id-ID')}{suffix}</span>
}

export function Tooltip({ children, text }: { children: ReactNode; text: string }) {
  const id = useId()
  return <span className={styles.tooltip}><span tabIndex={0} aria-describedby={id}>{children}</span><span className={styles.tooltipBubble} id={id} role="tooltip">{text}</span></span>
}

export function InteractiveDataNode({ children, active = false, onActivate }: {
  children: ReactNode
  active?: boolean
  onActivate?: () => void
}) {
  return <button type="button" className={styles.node} aria-pressed={active} onClick={onActivate}>{children}</button>
}

export function sectionStyle(section: ExperienceSectionId): CSSProperties {
  return { '--experience-section': EXPERIENCE_SECTIONS.findIndex((item) => item.id === section) } as CSSProperties
}
