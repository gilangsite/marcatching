'use client'

import { useState, useEffect, useRef, Suspense, FormEvent, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Reorder, useDragControls } from 'framer-motion'
import Cropper from 'react-easy-crop'
import {
  Plus, Pencil, Trash2, LogOut, Globe, Music2,
  Mail, Link as LinkIcon, Camera, Video,
  ShoppingBag, Check, X, ChevronRight, ExternalLink,
  Upload, Image as ImageIcon, Type, MousePointerClick, GripVertical, Menu,
  Package, Tag, ClipboardList, Eye, EyeOff, BookMarked,
  FileText, BarChart3, Users, MousePointer, TrendingUp, RefreshCw, Calendar,
  Newspaper, UserCircle, FolderOpen, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Minus, ChevronDown, ChevronUp, MoveVertical, Navigation, ShoppingCart, Store, PartyPopper,
  TrendingDown, DollarSign, Globe as GlobeAnalytics, Lock
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Link, Contact, Product, Voucher, Order, CourseMaterial, AddonItem, Article, ArticleBlock, ArticleCategory, ArticleAuthor, NavLink, ProductCategory, StorePageBlock, StoreProduct } from '@/lib/supabaseClient'
import styles from './admin.module.css'
import AboutPageConfigTab from './AboutPageConfigTab'
import ChampagneTab from './ChampagneTab'
import FinanceTab from './FinanceTab'
import CashflowAnalytics from './CashflowAnalytics'
import RichTextEditor from '@/components/RichTextEditor'
import SecurityTab from './SecurityTab'
import SurveyTab from './SurveyTab'

// ─── Icon map ────────────────────────────────────────────────
const ICON_OPTIONS = [
  { value: 'Globe', label: 'Globe (Website)', Icon: Globe },
  { value: 'Instagram', label: 'Instagram (Camera)', Icon: Camera },
  { value: 'Video', label: 'YouTube (Video)', Icon: Video },
  { value: 'Music2', label: 'TikTok / Music', Icon: Music2 },
  { value: 'Mail', label: 'Email', Icon: Mail },
  { value: 'Link', label: 'Generic Link', Icon: LinkIcon },
  { value: 'ShoppingBag', label: 'Shop', Icon: ShoppingBag },
  { value: 'ExternalLink', label: 'External Link', Icon: ExternalLink },
]
const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(
  ICON_OPTIONS.map(({ value, Icon }) => [value, Icon])
)

const emptyLink: Partial<Link> = {
  title: '', url: '', icon: 'Globe', status: 'active', order_index: 0,
  type: 'button', btn_color: '', text_color: '#000000', text_size: '1rem',
  text_align: 'center', text_bold: false, text_italic: false,
  carousel_aspect_ratio: '16:9', image_data: []
}

// ─── Format helpers ──────────────────────────────────────────
function formatRp(num: number): string {
  return num.toLocaleString('id-ID')
}
function parseRp(str: string): number {
  return parseInt(str.replace(/\D/g, '')) || 0
}
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function formatWaNumber(wa: string): string {
  const clean = wa.replace(/\D/g, '')
  if (clean.startsWith('62')) return clean
  if (clean.startsWith('0')) return '62' + clean.slice(1)
  return '62' + clean
}
function cleanUrl(url: string | null | undefined): string {
  if (!url) return ''
  let finalUrl = url.trim()
  finalUrl = finalUrl.replace(/^(https?:\/\/)?(www\.)?marcatching\.com\/?/i, '/')
  if (finalUrl && !finalUrl.startsWith('http') && !finalUrl.startsWith('/') && !finalUrl.startsWith('#') && !finalUrl.startsWith('mailto:') && !finalUrl.startsWith('tel:')) {
    finalUrl = 'https://' + finalUrl
  }
  return finalUrl
}

// ─── Sortable Item ─────────────────────────────────────────
function SortableLinkItem({ link, onEdit, onDelete }: { link: Link, onEdit: (l: Link) => void, onDelete: (id: string) => void }) {
  const controls = useDragControls()
  const IconComp = ICON_MAP[link.icon] ?? LinkIcon
  return (
    <Reorder.Item value={link} dragListener={false} dragControls={controls} className={styles.linkRow} initial={false} style={{ cursor: 'default' }}>
      <div className={styles.linkDragHandle} title="Tarik untuk memindahkan" onPointerDown={(e) => controls.start(e)}
        style={{ padding: '0 12px 0 4px', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none' }}>
        <GripVertical size={16} color="var(--text-secondary)" />
      </div>
      <div onClick={() => onEdit(link)} style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer', gap: '16px', minWidth: 0 }}>
        <div className={styles.linkIcon} style={{ margin: 0 }}><IconComp size={18} strokeWidth={1.75} /></div>
        <div className={styles.linkInfo}>
          <span className={styles.linkTypeBadge}>{link.type === 'product' || link.url?.includes('/product/') ? 'Product' : link.type === 'video' ? 'Video' : link.type === 'carousel' ? 'Carousel' : link.type === 'text' ? 'Text Block' : 'Button'}</span>
          <span className={styles.linkTitle} style={{marginTop: 4, display: 'block'}}>{link.title}</span>
          {link.type === 'button' && (
            <span className={styles.linkUrl}>{link.url ?? '—'} · <span className={link.status === 'active' ? styles.statusActive : styles.statusSoon}>{link.status === 'active' ? 'Active' : 'Coming Soon'}</span></span>
          )}
        </div>
      </div>
      <div className={styles.linkActions}>
        <button className={styles.editBtn} onClick={() => onEdit(link)} title="Edit"><Pencil size={15} /></button>
        <button className={styles.deleteBtn} onClick={() => onDelete(link.id)} title="Hapus"><Trash2 size={15} /></button>
      </div>
    </Reorder.Item>
  )
}

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', err => reject(err))
    img.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  )
  return canvas.toDataURL('image/jpeg', 0.9) // Return base64 directly
}

