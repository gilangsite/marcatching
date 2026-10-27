'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CarouselImage } from '@/lib/landingPage'
import styles from './landing.module.css'

export default function LandingCarousel({ images, aspect, label }: { images: CarouselImage[]; aspect: string; label: string }) {
  const scroller = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  function go(direction: -1 | 1) {
    const element = scroller.current
    if (element) element.scrollBy({ left: direction * element.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className={styles.carousel}>
      <div
        ref={scroller}
        className={styles.carouselTrack}
        onScroll={event => {
          const element = event.currentTarget
          setIndex(Math.round(element.scrollLeft / Math.max(1, element.clientWidth)))
        }}
      >
        {images.map((image, position) => {
          const picture = (
            <div className={styles.slide} style={{ aspectRatio: aspect }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={`${label} ${position + 1}`} loading={position === 0 ? 'eager' : 'lazy'} draggable={false} />
            </div>
          )
          return image.link
            ? <a key={image.url} href={image.link} target="_blank" rel="noopener noreferrer nofollow ugc" className={styles.slideLink}>{picture}</a>
            : <div key={image.url} className={styles.slideLink}>{picture}</div>
        })}
      </div>
      {images.length > 1 && (
        <>
          <button type="button" className={`${styles.carouselNav} ${styles.carouselPrev}`} onClick={() => go(-1)} aria-label="Foto sebelumnya"><ChevronLeft size={18} /></button>
          <button type="button" className={`${styles.carouselNav} ${styles.carouselNext}`} onClick={() => go(1)} aria-label="Foto berikutnya"><ChevronRight size={18} /></button>
          <div className={styles.dots} aria-hidden>{images.map((image, position) => <i key={image.url} className={position === index ? styles.dotActive : undefined} />)}</div>
        </>
      )}
    </div>
  )
}
