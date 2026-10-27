import { ArrowUpRight, Camera, Globe, Link2, Mail, MessageCircle, Play, Video } from 'lucide-react'
import { isRenderable, parseVideoUrl, resolveLandingStyle, type ButtonSource, type ImageAspect, type LandingBlock, type LandingPage } from '@/lib/landingPage'
import LandingCarousel from './LandingCarousel'
import styles from './landing.module.css'

const icons: Record<ButtonSource, React.ComponentType<{ size?: number }>> = {
  instagram: Camera,
  tiktok: Play,
  youtube: Video,
  website: Globe,
  whatsapp: MessageCircle,
  email: Mail,
  link: Link2,
}

function ratio(aspect: ImageAspect) {
  return aspect === 'auto' ? undefined : aspect.replace(':', ' / ')
}

function Block({ block, headline }: { block: LandingBlock; headline: string }) {
  if (block.type === 'text') {
    return <p className={`${styles.text} ${styles[`text_${block.size}`]} ${block.align === 'center' ? styles.center : ''} ${block.bold ? styles.bold : ''}`}>{block.text}</p>
  }

  if (block.type === 'button') {
    const Icon = icons[block.source] || Link2
    const external = block.url.startsWith('http')
    return (
      <a className={styles.button} href={block.url} {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow ugc' } : {})}>
        <span className={styles.buttonIcon}><Icon size={18} /></span>
        <span className={styles.buttonLabel}>{block.label}</span>
        <ArrowUpRight size={16} className={styles.buttonArrow} />
      </a>
    )
  }

  if (block.type === 'video') {
    const video = parseVideoUrl(block.url)
    if (!video) return null
    return (
      <figure className={styles.figure}>
        <div className={`${styles.video} ${video.vertical ? styles.videoVertical : ''}`}>
          <iframe
            src={video.embedUrl}
            title={block.caption || `Video ${headline}`}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    )
  }

  if (block.type === 'image') {
    // eslint-disable-next-line @next/next/no-img-element
    const picture = <div className={styles.image} style={{ aspectRatio: ratio(block.aspect) }}><img src={block.url} alt={block.alt || headline} loading="lazy" draggable={false} /></div>
    return block.link
      ? <a href={block.link} target="_blank" rel="noopener noreferrer nofollow ugc" className={styles.imageLink}>{picture}</a>
      : picture
  }

  return <LandingCarousel images={block.images} aspect={ratio(block.aspect) || '4 / 5'} label={headline} />
}

/** The public page and the editor preview render through this same component, so what you see is what visitors get. */
export default function LandingPageView({ page, preview = false }: { page: Pick<LandingPage, 'theme' | 'headline' | 'description' | 'blocks' | 'style'>; preview?: boolean }) {
  const blocks = page.blocks.filter(isRenderable)
  const resolved = resolveLandingStyle(page.style, page.theme)
  return (
    <>
      {resolved.fontHref && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={resolved.fontHref} precedence="landing-fonts" />
        </>
      )}
    <div className={`${styles.root} ${preview ? styles.preview : ''}`} data-theme={page.theme} style={resolved.vars as React.CSSProperties}>
      {page.style.backgroundImage && (
        <div className={styles.bgLayer} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={page.style.backgroundImage} alt="" draggable={false} />
          <i style={{ background: resolved.overlayColor }} />
        </div>
      )}
      <main className={styles.container}>
        <header className={styles.header}>
          {page.headline ? <h1>{page.headline}</h1> : <h1 className={styles.placeholder}>Nama brand</h1>}
          {(page.style.primary || page.style.secondary) && <i className={styles.accentBar} aria-hidden />}
          {page.description && <p>{page.description}</p>}
        </header>
        <div className={styles.blocks}>
          {blocks.length ? blocks.map(block => <Block key={block.id} block={block} headline={page.headline} />) : preview && <p className={styles.emptyHint}>Tambahkan blok di panel kiri. Hasilnya muncul di sini.</p>}
        </div>
        <footer className={styles.footer}>
          <a href="https://marcatching.com" target="_blank" rel="noopener">Dibuat dengan <b>Marcatching</b></a>
        </footer>
      </main>
    </div>
    </>
  )
}
