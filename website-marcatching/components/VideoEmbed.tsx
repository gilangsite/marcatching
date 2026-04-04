import React from 'react'
import type { Link } from '@/lib/supabaseClient'
import styles from './VideoEmbed.module.css'

export default function VideoEmbed({ link }: { link: Link }) {
  const url = link.url || ''
  if (!url) return null

  let embedHtml = null
  let isVertical = false

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null
    if (videoId) {
      embedHtml = (
        <iframe
          className={styles.videoIframe}
          src={`https://www.youtube.com/embed/${videoId}`}
          title={link.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }
  }
  // TikTok
  else if (url.includes('tiktok.com')) {
    isVertical = true
    const videoIdMatch = url.match(/video\/(\d+)/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null
    if(videoId) {
      embedHtml = (
        <iframe
          className={styles.videoIframe}
          style={{ aspectRatio: '9/16' }}
          src={`https://www.tiktok.com/player/v1/${videoId}?&autoplay=0`}
          allow="fullscreen"
          title={link.title}
        />
      )
    } else {
       embedHtml = <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>Tonton Video TikTok</a>
    }
  }
  // Instagram Reels
  else if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')) {
    isVertical = true
    let embedUrl = url.split('?')[0]
    if (!embedUrl.endsWith('/')) embedUrl += '/'
    embedUrl += 'embed/'
    
    embedHtml = (
      <iframe
        className={styles.videoIframe}
        style={{ aspectRatio: '9/16' }}
        src={embedUrl}
        allowTransparency={true}
        allowFullScreen={true}
        scrolling="no"
        title={link.title}
      />
    )
  }
  // Google Drive
  else if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/d\/([^/]+)/)
    const fileId = fileIdMatch ? fileIdMatch[1] : null
    if(fileId) {
       embedHtml = (
         <iframe
           className={styles.videoIframe}
           src={`https://drive.google.com/file/d/${fileId}/preview`}
           title={link.title}
           allowFullScreen={true}
         />
       )
    }
  }

  if(!embedHtml) {
    embedHtml = (
      <div className={styles.fallbackLinkWrap}>
         <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
           Buka Video: {link.title}
         </a>
      </div>
    )
  }

  return (
    <div className={`${styles.videoContainer} ${isVertical ? styles.vertical : ''}`}>
      {embedHtml}
    </div>
  )
}
