'use client'

import React, { useRef } from 'react'
import type { Link } from '@/lib/supabaseClient'
import styles from './ImageCarousel.module.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageCarousel({ link }: { link: Link }) {
  const images = link.image_data || []
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Aspect ratio is like '16:9' -> default to '16/9' CSS format
  const ratioStyles = link.carousel_aspect_ratio ? link.carousel_aspect_ratio.replace(':', '/') : '16/9'

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  if (images.length === 0) return null

  return (
    <div className={styles.carouselContainer}>
      {images.length > 1 && (
        <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={scrollLeft} aria-label="Previous image">
          <ChevronLeft size={24} />
        </button>
      )}
      
      <div className={styles.carouselScrollArea} ref={scrollRef}>
        {images.map((img: any, idx: number) => {
          const content = (
            <div className={styles.imageItem} style={{ aspectRatio: ratioStyles }} key={idx}>
              <img src={img.url} alt={`${link.title} ${idx + 1}`} draggable={false} />
            </div>
          )

          if (img.link) {
            return (
              <a href={img.link} target="_blank" rel="noopener noreferrer" className={styles.imageLinkWrapper} key={idx}>
                {content}
              </a>
            )
          }
          return content
        })}
      </div>

      {images.length > 1 && (
        <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={scrollRight} aria-label="Next image">
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  )
}