// ─── Visitor Line Chart (stock-style SVG) ────────────────────
function VisitorLineChart({ data }: {
  data: { date: string; visitors: number; views: number; clicks: number }[]
}) {
  const W = 820, H = 210
  const PAD = { top: 18, bottom: 38, left: 44, right: 16 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom
  if (!data || data.length === 0) return null
  const maxV = Math.max(...data.map(d => d.visitors), 1)
  const n = data.length
  const toX = (i: number) => PAD.left + (n <= 1 ? cW / 2 : (i / (n - 1)) * cW)
  const toY = (v: number) => PAD.top + cH - (v / maxV) * cH
  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.visitors), ...d }))
  // Smooth cubic bezier
  let linePath = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i]
    const cpx = ((p0.x + p1.x) / 2).toFixed(1)
    linePath += ` C ${cpx} ${p0.y.toFixed(1)} ${cpx} ${p1.y.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`
  }
  const bY = (PAD.top + cH).toFixed(1)
  const areaPath = `${linePath} L ${pts[n-1].x.toFixed(1)} ${bY} L ${pts[0].x.toFixed(1)} ${bY} Z`
  // Y-axis ticks
  const fmt = (v: number) => v >= 1000 ? `${(v/1000).toFixed(v%1000===0?0:1)}k` : `${Math.round(v)}`
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: (PAD.top + cH - f * cH).toFixed(1),
    label: fmt(f * maxV)
  }))
  // X-axis labels (max ~7)
  const step = Math.max(1, Math.floor(n / 7))
  const lblSet = new Set<number>()
  for (let i = 0; i < n; i += step) lblSet.add(i)
  lblSet.add(n - 1)
  const showDots = n <= 30
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.30" />
          <stop offset="70%" stopColor="#1d4ed8" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines + Y labels */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y}
            stroke={i === 0 ? '#cbd5e1' : '#e2e8f0'} strokeWidth="1" />
          <text x={PAD.left - 8} y={parseFloat(t.y) + 4} textAnchor="end"
            fontSize="10" fill="#94a3b8">{t.label}</text>
        </g>
      ))}
      {/* Gradient area */}
      <path d={areaPath} fill="url(#visGrad)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#1d4ed8" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {showDots && pts.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3.5"
          fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5">
          <title>{`${p.date}: ${p.visitors} visitors · ${p.views} views · ${p.clicks} clicks`}</title>
        </circle>
      ))}
      {/* X labels */}
      {pts.map((p, i) => lblSet.has(i) ? (
        <text key={i} x={p.x.toFixed(1)} y={H - 4} textAnchor="middle"
          fontSize="10" fill="#94a3b8">{data[i].date.substring(5)}</text>
      ) : null)}
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────
function AdminDashboardInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  type TabType = 'links' | 'contact' | 'products' | 'vouchers' | 'orders' | 'ecourse' | 'analytics' | 'articles' | 'navigation' | 'ecommerce' | 'aboutpage' | 'champagne' | 'finance' | 'security' | 'survey'
  const [tab, setTab] = useState<TabType>('links')
  const [analyticsSubView, setAnalyticsSubView] = useState<'website' | 'cashflow'>('website')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const contactMenuRef = useRef<HTMLTableSectionElement | null>(null)

  // Links state
  const [links, setLinks] = useState<Link[]>([])
  const [linksLoading, setLinksLoading] = useState(true)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [linkForm, setLinkForm] = useState<Partial<Link>>(emptyLink)
  const [linkSaving, setLinkSaving] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [contact, setContact] = useState<Contact | null>(null)
  const [contactLoading, setContactLoading] = useState(true)
  const [contactEmail, setContactEmail] = useState('')
  const [contactSaving, setContactSaving] = useState(false)
  const [contactMsg, setContactMsg] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [cropData, setCropData] = useState<{ src: string; target: 'poster' | 'carousel' | 'author' | null, file?: File, filename?: string, mimeType?: string }>({ src: '', target: null })
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => { setCroppedAreaPixels(croppedAreaPixels) }, [])

  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [pf, setPf] = useState({ name: '', sub_headline: '', description: '', image_url: '', price_before: '', price_after: '', discount: '', features: [] as string[], is_active: true, is_coming_soon: false, category_id: '' })
  const [newFeature, setNewFeature] = useState('')
  const [productSaving, setProductSaving] = useState(false)
  const [productError, setProductError] = useState('')
  const [uploadingPoster, setUploadingPoster] = useState(false)

  // Vouchers state
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [vouchersLoading, setVouchersLoading] = useState(true)
  const [showVoucherForm, setShowVoucherForm] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [vf, setVf] = useState({ code: '', discount_value: '', discount_type: 'fixed' as 'fixed' | 'percentage', is_active: true, applicable_products: null as string[] | null })
  const [voucherSaving, setVoucherSaving] = useState(false)
  const [voucherError, setVoucherError] = useState('')

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [contactMenuOrder, setContactMenuOrder] = useState<string | null>(null)

  // ── Product Categories state ─────────────────────────────
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([])
  const [productCatLoading, setProductCatLoading] = useState(false)
  const [showProdCatForm, setShowProdCatForm] = useState(false)
  const [editingProdCat, setEditingProdCat] = useState<ProductCategory | null>(null)
  const [prodCatName, setProdCatName] = useState('')
  const [prodCatSaving, setProdCatSaving] = useState(false)

  // ── E-Commerce state ──────────────────────────────────────
  const [storeBlocks, setStoreBlocks] = useState<StorePageBlock[]>([])
  const [storeBlocksLoading, setStoreBlocksLoading] = useState(false)
  const [showStoreBlockForm, setShowStoreBlockForm] = useState(false)
  const [editingStoreBlock, setEditingStoreBlock] = useState<StorePageBlock | null>(null)
  const [storeBlockType, setStoreBlockType] = useState<StorePageBlock['type']>('headline')
  const [storeBlockContent, setStoreBlockContent] = useState<StorePageBlock['content']>({})
  const [storeBlockSaving, setStoreBlockSaving] = useState(false)

  const [storePlacements, setStorePlacements] = useState<StoreProduct[]>([])
  const [storePlacementsLoading, setStorePlacementsLoading] = useState(false)
  const [showStorePlacementForm, setShowStorePlacementForm] = useState(false)
  const [spProductId, setSpProductId] = useState('')
  const [spStatus, setSpStatus] = useState<'active'|'coming_soon'>('active')
  const [spSaving, setSpSaving] = useState(false)

  // ── E-Course state ────────────────────────────────────────
  const [courseMaterials, setCourseMaterials] = useState<Record<string, CourseMaterial[]>>({})
  const [courseLoading, setCourseLoading] = useState<Record<string, boolean>>({})
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [showMaterialForm, setShowMaterialForm] = useState<string | null>(null) // product_id
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'video' as 'video' | 'pdf', content_url: '' })
  const [materialSaving, setMaterialSaving] = useState(false)
  const [materialError, setMaterialError] = useState('')
  const [uploadingPdf, setUploadingPdf] = useState(false)

  // ── Article state ─────────────────────────────────────────
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [articleCategories, setArticleCategories] = useState<ArticleCategory[]>([])
  const [articleAuthors, setArticleAuthors] = useState<ArticleAuthor[]>([])
  const [showArticleEditor, setShowArticleEditor] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [articleSaving, setArticleSaving] = useState(false)
  const [articleError, setArticleError] = useState('')
  // Article form
  const [articleTitle, setArticleTitle] = useState('')
  const [articleExcerpt, setArticleExcerpt] = useState('')
  const [articleStatus, setArticleStatus] = useState<'draft'|'published'|'unpublished'>('draft')
  const [articleCategoryId, setArticleCategoryId] = useState<string>('')
  const [articleAuthorId, setArticleAuthorId] = useState<string>('')
  const [articleBlocks, setArticleBlocks] = useState<ArticleBlock[]>([])
  const [articleImageUrls, setArticleImageUrls] = useState<string[]>([])
  // Block being added
  const [addingBlockType, setAddingBlockType] = useState<string|null>(null)
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  // Category management
  const [showCatForm, setShowCatForm] = useState(false)
  const [catFormName, setCatFormName] = useState('')
  const [editingCat, setEditingCat] = useState<ArticleCategory|null>(null)
  const [catSaving, setCatSaving] = useState(false)
  // Author management
  const [showAuthorForm, setShowAuthorForm] = useState(false)
  const [authorFormName, setAuthorFormName] = useState('')
  const [authorFormPhoto, setAuthorFormPhoto] = useState('')
  const [editingAuthor, setEditingAuthor] = useState<ArticleAuthor|null>(null)
  const [authorSaving, setAuthorSaving] = useState(false)
  const [uploadingAuthorPhoto, setUploadingAuthorPhoto] = useState(false)
  // Article image upload (for article blocks)
  const [articleCropData, setArticleCropData] = useState<{src:string; aspectRatio:string; blockId:string; file?:File; filename?:string; mimeType?:string}>({src:'', aspectRatio:'16:9', blockId:''})
  const [articleCrop, setArticleCrop] = useState({x:0,y:0})
  const [articleZoom, setArticleZoom] = useState(1)
  const [articleCroppedAreaPixels, setArticleCroppedAreaPixels] = useState<any>(null)
  const onArticleCropComplete = useCallback((_: any, pixels: any) => { setArticleCroppedAreaPixels(pixels) }, [])
  const [uploadingArticleImage, setUploadingArticleImage] = useState(false)

  // ── Analytics state ────────────────────────────────────────
  type AnalyticsData = {
    kpi: { uniqueVisitors: number; totalPageViews: number; totalClicks: number; ctr: number }
    buttonPerformance: { link_id: string; link_title: string; clicks: number }[]
    dailyTrend: { date: string; views: number; clicks: number; visitors: number }[]
    topPages: { path: string; count: number }[]
    trafficSources: { source: string; count: number }[]
  }
  type KpiComparison = { visitors: number; pageViews: number; clicks: number; ctr: number }
  // ── Navigation state ────────────────────────────────────────
  const [navLinks, setNavLinks] = useState<NavLink[]>([])
  const [navLinksLoading, setNavLinksLoading] = useState(false)
  const [showNavForm, setShowNavForm] = useState(false)
  const [editingNavLink, setEditingNavLink] = useState<NavLink | null>(null)
  const [navForm, setNavForm] = useState({ title: '', url: '', icon: 'Globe', text_color: '#ffffff', btn_color: '', is_active: true })
  const [navSaving, setNavSaving] = useState(false)
  const [navError, setNavError] = useState('')

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [kpiComparison, setKpiComparison] = useState<KpiComparison | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsPreset, setAnalyticsPreset] = useState('30')
  const [analyticsStart, setAnalyticsStart] = useState('')
  const [analyticsEnd, setAnalyticsEnd] = useState('')

  // ── Fetch all ─────────────────────────────────────────────
  async function fetchLinks() { setLinksLoading(true); const { data } = await supabase.from('links').select('*').order('order_index'); setLinks(data ?? []); setLinksLoading(false) }
  async function fetchContact() { setContactLoading(true); const { data } = await supabase.from('contact').select('*').limit(1).single(); setContact(data); setContactEmail(data?.email ?? ''); setContactLoading(false) }
  async function fetchProducts() { setProductsLoading(true); const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }); setProducts(data ?? []); setProductsLoading(false) }
  async function fetchVouchers() { setVouchersLoading(true); const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false }); setVouchers(data ?? []); setVouchersLoading(false) }
  async function fetchOrders() { setOrdersLoading(true); const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }); setOrders(data ?? []); setOrdersLoading(false) }

  // ── Product Categories CRUD ───────────────────────────────
  async function fetchProductCategories() { setProductCatLoading(true); const { data } = await supabase.from('product_categories').select('*').order('order_index'); setProductCategories(data ?? []); setProductCatLoading(false) }
  async function saveProdCat(e: FormEvent) {
    e.preventDefault(); if (!prodCatName.trim()) return
    setProdCatSaving(true)
    const slug = prodCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (editingProdCat) { await supabase.from('product_categories').update({ name: prodCatName.trim(), slug }).eq('id', editingProdCat.id) }
    else { await supabase.from('product_categories').insert({ name: prodCatName.trim(), slug, order_index: productCategories.length + 1 }) }
    setProdCatSaving(false); setShowProdCatForm(false); setProdCatName(''); setEditingProdCat(null); fetchProductCategories()
  }
  async function deleteProdCat(cat: ProductCategory) {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return
    await supabase.from('product_categories').delete().eq('id', cat.id); fetchProductCategories()
  }

  // ── Store Blocks CRUD ─────────────────────────────────────
  async function fetchStoreBlocks() { setStoreBlocksLoading(true); const { data } = await supabase.from('store_page_blocks').select('*').order('order_index'); setStoreBlocks(data ?? []); setStoreBlocksLoading(false) }
  function openAddStoreBlock() { setEditingStoreBlock(null); setStoreBlockType('headline'); setStoreBlockContent({ text: '', size: 'h2', color: '#ffffff', align: 'left' }); setShowStoreBlockForm(true) }
  function openEditStoreBlock(b: StorePageBlock) { setEditingStoreBlock(b); setStoreBlockType(b.type); setStoreBlockContent(b.content); setShowStoreBlockForm(true) }
  async function saveStoreBlock(e: FormEvent) {
    e.preventDefault(); setStoreBlockSaving(true)
    let finalContent = { ...storeBlockContent }
    if (storeBlockType === 'button' && finalContent.btn_url) {
      finalContent.btn_url = cleanUrl(finalContent.btn_url)
    }
    const payload = { type: storeBlockType, content: finalContent, is_active: true, order_index: editingStoreBlock ? editingStoreBlock.order_index : storeBlocks.length + 1 }
    if (editingStoreBlock) { await supabase.from('store_page_blocks').update(payload).eq('id', editingStoreBlock.id) }
    else { await supabase.from('store_page_blocks').insert(payload) }
    setStoreBlockSaving(false); setShowStoreBlockForm(false); setEditingStoreBlock(null); fetchStoreBlocks()
  }
  async function deleteStoreBlock(id: string) { if (!confirm('Hapus block ini?')) return; await supabase.from('store_page_blocks').delete().eq('id', id); fetchStoreBlocks() }
  async function handleStoreBlockReorder(newOrder: StorePageBlock[]) { setStoreBlocks(newOrder); await Promise.all(newOrder.map((b, i) => supabase.from('store_page_blocks').update({ order_index: i + 1 }).eq('id', b.id))) }
  async function toggleStoreBlockActive(b: StorePageBlock) { await supabase.from('store_page_blocks').update({ is_active: !b.is_active }).eq('id', b.id); fetchStoreBlocks() }

  // ── Store Placements CRUD ─────────────────────────────────
  async function fetchStorePlacements() { setStorePlacementsLoading(true); const { data } = await supabase.from('store_products').select('*, products(*)').order('order_index'); setStorePlacements(data ?? []); setStorePlacementsLoading(false) }
  async function addStorePlacement(e: FormEvent) {
    e.preventDefault(); if (!spProductId) return
    setSpSaving(true)
    await supabase.from('store_products').upsert({ product_id: spProductId, store_status: spStatus, order_index: storePlacements.length + 1 }, { onConflict: 'product_id' })
    setSpSaving(false); setShowStorePlacementForm(false); setSpProductId(''); setSpStatus('active'); fetchStorePlacements()
  }
  async function deleteStorePlacement(id: string) { if (!confirm('Hapus produk dari store?')) return; await supabase.from('store_products').delete().eq('id', id); fetchStorePlacements() }
  async function updateStorePlacementStatus(sp: StoreProduct, status: 'active'|'coming_soon'|'hidden') { await supabase.from('store_products').update({ store_status: status }).eq('id', sp.id); fetchStorePlacements() }
  async function handleStorePlacementReorder(newOrder: StoreProduct[]) { setStorePlacements(newOrder); await Promise.all(newOrder.map((sp, i) => supabase.from('store_products').update({ order_index: i + 1 }).eq('id', sp.id))) }

  // ── Navigation CRUD ────────────────────────────────────────
  async function fetchNavLinks() {
    setNavLinksLoading(true)
    const { data } = await supabase.from('nav_links').select('*').order('order_index')
    setNavLinks(data ?? [])
    setNavLinksLoading(false)
  }

  function openAddNavLink() {
    setEditingNavLink(null)
    setNavForm({ title: '', url: '', icon: 'Globe', text_color: '#ffffff', btn_color: '', is_active: true })
    setNavError('')
    setShowNavForm(true)
  }

  function openEditNavLink(nl: NavLink) {
    setEditingNavLink(nl)
    setNavForm({
      title: nl.title,
      url: nl.url || '',
      icon: nl.icon || 'Globe',
      text_color: nl.text_color || '#ffffff',
      btn_color: nl.btn_color || '',
      is_active: nl.is_active,
    })
    setNavError('')
    setShowNavForm(true)
  }

  async function saveNavLink(e: FormEvent) {
    e.preventDefault()
    if (!navForm.title.trim()) { setNavError('Judul wajib diisi.'); return }
    setNavSaving(true); setNavError('')
    const payload = {
      title: navForm.title.trim(),
      url: cleanUrl(navForm.url) || null,
      icon: navForm.icon,
      text_color: navForm.text_color || '#ffffff',
      btn_color: navForm.btn_color || null,
      is_active: navForm.is_active,
      order_index: editingNavLink ? editingNavLink.order_index : navLinks.length + 1,
    }
    let error
    if (editingNavLink) {
      ({ error } = await supabase.from('nav_links').update(payload).eq('id', editingNavLink.id))
    } else {
      ({ error } = await supabase.from('nav_links').insert(payload))
    }
    setNavSaving(false)
    if (error) { setNavError('Terjadi kesalahan: ' + error.message) }
    else { setShowNavForm(false); setEditingNavLink(null); fetchNavLinks() }
  }

  async function deleteNavLink(id: string) {
    if (!confirm('Hapus navigation link ini?')) return
    await supabase.from('nav_links').delete().eq('id', id)
    fetchNavLinks()
  }

  async function handleNavReorder(newOrder: NavLink[]) {
    setNavLinks(newOrder)
    await Promise.all(newOrder.map((nl, idx) => supabase.from('nav_links').update({ order_index: idx + 1 }).eq('id', nl.id)))
  }

  async function toggleNavLinkActive(nl: NavLink) {
    await supabase.from('nav_links').update({ is_active: !nl.is_active }).eq('id', nl.id)
    fetchNavLinks()
  }

  // ── Article fetchers ───────────────────────────────────────
  async function fetchArticles() {
    setArticlesLoading(true)
    const res = await fetch('/api/articles?admin=1')
    const data = await res.json()
    setArticles(Array.isArray(data) ? data : [])
    setArticlesLoading(false)
  }
  async function fetchArticleCategories() {
    const res = await fetch('/api/article-categories')
    const data = await res.json()
    setArticleCategories(Array.isArray(data) ? data : [])
  }
  async function fetchArticleAuthors() {
    const res = await fetch('/api/article-authors')
    const data = await res.json()
    setArticleAuthors(Array.isArray(data) ? data : [])
  }

  async function fetchCourseMaterials(productId: string) {
    setCourseLoading(prev => ({ ...prev, [productId]: true }))
    const { data } = await supabase.from('course_materials').select('*').eq('product_id', productId).order('order_index')
    setCourseMaterials(prev => ({ ...prev, [productId]: data ?? [] }))
    setCourseLoading(prev => ({ ...prev, [productId]: false }))
  }

  async function saveMaterial(e: FormEvent, productId: string) {
    e.preventDefault()
    if (!materialForm.title) { setMaterialError('Judul materi wajib diisi.'); return }
    if (!materialForm.content_url) { setMaterialError('URL konten wajib diisi.'); return }
    setMaterialSaving(true); setMaterialError('')
    const existing = courseMaterials[productId] || []
    await supabase.from('course_materials').insert({
      product_id: productId,
      title: materialForm.title,
      type: materialForm.type,
      content_url: materialForm.content_url,
      order_index: existing.length + 1
    })
    setMaterialForm({ title: '', type: 'video', content_url: '' })
    setShowMaterialForm(null)
    setMaterialSaving(false)
    fetchCourseMaterials(productId)
  }

  async function deleteMaterial(materialId: string, productId: string) {
    if (!confirm('Hapus materi ini?')) return
    const mat = courseMaterials[productId]?.find(m => m.id === materialId)
    if (mat && mat.content_url && mat.content_url.includes('drive.google')) {
      const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'
      fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'deleteFile', url: mat.content_url }) }).catch(()=>null)
    }
    await supabase.from('course_materials').delete().eq('id', materialId)
    fetchCourseMaterials(productId)
  }

  async function reorderMaterials(newOrder: CourseMaterial[], productId: string) {
    setCourseMaterials(prev => ({ ...prev, [productId]: newOrder }))
    await Promise.all(newOrder.map((m, idx) => supabase.from('course_materials').update({ order_index: idx + 1 }).eq('id', m.id)))
  }

  async function handlePdfBatchUpload(e: React.ChangeEvent<HTMLInputElement>, productId: string) {
    const files = e.target.files; if (!files || files.length === 0) return
    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || ''
    setUploadingPdf(true)
    const uploaded: { filename: string; url: string }[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]; const reader = new FileReader()
      await new Promise<void>((resolve) => {
        reader.onload = async (event) => {
          const base64 = event.target?.result as string
          try {
            const res = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'uploadPdf', filename: file.name, mimeType: file.type, base64 }) })
            const data = await res.json()
            if (data.status === 'success') uploaded.push({ filename: file.name.replace('.pdf', ''), url: data.url })
            else alert('Gagal upload ' + file.name + ': ' + data.message)
          } catch { alert('Error upload ' + file.name) }
          resolve()
        }; reader.readAsDataURL(file)
      })
    }
    // Auto-insert all uploaded PDFs as materials
    const existing = courseMaterials[productId] || []
    let baseIdx = existing.length + 1
    for (const pdf of uploaded) {
      await supabase.from('course_materials').insert({
        product_id: productId, title: pdf.filename, type: 'pdf', content_url: pdf.url, order_index: baseIdx++
      })
    }
    setUploadingPdf(false)
    fetchCourseMaterials(productId)
  }

  // ── Analytics fetch ─────────────────────────────────────────
  function getDateRange(preset: string): { start: string; end: string } {
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    let start: Date
    switch (preset) {
      case '0': start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break
      case '7': start = new Date(end.getTime() - 7 * 86400000); break
      case '60': start = new Date(end.getTime() - 60 * 86400000); break
      case '90': start = new Date(end.getTime() - 90 * 86400000); break
      default: start = new Date(end.getTime() - 30 * 86400000)
    }
    return { start: start.toISOString(), end: end.toISOString() }
  }

  async function fetchAnalytics(startISO?: string, endISO?: string) {
    setAnalyticsLoading(true)
    let s = startISO, e = endISO
    if (!s || !e) {
      const range = getDateRange(analyticsPreset)
      s = range.start; e = range.end
    }
    try {
      // Compute previous period (same duration, shifted back)
      const durMs = new Date(e!).getTime() - new Date(s!).getTime()
      const prevEnd = new Date(new Date(s!).getTime() - 1).toISOString()
      const prevStart = new Date(new Date(s!).getTime() - durMs - 1).toISOString()
      const [currRes, prevRes] = await Promise.all([
        fetch(`/api/analytics?start=${encodeURIComponent(s!)}&end=${encodeURIComponent(e!)}`),
        fetch(`/api/analytics?start=${encodeURIComponent(prevStart)}&end=${encodeURIComponent(prevEnd)}`)
      ])
      const [currData, prevData] = await Promise.all([currRes.json(), prevRes.json()])
      if (currData.kpi) {
        setAnalyticsData(currData)
        if (prevData.kpi) {
          const pct = (curr: number, prev: number) =>
            prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)
          setKpiComparison({
            visitors: pct(currData.kpi.uniqueVisitors, prevData.kpi.uniqueVisitors),
            pageViews: pct(currData.kpi.totalPageViews, prevData.kpi.totalPageViews),
            clicks: pct(currData.kpi.totalClicks, prevData.kpi.totalClicks),
            ctr: pct(currData.kpi.ctr, prevData.kpi.ctr),
          })
        } else { setKpiComparison(null) }
      }
    } catch (err) { console.error('Analytics fetch error:', err) }
    setAnalyticsLoading(false)
  }

  function handlePresetChange(preset: string) {
    setAnalyticsPreset(preset)
    const range = getDateRange(preset)
    setAnalyticsStart(range.start.substring(0, 10))
    setAnalyticsEnd(range.end.substring(0, 10))
    fetchAnalytics(range.start, range.end)
  }

  function handleCustomDateApply() {
    if (analyticsStart && analyticsEnd) {
      const s = new Date(analyticsStart + 'T00:00:00').toISOString()
      const e = new Date(analyticsEnd + 'T23:59:59.999').toISOString()
      setAnalyticsPreset('custom')
      fetchAnalytics(s, e)
    }
  }

  // ── Session check to prevent Service Worker bypass ─────────
  useEffect(() => {
    fetch('/api/admin/sessions', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          window.location.replace('/admin/login')
        }
      })
      .catch(() => {
        // Ignore network errors, only kick on actual 401
      })
  }, [])

  useEffect(() => { fetchLinks(); fetchContact(); fetchProducts(); fetchVouchers(); fetchOrders(); fetchProductCategories() }, [])

  // Fetch ecommerce data when tab is active
  useEffect(() => {
    if (tab === 'ecommerce' && storeBlocks.length === 0 && !storeBlocksLoading) {
      fetchStoreBlocks(); fetchStorePlacements()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // Fetch nav links when navigation tab is active
  useEffect(() => {
    if (tab === 'navigation' && navLinks.length === 0 && !navLinksLoading) {
      fetchNavLinks()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  useEffect(() => {
    if (tab === 'articles' && articles.length === 0 && !articlesLoading) {
      fetchArticles(); fetchArticleCategories(); fetchArticleAuthors()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // Initialize analytics when tab switches to analytics
  useEffect(() => {
    if (tab === 'analytics' && !analyticsData && !analyticsLoading) {
      const range = getDateRange('30')
      setAnalyticsStart(range.start.substring(0, 10))
      setAnalyticsEnd(range.end.substring(0, 10))
      fetchAnalytics(range.start, range.end)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // Supabase Realtime subscription for analytics
  useEffect(() => {
    if (tab !== 'analytics') return
    const channel = supabase
      .channel('analytics_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analytics_events' }, () => {
        // Debounced refetch on new events
        fetchAnalytics()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, analyticsPreset, analyticsStart, analyticsEnd])

  // Read ?tab param from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType | null
    if (tabParam && ['links','contact','products','vouchers','orders','ecourse','analytics','articles','navigation','ecommerce','champagne','finance','security','survey'].includes(tabParam)) {
      setTab(tabParam)
    }
  }, [searchParams])

  // ── Article helpers ───────────────────────────────────────
  function slugifyArticle(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
  }

  function genBlockId() { return Math.random().toString(36).slice(2, 9) }

  function openNewArticle() {
    setEditingArticle(null)
    setArticleTitle('')
    setArticleExcerpt('')
    setArticleStatus('draft')
    setArticleCategoryId('')
    setArticleAuthorId('')
    setArticleBlocks([])
    setArticleImageUrls([])
    setArticleError('')
    setShowArticleEditor(true)
  }

  function openEditArticle(a: Article) {
    setEditingArticle(a)
    setArticleTitle(a.title)
    setArticleExcerpt(a.excerpt || '')
    setArticleStatus(a.status)
    setArticleCategoryId(a.category_id || '')
    setArticleAuthorId(a.author_id || '')
    setArticleBlocks(Array.isArray(a.content) ? a.content : [])
    setArticleImageUrls(a.image_urls || [])
    setArticleError('')
    setShowArticleEditor(true)
  }

  function addBlock(type: ArticleBlock['type']) {
    const id = genBlockId()
    let block: ArticleBlock
    if (type === 'headline') block = { type, id, text: '', size: 'h2', color: '#ffffff', font_family: 'DM Sans', align: 'left' }
    else if (type === 'text') block = { type, id, text: '', size: '1rem', weight: 'normal', italic: false, color: '#ffffff', font_family: 'DM Sans', align: 'left' }
    else if (type === 'image') block = { type, id, url: '', aspect_ratio: '16:9', caption: '' }
    else if (type === 'product') block = { type, id, product_id: '' }
    else block = { type: 'video', id, url: '', caption: '' }
    setArticleBlocks(prev => [...prev, block])
    setShowBlockMenu(false)
  }

  function updateBlock(blockId: string, updates: Partial<ArticleBlock>) {
    setArticleBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...updates } as ArticleBlock : b))
  }

  function removeBlock(blockId: string) {
    // Also remove the image url from tracking if it's an image block
    const block = articleBlocks.find(b => b.id === blockId)
    if (block?.type === 'image' && block.url) {
      setArticleImageUrls(prev => prev.filter(u => u !== block.url))
    }
    setArticleBlocks(prev => prev.filter(b => b.id !== blockId))
  }

  function moveBlock(blockId: string, dir: 'up' | 'down') {
    const idx = articleBlocks.findIndex(b => b.id === blockId)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === articleBlocks.length - 1) return
    const next = [...articleBlocks]
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
    setArticleBlocks(next)
  }

  async function saveArticle() {
    if (!articleTitle.trim()) { setArticleError('Judul artikel wajib diisi'); return }
    setArticleSaving(true); setArticleError('')
    const slug = slugifyArticle(articleTitle)
    const payload = {
      title: articleTitle.trim(),
      slug,
      status: articleStatus,
      category_id: articleCategoryId || null,
      author_id: articleAuthorId || null,
      content: articleBlocks,
      image_urls: articleImageUrls,
      excerpt: articleExcerpt || null,
    }
    try {
      let res
      if (editingArticle) {
        res = await fetch(`/api/articles/${editingArticle.slug}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      } else {
        res = await fetch('/api/articles', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      }
      const data = await res.json()
      if (!res.ok) { setArticleError(data.error || 'Gagal menyimpan artikel'); setArticleSaving(false); return }
      setShowArticleEditor(false); setEditingArticle(null); fetchArticles()
    } catch { setArticleError('Terjadi kesalahan') }
    setArticleSaving(false)
  }

  async function toggleArticleStatus(a: Article) {
    const newStatus = a.status === 'published' ? 'unpublished' : 'published'
    await fetch(`/api/articles/${a.slug}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status: newStatus }) })
    fetchArticles()
  }

  async function deleteArticle(a: Article) {
    if (!confirm(`Hapus artikel "${a.title}"? Semua gambar di Google Drive juga akan dihapus.`)) return
    await fetch(`/api/articles/${a.slug}`, { method: 'DELETE' })
    fetchArticles()
  }

  // ── Category CRUD ─────────────────────────────────────────
  async function saveCat() {
    if (!catFormName.trim()) return
    setCatSaving(true)
    if (editingCat) {
      await fetch('/api/article-categories', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: editingCat.id, name: catFormName.trim() }) })
    } else {
      await fetch('/api/article-categories', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: catFormName.trim() }) })
    }
    setCatSaving(false); setShowCatForm(false); setCatFormName(''); setEditingCat(null)
    fetchArticleCategories()
  }

  async function deleteCat(cat: ArticleCategory) {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return
    await fetch('/api/article-categories', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: cat.id }) })
    fetchArticleCategories()
  }

  // ── Author CRUD ───────────────────────────────────────────
  async function saveAuthor() {
    if (!authorFormName.trim()) return
    setAuthorSaving(true)
    try {
      const payload = { id: editingAuthor?.id, name: authorFormName.trim(), photo_url: authorFormPhoto || null }
      const res = await fetch('/api/article-authors', {
        method: editingAuthor ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save author')
      }
      setAuthorSaving(false); setShowAuthorForm(false); setAuthorFormName(''); setAuthorFormPhoto(''); setEditingAuthor(null)
      fetchArticleAuthors()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
      setAuthorSaving(false)
    }
  }

  async function deleteAuthor(author: ArticleAuthor) {
    if (!confirm(`Hapus author "${author.name}"?`)) return
    try {
      const res = await fetch('/api/article-authors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: author.id })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete author')
      }
      fetchArticleAuthors()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  async function handleAuthorPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCropData({ src: ev.target?.result as string, target: 'author', file, filename: file.name, mimeType: file.type })
      setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedAreaPixels(null)
    }
    reader.readAsDataURL(file)
  }

  // ── Article image upload (with crop) ──────────────────────
  function handleArticleImagePick(e: React.ChangeEvent<HTMLInputElement>, blockId: string, aspectRatio: string) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setArticleCropData({ src: ev.target?.result as string, aspectRatio, blockId, file, filename: file.name, mimeType: file.type })
      setArticleCrop({x:0,y:0}); setArticleZoom(1); setArticleCroppedAreaPixels(null)
    }
    reader.readAsDataURL(file)
  }

  async function confirmArticleCrop() {
    if (!articleCroppedAreaPixels || !articleCropData.src) return
    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || ''
    setUploadingArticleImage(true)
    const base64 = await getCroppedImg(articleCropData.src, articleCroppedAreaPixels)
    setArticleCropData({src:'', aspectRatio:'16:9', blockId:''})
    try {
      const res = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'upload', filename: articleCropData.filename, mimeType: articleCropData.mimeType, base64 }) })
      const data = await res.json()
      if (data.status === 'success') {
        const url = data.url
        updateBlock(articleCropData.blockId, { url } as any)
        setArticleImageUrls(prev => [...prev, url])
      } else { alert('Gagal upload gambar: ' + data.message) }
    } catch { alert('Error upload gambar') }
    setUploadingArticleImage(false)
  }

  // Close contact dropdown when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (contactMenuRef.current && !contactMenuRef.current.contains(e.target as Node)) {
        setContactMenuOrder(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  async function handleLogout() { await fetch('/api/auth', { method: 'DELETE' }); router.push('/login') }

  // ── Link CRUD (kept from original) ─────────────────────────
  function handleAddSpecific(type: 'button'|'text'|'carousel'|'video'|'product') { setShowAddMenu(false); setTab('links'); setEditingLink(null); setLinkForm({ ...emptyLink, type, order_index: links.length + 1 }); setLinkError(''); setShowLinkForm(true) }
  function openEditLink(link: Link) { setEditingLink(link); setLinkForm({ ...emptyLink, ...link }); setLinkError(''); setShowLinkForm(true) }
  function cancelLinkForm() { setShowLinkForm(false); setEditingLink(null); setLinkError('') }

  async function saveLink(e: FormEvent) {
    e.preventDefault()
    if (!linkForm.title) { setLinkError('Judul wajib diisi.'); return }
    if (linkForm.type === 'button' && linkForm.status === 'active' && !linkForm.url) { setLinkError('URL wajib diisi untuk link aktif.'); return }
    if (linkForm.type === 'video' && !linkForm.url) { setLinkError('URL Video wajib diisi.'); return }
    if (linkForm.type === 'product' && !linkForm.url) { setLinkError('Pilih produk wajib diisi.'); return }
    setLinkSaving(true); setLinkError('')
    const finalUrl = linkForm.status === 'coming_soon' ? null : (cleanUrl(linkForm.url) || null)
    const payload = { title: linkForm.title, url: finalUrl, icon: linkForm.icon ?? 'Globe', status: linkForm.status ?? 'active', order_index: linkForm.order_index ?? links.length + 1, type: linkForm.type ?? 'button', btn_color: linkForm.btn_color || null, text_color: linkForm.text_color || null, text_size: linkForm.text_size || null, text_align: linkForm.text_align || null, text_bold: linkForm.text_bold ?? false, text_italic: linkForm.text_italic ?? false, carousel_aspect_ratio: linkForm.carousel_aspect_ratio || null, image_data: linkForm.image_data || [] }
    let error
    if (editingLink) { ({ error } = await supabase.from('links').update(payload).eq('id', editingLink.id)) } else { ({ error } = await supabase.from('links').insert(payload)) }
    setLinkSaving(false)
    if (error) { setLinkError('Terjadi kesalahan: ' + error.message) } else { setShowLinkForm(false); setEditingLink(null); fetchLinks() }
  }

  async function confirmCrop() {
    if (!croppedAreaPixels || !cropData.src) return
    const base64 = await getCroppedImg(cropData.src, croppedAreaPixels)
    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'
    
    if (cropData.target === 'poster') {
      setUploadingPoster(true)
      setCropData({ src: '', target: null })
      try { const res = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'upload', filename: cropData.filename, mimeType: cropData.mimeType, base64 }) }); const data = await res.json(); if (data.status === 'success') { setPf(f => ({ ...f, image_url: data.url })) } else { alert('Gagal upload: ' + data.message) } } catch { alert('Error upload poster') }
      setUploadingPoster(false)
    } else if (cropData.target === 'carousel') {
      setUploadingImage(true)
      setCropData({ src: '', target: null })
      const newImages = [...(linkForm.image_data || [])]
      try { const res = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'upload', filename: cropData.filename, mimeType: cropData.mimeType, base64 }) }); const data = await res.json(); if (data.status === 'success') { newImages.push({ url: data.url, link: '' }) } else { alert("Gagal upload: " + data.message) } } catch { alert("Terjadi kesalahan saat upload gambar.") }
      setLinkForm(f => ({ ...f, image_data: newImages }))
      setUploadingImage(false)
    } else if (cropData.target === 'author') {
      setUploadingAuthorPhoto(true)
      setCropData({ src: '', target: null })
      try { const res = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'upload', filename: cropData.filename, mimeType: cropData.mimeType, base64 }) }); const data = await res.json(); if (data.status === 'success') { setAuthorFormPhoto(data.url) } else { alert('Gagal upload: ' + data.message) } } catch { alert('Error upload author photo') }
      setUploadingAuthorPhoto(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setCropData({ src: event.target?.result as string, target: 'carousel', file, filename: file.name, mimeType: file.type })
      setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedAreaPixels(null)
    }; reader.readAsDataURL(file)
  }
  function handleImageLinkChange(index: number, url: string) { const n = [...(linkForm.image_data || [])]; if (n[index]) { n[index].link = url; setLinkForm(f => ({ ...f, image_data: n })) } }
  function removeImage(index: number) { const n = [...(linkForm.image_data || [])]; n.splice(index, 1); setLinkForm(f => ({ ...f, image_data: n })) }
  async function deleteLink(id: string) { if (!confirm('Hapus link ini?')) return; await supabase.from('links').delete().eq('id', id); fetchLinks() }
  const [reordering, setReordering] = useState(false)
  async function handleReorder(newOrder: Link[]) { setLinks(newOrder); setReordering(true); await Promise.all(newOrder.map((link, idx) => supabase.from('links').update({ order_index: idx + 1 }).eq('id', link.id))); setReordering(false) }

  async function saveContact(e: FormEvent) {
    e.preventDefault(); setContactSaving(true); setContactMsg('')
    if (contact) { const { error } = await supabase.from('contact').update({ email: contactEmail }).eq('id', contact.id); setContactMsg(error ? '❌ Error: ' + error.message : '✓ Email berhasil disimpan.'); fetchContact() }
    else { const { error } = await supabase.from('contact').insert({ email: contactEmail }); setContactMsg(error ? '❌ Error: ' + error.message : '✓ Email berhasil disimpan.'); fetchContact() }
    setContactSaving(false)
  }

  // ── Product CRUD ─────────────────────────────────────────────
  function openAddProduct() {
    setEditingProduct(null); setPf({ name: '', sub_headline: '', description: '', image_url: '', price_before: '', price_after: '', discount: '', features: [], is_active: true, is_coming_soon: false, category_id: '' }); setProductError(''); setShowProductForm(true)
  }
  function openEditProduct(p: Product) {
    setEditingProduct(p); setPf({ name: p.name, sub_headline: p.sub_headline || '', description: p.description || '', image_url: p.image_url || '', price_before: p.price_before_discount?.toString() || '', price_after: p.price_after_discount?.toString() || '', discount: p.discount_percentage?.toString() || '', features: Array.isArray(p.features) ? p.features : [], is_active: p.is_active, is_coming_soon: p.is_coming_soon, category_id: p.category_id || '' }); setProductError(''); setShowProductForm(true)
  }

  // Price interlinked calculator
  function handlePriceBefore(val: string) {
    const num = parseRp(val); setPf(f => {
      const d = parseRp(f.discount); const after = d > 0 ? Math.round(num * (1 - d / 100)) : parseRp(f.price_after)
      return { ...f, price_before: num.toString(), price_after: after.toString() }
    })
  }
  function handlePriceAfter(val: string) {
    const num = parseRp(val); setPf(f => {
      const before = parseRp(f.price_before); const d = before > 0 ? Math.round((1 - num / before) * 100) : 0
      return { ...f, price_after: num.toString(), discount: d > 0 ? d.toString() : '' }
    })
  }
  function handleDiscount(val: string) {
    const num = parseInt(val.replace(/\D/g, '')) || 0; setPf(f => {
      const before = parseRp(f.price_before); const after = before > 0 ? Math.round(before * (1 - num / 100)) : parseRp(f.price_after)
      return { ...f, discount: num.toString(), price_after: after.toString() }
    })
  }

  function addFeature() { if (!newFeature.trim()) return; setPf(f => ({ ...f, features: [...f.features, newFeature.trim()] })); setNewFeature('') }
  function removeFeature(i: number) { setPf(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) })) }

  async function handlePosterUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setCropData({ src: event.target?.result as string, target: 'poster', file, filename: file.name, mimeType: file.type })
      setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedAreaPixels(null)
    }; reader.readAsDataURL(file)
  }

  async function saveProduct(e: FormEvent) {
    e.preventDefault(); if (!pf.name) { setProductError('Nama product wajib diisi'); return }
    setProductSaving(true); setProductError('')
    const payload = { name: pf.name, slug: slugify(pf.name), sub_headline: pf.sub_headline || null, description: pf.description || null, image_url: pf.image_url || null, price_before_discount: parseRp(pf.price_before), price_after_discount: parseRp(pf.price_after), discount_percentage: parseInt(pf.discount) || 0, features: pf.features, is_active: pf.is_active, is_coming_soon: pf.is_coming_soon, category_id: pf.category_id || null }
    let error
    if (editingProduct) { 
      ({ error } = await supabase.from('products').update(payload).eq('id', editingProduct.id)) 
    } else { 
      ({ error } = await supabase.from('products').insert(payload)) 
      if (!error) { await supabase.from('links').insert({ title: payload.name, url: '/product/' + payload.slug, icon: 'ShoppingBag', status: 'active', type: 'button', order_index: links.length + 1 }) }
    }
    setProductSaving(false); if (error) { setProductError('Error: ' + error.message) } else { setShowProductForm(false); fetchProducts(); fetchLinks() }
  }
  async function deleteProduct(p: Product) { 
    if (!confirm(`Hapus produk "${p.name}"?`)) return; 
    
    // Hapus dari Google Drive jika ada url
    const appScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwMg8HxK3rZ0vyuDFj3czW1cOWYmSa6iy7aqYjU8nmadsBuHWyyZgg4b_NY-SSi-y7T/exec'
    if (p.image_url) {
      fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'deleteFile', url: p.image_url }) }).catch(()=>null)
    }
    
    // Putuskan relasi dari table orders agar tidak error foreign key constraint
    await supabase.from('orders').update({ product_id: null }).eq('product_id', p.id);
    
    // Hapus link button yang otomatis terbuat 
    await supabase.from('links').delete().eq('url', `/product/${p.slug}`);

    const { error } = await supabase.from('products').delete().eq('id', p.id); 
    if (error) { 
      alert('Gagal menghapus produk: ' + error.message); 
      return; 
    }
    
    fetchProducts();
    fetchLinks();
  }

  // ── Voucher CRUD ────────────────────────────────────────────
  function openAddVoucher() { setEditingVoucher(null); setVf({ code: '', discount_value: '', discount_type: 'fixed', is_active: true, applicable_products: null }); setVoucherError(''); setShowVoucherForm(true) }
  function openEditVoucher(v: Voucher) { setEditingVoucher(v); setVf({ code: v.code, discount_value: v.discount_value.toString(), discount_type: v.discount_type, is_active: v.is_active, applicable_products: v.applicable_products ?? null }); setVoucherError(''); setShowVoucherForm(true) }

  // Toggle a product in the voucher applicable_products list
  function toggleVoucherProduct(productId: string) {
    setVf(f => {
      const cur = f.applicable_products ?? []
      const next = cur.includes(productId) ? cur.filter(id => id !== productId) : [...cur, productId]
      return { ...f, applicable_products: next.length === 0 ? null : next }
    })
  }

  async function saveVoucher(e: FormEvent) {
    e.preventDefault(); if (!vf.code) { setVoucherError('Kode voucher wajib diisi'); return }
    setVoucherSaving(true); setVoucherError('')
    const payload = {
      code: vf.code.toUpperCase().trim(),
      discount_value: parseInt(vf.discount_value) || 0,
      discount_type: vf.discount_type,
      is_active: vf.is_active,
      applicable_products: vf.applicable_products && vf.applicable_products.length > 0 ? vf.applicable_products : null
    }
    let error
    if (editingVoucher) { ({ error } = await supabase.from('vouchers').update(payload).eq('id', editingVoucher.id)) } else { ({ error } = await supabase.from('vouchers').insert(payload)) }
    setVoucherSaving(false); if (error) { setVoucherError('Error: ' + error.message) } else { setShowVoucherForm(false); fetchVouchers() }
  }
  async function deleteVoucher(id: string) { if (!confirm('Hapus voucher ini?')) return; await supabase.from('vouchers').delete().eq('id', id); fetchVouchers() }
  async function toggleVoucher(v: Voucher) { await supabase.from('vouchers').update({ is_active: !v.is_active }).eq('id', v.id); fetchVouchers() }

  async function toggleOrderStatus(order: Order) {
    const newStatus = order.status === 'pending' ? 'confirmed' : 'pending'
    await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)

    // When confirming an order: add to course_access_emails + send course access email
    if (newStatus === 'confirmed') {
      // Add main product to course_access_emails
      if (order.product_id) {
        await supabase.from('course_access_emails').upsert({
          email: order.email.toLowerCase().trim(),
          product_id: order.product_id,
          order_id: order.id
        }, { onConflict: 'email,product_id' })
      }

      // Add addons to course_access_emails
      const addons = Array.isArray(order.addon_items) ? order.addon_items : []
      for (const addon of addons) {
        if (addon.id) {
          await supabase.from('course_access_emails').upsert({
            email: order.email.toLowerCase().trim(),
            product_id: addon.id,
            order_id: order.id
          }, { onConflict: 'email,product_id' })
        }
      }

      // Build allProducts array for email
      const allProducts = [
        { name: order.product_name, priceOriginal: order.price_original || 0, priceDiscounted: order.price_discounted || 0 },
        ...addons.map(a => ({ name: a.name, priceOriginal: a.priceOriginal, priceDiscounted: a.priceDiscounted }))
      ]

      // Send course access email via Apps Script
      try {
        const emailRes = await fetch('/api/course-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: order.email,
            fullName: order.full_name,
            productName: order.product_name,
            orderId: order.id,
            allProducts,
            addonItems: addons
          })
        })
        const data = await emailRes.json()
        if (!data.success) {
          alert('Warning: Gagal kirim email ke user - ' + (data.error || 'Unknown error'))
        }
      } catch (err) {
        console.warn('Failed to send course email:', err)
        alert('Gagal trigger email course. Cek koneksi.')
      }
    } else {
      // When reverting to pending: remove course_access_emails to revoke access
      await supabase.from('course_access_emails').delete().eq('order_id', order.id)
    }

    fetchOrders()
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button className={styles.hamburgerBtn} onClick={() => setIsSidebarOpen(true)}><Menu size={24} color="#ffffff" /></button>
        <Image src="https://marcatching.com/logo-type-white.png" alt="Marcatching" width={140} height={34} className={styles.mobileHeaderLogo} unoptimized={true} />
      </div>
      <div className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.sidebarOverlayOpen : ''}`} onClick={() => setIsSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Desktop: Navy logotype at the very top */}
        <div className={styles.sidebarLogoDesktop}>
          <Image src="https://marcatching.com/logo-type-white.png" alt="Marcatching" width={160} height={38} style={{ objectFit: 'contain' }} unoptimized={true} />
        </div>
        {/* Mobile: Hamburger row */}
        <div className={styles.sidebarLogo}>
          <button className={styles.hamburgerBtnSidebar} onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={24} color="rgba(255,255,255,0.85)" /></button>
        </div>
        <nav className={styles.sidenav}>
          <button className={`${styles.navItem} ${tab === 'analytics' ? styles.navActive : ''}`} onClick={() => { setTab('analytics'); setIsSidebarOpen(false) }}><BarChart3 size={18} /> Analytics</button>
          <button className={`${styles.navItem} ${tab === 'finance' ? styles.navActive : ''}`} onClick={() => { setTab('finance'); setIsSidebarOpen(false) }} style={tab === 'finance' ? {} : { background: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }}><DollarSign size={18} /> Finance</button>
          <button className={`${styles.navItem} ${tab === 'links' ? styles.navActive : ''}`} onClick={() => { setTab('links'); setIsSidebarOpen(false) }}><ExternalLink size={18} /> Links &amp; Buttons</button>
          <button className={`${styles.navItem} ${tab === 'navigation' ? styles.navActive : ''}`} onClick={() => { setTab('navigation'); setIsSidebarOpen(false) }}><Navigation size={18} /> Navigation</button>
          <button className={`${styles.navItem} ${tab === 'ecommerce' ? styles.navActive : ''}`} onClick={() => { setTab('ecommerce'); setIsSidebarOpen(false) }}><ShoppingCart size={18} /> E-Commerce</button>
          <button className={`${styles.navItem} ${tab === 'champagne' ? styles.navActive : ''}`} onClick={() => { setTab('champagne'); setIsSidebarOpen(false) }}><PartyPopper size={18} /> Champagne</button>
          <button className={`${styles.navItem} ${tab === 'articles' ? styles.navActive : ''}`} onClick={() => { setTab('articles'); setIsSidebarOpen(false) }}><Newspaper size={18} /> Articles</button>
          <button className={`${styles.navItem} ${tab === 'aboutpage' ? styles.navActive : ''}`} onClick={() => { setTab('aboutpage'); setIsSidebarOpen(false) }}><FileText size={18} /> About Page</button>
          <button className={`${styles.navItem} ${tab === 'products' ? styles.navActive : ''}`} onClick={() => { setTab('products'); setIsSidebarOpen(false) }}><Package size={18} /> Products</button>
          <button className={`${styles.navItem} ${tab === 'ecourse' ? styles.navActive : ''}`} onClick={() => { setTab('ecourse'); setIsSidebarOpen(false) }}><BookMarked size={18} /> E-Course</button>
          <button className={`${styles.navItem} ${tab === 'vouchers' ? styles.navActive : ''}`} onClick={() => { setTab('vouchers'); setIsSidebarOpen(false) }}><Tag size={18} /> Vouchers</button>
          <button className={`${styles.navItem} ${tab === 'orders' ? styles.navActive : ''}`} onClick={() => { setTab('orders'); setIsSidebarOpen(false) }}><ClipboardList size={18} /> Orders</button>
          <button className={`${styles.navItem} ${tab === 'contact' ? styles.navActive : ''}`} onClick={() => { setTab('contact'); setIsSidebarOpen(false) }}><Mail size={18} /> Contact Info</button>
          <button className={`${styles.navItem} ${tab === 'security' ? styles.navActive : ''}`} onClick={() => { setTab('security'); setIsSidebarOpen(false) }}><Lock size={18} /> Keamanan</button>
          <button className={`${styles.navItem} ${tab === 'survey' ? styles.navActive : ''}`} onClick={() => { setTab('survey'); setIsSidebarOpen(false) }}><ClipboardList size={18} /> Survey</button>

          <div style={{ position: 'relative' }}>
            <button className={styles.navItem} onClick={() => setShowAddMenu(!showAddMenu)} style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 'bold' }}><Plus size={18} /> Tambah Link</button>
            {showAddMenu && (
              <div className={styles.addMenuDropdown} style={{position: 'relative', zIndex: 60}}>
                <button onClick={() => handleAddSpecific('product')}><Package size={14}/> Product Card</button>
                <button onClick={() => handleAddSpecific('button')}><MousePointerClick size={14}/> Link Button</button>
                <button onClick={() => handleAddSpecific('text')}><Type size={14}/> Text Block</button>
                <button onClick={() => handleAddSpecific('carousel')}><ImageIcon size={14}/> Image Carousel</button>
                <button onClick={() => handleAddSpecific('video')}><Video size={14}/> Video Embed</button>
              </div>
            )}
          </div>
        </nav>
        <div className={styles.sidebarBottom}>
          <a href="https://course.marcatching.com" target="_blank" rel="noopener noreferrer" className={styles.navItem}><ExternalLink size={18} /> Login Course</a>
          <a href="https://marcatching.com" target="_blank" rel="noopener noreferrer" className={styles.navItem}><Globe size={18} /> Lihat Website</a>
          <button onClick={handleLogout} className={styles.navItem} style={{ color: '#dc2626' }}><LogOut size={18} /> Keluar</button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.content}>

        {/* ── LINKS TAB ─── */}
        {tab === 'links' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}><div><h1 className={styles.contentTitle}>Links & Buttons</h1><p className={styles.contentDesc}>Kelola link yang tampil di landing page</p></div></div>
            {showLinkForm && (
              <div className={styles.formCard}>
                <div className={styles.formCardHeader}><h2 className={styles.formTitle}>{editingLink ? 'Edit Link' : 'Tambah Link Baru'}</h2><button onClick={cancelLinkForm} className={styles.closeBtn}><X size={18} /></button></div>
                <form onSubmit={saveLink} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Tipe Block</label>
                      <div className={styles.typeSelector} style={{pointerEvents: 'none', opacity: 0.9}}><span className={`${styles.typeBtn} ${styles.typeBtnActive}`} style={{justifyContent: 'center', display: 'flex'}}>
                        {linkForm.type === 'product' && <><Package size={16}/> Product Card</>}
                        {linkForm.type === 'button' && <><MousePointerClick size={16}/> Link Button</>}
                        {linkForm.type === 'text' && <><Type size={16}/> Text Block</>}
                        {linkForm.type === 'carousel' && <><ImageIcon size={16}/> Image Carousel</>}
                        {linkForm.type === 'video' && <><Video size={16}/> Online Video</>}
                      </span></div>
                    </div>
                    {linkForm.type === 'button' && (<>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Judul Tombol *</label><input className="input" placeholder="cth: Instagram Marcatching" value={linkForm.title ?? ''} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">URL</label><input className="input" placeholder="https://..." value={linkForm.url ?? ''} disabled={linkForm.status === 'coming_soon'} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">Warna Tombol (Background)</label><div className={styles.colorInputWrap}><input type="color" className={styles.colorPicker} value={linkForm.btn_color || '#ffffff'} onChange={e => setLinkForm(f => ({ ...f, btn_color: e.target.value }))} /><input type="text" className="input" style={{flex: 1}} placeholder="#0d3369" value={linkForm.btn_color || ''} onChange={e => setLinkForm(f => ({ ...f, btn_color: e.target.value }))} /></div></div>
                      <div className="form-group"><label className="label">Warna Text Tombol</label><div className={styles.colorInputWrap}><input type="color" className={styles.colorPicker} value={linkForm.text_color || '#000000'} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /><input type="text" className="input" style={{flex: 1}} placeholder="#000000" value={linkForm.text_color || ''} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /></div></div>
                      <div className="form-group"><label className="label">Icon</label><select className="select" value={linkForm.icon ?? 'Globe'} onChange={e => setLinkForm(f => ({ ...f, icon: e.target.value }))}>{ICON_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></div>
                      <div className="form-group"><label className="label">Status</label><select className="select" value={linkForm.status ?? 'active'} onChange={e => setLinkForm(f => ({ ...f, status: e.target.value as 'active' | 'coming_soon' }))}><option value="active">Active</option><option value="coming_soon">Coming Soon</option></select></div>
                    </>)}
                    {linkForm.type === 'text' && (<>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Isi Text *</label><textarea className="input" placeholder="Masukkan text..." rows={3} value={linkForm.title ?? ''} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">Warna Text</label><div className={styles.colorInputWrap}><input type="color" className={styles.colorPicker} value={linkForm.text_color || '#000000'} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /><input type="text" className="input" style={{flex: 1}} value={linkForm.text_color || ''} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /></div></div>
                      <div className="form-group"><label className="label">Ukuran Text</label><select className="select" value={linkForm.text_size || '1rem'} onChange={e => setLinkForm(f => ({ ...f, text_size: e.target.value }))}><option value="0.875rem">Kecil</option><option value="1rem">Normal</option><option value="1.25rem">Besar</option><option value="1.5rem">Extra Large</option><option value="2rem">Judul Utama</option></select></div>
                      <div className="form-group"><label className="label">Alignment</label><select className="select" value={linkForm.text_align || 'center'} onChange={e => setLinkForm(f => ({ ...f, text_align: e.target.value }))}><option value="left">Rata Kiri</option><option value="center">Rata Tengah</option><option value="right">Rata Kanan</option><option value="justify">Rata Kiri Kanan</option></select></div>
                      <div className="form-group"><label className="label">Style Font</label><div className={styles.checkboxGroup}><label className={styles.checkboxLabel}><input type="checkbox" checked={linkForm.text_bold || false} onChange={e => setLinkForm(f => ({ ...f, text_bold: e.target.checked }))} /> Bold</label><label className={styles.checkboxLabel}><input type="checkbox" checked={linkForm.text_italic || false} onChange={e => setLinkForm(f => ({ ...f, text_italic: e.target.checked }))} /> Italic</label></div></div>
                    </>)}
                    {linkForm.type === 'product' && (<>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Pilih Produk *</label>
                        <select className="select" value={linkForm.url || ''} onChange={e => {
                          const p = products.find(prod => `/product/${prod.slug}` === e.target.value)
                          if (p) setLinkForm(f => ({ ...f, url: `/product/${p.slug}`, title: p.name, icon: 'ShoppingBag' }))
                        }}>
                          <option value="">-- Pilih Produk --</option>
                          {products.map(p => (
                            <option key={p.id} value={`/product/${p.slug}`}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group"><label className="label">Warna Judul Product Card</label><div className={styles.colorInputWrap}><input type="color" className={styles.colorPicker} value={linkForm.text_color || '#000000'} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /><input type="text" className="input" style={{flex: 1}} placeholder="#000000" value={linkForm.text_color || ''} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /></div></div>
                    </>)}
                    {linkForm.type === 'video' && (<>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Judul Video *</label><input className="input" placeholder="cth: Video TikTok Promo" value={linkForm.title ?? ''} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} /></div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">URL Video *</label><input className="input" placeholder="https://..." value={linkForm.url ?? ''} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">Warna Text Judul Video</label><div className={styles.colorInputWrap}><input type="color" className={styles.colorPicker} value={linkForm.text_color || '#000000'} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /><input type="text" className="input" style={{flex: 1}} placeholder="#000000" value={linkForm.text_color || ''} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /></div></div>
                    </>)}
                    {linkForm.type === 'carousel' && (<>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Judul Internal *</label><input className="input" placeholder="cth: Poster Event" value={linkForm.title ?? ''} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">Aspect Ratio</label><select className="select" value={linkForm.carousel_aspect_ratio || '16:9'} onChange={e => setLinkForm(f => ({ ...f, carousel_aspect_ratio: e.target.value }))}><option value="16:9">16:9</option><option value="9:16">9:16</option><option value="4:5">4:5</option></select></div>
                      <div className="form-group"><label className="label">Warna Text Caption Carousel</label><div className={styles.colorInputWrap}><input type="color" className={styles.colorPicker} value={linkForm.text_color || '#000000'} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /><input type="text" className="input" style={{flex: 1}} placeholder="#000000" value={linkForm.text_color || ''} onChange={e => setLinkForm(f => ({ ...f, text_color: e.target.value }))} /></div></div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Upload Gambar</label>
                        <div className={styles.uploadArea}><input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className={styles.fileInput} /><div className={styles.uploadLabel}><Upload size={20} />{uploadingImage ? 'Mengupload...' : 'Klik atau Drag & Drop'}</div></div>
                        <div className={styles.imageList}>{(linkForm.image_data || []).map((img: any, idx: number) => { let previewUrl = img.url; if (previewUrl?.includes('drive.google.com/uc')) { const m = previewUrl.match(/id=([^&]+)/); if (m?.[1]) previewUrl = `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000-h1000` } return (<div key={idx} className={styles.imageItem}><div className={styles.imagePreviewWrap} style={{aspectRatio: linkForm.carousel_aspect_ratio?.replace(':', '/') || '16/9'}}><img src={previewUrl} alt={`Preview ${idx}`} className={styles.imagePreview} /></div><div className={styles.imageItemDetails}><input type="text" className="input" style={{fontSize: '0.8rem', padding: '0.4rem 0.6rem'}} placeholder="Link tujuan (opsional)" value={img.link || ''} onChange={(e) => handleImageLinkChange(idx, e.target.value)} /><button type="button" className="btn btn-ghost" style={{padding: '0.4rem', color: '#ff4444'}} onClick={() => removeImage(idx)}><Trash2 size={16}/></button></div></div>) })}</div>
                      </div>
                    </>)}
                  </div>
                  {linkError && <p className={styles.formError}>{linkError}</p>}
                  <div className={styles.spacer} />
                  <div className={styles.fixedActions}>
                    <button type="button" className="btn btn-ghost" style={{ padding: '10px 24px' }} onClick={cancelLinkForm}>Batal</button>
                    <button type="submit" className="btn btn-navy" style={{ padding: '10px 24px', fontWeight: 700 }} disabled={linkSaving}>
                      {linkSaving ? 'Menyimpan...' : <><Check size={16} /> Simpan</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {linksLoading ? <div className={styles.loading}>Memuat data...</div> : links.length === 0 ? <div className={styles.emptyState}><p>Belum ada link.</p></div> : (
              <Reorder.Group axis="y" values={links} onReorder={handleReorder} className={styles.linksList} style={{ listStyleType: 'none', padding: 0, margin: 0, gap: '12px', display: 'flex', flexDirection: 'column' }}>
                {links.map(link => <SortableLinkItem key={link.id} link={link} onEdit={openEditLink} onDelete={deleteLink} />)}
              </Reorder.Group>
            )}
          </div>
        )}

        {/* ── PRODUCTS TAB ─── */}
        {tab === 'products' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}>
              <div><h1 className={styles.contentTitle}>Products</h1><p className={styles.contentDesc}>Kelola produk digital yang dijual</p></div>
              <button className="btn btn-navy" onClick={openAddProduct}><Plus size={16} /> Tambah Product</button>
            </div>
            {showProductForm && (
              <div className={styles.formCard}>
                <div className={styles.formCardHeader}><h2 className={styles.formTitle}>{editingProduct ? 'Edit Product' : 'Tambah Product Baru'}</h2><button onClick={() => setShowProductForm(false)} className={styles.closeBtn}><X size={18} /></button></div>
                <form onSubmit={saveProduct} className={styles.form}>
                  <div className="form-group"><label className="label">Poster Product</label>
                    <div className={styles.uploadArea}><input type="file" accept="image/*" onChange={handlePosterUpload} disabled={uploadingPoster} className={styles.fileInput} /><div className={styles.uploadLabel}><Upload size={20} />{uploadingPoster ? 'Mengupload poster...' : 'Upload Poster (4:5)'}</div></div>
                    {pf.image_url && <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', maxWidth: 200 }}><img src={pf.image_url.includes('drive.google.com/uc') ? pf.image_url.replace(/uc\?export=view&id=/, 'thumbnail?id=') + '&sz=w600-h750' : pf.image_url} alt="Preview" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} /></div>}
                  </div>
                  <div className="form-group"><label className="label">Nama Product *</label><input className="input" placeholder="cth: Marketing Mastery" value={pf.name} onChange={e => setPf(f => ({...f, name: e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Sub Headline</label><input className="input" placeholder="cth: Panduan lengkap belajar marketing" value={pf.sub_headline} onChange={e => setPf(f => ({...f, sub_headline: e.target.value}))} /></div>
                  <div className={styles.formGrid}>
                    <div className="form-group"><label className="label">Harga Sebelum Diskon</label><div style={{display:'flex',alignItems:'center',gap:4}}><span style={{fontWeight:600,color:'#64748b'}}>Rp</span><input className="input" placeholder="1500000" value={pf.price_before ? formatRp(parseRp(pf.price_before)) : ''} onChange={e => handlePriceBefore(e.target.value)} /></div></div>
                    <div className="form-group"><label className="label">Harga Setelah Diskon</label><div style={{display:'flex',alignItems:'center',gap:4}}><span style={{fontWeight:600,color:'#64748b'}}>Rp</span><input className="input" placeholder="750000" value={pf.price_after ? formatRp(parseRp(pf.price_after)) : ''} onChange={e => handlePriceAfter(e.target.value)} /></div></div>
                    <div className="form-group"><label className="label">Discount</label><div style={{display:'flex',alignItems:'center',gap:4}}><input className="input" placeholder="50" value={pf.discount} onChange={e => handleDiscount(e.target.value)} /><span style={{fontWeight:600,color:'#64748b'}}>%</span></div></div>
                    <div className="form-group"><label className="label">Status</label><select className="select" value={pf.is_active ? (pf.is_coming_soon ? 'coming_soon' : 'active') : 'inactive'} onChange={e => {
                      const v = e.target.value;
                      if(v === 'active') setPf(f => ({...f, is_active: true, is_coming_soon: false}))
                      else if(v === 'coming_soon') setPf(f => ({...f, is_active: true, is_coming_soon: true}))
                      else setPf(f => ({...f, is_active: false, is_coming_soon: false}))
                    }}><option value="active">Active</option><option value="coming_soon">Coming Soon</option><option value="inactive">Inactive</option></select></div>
                    <div className="form-group"><label className="label">Kategori</label><select className="select" value={pf.category_id} onChange={e => setPf(f => ({...f, category_id: e.target.value}))}><option value="">— Tanpa Kategori —</option>{productCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  </div>
                  <div className="form-group"><label className="label">Features</label>
                    <div style={{display:'flex',gap:8}}><input className="input" placeholder="cth: Akses modul gratis seumur hidup" value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature() } }} /><button type="button" className="btn btn-navy" onClick={addFeature} style={{whiteSpace:'nowrap'}}><Plus size={14} /></button></div>
                    {pf.features.map((f, i) => (<div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'1px solid #f1f5f9'}}><Check size={14} color="#16a34a" /><span style={{flex:1,fontSize:'0.88rem'}}>{f}</span><button type="button" onClick={() => removeFeature(i)} style={{color:'#dc2626',background:'none',border:'none',cursor:'pointer'}}><X size={14} /></button></div>))}
                  </div>
                  <div className="form-group"><label className="label">Deskripsi Produk</label><textarea className="input" rows={5} placeholder="Deskripsikan detail produk di sini..." value={pf.description} onChange={e => setPf(f => ({...f, description: e.target.value}))} /></div>
                  {productError && <p className={styles.formError}>{productError}</p>}
                  <div className={styles.spacer} />
                  <div className={styles.fixedActions}>
                    <button type="button" className="btn btn-ghost" style={{ padding: '10px 24px' }} onClick={() => setShowProductForm(false)}>Batal</button>
                    <button type="submit" className="btn btn-navy" style={{ padding: '10px 24px', fontWeight: 700 }} disabled={productSaving}>
                      {productSaving ? 'Menyimpan...' : <><Check size={16} /> Simpan Product</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {/* Categories Section */}
            <div style={{ marginBottom: 24, padding: '20px', background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0d3369' }}>Kategori Produk</h3>
                <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '4px 12px' }} onClick={() => { setEditingProdCat(null); setProdCatName(''); setShowProdCatForm(true) }}><Plus size={14} /> Tambah</button>
              </div>
              {showProdCatForm && (
                <form onSubmit={saveProdCat} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input className="input" style={{ flex: 1 }} placeholder="Nama kategori" value={prodCatName} onChange={e => setProdCatName(e.target.value)} autoFocus />
                  <button type="submit" className="btn btn-navy" disabled={prodCatSaving} style={{ whiteSpace: 'nowrap' }}>{prodCatSaving ? '...' : <><Check size={14} /> Simpan</>}</button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowProdCatForm(false); setEditingProdCat(null); setProdCatName('') }}><X size={14} /></button>
                </form>
              )}
              {productCatLoading ? <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Memuat...</div> : productCategories.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Belum ada kategori.</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {productCategories.map(cat => (
                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(13,51,105,0.08)', border: '1px solid rgba(13,51,105,0.15)' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d3369' }}>{cat.name}</span>
                      <button onClick={() => { setEditingProdCat(cat); setProdCatName(cat.name); setShowProdCatForm(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748b', display: 'flex' }}><Pencil size={12} /></button>
                      <button onClick={() => deleteProdCat(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#dc2626', display: 'flex' }}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Products list */}
            {productsLoading ? <div className={styles.loading}>Memuat...</div> : products.length === 0 ? <div className={styles.emptyState}>Belum ada product.</div> : (
              <div className={styles.linksList}>{products.map(p => (
                <div key={p.id} className={styles.linkRow} style={{ cursor: 'pointer' }} onClick={() => openEditProduct(p)}>
                  <div className={styles.linkIcon}><Package size={18} /></div>
                  <div className={styles.linkInfo}>
                    <span className={styles.linkTitle}>{p.name}</span>
                    <span className={styles.linkUrl}>/product/{p.slug} · {p.is_active ? (p.is_coming_soon ? <span className={styles.statusSoon}>Coming Soon</span> : <span className={styles.statusActive}>Active</span>) : <span className={styles.statusSoon}>Inactive</span>} · Rp {formatRp(p.price_after_discount)} · <span style={{ color: '#94a3b8' }}>{productCategories.find(c => c.id === p.category_id)?.name || 'No Category'}</span></span>
                  </div>
                  <div className={styles.linkActions}>
                    <button className={styles.editBtn} onClick={e => { e.stopPropagation(); openEditProduct(p) }}><Pencil size={15} /></button>
                    <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); deleteProduct(p) }}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
        )}

        {/* ── ABOUT PAGE CONFIG TAB ─── */}
        {tab === 'aboutpage' && <AboutPageConfigTab />}
        {tab === 'champagne' && <ChampagneTab products={products} />}

        {/* ── FINANCE TAB ─── */}
        {tab === 'finance' && <FinanceTab />}

        {/* ── SECURITY TAB ─── */}
        {tab === 'security' && <SecurityTab />}

        {/* ── SURVEY TAB ─── */}
        {tab === 'survey' && <SurveyTab />}

        {/* ── E-COMMERCE TAB ─── */}
        {tab === 'ecommerce' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}>
              <div><h1 className={styles.contentTitle}>E-Commerce</h1><p className={styles.contentDesc}>Kelola halaman toko di <strong>marcatching.com/store</strong></p></div>
              <a href="https://marcatching.com/store" target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}><ExternalLink size={14} /> Lihat Toko</a>
            </div>

            {/* Block form */}
            {showStoreBlockForm && (
              <div className={styles.formCard}>
                <div className={styles.formCardHeader}>
                  <h3 className={styles.formTitle}>{editingStoreBlock ? 'Edit Block' : 'Tambah Block Baru'}</h3>
                  <button onClick={() => { setShowStoreBlockForm(false); setEditingStoreBlock(null) }} className={styles.closeBtn}><X size={18} /></button>
                </div>
                <form onSubmit={saveStoreBlock} className={styles.form}>
                  <div className="form-group">
                    <label className="label">Tipe Block</label>
                    <select className="select" value={storeBlockType} onChange={e => {
                      const t = e.target.value as StorePageBlock['type']
                      setStoreBlockType(t)
                      setStoreBlockContent(
                        t === 'headline' ? { text: '', size: 'h2', color: '#ffffff', align: 'left' } :
                        t === 'text' ? { text: '', color: 'rgba(255,255,255,0.85)', font_size: '1rem', align: 'left' } :
                        t === 'image' ? { url: '', aspect_ratio: '16:9', caption: '' } :
                        t === 'video' ? { video_url: '', caption: '' } :
                        t === 'product' ? { product_id: '', store_status: 'active' } :
                        { btn_text: '', btn_url: '', btn_color: '#ffffff', btn_text_color: '#000000', align: 'center' }
                      )
                    }}>
                      <option value="headline">Headline</option>
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                      <option value="video">Online Video</option>
                      <option value="button">Button</option>
                      <option value="product">Produk</option>
                    </select>
                  </div>
                  {(storeBlockType === 'headline' || storeBlockType === 'text') && (
                    <div className={styles.formGrid}>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Teks (Pilih teks untuk format bold/italic/warna/ukuran)</label>
                        <RichTextEditor
                          value={storeBlockContent.text || ''}
                          onChange={html => setStoreBlockContent(c => ({ ...c, text: html }))}
                          placeholder="Tulis teks... pilih untuk format"
                          minHeight={storeBlockType === 'text' ? 100 : 60}
                          style={{ fontSize: storeBlockContent.font_size || (storeBlockType === 'headline' ? '1.5rem' : '1rem'), color: storeBlockContent.color || '#ffffff', textAlign: storeBlockContent.align as any || 'left' }}
                        />
                        <p style={{ fontSize:'0.75rem', color:'#94a3b8', margin:'4px 0 0' }}>Select teks untuk bold, italic, warna, ukuran per kata</p>
                      </div>
                      {storeBlockType === 'headline' && <div className="form-group"><label className="label">Ukuran</label><select className="select" value={storeBlockContent.size || 'h2'} onChange={e => setStoreBlockContent(c => ({ ...c, size: e.target.value }))}><option value="hero">Hero (2.5rem)</option><option value="h1">H1 (2rem)</option><option value="h2">H2 (1.5rem)</option><option value="h3">H3 (1.25rem)</option><option value="sub">Sub (1rem)</option></select></div>}
                      {storeBlockType === 'text' && <div className="form-group"><label className="label">Font Size Default</label><input className="input" placeholder="1rem" value={storeBlockContent.font_size || ''} onChange={e => setStoreBlockContent(c => ({ ...c, font_size: e.target.value }))} /></div>}
                      <div className="form-group"><label className="label">Warna Teks Default</label><div className={styles.colorInputWrap}><input type="color" className={styles.colorPicker} value={storeBlockContent.color || '#ffffff'} onChange={e => setStoreBlockContent(c => ({ ...c, color: e.target.value }))} /><input type="text" className="input" style={{ flex: 1 }} value={storeBlockContent.color || ''} onChange={e => setStoreBlockContent(c => ({ ...c, color: e.target.value }))} /></div></div>
                      <div className="form-group"><label className="label">Alignment</label><select className="select" value={storeBlockContent.align || 'left'} onChange={e => setStoreBlockContent(c => ({ ...c, align: e.target.value }))}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option><option value="justify">Rata Kanan-Kiri</option></select></div>
                    </div>
                  )}
                  {storeBlockType === 'image' && (
                    <div className={styles.formGrid}>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">URL Gambar</label><input className="input" placeholder="https://..." value={storeBlockContent.url || ''} onChange={e => setStoreBlockContent(c => ({ ...c, url: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">Aspect Ratio</label><select className="select" value={storeBlockContent.aspect_ratio || '16:9'} onChange={e => setStoreBlockContent(c => ({ ...c, aspect_ratio: e.target.value }))}><option value="16:9">16:9</option><option value="4:3">4:3</option><option value="1:1">1:1</option><option value="4:5">4:5</option></select></div>
                      <div className="form-group"><label className="label">Caption</label><input className="input" placeholder="Opsional" value={storeBlockContent.caption || ''} onChange={e => setStoreBlockContent(c => ({ ...c, caption: e.target.value }))} /></div>
                    </div>
                  )}
                  {storeBlockType === 'video' && (
                    <div className={styles.formGrid}>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="label">Online Video</label><input className="input" placeholder="URL lengkap video (YouTube, TikTok, IG, Drive)" value={storeBlockContent.video_url || ''} onChange={e => setStoreBlockContent(c => ({ ...c, video_url: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">Caption</label><input className="input" placeholder="Opsional" value={storeBlockContent.caption || ''} onChange={e => setStoreBlockContent(c => ({ ...c, caption: e.target.value }))} /></div>
                    </div>
                  )}
                  {storeBlockType === 'button' && (
                    <div className={styles.formGrid}>
                      <div className="form-group"><label className="label">Teks Button</label><input className="input" placeholder="Mulai Sekarang" value={storeBlockContent.btn_text || ''} onChange={e => setStoreBlockContent(c => ({ ...c, btn_text: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">URL</label><input className="input" placeholder="https://..." value={storeBlockContent.btn_url || ''} onChange={e => setStoreBlockContent(c => ({ ...c, btn_url: e.target.value }))} /></div>
                      <div className="form-group"><label className="label">Warna Button</label><div className={styles.colorInputWrap}><input type="color" className={styles.colorPicker} value={storeBlockContent.btn_color || '#ffffff'} onChange={e => setStoreBlockContent(c => ({ ...c, btn_color: e.target.value }))} /><input type="text" className="input" style={{ flex: 1 }} value={storeBlockContent.btn_color || ''} onChange={e => setStoreBlockContent(c => ({ ...c, btn_color: e.target.value }))} /></div></div>
                      <div className="form-group"><label className="label">Warna Teks</label><div className={styles.colorInputWrap}><input type="color" className={styles.colorPicker} value={storeBlockContent.btn_text_color || '#000000'} onChange={e => setStoreBlockContent(c => ({ ...c, btn_text_color: e.target.value }))} /><input type="text" className="input" style={{ flex: 1 }} value={storeBlockContent.btn_text_color || ''} onChange={e => setStoreBlockContent(c => ({ ...c, btn_text_color: e.target.value }))} /></div></div>
                      <div className="form-group"><label className="label">Alignment</label><select className="select" value={storeBlockContent.align || 'center'} onChange={e => setStoreBlockContent(c => ({ ...c, align: e.target.value }))}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
                    </div>
                  )}
                  {storeBlockType === 'product' && (
                    <div className={styles.formGrid}>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Pilih Produk</label>
                        <select className="select" value={storeBlockContent.product_id || ''} onChange={e => setStoreBlockContent(c => ({ ...c, product_id: e.target.value }))}>
                          <option value="">— Pilih Produk —</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="label">Status di Toko</label>
                        <select className="select" value={storeBlockContent.store_status || 'active'} onChange={e => setStoreBlockContent(c => ({ ...c, store_status: e.target.value as any }))}>
                          <option value="active">Active</option>
                          <option value="coming_soon">Coming Soon</option>
                          <option value="hidden">Hidden</option>
                        </select>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Unified block list */}
            {storeBlocksLoading ? <div className={styles.loading}>Memuat...</div> : storeBlocks.length === 0 ? (
              <div className={styles.emptyState}>Belum ada konten. Tekan &ldquo;+ Tambah Block&rdquo; di bawah untuk mulai.</div>
            ) : (
              <Reorder.Group axis="y" values={storeBlocks} onReorder={handleStoreBlockReorder} style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {storeBlocks.map(b => {
                  const linkedProduct = b.type === 'product' ? products.find(p => p.id === b.content.product_id) : null
                  const thumb = linkedProduct?.image_url?.includes('drive.google.com/uc')
                    ? linkedProduct.image_url.replace(/uc\?export=view&id=/, 'thumbnail?id=') + '&sz=w80-h100'
                    : linkedProduct?.image_url
                  return (
                    <Reorder.Item key={b.id} value={b} className={styles.linkRow} initial={false} style={{ cursor: 'default' }}>
                      <div style={{ padding: '0 12px 0 4px', cursor: 'grab', display: 'flex', alignItems: 'center', touchAction: 'none' }}><GripVertical size={16} color="#94a3b8" /></div>
                      {b.type === 'product' && thumb && <img src={thumb} alt={linkedProduct?.name} style={{ width: 32, height: 40, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />}
                      {b.type !== 'product' && (
                        <div style={{ width: 32, height: 32, minWidth: 32, background: '#f1f5f9', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, flexShrink: 0 }}>
                          {b.type === 'headline' ? 'H' : b.type === 'text' ? 'T' : b.type === 'image' ? 'IMG' : b.type === 'video' ? 'VID' : 'BTN'}
                        </div>
                      )}
                      <div className={styles.linkInfo}>
                        {b.type === 'product'
                          ? <><span className={styles.linkTitle}>{linkedProduct?.name || '(produk dihapus)'}</span><span className={styles.linkUrl}>Rp {formatRp(linkedProduct?.price_after_discount ?? 0)} · <ShoppingCart size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {linkedProduct?.checkout_clicks ?? 0}</span></>
                          : <><span className={styles.linkTitle}>{b.type.toUpperCase()} — {typeof (b.content.text || b.content.btn_text || b.content.url || b.content.video_url || '—') === 'string' ? (b.content.text || b.content.btn_text || b.content.url || b.content.video_url || '—').replace(/<[^>]*>?/gm, '') : '—'}</span><span className={styles.linkUrl}><span className={b.is_active ? styles.statusActive : styles.statusSoon}>{b.is_active ? 'Aktif' : 'Tersembunyi'}</span></span></>
                        }
                      </div>
                      <div className={styles.linkActions}>
                        {b.type === 'product' && (
                          <select className="select" style={{ fontSize: '0.75rem', padding: '3px 6px', minWidth: 100, marginRight: 4 }}
                            value={b.content.store_status || 'active'}
                            onChange={async e => {
                              await supabase.from('store_page_blocks').update({ content: { ...b.content, store_status: e.target.value } }).eq('id', b.id)
                              fetchStoreBlocks()
                            }}>
                            <option value="active">Active</option>
                            <option value="coming_soon">Coming Soon</option>
                            <option value="hidden">Hidden</option>
                          </select>
                        )}
                        {b.type !== 'product' && <button className={styles.editBtn} onClick={() => toggleStoreBlockActive(b)} title={b.is_active ? 'Sembunyikan' : 'Tampilkan'}>{b.is_active ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
                        <button className={styles.editBtn} onClick={() => openEditStoreBlock(b)}><Pencil size={15} /></button>
                        <button className={styles.deleteBtn} onClick={() => deleteStoreBlock(b.id)}><Trash2 size={15} /></button>
                      </div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            )}
          </div>
        )}
        {tab === 'ecommerce' && (
          <>
            <div className={styles.spacer} />
            <div className={styles.fixedActions}>
              {showStoreBlockForm && (
                <button type="button" className="btn btn-ghost" style={{ padding: '10px 24px' }} onClick={() => { setShowStoreBlockForm(false); setEditingStoreBlock(null) }}>Batal</button>
              )}
              
              <button type="button" className="btn btn-navy" style={{ padding: '10px 24px', fontWeight: 700, borderRadius: 999 }} onClick={openAddStoreBlock}>
                <Plus size={16} style={{ marginRight: 6 }} /> Tambah Block
              </button>

              {showStoreBlockForm && (
                <button type="button" className="btn btn-navy" style={{ padding: '10px 24px', fontWeight: 700 }} disabled={storeBlockSaving} onClick={(e) => saveStoreBlock(e as any)}>
                  {storeBlockSaving ? 'Menyimpan...' : <><Check size={16} /> Simpan Block</>}
                </button>
              )}
            </div>
          </>
        )}

        {/* ── VOUCHERS TAB ─── */}
        {tab === 'vouchers' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}>
              <div><h1 className={styles.contentTitle}>Vouchers</h1><p className={styles.contentDesc}>Kelola kode voucher diskon</p></div>
              <button className="btn btn-navy" onClick={openAddVoucher}><Plus size={16} /> Tambah Voucher</button>
            </div>
            {showVoucherForm && (
              <div className={styles.formCard}>
                <div className={styles.formCardHeader}><h2 className={styles.formTitle}>{editingVoucher ? 'Edit Voucher' : 'Tambah Voucher Baru'}</h2><button onClick={() => setShowVoucherForm(false)} className={styles.closeBtn}><X size={18} /></button></div>
                <form onSubmit={saveVoucher} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className="form-group"><label className="label">Kode Voucher *</label><input className="input" placeholder="MARCATCHING50" value={vf.code} onChange={e => setVf(f => ({...f, code: e.target.value.toUpperCase()}))} /></div>
                    <div className="form-group"><label className="label">Tipe Diskon</label><select className="select" value={vf.discount_type} onChange={e => setVf(f => ({...f, discount_type: e.target.value as 'fixed' | 'percentage'}))}><option value="fixed">Rupiah (Rp)</option><option value="percentage">Persen (%)</option></select></div>
                    <div className="form-group"><label className="label">Nilai Diskon</label><input className="input" placeholder={vf.discount_type === 'fixed' ? '50000' : '10'} value={vf.discount_value} onChange={e => setVf(f => ({...f, discount_value: e.target.value.replace(/\D/g, '')}))} /></div>
                    <div className="form-group"><label className="label">Status</label><select className="select" value={vf.is_active ? 'active' : 'inactive'} onChange={e => setVf(f => ({...f, is_active: e.target.value === 'active'}))}><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></div>
                  </div>

                  {/* ── Applicable Products ── */}
                  <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                    <label className="label" style={{ marginBottom: 8, display: 'block' }}>Berlaku untuk Product</label>
                    <div className={styles.voucherProductList}>
                      {/* All Products checkbox */}
                      <label className={styles.voucherProductItem} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 10, marginBottom: 6 }}>
                        <input
                          type="checkbox"
                          checked={vf.applicable_products === null || vf.applicable_products.length === 0}
                          onChange={e => {
                            if (e.target.checked) setVf(f => ({ ...f, applicable_products: null }))
                            else setVf(f => ({ ...f, applicable_products: [] }))
                          }}
                          className={styles.voucherProductCheckbox}
                        />
                        <span style={{ fontWeight: 700, color: '#0d3369' }}>✦ Semua Product (All Products)</span>
                      </label>
                      {/* Per product checkboxes — dynamically from products state */}
                      {products.map(p => (
                        <label key={p.id} className={styles.voucherProductItem}>
                          <input
                            type="checkbox"
                            checked={Array.isArray(vf.applicable_products) && vf.applicable_products.includes(p.id)}
                            disabled={vf.applicable_products === null}
                            onChange={() => toggleVoucherProduct(p.id)}
                            className={styles.voucherProductCheckbox}
                          />
                          <span style={{ color: vf.applicable_products === null ? '#94a3b8' : '#1e293b' }}>
                            {p.name}
                            {!p.is_active && <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: 6 }}>(inactive)</span>}
                          </span>
                        </label>
                      ))}
                      {products.length === 0 && (
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '4px 0' }}>Belum ada produk. Tambahkan produk di tab Products terlebih dahulu.</div>
                      )}
                    </div>
                  </div>

                  {voucherError && <p className={styles.formError}>{voucherError}</p>}
                  <div className={styles.spacer} />
                  <div className={styles.fixedActions}>
                    <button type="button" className="btn btn-ghost" style={{ padding: '10px 24px' }} onClick={() => setShowVoucherForm(false)}>Batal</button>
                    <button type="submit" className="btn btn-navy" style={{ padding: '10px 24px', fontWeight: 700 }} disabled={voucherSaving}>
                      {voucherSaving ? 'Menyimpan...' : <><Check size={16} /> Simpan</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {vouchersLoading ? <div className={styles.loading}>Memuat...</div> : vouchers.length === 0 ? <div className={styles.emptyState}>Belum ada voucher.</div> : (
              <div className={styles.linksList}>{vouchers.map(v => {
                // Resolve product names for display
                const appProductNames = v.applicable_products && v.applicable_products.length > 0
                  ? v.applicable_products.map(id => products.find(p => p.id === id)?.name ?? id).join(', ')
                  : null
                return (
                  <div key={v.id} className={styles.linkRow}>
                    <div className={styles.linkIcon}><Tag size={18} /></div>
                    <div className={styles.linkInfo}>
                      <span className={styles.linkTitle} style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{v.code}</span>
                      <span className={styles.linkUrl}>
                        {v.discount_type === 'fixed' ? `Rp ${formatRp(v.discount_value)}` : `${v.discount_value}%`}
                        {' · '}{v.is_active ? <span className={styles.statusActive}>Aktif</span> : <span className={styles.statusSoon}>Nonaktif</span>}
                        {' · '}<span style={{ color: '#64748b' }}>{appProductNames ? `${appProductNames}` : 'Semua Product'}</span>
                      </span>
                    </div>
                    <div className={styles.linkActions}>
                      <button className={styles.editBtn} onClick={() => toggleVoucher(v)} title={v.is_active ? 'Nonaktifkan' : 'Aktifkan'}>{v.is_active ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                      <button className={styles.editBtn} onClick={() => openEditVoucher(v)}><Pencil size={15} /></button>
                      <button className={styles.deleteBtn} onClick={() => deleteVoucher(v.id)}><Trash2 size={15} /></button>
                    </div>
                  </div>
                )
              })}</div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ─── */}
        {tab === 'orders' && (
          <div className={styles.tabContent} style={{ maxWidth: 1100 }}>
            <div className={styles.contentHeader}><div><h1 className={styles.contentTitle}>Orders</h1><p className={styles.contentDesc}>Semua pembelian yang masuk</p></div></div>
            {ordersLoading ? <div className={styles.loading}>Memuat...</div> : orders.length === 0 ? <div className={styles.emptyState}>Belum ada order.</div> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead><tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: 600 }}>Tanggal</th>
                    <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: 600 }}>Nama</th>
                    <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: 600 }}>Product</th>
                    <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: 600 }}>Aksi</th>
                  </tr></thead>
                  <tbody ref={contactMenuRef}>{orders.map(o => {
                    const waNum = formatWaNumber(o.whatsapp || '')
                    const totalFormatted = `Rp ${formatRp(o.total_paid)}`
                    const addons: AddonItem[] = Array.isArray(o.addon_items) ? o.addon_items : []
                    const allProductNames = [o.product_name, ...addons.map(a => a.name)]

                    function buildWaMsg(type: 'success' | 'pending') {
                      // Build course description based on single vs multiple
                      let courseDesc: string
                      if (allProductNames.length === 1) {
                        courseDesc = allProductNames[0]
                      } else {
                        courseDesc = ':\n\n' + allProductNames.map((name, i) => `${i + 1}. ${name}`).join('\n')
                      }

                      if (type === 'success') {
                        const successGreeting = allProductNames.length === 1
                          ? `Hi ${o.full_name}, aku Gilang. Thankyou udah order ${allProductNames[0]} di Marcatching!`
                          : `Hi ${o.full_name}, aku Gilang. Thankyou udah order ${courseDesc}\n\ndi Marcatching!`
                        return encodeURIComponent(
`${successGreeting}

