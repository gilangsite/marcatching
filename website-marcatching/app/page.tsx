import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { Link as LinkType, Contact, Product } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import ButtonCard from '@/components/ButtonCard'
import TextBlock from '@/components/TextBlock'
import ImageCarousel from '@/components/ImageCarousel'
import VideoEmbed from '@/components/VideoEmbed'
import FloatingLogo from '@/components/FloatingLogo'
import Footer from '@/components/Footer'
import { Mail, ArrowRight } from 'lucide-react'
import styles from './page.module.css'

async function getLinks(): Promise<LinkType[]> {
  const { data, error } = await supabase.from('links').select('*').order('order_index', { ascending: true })
  if (error) { console.error('Error fetching links:', error); return [] }
  return data ?? []
}

async function getContact(): Promise<Contact | null> {
  const { data, error } = await supabase.from('contact').select('*').limit(1).single()
  if (error) return null
  return data
}

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
  if (error) { console.error('Error fetching products:', error); return [] }
  return data ?? []
}

export const revalidate = 0

function formatRupiah(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID')
}

export default async function HomePage() {
  const [links, contact, products] = await Promise.all([getLinks(), getContact(), getProducts()])

  return (
    <>
      <Navbar links={links} />

      <main className={styles.main}>
        {/* ── Main Content ────────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.heroDecor} />
          <div className={styles.heroContent}>
            
            <div className={styles.homeLogoWrap}>
              <Image
                src="/logo-type-white.png"
                alt="Marcatching Logo"
                width={800}
                height={200}
                className={styles.homeLogoType}
                priority
              />
            </div>
            
            <p className={styles.homeTagline}>
              Learning to understand how marketing really works.
            </p>

            <div className={styles.linksList}>
              {links.length > 0 ? (
                links.map((link, i) => {
                  if (link.type === 'text') return <TextBlock key={link.id} link={link} />
                  if (link.type === 'carousel') return <ImageCarousel key={link.id} link={link} />
                  if (link.type === 'video') return <VideoEmbed key={link.id} link={link} />
                  if (link.type === 'product') {
                    const product = products.find(p => p.id === link.url)
                    if (!product) return null
                    let posterUrl = product.image_url || ''
                    if (posterUrl && posterUrl.includes('drive.google.com/uc')) {
                      const match = posterUrl.match(/id=([^&]+)/)
                      if (match?.[1]) posterUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400-h500`
                    }
                    return (
                      <Link key={link.id} href={`/product/${product.slug}`} className={styles.productCard}>
                        <div className={styles.productPoster} style={{ aspectRatio: '16/9' }}>
                          {posterUrl ? (
                            <img src={posterUrl} alt={product.name} className={styles.productPosterImg} />
                          ) : (
                            <div className={styles.productPosterPlaceholder}>No Image</div>
                          )}
                          {product.discount_percentage > 0 && (
                            <span className={styles.productDiscountBadge}>-{product.discount_percentage}%</span>
                          )}
                        </div>
                        <div className={styles.productCardInfo}>
                          <h3 className={styles.productCardName}>{product.name}</h3>
                          {product.sub_headline && (
                            <p className={styles.productCardSub}>{product.sub_headline}</p>
                          )}
                        </div>
                      </Link>
                    )
                  }
                  return <ButtonCard key={link.id} link={link} index={i} />
                })
              ) : (
                <p className={styles.emptyState}>Belum ada link tersedia.</p>
              )}
            </div>

            {/* ── Product Cards ────────────────────────────── */}
            {(() => {
              const linkedProductIds = new Set(links.filter(l => l.type === 'product').map(l => l.url))
              const unlinkedProducts = products.filter(p => !linkedProductIds.has(p.id))
              if (unlinkedProducts.length === 0) return null

              return (
                <div className={styles.productGrid}>
                  {unlinkedProducts.map(product => {
                    let posterUrl = product.image_url || ''
                    if (posterUrl && posterUrl.includes('drive.google.com/uc')) {
                      const match = posterUrl.match(/id=([^&]+)/)
                      if (match?.[1]) posterUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400-h500`
                    }
                    return (
                      <Link key={product.id} href={`/product/${product.slug}`} className={styles.productCard}>
                        <div className={styles.productPoster}>
                          {posterUrl ? (
                            <img src={posterUrl} alt={product.name} className={styles.productPosterImg} />
                          ) : (
                            <div className={styles.productPosterPlaceholder}>No Image</div>
                          )}
                          {product.discount_percentage > 0 && (
                            <span className={styles.productDiscountBadge}>-{product.discount_percentage}%</span>
                          )}
                        </div>
                        <div className={styles.productCardInfo}>
                          <h3 className={styles.productCardName}>{product.name}</h3>
                          {product.sub_headline && (
                            <p className={styles.productCardSub}>{product.sub_headline}</p>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )
            })()}
            
          </div>
        </section>

        {/* ── Contact ─────────────────────────────────────── */}
        <section className={styles.contactSection}>
          <div className={styles.heroContent}>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <Mail size={24} strokeWidth={1.75} />
              </div>
              <div className={styles.contactBody}>
                <h2 className={styles.contactTitle}>Get in touch with Marcatching</h2>
                <p className={styles.contactDesc}>
                  Punya pertanyaan atau ingin berkolaborasi? Kirimkan pesan ke kami.
                </p>
                {contact?.email && (
                  <a href={`mailto:${contact.email}`} className={styles.emailLink}>
                    {contact.email}
                    <ArrowRight size={16} strokeWidth={2} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingLogo />
    </>
  )
}
