'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Clock, Eye, X, SlidersHorizontal } from 'lucide-react'
import type { Article, ArticleCategory, NavLink } from '@/lib/supabaseClient'
import styles from './page.module.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getDriveThumb(url: string | null, size = 'w800-h600') {
  if (!url) return null
  if (url.includes('drive.google.com/uc')) {
    const m = url.match(/id=([^&]+)/)
    if (m?.[1]) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=${size}`
  }
  return url
}

function getFirstImageFromContent(content: any[]): string | null {
  if (!Array.isArray(content)) return null
  const block = content.find((b: any) => b.type === 'image' && b.url)
  return block ? getDriveThumb(block.url) : null
}

export default function ArticleListClient({ 
  initialArticles, 
  categories, 
  navbarLinks 
}: { 
  initialArticles: Article[], 
  categories: ArticleCategory[], 
  navbarLinks: NavLink[] 
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState<'newest' | 'views'>('newest')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Re-fetch only if sort or filter changes away from initial
    if (sort !== 'newest' || activeCategory !== 'all' || search !== '') {
      fetchArticles()
    } else {
      setArticles(initialArticles)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, activeCategory, search])

  async function fetchArticles() {
    setLoading(true)
    const params = new URLSearchParams({ sort })
    if (activeCategory !== 'all') params.set('category', activeCategory)
    if (search) params.set('search', search)
    const res = await fetch(`/api/articles?${params}`)
    const data = await res.json()
    setArticles(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
  }

  function clearSearch() {
    setSearch('')
    setSearchInput('')
    searchRef.current?.focus()
  }

  return (
    <>
      <Navbar navLinks={navbarLinks} />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.heroTag}>Marcatching</p>
            <h1 className={styles.heroTitle}>Articles</h1>
            <p className={styles.heroDesc}>Insight, strategi, dan cerita dari dunia marketing.</p>
          </div>
        </section>

        <div className={styles.filterBar}>
          <div className={styles.filterBarInner}>
            <div className={styles.catPills}>
              <button className={`${styles.catPill} ${activeCategory === 'all' ? styles.catPillActive : ''}`} onClick={() => setActiveCategory('all')}>All</button>
              {categories.map(cat => (
                <button key={cat.id} className={`${styles.catPill} ${activeCategory === cat.slug ? styles.catPillActive : ''}`} onClick={() => setActiveCategory(cat.slug)}>{cat.name}</button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <button className={styles.sortBtn} onClick={() => setShowSortMenu(s => !s)}><SlidersHorizontal size={14} />{sort === 'newest' ? 'Terbaru' : 'Most Seen'}</button>
              {showSortMenu && (
                <div className={styles.sortDropdown}>
                  <button className={sort === 'newest' ? styles.sortOptActive : styles.sortOpt} onClick={() => { setSort('newest'); setShowSortMenu(false) }}><Clock size={13} /> Terbaru</button>
                  <button className={sort === 'views' ? styles.sortOptActive : styles.sortOpt} onClick={() => { setSort('views'); setShowSortMenu(false) }}><Eye size={13} /> Most Seen</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className={styles.gridSection}>
          <div className={styles.gridWrap}>
            {loading ? (
              <div className={styles.loadingGrid}>{Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skeletonCard} />)}</div>
            ) : articles.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Belum ada artikel{search ? ` untuk "${search}"` : ' tersedia'}.</p>
                {search && <button className={styles.clearSearch} onClick={clearSearch}>Hapus pencarian</button>}
              </div>
            ) : (
              <div className={styles.grid}>
                {articles.map(article => {
                  const thumb = getFirstImageFromContent(article.content)
                  const cat = (article as any).article_categories
                  const author = (article as any).article_authors
                  return (
                    <Link key={article.id} href={`/article/${article.slug}`} className={styles.card}>
                      <div className={styles.cardThumb}>
                        {thumb ? <img src={thumb} alt={article.title} className={styles.cardThumbImg} /> : <div className={styles.cardThumbPlaceholder}><span>M</span></div>}
                        {cat && <span className={styles.cardCatBadge}>{cat.name}</span>}
                      </div>
                      <div className={styles.cardBody}>
                        <h2 className={styles.cardTitle}>{article.title}</h2>
                        {article.excerpt && <p className={styles.cardExcerpt}>{article.excerpt}</p>}
                        <div className={styles.cardMeta}>
                          {author && (
                            <div className={styles.cardAuthor}>
                              {author.photo_url ? <img src={getDriveThumb(author.photo_url, 'w80-h80') || ''} alt={author.name} className={styles.cardAuthorAvatar} /> : <div className={styles.cardAuthorAvatarPlaceholder}>{author.name[0]}</div>}
                              <span className={styles.cardAuthorName}>{author.name}</span>
                            </div>
                          )}
                          <div className={styles.cardMetaRight}><span className={styles.cardDate}>{formatDate(article.published_at)}</span><span className={styles.cardViews}><Eye size={11} /> {article.view_count}</span></div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <div className={styles.bottomSearchBar}>
        <form className={styles.bottomSearchForm} onSubmit={handleSearch}>
          <Search size={16} className={styles.bottomSearchIcon} />
          <input ref={searchRef} className={styles.bottomSearchInput} placeholder="Cari judul artikel..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          {searchInput && <button type="button" className={styles.bottomSearchClear} onClick={clearSearch}><X size={14} /></button>}
          <button type="submit" className={styles.bottomSearchBtn}>Cari</button>
        </form>
      </div>
      <Footer />
    </>
  )
}