aku udah kirim Email Aktivasi akun untuk kamu daftarkan di Marcatching Course. silahkan check email kamu untuk Daftar akun, Login, dan akses Coursenya, Enjoy!`
                        )
                      } else {
                        const pendingGreeting = allProductNames.length === 1
                          ? `Hi ${o.full_name}, aku Gilang. Thankyou udah order ${allProductNames[0]} di Marcatching!`
                          : `Hi ${o.full_name}, aku Gilang. Thankyou udah order ${courseDesc}\n\ndi Marcatching!`

                        const courseListForPending = allProductNames.length === 1
                          ? allProductNames[0]
                          : allProductNames.map((name, i) => `${i + 1}. ${name}`).join('\n')

                        return encodeURIComponent(
`${pendingGreeting}

aku liat kamu belum melakukan pembayaran ke Rekening tertera ya? yuk selesaikan dulu pembayaranya biar aku bisa kirim email aktivasi akun untuk akses Marcatching Course

Nama Course :
${courseListForPending}
Total bayar : ${totalFormatted}

Transfer ke Rekening
Nomor Rekening : 6030485643
Atas Nama : Gilang Ramadhan

Kalau sudah, silahkan kirim bukti transfernya disini, aku tunggu ya!`
                        )
                      }
                    }

                    return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{new Date(o.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: '10px 8px' }}><div style={{ fontWeight: 600 }}>{o.full_name}</div><div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{o.email}</div></td>
                      <td style={{ padding: '10px 8px' }}>
                        <div>{o.product_name}</div>
                        {addons.length > 0 && addons.map((a, i) => (
                          <div key={i} style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>+ {a.name}</div>
                        ))}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>Rp {formatRp(o.total_paid)}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <button 
                          onClick={() => toggleOrderStatus(o)} 
                          style={{ border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: o.status === 'confirmed' ? '#dcfce7' : '#fef3c7', color: o.status === 'confirmed' ? '#16a34a' : '#d97706', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title={`Ubah menjadi ${o.status === 'pending' ? 'Confirmed' : 'Pending'}`}
                        >
                          {o.status === 'confirmed' ? <Check size={12}/> : null}
                          {o.status.toUpperCase()}
                        </button>
                      </td>
                      <td style={{ padding: '10px 8px', position: 'relative' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            onClick={() => setContactMenuOrder(contactMenuOrder === o.id ? null : o.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: '#0d3369', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Contact Buyer
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                          </button>

                          {contactMenuOrder === o.id && (
                            <div
                              style={{
                                position: 'absolute', top: '110%', right: 0, zIndex: 200,
                                background: '#ffffff', border: '1px solid #e2e8f0',
                                borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
                                minWidth: 210, overflow: 'hidden'
                              }}
                            >
                              <div style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f1f5f9' }}>
                                WA: {o.whatsapp}
                              </div>
                              <a
                                href={`https://wa.me/${waNum}?text=${buildWaMsg('success')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setContactMenuOrder(null)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', textDecoration: 'none', color: '#16a34a', fontWeight: 700, fontSize: '0.82rem', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                Pembayaran Berhasil
                              </a>
                              <a
                                href={`https://wa.me/${waNum}?text=${buildWaMsg('pending')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setContactMenuOrder(null)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', textDecoration: 'none', color: '#d97706', fontWeight: 700, fontSize: '0.82rem', transition: 'background 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#fffbeb')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                Pembayaran Belum Berhasil
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    )
                  })}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── E-COURSE TAB ─── */}
        {tab === 'ecourse' && (
          <div className={styles.tabContent} style={{ maxWidth: 900 }}>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.contentTitle}>E-Course</h1>
                <p className={styles.contentDesc}>Kelola materi untuk setiap course / produk</p>
              </div>
            </div>

            {productsLoading ? (
              <div className={styles.loading}>Memuat products...</div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Belum ada produk. Tambahkan produk terlebih dahulu di tab Products.</p>
              </div>
            ) : (
              <div className={styles.linksList}>
                {products.map(product => {
                  const isExpanded = expandedCourse === product.id
                  const mats = courseMaterials[product.id] || []
                  const isLoadingMats = courseLoading[product.id]

                  return (
                    <div key={product.id} style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 4 }}>
                      {/* Product header row */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer', borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none' }}
                        onClick={() => {
                          if (isExpanded) { setExpandedCourse(null) }
                          else { setExpandedCourse(product.id); fetchCourseMaterials(product.id) }
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookMarked size={17} color="#374151" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{product.name}</div>
                          <div style={{ fontSize: '0.77rem', color: '#94a3b8', marginTop: 1 }}>
                            {isExpanded && !isLoadingMats ? `${mats.length} materi` : 'Klik untuk kelola materi'}
                          </div>
                        </div>
                        <ChevronRight size={16} color="#94a3b8" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {/* Expanded materials panel */}
                      {isExpanded && (
                        <div style={{ padding: '16px 20px' }}>
                          {isLoadingMats ? (
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '8px 0' }}>Memuat materi...</div>
                          ) : (
                            <>
                              {mats.length === 0 ? (
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '12px 0', textAlign: 'center' }}>Belum ada materi. Tambahkan materi di bawah.</div>
                              ) : (
                                <Reorder.Group
                                  axis="y"
                                  values={mats}
                                  onReorder={(newOrder) => reorderMaterials(newOrder, product.id)}
                                  style={{ listStyleType: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}
                                >
                                  {mats.map(mat => {
                                    const MatDragItem = () => {
                                      const dragControls = useDragControls()
                                      return (
                                        <Reorder.Item
                                          value={mat}
                                          dragListener={false}
                                          dragControls={dragControls}
                                          initial={false}
                                          style={{ listStyle: 'none' }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                            <div
                                              onPointerDown={(e) => dragControls.start(e)}
                                              style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#94a3b8', touchAction: 'none' }}
                                            >
                                              <GripVertical size={15} />
                                            </div>
                                            <div style={{ width: 28, height: 28, borderRadius: 6, background: mat.type === 'pdf' ? '#eff6ff' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                              {mat.type === 'pdf' ? <FileText size={15} color="#2563eb" /> : <Video size={15} color="#dc2626" />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{mat.title}</div>
                                              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mat.type === 'pdf' ? 'PDF' : 'Video'}</div>
                                            </div>
                                            <button
                                              onClick={() => deleteMaterial(mat.id, product.id)}
                                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#dc2626', borderRadius: 4 }}
                                              title="Hapus materi"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </Reorder.Item>
                                      )
                                    }
                                    return <MatDragItem key={mat.id} />
                                  })}
                                </Reorder.Group>
                              )}

                              {/* Add material buttons */}
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                {/* PDF batch upload */}
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#eff6ff', color: '#2563eb', borderRadius: 8, cursor: uploadingPdf ? 'wait' : 'pointer', fontSize: '0.82rem', fontWeight: 600, border: '1.5px dashed #93c5fd' }}>
                                  <Upload size={14} />
                                  {uploadingPdf ? 'Mengupload PDF...' : 'Upload PDF (Batch)'}
                                  <input
                                    type="file"
                                    multiple
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                    disabled={uploadingPdf}
                                    onChange={(e) => handlePdfBatchUpload(e, product.id)}
                                  />
                                </label>

                                {/* Add video button */}
                                <button
                                  onClick={() => { setShowMaterialForm(showMaterialForm === product.id ? null : product.id); setMaterialForm({ title: '', type: 'video', content_url: '' }); setMaterialError('') }}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fef3c7', color: '#92400e', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, border: '1.5px dashed #fcd34d', outline: 'none' }}
                                >
                                  <Video size={14} /> Tambah Video
                                </button>
                              </div>

                              {/* Video form */}
                              {showMaterialForm === product.id && (
                                <form onSubmit={(e) => saveMaterial(e, product.id)} style={{ background: '#f8fafc', borderRadius: 10, padding: '16px', border: '1px solid #e2e8f0' }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#374151', marginBottom: 12 }}>Tambah Materi Video YouTube</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div>
                                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Judul Materi *</label>
                                      <input className="input" placeholder="cth: Pengenalan Apple Copywriting" value={materialForm.title} onChange={e => setMaterialForm(f => ({ ...f, title: e.target.value }))} />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>URL YouTube *</label>
                                      <input className="input" placeholder="https://youtube.com/watch?v=..." value={materialForm.content_url} onChange={e => setMaterialForm(f => ({ ...f, content_url: e.target.value, type: 'video' }))} />
                                    </div>
                                  </div>
                                  {materialError && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: 8 }}>{materialError}</p>}
                                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowMaterialForm(null)}>Batal</button>
                                    <button type="submit" className="btn btn-navy" disabled={materialSaving}>{materialSaving ? 'Menyimpan...' : <><Check size={14} /> Simpan Materi</>}</button>
                                  </div>
                                </form>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── NAVIGATION TAB ─── */}
        {tab === 'navigation' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.contentTitle}>Navigation</h1>
                <p className={styles.contentDesc}>Kelola dropdown menu navigasi di pojok kanan atas landing page</p>
              </div>
              <button className="btn btn-navy" onClick={openAddNavLink}><Plus size={16} /> Tambah Nav Link</button>
            </div>

            {showNavForm && (
              <div className={styles.formCard}>
                <div className={styles.formCardHeader}>
                  <h2 className={styles.formTitle}>{editingNavLink ? 'Edit Nav Link' : 'Tambah Nav Link Baru'}</h2>
                  <button onClick={() => { setShowNavForm(false); setEditingNavLink(null) }} className={styles.closeBtn}><X size={18} /></button>
                </div>
                <form onSubmit={saveNavLink} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="label">Judul / Label *</label>
                      <input className="input" placeholder="cth: Instagram" value={navForm.title} onChange={e => setNavForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="label">URL Link</label>
                      <input className="input" placeholder="https://..." value={navForm.url} onChange={e => setNavForm(f => ({ ...f, url: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="label">Icon</label>
                      <select className="select" value={navForm.icon} onChange={e => setNavForm(f => ({ ...f, icon: e.target.value }))}>
                        {ICON_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Status</label>
                      <select className="select" value={navForm.is_active ? 'active' : 'inactive'} onChange={e => setNavForm(f => ({ ...f, is_active: e.target.value === 'active' }))}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Warna Text</label>
                      <div className={styles.colorInputWrap}>
                        <input type="color" className={styles.colorPicker} value={navForm.text_color || '#ffffff'} onChange={e => setNavForm(f => ({ ...f, text_color: e.target.value }))} />
                        <input type="text" className="input" style={{ flex: 1 }} placeholder="#ffffff" value={navForm.text_color} onChange={e => setNavForm(f => ({ ...f, text_color: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="label">Warna Background (kosongkan = transparan)</label>
                      <div className={styles.colorInputWrap}>
                        <input type="color" className={styles.colorPicker} value={navForm.btn_color || '#0d3369'} onChange={e => setNavForm(f => ({ ...f, btn_color: e.target.value }))} />
                        <input type="text" className="input" style={{ flex: 1 }} placeholder="Kosongkan = transparan" value={navForm.btn_color} onChange={e => setNavForm(f => ({ ...f, btn_color: e.target.value }))} />
                        {navForm.btn_color && (
                          <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setNavForm(f => ({ ...f, btn_color: '' }))}>
                            <X size={14} /> Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div style={{ marginTop: 16, padding: '16px', background: '#000', borderRadius: 12, display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                      color: navForm.text_color || '#ffffff',
                      background: navForm.btn_color || 'transparent',
                      borderRadius: 8, fontSize: '0.9rem', fontWeight: navForm.btn_color ? 600 : 500,
                    }}>
                      {(() => { const IC = ICON_MAP[navForm.icon] ?? Globe; return <IC size={20} /> })()}
                      <span>{navForm.title || 'Preview'}</span>
                    </div>
                  </div>

                  {navError && <p className={styles.formError}>{navError}</p>}
                  <div className={styles.spacer} />
                  <div className={styles.fixedActions}>
                    <button type="button" className="btn btn-ghost" style={{ padding: '10px 24px' }} onClick={() => { setShowNavForm(false); setEditingNavLink(null) }}>Batal</button>
                    <button type="submit" className="btn btn-navy" style={{ padding: '10px 24px', fontWeight: 700 }} disabled={navSaving}>
                      {navSaving ? 'Menyimpan...' : <><Check size={16} /> Simpan</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {navLinksLoading ? <div className={styles.loading}>Memuat data...</div> : navLinks.length === 0 ? (
              <div className={styles.emptyState}><p>Belum ada navigation link. Klik "Tambah Nav Link" untuk menambahkan.</p></div>
            ) : (
              <Reorder.Group axis="y" values={navLinks} onReorder={handleNavReorder} className={styles.linksList} style={{ listStyleType: 'none', padding: 0, margin: 0, gap: '12px', display: 'flex', flexDirection: 'column' }}>
                {navLinks.map(nl => {
                  const IconComp = ICON_MAP[nl.icon] ?? Globe
                  return (
                    <Reorder.Item key={nl.id} value={nl} className={styles.linkRow} initial={false} style={{ cursor: 'default' }}>
                      <div style={{ padding: '0 12px 0 4px', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none' }}>
                        <GripVertical size={16} color="var(--text-secondary)" />
                      </div>
                      <div onClick={() => openEditNavLink(nl)} style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer', gap: '16px', minWidth: 0 }}>
                        <div className={styles.linkIcon} style={{ margin: 0 }}><IconComp size={18} strokeWidth={1.75} /></div>
                        <div className={styles.linkInfo}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={styles.linkTitle}>{nl.title}</span>
                            {nl.btn_color && (
                              <span style={{ width: 14, height: 14, borderRadius: 4, background: nl.btn_color, display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)' }} />
                            )}
                            <span style={{ width: 14, height: 14, borderRadius: 4, background: nl.text_color || '#ffffff', display: 'inline-block', border: '1px solid rgba(0,0,0,0.15)' }} title="Text color" />
                          </div>
                          <span className={styles.linkUrl}>
                            {nl.url || '—'} · <span className={nl.is_active ? styles.statusActive : styles.statusSoon}>{nl.is_active ? 'Active' : 'Inactive'}</span>
                          </span>
                        </div>
                      </div>
                      <div className={styles.linkActions}>
                        <button className={styles.editBtn} onClick={() => toggleNavLinkActive(nl)} title={nl.is_active ? 'Nonaktifkan' : 'Aktifkan'}>{nl.is_active ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                        <button className={styles.editBtn} onClick={() => openEditNavLink(nl)} title="Edit"><Pencil size={15} /></button>
                        <button className={styles.deleteBtn} onClick={() => deleteNavLink(nl.id)} title="Hapus"><Trash2 size={15} /></button>
                      </div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            )}
          </div>
        )}

        {/* ── CONTACT TAB ─── */}
        {tab === 'contact' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}><div><h1 className={styles.contentTitle}>Contact Info</h1><p className={styles.contentDesc}>Kelola email kontak</p></div></div>
            <div className={styles.formCard} style={{ maxWidth: 480 }}>
              <h2 className={styles.formTitle}>Email Kontak</h2>
              {contactLoading ? <div className={styles.loading}>Memuat...</div> : (
                <form onSubmit={saveContact} className={styles.form}>
                  <div className="form-group"><label className="label">Alamat Email *</label><input className="input" type="email" placeholder="email@marcatching.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required /></div>
                  {contactMsg && <p className={contactMsg.startsWith('✓') ? styles.successMsg : styles.formError}>{contactMsg}</p>}
                  <div className={styles.formActions}><button type="submit" className="btn btn-navy" disabled={contactSaving}>{contactSaving ? 'Menyimpan...' : <><Check size={16} /> Simpan Email</>}</button></div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ─── */}
        {tab === 'analytics' && (
          <div className={styles.tabContent} style={{ maxWidth: 1100 }}>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.contentTitle}>Analytics</h1>
                <p className={styles.contentDesc}>
                  {analyticsSubView === 'website' && <><span className={styles.analyticsLiveDot} /><span className={styles.analyticsLiveLabel}>Realtime</span>{' · '}</>}
                  {analyticsSubView === 'website' ? 'Pantau performa website dan klik button' : 'Laporan keuangan — Cashflow Analysis'}
                </p>
              </div>
            </div>

            {/* ── Sub-tab toggle: Website / Cashflow ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <button
                onClick={() => setAnalyticsSubView('website')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 10, fontWeight: 700,
                  fontSize: '0.88rem', border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: analyticsSubView === 'website' ? '#0d3369' : '#f1f5f9',
                  color: analyticsSubView === 'website' ? '#ffffff' : '#475569',
                  boxShadow: analyticsSubView === 'website' ? '0 4px 14px rgba(13,51,105,0.25)' : 'none',
                }}>
                <GlobeAnalytics size={16} /> Website
              </button>
              <button
                onClick={() => setAnalyticsSubView('cashflow')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 10, fontWeight: 700,
                  fontSize: '0.88rem', border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: analyticsSubView === 'cashflow' ? '#0d3369' : '#f1f5f9',
                  color: analyticsSubView === 'cashflow' ? '#ffffff' : '#475569',
                  boxShadow: analyticsSubView === 'cashflow' ? '0 4px 14px rgba(13,51,105,0.25)' : 'none',
                }}>
                <DollarSign size={16} /> Cashflow
              </button>
            </div>

            {/* Date Range Bar (shared for both sub-views) */}
            <div className={styles.analyticsDateBar}>
              <select
                className={styles.analyticsPresetSelect}
                value={analyticsPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
              >
                <option value="0">Today</option>
                <option value="7">7 Hari Terakhir</option>
                <option value="30">30 Hari Terakhir</option>
                <option value="60">60 Hari Terakhir</option>
                <option value="90">90 Hari Terakhir</option>
                {analyticsPreset === 'custom' && <option value="custom">Custom Range</option>}
              </select>

              <div className={styles.analyticsDateInputs}>
                <input
                  type="date"
                  className={styles.analyticsDateInput}
                  value={analyticsStart}
                  onChange={(e) => setAnalyticsStart(e.target.value)}
                />
                <span className={styles.analyticsDateSep}>to</span>
                <input
                  type="date"
                  className={styles.analyticsDateInput}
                  value={analyticsEnd}
                  onChange={(e) => setAnalyticsEnd(e.target.value)}
                />
              </div>

              <button className={styles.analyticsRefreshBtn} onClick={handleCustomDateApply} title="Apply date range">
                <Calendar size={14} /> Apply
              </button>
              {analyticsSubView === 'website' && (
                <button
                  className={styles.analyticsRefreshBtn}
                  onClick={() => fetchAnalytics()}
                  disabled={analyticsLoading}
                  title="Refresh data"
                >
                  <RefreshCw size={14} className={analyticsLoading ? 'spin' : ''} />
                  {analyticsLoading ? 'Loading...' : 'Refresh'}
                </button>
              )}
            </div>

            {analyticsSubView === 'website' && (analyticsLoading && !analyticsData ? (
              <div className={styles.loading}>Memuat data analytics...</div>
            ) : analyticsData ? (
              <>
                {/* KPI Cards */}
                <div className={styles.analyticsKpiGrid}>
                  {/* Unique Visitors */}
                  <div className={styles.analyticsKpiCard}>
                    <div className={styles.analyticsKpiIcon}><Users size={20} /></div>
                    <div className={styles.analyticsKpiValue}>{analyticsData.kpi.uniqueVisitors.toLocaleString()}</div>
                    <div className={styles.analyticsKpiLabel}>Unique Visitors</div>
                    {kpiComparison !== null && (
                      <div className={kpiComparison.visitors >= 0 ? styles.kpiUp : styles.kpiDown}>
                        {kpiComparison.visitors >= 0 ? '▲' : '▼'} {kpiComparison.visitors > 0 ? '+' : ''}{kpiComparison.visitors}%
                        <span className={styles.kpiVs}>vs. periode sebelumnya</span>
                      </div>
                    )}
                  </div>
                  {/* Page Views */}
                  <div className={styles.analyticsKpiCard}>
                    <div className={styles.analyticsKpiIcon}><Eye size={20} /></div>
                    <div className={styles.analyticsKpiValue}>{analyticsData.kpi.totalPageViews.toLocaleString()}</div>
                    <div className={styles.analyticsKpiLabel}>Page Views</div>
                    {kpiComparison !== null && (
                      <div className={kpiComparison.pageViews >= 0 ? styles.kpiUp : styles.kpiDown}>
                        {kpiComparison.pageViews >= 0 ? '▲' : '▼'} {kpiComparison.pageViews > 0 ? '+' : ''}{kpiComparison.pageViews}%
                        <span className={styles.kpiVs}>vs. periode sebelumnya</span>
                      </div>
                    )}
                  </div>
                  {/* Total Clicks */}
                  <div className={styles.analyticsKpiCard}>
                    <div className={styles.analyticsKpiIcon}><MousePointer size={20} /></div>
                    <div className={styles.analyticsKpiValue}>{analyticsData.kpi.totalClicks.toLocaleString()}</div>
                    <div className={styles.analyticsKpiLabel}>Total Clicks</div>
                    {kpiComparison !== null && (
                      <div className={kpiComparison.clicks >= 0 ? styles.kpiUp : styles.kpiDown}>
                        {kpiComparison.clicks >= 0 ? '▲' : '▼'} {kpiComparison.clicks > 0 ? '+' : ''}{kpiComparison.clicks}%
                        <span className={styles.kpiVs}>vs. periode sebelumnya</span>
                      </div>
                    )}
                  </div>
                  {/* CTR */}
                  <div className={styles.analyticsKpiCard}>
                    <div className={styles.analyticsKpiIcon}><TrendingUp size={20} /></div>
                    <div className={styles.analyticsKpiValue}>{analyticsData.kpi.ctr}%</div>
                    <div className={styles.analyticsKpiLabel}>Click-Through Rate</div>
                    {kpiComparison !== null && (
                      <div className={kpiComparison.ctr >= 0 ? styles.kpiUp : styles.kpiDown}>
                        {kpiComparison.ctr >= 0 ? '▲' : '▼'} {kpiComparison.ctr > 0 ? '+' : ''}{kpiComparison.ctr}%
                        <span className={styles.kpiVs}>vs. periode sebelumnya</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Daily Visitors Trend — Stock-style Line Chart */}
                {analyticsData.dailyTrend.length > 0 && (
                  <div className={styles.analyticsMiniChart}>
                    <div className={styles.analyticsMiniChartHeader}>
                      <div>
                        <div className={styles.analyticsMiniChartTitle}>Daily Visitors Trend</div>
                        <div className={styles.analyticsMiniChartSub}>
                          {analyticsData.dailyTrend.reduce((s, d) => s + d.visitors, 0).toLocaleString()} total visitors
                          {' · '}{analyticsData.dailyTrend.length} days
                        </div>
                      </div>
                      {kpiComparison !== null && (
                        <div className={kpiComparison.visitors >= 0 ? styles.kpiUpLarge : styles.kpiDownLarge}>
                          {kpiComparison.visitors >= 0 ? '▲' : '▼'}
                          {' '}{kpiComparison.visitors > 0 ? '+' : ''}{kpiComparison.visitors}%
                        </div>
                      )}
                    </div>
                    <div className={styles.analyticsMiniChartSvgWrap}>
                      <VisitorLineChart data={analyticsData.dailyTrend} />
                    </div>
                  </div>
                )}

                {/* Button Performance Table */}
                <div className={styles.analyticsTableCard}>
                  <div className={styles.analyticsTableHeader}>
                    <div>
                      <h3 className={styles.analyticsTableTitle}>Button Performance</h3>
                      <p className={styles.analyticsTableSubtitle}>Klik per button link di website</p>
                    </div>
                  </div>
                  {analyticsData.buttonPerformance.length === 0 ? (
                    <div className={styles.analyticsEmptyTable}>Belum ada data klik button.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className={styles.analyticsTable}>
                        <thead>
                          <tr>
                            <th style={{ width: '40%' }}>Button</th>
                            <th style={{ width: '15%' }}>Clicks</th>
                            <th style={{ width: '45%' }}>Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.buttonPerformance.map((btn, i) => {
                            const maxClicks = analyticsData.buttonPerformance[0]?.clicks || 1
                            const percent = analyticsData.kpi.totalClicks > 0
                              ? Math.round((btn.clicks / analyticsData.kpi.totalClicks) * 100)
                              : 0
                            return (
                              <tr key={btn.link_id || i}>
                                <td>
                                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{btn.link_title}</div>
                                </td>
                                <td className={styles.analyticsClickCount}>{btn.clicks.toLocaleString()}</td>
                                <td>
                                  <div className={styles.analyticsBarWrap}>
                                    <div className={styles.analyticsBar}>
                                      <div
                                        className={styles.analyticsBarFill}
                                        style={{ width: `${(btn.clicks / maxClicks) * 100}%` }}
                                      />
                                    </div>
                                    <span className={styles.analyticsBarPercent}>{percent}%</span>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Top Pages */}
                {analyticsData.topPages.length > 0 && (
                  <div className={styles.analyticsTableCard}>
                    <div className={styles.analyticsTableHeader}>
                      <div>
                        <h3 className={styles.analyticsTableTitle}>Top Pages</h3>
                        <p className={styles.analyticsTableSubtitle}>Halaman paling banyak dikunjungi</p>
                      </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className={styles.analyticsTable}>
                        <thead>
                          <tr>
                            <th style={{ width: '60%' }}>Page</th>
                            <th style={{ width: '20%' }}>Views</th>
                            <th style={{ width: '20%' }}>Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.topPages.map((pg, i) => {
                            const maxViews = analyticsData.topPages[0]?.count || 1
                            const percent = analyticsData.kpi.totalPageViews > 0
                              ? Math.round((pg.count / analyticsData.kpi.totalPageViews) * 100)
                              : 0
                            return (
                              <tr key={pg.path || i}>
                                <td>
                                  <details style={{ margin: 0, cursor: 'pointer' }}>
                                    <summary style={{ 
                                      outline: 'none', 
                                      maxWidth: '150px', 
                                      overflow: 'hidden', 
                                      textOverflow: 'ellipsis', 
                                      whiteSpace: 'nowrap',
                                      fontWeight: 600,
                                      fontSize: '0.82rem',
                                      color: '#0d3369'
                                    }}>
                                      {pg.path}
                                    </summary>
                                    <div style={{ 
                                      fontSize: '0.75rem', 
                                      color: '#64748b', 
                                      wordBreak: 'break-all', 
                                      marginTop: 6, 
                                      whiteSpace: 'normal',
                                      padding: '6px 8px',
                                      background: '#f8fafc',
                                      borderRadius: 6,
                                      border: '1px solid #e2e8f0',
                                      fontWeight: 500
                                    }}>
                                      {pg.path}
                                    </div>
                                  </details>
                                </td>
                                <td className={styles.analyticsClickCount}>{pg.count.toLocaleString()}</td>
                                <td>
                                  <div className={styles.analyticsBarWrap}>
                                    <div className={styles.analyticsBar}>
                                      <div
                                        className={styles.analyticsBarFill}
                                        style={{ width: `${(pg.count / maxViews) * 100}%` }}
                                      />
                                    </div>
                                    <span className={styles.analyticsBarPercent}>{percent}%</span>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Source Visitor */}
                {analyticsData.trafficSources && analyticsData.trafficSources.length > 0 && (
                  <div className={styles.analyticsTableCard}>
                    <div className={styles.analyticsTableHeader}>
                      <div>
                        <h3 className={styles.analyticsTableTitle}>Source Visitor</h3>
                        <p className={styles.analyticsTableSubtitle}>Sumber platform darimana pengunjung datang ke website</p>
                      </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className={styles.analyticsTable}>
                        <thead>
                          <tr>
                            <th style={{ width: '60%' }}>Source</th>
                            <th style={{ width: '20%' }}>Visitors</th>
                            <th style={{ width: '20%' }}>Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.trafficSources.map((src, i) => {
                            const maxVisitors = analyticsData.trafficSources[0]?.count || 1
                            const percent = analyticsData.kpi.uniqueVisitors > 0
                              ? Math.round((src.count / analyticsData.kpi.uniqueVisitors) * 100)
                              : 0
                            return (
                              <tr key={src.source || i}>
                                <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{src.source}</td>
                                <td className={styles.analyticsClickCount}>{src.count.toLocaleString()}</td>
                                <td>
                                  <div className={styles.analyticsBarWrap}>
                                    <div className={styles.analyticsBar}>
                                      <div
                                        className={styles.analyticsBarFill}
                                        style={{ width: `${(src.count / maxVisitors) * 100}%` }}
                                      />
                                    </div>
                                    <span className={styles.analyticsBarPercent}>{percent}%</span>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>Klik tab Analytics untuk melihat data.</div>
            ))}

            {/* ── CASHFLOW sub-view ── */}
            {analyticsSubView === 'cashflow' && (
              <CashflowAnalytics
                analyticsPreset={analyticsPreset}
                analyticsStart={analyticsStart}
                analyticsEnd={analyticsEnd}
                onPresetChange={handlePresetChange}
                setAnalyticsStart={setAnalyticsStart}
                setAnalyticsEnd={setAnalyticsEnd}
                onDateApply={handleCustomDateApply}
              />
            )}
          </div>
        )}

        {/* ── CROP MODAL ─── */}
        {cropData.src && (
          <div className={styles.cropModalOverlay}>
            <div className={styles.cropModalContent}>
              <div className={styles.cropModalHeader}>
                <h3 className={styles.cropModalTitle}>Sesuaikan Gambar</h3>
                <button className={styles.closeBtn} onClick={() => setCropData({ src: '', target: null })}><X size={18} /></button>
              </div>
              <div className={styles.cropContainer}>
                <Cropper
                  image={cropData.src}
                  crop={crop}
                  zoom={zoom}
                  aspect={cropData.target === 'author' ? 1 : 4 / 5}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  classes={{ containerClassName: styles.cropContainer }}
                />
              </div>
              <div className={styles.cropControls}>
                <div className={styles.zoomControl}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Zoom</span>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className={styles.zoomSlider}
                  />
                </div>
              </div>
              <div className={styles.cropModalActions}>
                <button className="btn btn-ghost" onClick={() => setCropData({ src: '', target: null })}>Batal</button>
                <button className="btn btn-navy" onClick={confirmCrop} disabled={uploadingPoster || uploadingImage}>
                  {(uploadingPoster || uploadingImage) ? 'Mengupload...' : <><Check size={16} /> Crop & Upload</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ARTICLES TAB ─── */}
        {tab === 'articles' && (
          <div className={styles.tabContent} style={{ maxWidth: 900 }}>
            {!showArticleEditor ? (
              <>
                {/* Header */}
                <div className={styles.contentHeader}>
                  <div>
                    <h1 className={styles.contentTitle}>Articles</h1>
                    <p className={styles.contentDesc}>Kelola artikel yang tampil di marcatching.com/article</p>
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <button className="btn btn-ghost" style={{ fontSize:'0.82rem' }} onClick={() => { setShowCatForm(true); setEditingCat(null); setCatFormName('') }}>
                      <FolderOpen size={15} /> Kategori
                    </button>
                    <button className="btn btn-ghost" style={{ fontSize:'0.82rem' }} onClick={() => { setShowAuthorForm(true); setEditingAuthor(null); setAuthorFormName(''); setAuthorFormPhoto('') }}>
                      <UserCircle size={15} /> Author
                    </button>
                    <button className="btn btn-navy" onClick={openNewArticle}><Plus size={16} /> Tulis Artikel</button>
                  </div>
                </div>

                {/* Category Manager Inline Panel */}
                {showCatForm && (
                  <div className={styles.formCard} style={{ marginBottom:20 }}>
                    <div className={styles.formCardHeader}>
                      <h2 className={styles.formTitle}>Kelola Kategori</h2>
                      <button className={styles.closeBtn} onClick={() => { setShowCatForm(false); setEditingCat(null); setCatFormName('') }}><X size={18}/></button>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      {/* Existing categories */}
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {articleCategories.length === 0 && <div style={{ color:'#94a3b8', fontSize:'0.85rem' }}>Belum ada kategori.</div>}
                        {articleCategories.map(cat => (
                          <div key={cat.id} className={styles.linkRow} style={{ padding:'10px 16px' }}>
                            {editingCat?.id === cat.id ? (
                              <input className="input" style={{ flex:1, padding:'6px 10px' }} value={catFormName} autoFocus
                                onChange={e => setCatFormName(e.target.value)}
                                onKeyDown={e => { if(e.key==='Enter') saveCat() }}
                              />
                            ) : (
                              <span style={{ flex:1, fontWeight:600, fontSize:'0.9rem', color:'#0f172a' }}>{cat.name}</span>
                            )}
                            <div style={{ display:'flex', gap:6 }}>
                              {editingCat?.id === cat.id ? (
                                <>
                                  <button className={styles.editBtn} onClick={saveCat} disabled={catSaving}><Check size={14}/></button>
                                  <button className={styles.deleteBtn} onClick={() => { setEditingCat(null); setCatFormName('') }}><X size={14}/></button>
                                </>
                              ) : (
                                <>
                                  <button className={styles.editBtn} onClick={() => { setEditingCat(cat); setCatFormName(cat.name) }}><Pencil size={14}/></button>
                                  <button className={styles.deleteBtn} onClick={() => deleteCat(cat)}><Trash2 size={14}/></button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Add new */}
                      {!editingCat && (
                        <div style={{ display:'flex', gap:8 }}>
                          <input className="input" placeholder="Nama kategori baru" value={catFormName} onChange={e => setCatFormName(e.target.value)}
                            onKeyDown={e => { if(e.key==='Enter') saveCat() }}
                          />
                          <button className="btn btn-navy" onClick={saveCat} disabled={catSaving || !catFormName.trim()}>{catSaving ? '...' : <><Plus size={14}/> Tambah</>}</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Author Manager Inline Panel */}
                {showAuthorForm && (
                  <div className={styles.formCard} style={{ marginBottom:20 }}>
                    <div className={styles.formCardHeader}>
                      <h2 className={styles.formTitle}>Kelola Author</h2>
                      <button className={styles.closeBtn} onClick={() => { setShowAuthorForm(false); setEditingAuthor(null); setAuthorFormName(''); setAuthorFormPhoto('') }}><X size={18}/></button>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      {articleAuthors.map(author => (
                        <div key={author.id} className={styles.linkRow} style={{ padding:'10px 16px' }}>
                          {author.photo_url && (
                            <img src={author.photo_url.includes('drive.google.com/uc') ? author.photo_url.replace(/uc\?export=view&id=/,'thumbnail?id=')+'&sz=w100-h100' : author.photo_url}
                              alt={author.name} style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', flexShrink:0, border:'2px solid #e2e8f0' }} />
                          )}
                          {!author.photo_url && <div style={{ width:36, height:36, borderRadius:'50%', background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><UserCircle size={20} color="#0d3369"/></div>}
                          {editingAuthor?.id === author.id ? (
                            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                              <input className="input" style={{ padding:'6px 10px' }} value={authorFormName} onChange={e => setAuthorFormName(e.target.value)} placeholder="Nama"/>
                              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                <div className={styles.uploadArea} style={{ flex:1, minHeight:40 }}>
                                  <input type="file" accept="image/*" className={styles.fileInput} onChange={handleAuthorPhotoUpload} disabled={uploadingAuthorPhoto}/>
                                  <div className={styles.uploadLabel} style={{ fontSize:'0.78rem' }}>{uploadingAuthorPhoto ? 'Uploading...' : 'Ganti Foto'}</div>
                                </div>
                                {authorFormPhoto && <img src={authorFormPhoto.includes('drive.google.com/uc') ? authorFormPhoto.replace(/uc\?export=view&id=/,'thumbnail?id=')+'&sz=w100-h100' : authorFormPhoto} style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', border:'2px solid #0d3369' }} alt=""/>}
                              </div>
                            </div>
                          ) : (
                            <span style={{ flex:1, fontWeight:600, fontSize:'0.9rem', color:'#0f172a' }}>{author.name}</span>
                          )}
                          <div style={{ display:'flex', gap:6 }}>
                            {editingAuthor?.id === author.id ? (
                              <>
                                <button className={styles.editBtn} onClick={saveAuthor} disabled={authorSaving}><Check size={14}/></button>
                                <button className={styles.deleteBtn} onClick={() => { setEditingAuthor(null); setAuthorFormName(''); setAuthorFormPhoto('') }}><X size={14}/></button>
                              </>
                            ) : (
                              <>
                                <button className={styles.editBtn} onClick={() => { setEditingAuthor(author); setAuthorFormName(author.name); setAuthorFormPhoto(author.photo_url || '') }}><Pencil size={14}/></button>
                                <button className={styles.deleteBtn} onClick={() => deleteAuthor(author)}><Trash2 size={14}/></button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {/* Add new author */}
                      {!editingAuthor && (
                        <div style={{ display:'flex', flexDirection:'column', gap:8, paddingTop:8, borderTop:'1px solid #f1f5f9' }}>
                          <div className="form-group">
                            <label className="label">Nama Author Baru</label>
                            <input className="input" placeholder="cth: Gilang Fauzi" value={authorFormName} onChange={e => setAuthorFormName(e.target.value)}/>
                          </div>
                          <div className="form-group">
                            <label className="label">Foto Profile</label>
                            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                              <div className={styles.uploadArea} style={{ flex:1, minHeight:48 }}>
                                <input type="file" accept="image/*" className={styles.fileInput} onChange={handleAuthorPhotoUpload} disabled={uploadingAuthorPhoto}/>
                                <div className={styles.uploadLabel}><Upload size={16}/>{uploadingAuthorPhoto ? 'Uploading...' : 'Upload Foto'}</div>
                              </div>
                              {authorFormPhoto && <img src={authorFormPhoto.includes('drive.google.com/uc') ? authorFormPhoto.replace(/uc\?export=view&id=/,'thumbnail?id=')+'&sz=w200-h200' : authorFormPhoto} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', border:'2px solid #0d3369' }} alt=""/>}
                            </div>
                          </div>
                          <button className="btn btn-navy" style={{ alignSelf:'flex-start' }} onClick={saveAuthor} disabled={authorSaving || !authorFormName.trim()}>{authorSaving ? 'Menyimpan...' : <><Plus size={14}/> Tambah Author</>}</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Article list */}
                {articlesLoading ? (
                  <div className={styles.loading}>Memuat artikel...</div>
                ) : articles.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Newspaper size={40} color="#cbd5e1" style={{ margin:'0 auto 12px' }}/>
                    <p>Belum ada artikel. Klik <strong>Tulis Artikel</strong> untuk memulai.</p>
                  </div>
                ) : (
                  <div className={styles.linksList}>
                    {articles.map(a => (
                      <div key={a.id} className={styles.linkRow}>
                        <div className={styles.linkIcon} style={{ background: a.status==='published' ? '#dcfce7' : a.status==='unpublished' ? '#fef3c7' : '#f1f5f9' }}>
                          <Newspaper size={18} color={a.status==='published' ? '#16a34a' : a.status==='unpublished' ? '#b45309' : '#64748b'}/>
                        </div>
                        <div className={styles.linkInfo} style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                            <span className={styles.linkTitle}>{a.title}</span>
                            <span style={{ fontSize:'0.68rem', fontWeight:700, borderRadius:999, padding:'2px 8px',
                              background: a.status==='published' ? '#dcfce7' : a.status==='unpublished' ? '#fef3c7' : '#f1f5f9',
                              color: a.status==='published' ? '#16a34a' : a.status==='unpublished' ? '#b45309' : '#64748b'
                            }}>{a.status.toUpperCase()}</span>
                          </div>
                          <span className={styles.linkUrl}>
                            /article/{a.slug} · <Eye size={11} style={{ display:'inline', verticalAlign:'middle' }}/> {a.view_count} views
                            {(a as any).article_categories?.name && ` · ${(a as any).article_categories.name}`}
                          </span>
                        </div>
                        <div className={styles.linkActions}>
                          <button className={styles.editBtn} title={a.status==='published'?'Unpublish':'Publish'} onClick={() => toggleArticleStatus(a)}>
                            {a.status==='published' ? <EyeOff size={14}/> : <Eye size={14}/>}
                          </button>
                          <button className={styles.editBtn} onClick={() => openEditArticle(a)}><Pencil size={15}/></button>
                          <button className={styles.deleteBtn} onClick={() => deleteArticle(a)}><Trash2 size={15}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* ── ARTICLE EDITOR ── */
              <div>
                <div className={styles.contentHeader} style={{ marginBottom:20 }}>
                  <div>
                    <h1 className={styles.contentTitle}>{editingArticle ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h1>
                    <p className={styles.contentDesc}>{articleTitle ? `/${slugifyArticle(articleTitle)}` : 'Judul artikel akan menjadi slug URL'}</p>
                  </div>
                  <button className="btn btn-ghost" onClick={() => setShowArticleEditor(false)}><X size={16}/> Batal</button>
                </div>

                {/* Meta fields */}
                <div className={styles.formCard}>
                  <h3 className={styles.formTitle} style={{ marginBottom:16 }}>Informasi Artikel</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div className="form-group">
                      <label className="label">Judul Artikel *</label>
                      <input className="input" placeholder="cth: Strategi Marketing 2025" value={articleTitle} onChange={e => setArticleTitle(e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="label">Excerpt / Ringkasan</label>
                      <textarea className="input" rows={2} placeholder="Ringkasan singkat artikel (untuk SEO & preview)" value={articleExcerpt} onChange={e => setArticleExcerpt(e.target.value)}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div className="form-group">
                        <label className="label">Kategori</label>
                        <select className="select" value={articleCategoryId} onChange={e => setArticleCategoryId(e.target.value)}>
                          <option value="">-- Pilih Kategori --</option>
                          {articleCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="label">Author</label>
                        <select className="select" value={articleAuthorId} onChange={e => setArticleAuthorId(e.target.value)}>
                          <option value="">-- Pilih Author --</option>
                          {articleAuthors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="label">Status</label>
                        <select className="select" value={articleStatus} onChange={e => setArticleStatus(e.target.value as any)}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="unpublished">Unpublished</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Blocks */}
                <div className={styles.formCard} style={{ marginTop:16 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <h3 className={styles.formTitle}>Konten Artikel</h3>
                  </div>

                  {articleBlocks.length === 0 && (
                    <div className={styles.emptyState} style={{ padding:'32px 24px', marginBottom:0 }}>
                      <p style={{ color:'#94a3b8' }}>Klik <strong>+ Tambah Block</strong> untuk mulai menulis konten artikel.</p>
                    </div>
                  )}

                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {articleBlocks.map((block, idx) => (
                      <div key={block.id} className={styles.articleBlockWrap}>
                        {/* Block controls (move up/down + delete) */}
                        <div className={styles.articleBlockControls}>
                          <button onClick={() => moveBlock(block.id, 'up')} disabled={idx===0} className={styles.articleBlockCtrlBtn} title="Move up"><ChevronUp size={13}/></button>
                          <button onClick={() => moveBlock(block.id, 'down')} disabled={idx===articleBlocks.length-1} className={styles.articleBlockCtrlBtn} title="Move down"><ChevronDown size={13}/></button>
                          <button onClick={() => removeBlock(block.id)} className={styles.articleBlockDelBtn} title="Remove block"><Trash2 size={13}/></button>
                        </div>

                        {/* ── HEADLINE block ── */}
                        {block.type === 'headline' && (
                          <div className={styles.articleBlockInner}>
                            <div className={styles.articleBlockLabel}><Type size={12}/> Headline</div>
                            {/* Rich text editor - select text to see formatting toolbar */}
                            <RichTextEditor
                              value={block.text}
                              onChange={html => updateBlock(block.id, { text: html } as any)}
                              placeholder="Tulis headline... (pilih teks untuk format)"
                              minHeight={60}
                              style={{ fontSize:'1.25rem', fontWeight:700, color: block.color || '#ffffff', textAlign: (block.align as any) || 'left', background: '#0a0a0a', border: '1px solid #1e293b' }}
                            />
                            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                              <select className="select" style={{ flex:1, padding:'8px 12px', fontSize:'0.82rem' }} value={block.size} onChange={e => updateBlock(block.id, { size: e.target.value } as any)}>
                                <option value="hero">Hero (2.5rem)</option>
                                <option value="h1">H1 (2rem)</option>
                                <option value="h2">H2 (1.5rem)</option>
                                <option value="h3">H3 (1.25rem)</option>
                                <option value="sub">Sub (1rem)</option>
                              </select>
                              <select className="select" style={{ flex:1, padding:'8px 12px', fontSize:'0.82rem' }} value={block.align || 'left'} onChange={e => updateBlock(block.id, { align: e.target.value } as any)}>
                                <option value="left">Kiri</option>
                                <option value="center">Tengah</option>
                                <option value="right">Kanan</option>
                                <option value="justify">Rata Kanan-Kiri</option>
                              </select>
                              <select className="select" style={{ flex:1, padding:'8px 12px', fontSize:'0.82rem' }} value={block.font_family || 'DM Sans'} onChange={e => updateBlock(block.id, { font_family: e.target.value } as any)}>
                                <option value="DM Sans">DM Sans</option>
                                <option value="Montserrat">Montserrat</option>
                                <option value="serif">Serif</option>
                                <option value="monospace">Monospace</option>
                              </select>
                              <div className={styles.colorInputWrap} style={{ flex:'0 0 auto' }}>
                                <input type="color" className={styles.colorPicker} value={block.color || '#ffffff'} onChange={e => updateBlock(block.id, { color: e.target.value } as any)}/>
                                <input type="text" className="input" style={{ width:90, padding:'8px 10px', fontSize:'0.82rem' }} value={block.color || '#ffffff'} onChange={e => updateBlock(block.id, { color: e.target.value } as any)}/>
                              </div>
                            </div>
                            <p style={{ fontSize:'0.75rem', color:'#94a3b8', margin:'6px 0 0' }}>Pilih/select teks untuk bold, italic, ubah ukuran, warna, & highlight pada teks terpilih</p>
                          </div>
                        )}

                        {/* ── TEXT block ── */}
                        {block.type === 'text' && (
                          <div className={styles.articleBlockInner}>
                            <div className={styles.articleBlockLabel}><AlignLeft size={12}/> Text</div>
                            {/* Rich text editor - select text to see formatting toolbar */}
                            <RichTextEditor
                              value={block.text}
                              onChange={html => updateBlock(block.id, { text: html } as any)}
                              placeholder="Tulis paragraf... (pilih teks untuk format)"
                              minHeight={100}
                              style={{ fontSize: block.size || '1rem', color: block.color || '#ffffff', textAlign: (block.align as any) || 'left', fontWeight: block.weight === 'bold' ? 700 : block.weight === 'semibold' ? 600 : 400, fontStyle: block.italic ? 'italic' : 'normal', fontFamily: block.font_family || 'DM Sans', background: '#0a0a0a', border: '1px solid #1e293b' }}
                            />
                            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                              <select className="select" style={{ flex:1, padding:'8px 12px', fontSize:'0.82rem' }} value={block.size || '1rem'} onChange={e => updateBlock(block.id, { size: e.target.value } as any)}>
                                <option value="2rem">Hero (2rem)</option>
                                <option value="1.5rem">Large (1.5rem)</option>
                                <option value="1.25rem">Semi Bold (1.25rem)</option>
                                <option value="1rem">Regular (1rem)</option>
                                <option value="0.875rem">Kecil (0.875rem)</option>
                              </select>
                              <select className="select" style={{ flex:1, padding:'8px 12px', fontSize:'0.82rem' }} value={block.weight || 'normal'} onChange={e => updateBlock(block.id, { weight: e.target.value } as any)}>
                                <option value="normal">Normal</option>
                                <option value="semibold">Semi Bold</option>
                                <option value="bold">Bold</option>
                              </select>
                              <select className="select" style={{ flex:1, padding:'8px 12px', fontSize:'0.82rem' }} value={block.align || 'left'} onChange={e => updateBlock(block.id, { align: e.target.value } as any)}>
                                <option value="left">Kiri</option>
                                <option value="center">Tengah</option>
                                <option value="right">Kanan</option>
                                <option value="justify">Rata Kanan-Kiri</option>
                              </select>
                              <label className={styles.checkboxLabel} style={{ alignSelf:'center' }}>
                                <input type="checkbox" checked={block.italic || false} onChange={e => updateBlock(block.id, { italic: e.target.checked } as any)}/> Italic
                              </label>
                              <select className="select" style={{ flex:1, padding:'8px 12px', fontSize:'0.82rem' }} value={block.font_family || 'DM Sans'} onChange={e => updateBlock(block.id, { font_family: e.target.value } as any)}>
                                <option value="DM Sans">DM Sans</option>
                                <option value="Montserrat">Montserrat</option>
                                <option value="serif">Serif</option>
                                <option value="monospace">Monospace</option>
                              </select>
                              <div className={styles.colorInputWrap} style={{ flex:'0 0 auto' }}>
                                <input type="color" className={styles.colorPicker} value={block.color || '#ffffff'} onChange={e => updateBlock(block.id, { color: e.target.value } as any)}/>
                                <input type="text" className="input" style={{ width:90, padding:'8px 10px', fontSize:'0.82rem' }} value={block.color || '#ffffff'} onChange={e => updateBlock(block.id, { color: e.target.value } as any)}/>
                              </div>
                            </div>
                            <p style={{ fontSize:'0.75rem', color:'#94a3b8', margin:'6px 0 0' }}>Pilih/select teks untuk bold, italic, ubah ukuran, warna, & highlight pada teks terpilih</p>
                          </div>
                        )}

                        {/* ── IMAGE block ── */}
                        {block.type === 'image' && (
                          <div className={styles.articleBlockInner}>
                            <div className={styles.articleBlockLabel}><ImageIcon size={12}/> Gambar</div>
                            <div style={{ display:'flex', gap:10, marginBottom:10, flexWrap:'wrap' }}>
                              <select className="select" style={{ flex:1, padding:'8px 12px', fontSize:'0.82rem' }}
                                value={block.aspect_ratio}
                                onChange={e => updateBlock(block.id, { aspect_ratio: e.target.value } as any)}>
                                <option value="16:9">16:9 Landscape</option>
                                <option value="9:16">9:16 Portrait</option>
                                <option value="4:5">4:5 Instagram</option>
                                <option value="5:4">5:4</option>
                                <option value="1:3">1:3 Tall</option>
                                <option value="3:5">3:5</option>
                                <option value="5:3">5:3</option>
                              </select>
                              <input className="input" placeholder="Caption (opsional)" style={{ flex:2, padding:'8px 12px', fontSize:'0.82rem' }}
                                value={block.caption || ''} onChange={e => updateBlock(block.id, { caption: e.target.value } as any)}/>
                            </div>
                            {block.url ? (
                              <div style={{ position:'relative', marginBottom:8 }}>
                                <img
                                  src={block.url.includes('drive.google.com/uc') ? block.url.replace(/uc\?export=view&id=/, 'thumbnail?id=')+'&sz=w1200-h1200' : block.url}
                                  alt=""
                                  style={{ width:'100%', aspectRatio: block.aspect_ratio.replace(':','/'), objectFit:'cover', borderRadius:8, border:'1px solid #e2e8f0' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => updateBlock(block.id, { url: '' } as any)}
                                  style={{ position:'absolute', top:8, right:8, background:'rgba(220,38,38,0.9)', border:'none', borderRadius:6, padding:'4px 8px', color:'#fff', cursor:'pointer', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:4 }}
                                ><Trash2 size={12}/> Ganti
                                </button>
                              </div>
                            ) : (
                              <div className={styles.uploadArea}>
                                <input type="file" accept="image/*" className={styles.fileInput}
                                  onChange={e => handleArticleImagePick(e, block.id, block.aspect_ratio)}
                                />
                                <div className={styles.uploadLabel}><Upload size={18}/> Upload Gambar (akan di-crop)</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── VIDEO block ── */}
                        {block.type === 'video' && (
                          <div className={styles.articleBlockInner}>
                            <div className={styles.articleBlockLabel}><Video size={12}/> YouTube Video</div>
                            <input className="input" placeholder="https://youtube.com/watch?v=..." value={block.url}
                              onChange={e => updateBlock(block.id, { url: e.target.value } as any)}/>
                            <input className="input" style={{ marginTop:8, fontSize:'0.85rem' }} placeholder="Caption (opsional)" value={block.caption||''}
                              onChange={e => updateBlock(block.id, { caption: e.target.value } as any)}/>
                          </div>
                        )}

                        {/* ── PRODUCT block ── */}
                        {block.type === 'product' && (
                          <div className={styles.articleBlockInner}>
                            <div className={styles.articleBlockLabel}><Package size={12}/> Product Card (Popup)</div>
                            <select className="select" value={block.product_id} onChange={e => updateBlock(block.id, { product_id: e.target.value } as any)}>
                              <option value="">-- Pilih Product --</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            {block.product_id && (() => {
                              const p = products.find(pr => pr.id === block.product_id)
                              if (!p) return null
                              return (
                                <div style={{ marginTop:8, padding:'10px 14px', background:'#f8fafc', borderRadius:8, border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:12 }}>
                                  {p.image_url && <img src={p.image_url.includes('drive.google.com/uc')?p.image_url.replace(/uc\?export=view&id=/,'thumbnail?id=')+'&sz=w200-h250':p.image_url} style={{ width:44, height:55, objectFit:'cover', borderRadius:6, border:'1px solid #e2e8f0' }} alt=""/>}
                                  <div>
                                    <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#0f172a' }}>{p.name}</div>
                                    <div style={{ fontSize:'0.78rem', color:'#64748b' }}>Rp {p.price_after_discount.toLocaleString('id-ID')} · akan tampil sebagai popup</div>
                                  </div>
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {articleError && <p className={styles.formError} style={{ marginTop:8 }}>{articleError}</p>}

                {/* Fixed bar for Article Editor */}
                <div className={styles.spacer} />
                <div className={styles.fixedActions}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowArticleEditor(false)} style={{ padding: '10px 24px' }}>Batal</button>
                  
                  {/* Tambah Block with its dropdown */}
                  <div style={{ position:'relative' }}>
                    {showBlockMenu && (
                      <div className={styles.addMenuDropdown} style={{ position: 'absolute', bottom: '120%', right: '50%', transform: 'translateX(50%)', width:200, marginBottom: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', borderRadius: 12 }}>
                        <button type="button" onClick={() => { addBlock('headline'); setShowBlockMenu(false); }}><Type size={14}/> Headline / Judul</button>
                        <button type="button" onClick={() => { addBlock('text'); setShowBlockMenu(false); }}><AlignLeft size={14}/> Text / Paragraf</button>
                        <button type="button" onClick={() => { addBlock('image'); setShowBlockMenu(false); }}><ImageIcon size={14}/> Gambar</button>
                        <button type="button" onClick={() => { addBlock('video'); setShowBlockMenu(false); }}><Video size={14}/> Online Video</button>
                        <button type="button" onClick={() => { addBlock('product'); setShowBlockMenu(false); }}><Package size={14}/> Product Card</button>
                      </div>
                    )}
                    <button type="button" className="btn btn-navy" style={{ fontSize:'0.92rem', fontWeight: 700, padding: '10px 24px', borderRadius: '100px' }} onClick={() => setShowBlockMenu(b => !b)}>
                      <Plus size={18} style={{ marginRight: 6 }}/> Tambah Block
                    </button>
                  </div>

                  <button type="button" onClick={saveArticle} className="btn btn-navy" style={{ padding: '10px 24px', fontWeight: 700 }} disabled={articleSaving}>
                    {articleSaving ? 'Menyimpan...' : <><Check size={16} /> Simpan Artikel</>}
                  </button>
                </div>
              </div>
            )}
            

          </div>
        )}

        {/* ── Article image crop modal ── */}
        {articleCropData.src && (
          <div className={styles.cropModalOverlay}>
            <div className={styles.cropModalContent}>
              <div className={styles.cropModalHeader}>
                <h3 className={styles.cropModalTitle}>Sesuaikan Gambar ({articleCropData.aspectRatio})</h3>
                <button className={styles.closeBtn} onClick={() => setArticleCropData({src:'', aspectRatio:'16:9', blockId:''})}><X size={18}/></button>
              </div>
              <div className={styles.cropContainer}>
                <Cropper
                  image={articleCropData.src}
                  crop={articleCrop}
                  zoom={articleZoom}
                  aspect={(() => {
                    const [w,h] = articleCropData.aspectRatio.split(':').map(Number)
                    return w/h
                  })()}
                  onCropChange={setArticleCrop}
                  onCropComplete={onArticleCropComplete}
                  onZoomChange={setArticleZoom}
                  classes={{ containerClassName: styles.cropContainer }}
                />
              </div>
              <div className={styles.cropControls}>
                <div className={styles.zoomControl}>
                  <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#64748b' }}>Zoom</span>
                  <input type="range" value={articleZoom} min={1} max={3} step={0.1} onChange={e => setArticleZoom(Number(e.target.value))} className={styles.zoomSlider}/>
                </div>
              </div>
              <div className={styles.cropModalActions}>
                <button className="btn btn-ghost" onClick={() => setArticleCropData({src:'', aspectRatio:'16:9', blockId:''})}>Batal</button>
                <button className="btn btn-navy" onClick={confirmArticleCrop} disabled={uploadingArticleImage}>
                  {uploadingArticleImage ? 'Mengupload...' : <><Check size={16}/> Crop & Upload</>}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardInner />
    </Suspense>
  )
}
