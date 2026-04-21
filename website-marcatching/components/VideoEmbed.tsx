import React from 'react'
import type { Link } from '@/lib/supabaseClient'
import styles from './VideoEmbed.module.css'

export default function VideoEmbed({ link, url, title }: { link?: Link, url?: string, title?: string }) {
  const videoUrl = url || link?.url || ''
  const embedTitle = title || link?.title || 'Video'
  if (!videoUrl) return null

  let embedHtml = null
  let isVertical = false

  // YouTube
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null
    if (videoId) {
      embedHtml = (
        <iframe
          className={styles.videoIframe}
          src={`https://www.youtube.com/embed/${videoId}`}
          title={embedTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }
  }
  // TikTok
  else if (videoUrl.includes('tiktok.com')) {
    isVertical = true
    const videoIdMatch = videoUrl.match(/video\/(\d+)/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null
    if(videoId) {
      embedHtml = (
        <iframe
          className={styles.videoIframe}
          style={{ aspectRatio: '9/16' }}
          src={`https://www.tiktok.com/player/v1/${videoId}?&autoplay=0`}
          allow="fullscreen"
          title={embedTitle}
        />
      )
    } else {
       embedHtml = <a href={videoUrl} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>Tonton Video TikTok</a>
    }
  }
  // Instagram Reels
  else if (videoUrl.includes('instagram.com/reel/') || videoUrl.includes('instagram.com/p/')) {
    isVertical = true
    let embedUrl = videoUrl.split('?')[0]
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
        title={embedTitle}
      />
    )
  }
  // Google Drive
  else if (videoUrl.includes('drive.google.com/file/d/')) {
    const fileIdMatch = videoUrl.match(/d\/([^/]+)/)
    const fileId = fileIdMatch ? fileIdMatch[1] : null
    if(fileId) {
       embedHtml = (
         <iframe
           className={styles.videoIframe}
           src={`https://drive.google.com/file/d/${fileId}/preview`}
           title={embedTitle}
           allowFullScreen={true}
         />
       )
    }
  }

  if(!embedHtml) {
    embedHtml = (
      <div className={styles.fallbackLinkWrap}>
         <a href={videoUrl} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
           Buka Video: {embedTitle}
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
