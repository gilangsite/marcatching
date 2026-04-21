'use client'

import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import styles from './admin.module.css'
import type { FinanceRecord } from './FinanceTab'

// ─── Colour palette ────────────────────────────────────────────
const PALETTE = [
  '#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16',
  '#06b6d4','#e11d48','#0ea5e9','#a3e635','#fb923c'
]

// ─── Format helpers ────────────────────────────────────────────
function formatRp(n: number) {
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(Math.round(n))
}
function formatRpFull(n: number) {
  return new Intl.NumberFormat('id-ID').format(Math.abs(Math.round(n)))
}

// ─── Bar chart (Income vs Cost by month) ──────────────────────
function CashflowBarChart({ data }: { data: { month: string; income: number; cost: number }[] }) {
  if (!data || data.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '0.88rem' }}>
      Tidak ada data untuk ditampilkan.
    </div>
  )

  const W = 820, H = 260
  const PAD = { top: 20, bottom: 44, left: 68, right: 16 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom
  const n = data.length
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.cost]), 1)
  const groupW = cW / n
  const barW = Math.min(groupW * 0.32, 28)

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: (PAD.top + cH - f * cH).toFixed(1),
    label: formatRp(f * maxVal),
  }))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="cfIncomeG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="cfCostG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y}
            stroke={i === 0 ? '#cbd5e1' : '#e2e8f0'} strokeWidth={i === 0 ? 1.5 : 1}
            strokeDasharray={i === 0 ? '0' : '4,3'} />
          <text x={PAD.left - 8} y={parseFloat(t.y) + 4} textAnchor="end"
            fontSize="10" fill="#94a3b8">{t.label}</text>
        </g>
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const gx = PAD.left + i * groupW + groupW * 0.12
        const baseY = PAD.top + cH
        const ih = (d.income / maxVal) * cH
        const ch = (d.cost / maxVal) * cH
        const mx = gx + barW + 4
        return (
          <g key={i}>
            {/* Income bar */}
            <rect x={gx} y={baseY - ih} width={barW} height={Math.max(ih, 0)} rx="3" ry="3" fill="url(#cfIncomeG)">
              <title>Income: Rp {formatRpFull(d.income)}</title>
            </rect>
            {/* Cost bar */}
            <rect x={mx} y={baseY - ch} width={barW} height={Math.max(ch, 0)} rx="3" ry="3" fill="url(#cfCostG)">
              <title>Cost: Rp {formatRpFull(d.cost)}</title>
            </rect>
            {/* X label */}
            <text x={gx + barW + 2} y={H - 8} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.month}</text>
          </g>
        )
      })}

      {/* Legend */}
      <g>
        <rect x={PAD.left} y={H - 20} width={10} height={10} rx="2" fill="#10b981" />
        <text x={PAD.left + 14} y={H - 11} fontSize="10" fill="#64748b" fontWeight="600">Income</text>
        <rect x={PAD.left + 68} y={H - 20} width={10} height={10} rx="2" fill="#f87171" />
        <text x={PAD.left + 82} y={H - 11} fontSize="10" fill="#64748b" fontWeight="600">Cost</text>
      </g>
    </svg>
  )
}

// ─── Pie chart ─────────────────────────────────────────────────
function CashflowPieChart({ data, label }: {
  data: { name: string; value: number; color: string }[]
  label: string
}) {
  const SIZE = 200
  const cx = SIZE / 2, cy = SIZE / 2, r = SIZE / 2 - 12
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '0.82rem' }}>
      Tidak ada data {label}
    </div>
  )

  let startAngle = -Math.PI / 2
  const slices = data.map(d => {
    const angle = total > 0 ? (d.value / total) * 2 * Math.PI : 0
    const endAngle = startAngle + angle
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = angle > Math.PI ? 1 : 0
    const path = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`
    const pct = Math.round((d.value / total) * 100)
    startAngle = endAngle
    return { ...d, path, pct }
  })

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: SIZE, height: SIZE, flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="#ffffff" strokeWidth="2.5">
            <title>{s.name}: {s.pct}% — Rp {formatRpFull(s.value)}</title>
          </path>
        ))}
        {/* Centre hole */}
        <circle cx={cx} cy={cy} r={r * 0.45} fill="#ffffff" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">TOTAL</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="800">
          {formatRp(total)}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.name}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Props ─────────────────────────────────────────────────────
interface Props {
  analyticsPreset: string
  analyticsStart: string
  analyticsEnd: string
  onPresetChange: (preset: string) => void
  setAnalyticsStart: (v: string) => void
  setAnalyticsEnd: (v: string) => void
  onDateApply: () => void
}

// ─── Main component ────────────────────────────────────────────
export default function CashflowAnalytics({
  analyticsPreset, analyticsStart, analyticsEnd,
  onPresetChange, setAnalyticsStart, setAnalyticsEnd, onDateApply
}: Props) {
  const [incomeData, setIncomeData] = useState<FinanceRecord[]>([])
  const [costData,   setCostData]   = useState<FinanceRecord[]>([])
  const [loading,    setLoading]    = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const [iRes, cRes] = await Promise.all([
        fetch('/api/finance?type=income'),
        fetch('/api/finance?type=cost'),
      ])
      const iJson = await iRes.json()
      const cJson = await cRes.json()
      setIncomeData((iJson.rows ?? []).map((r: any) => ({ ...r, type: 'income' as const })))
      setCostData((cJson.rows ?? []).map((r: any) => ({ ...r, type: 'cost' as const })))
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // ── Date filtering ──────────────────────────────────────────
  const startMs = analyticsStart ? new Date(analyticsStart + 'T00:00:00').getTime() : 0
  const endMs   = analyticsEnd   ? new Date(analyticsEnd   + 'T23:59:59').getTime() : Date.now()

  function inRange(record: FinanceRecord) {
    if (!record.date) return true
    const d = new Date(record.date).getTime()
    return d >= startMs && d <= endMs
  }

  const income = useMemo(() => incomeData.filter(inRange), [incomeData, startMs, endMs])
  const cost   = useMemo(() => costData.filter(inRange),   [costData,   startMs, endMs])

  // ── KPIs ───────────────────────────────────────────────────
  const totalIncome = income.reduce((s, r) => s + (Number(r.nominal) || 0), 0)
  const totalCost   = cost.reduce(  (s, r) => s + (Number(r.nominal) || 0), 0)
  const net         = totalIncome - totalCost

  // ── Monthly bar chart data ──────────────────────────────────
  const monthlyData = useMemo(() => {
    const map: Record<string, { income: number; cost: number }> = {}
    const addRecord = (r: FinanceRecord, type: 'income' | 'cost') => {
      if (!r.date) return
      const d = new Date(r.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map[key]) map[key] = { income: 0, cost: 0 }
      map[key][type] += Number(r.nominal) || 0
    }
    income.forEach(r => addRecord(r, 'income'))
    cost.forEach(r => addRecord(r, 'cost'))
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => {
        const [y, m] = key.split('-')
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return { month: `${months[parseInt(m) - 1]} ${y.slice(2)}`, income: v.income, cost: v.cost }
      })
  }, [income, cost])

  // ── Category breakdown ──────────────────────────────────────
  function buildCategoryData(records: FinanceRecord[]) {
    const map: Record<string, number> = {}
    records.forEach(r => {
      map[r.category] = (map[r.category] || 0) + (Number(r.nominal) || 0)
    })
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))
  }

  const incomeCats = useMemo(() => buildCategoryData(income), [income])
  const costCats   = useMemo(() => buildCategoryData(cost),   [cost])

  // ── Head-to-head by category ────────────────────────────────
  const allCategories = useMemo(() => {
    const set = new Set([...income.map(r => r.category), ...cost.map(r => r.category)])
    const incMap: Record<string, number> = {}
    const cosMap: Record<string, number> = {}
    income.forEach(r => { incMap[r.category] = (incMap[r.category] || 0) + (Number(r.nominal) || 0) })
    cost.forEach(r =>   { cosMap[r.category] = (cosMap[r.category] || 0) + (Number(r.nominal) || 0) })
    return Array.from(set).map(cat => ({
      cat,
      income: incMap[cat] || 0,
      cost:   cosMap[cat] || 0,
      net:    (incMap[cat] || 0) - (cosMap[cat] || 0),
    })).sort((a, b) => (b.income + b.cost) - (a.income + a.cost))
  }, [income, cost])

  const maxH2H = Math.max(...allCategories.flatMap(c => [c.income, c.cost]), 1)

  return (
    <div>
      {/* ── Header section ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        <button className={styles.analyticsRefreshBtn} onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1.5px solid #6ee7b7', borderRadius: 18, padding: '18px 22px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Income</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#064e3b' }}>Rp {formatRpFull(totalIncome)}</div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: 4 }}>{income.length} transaksi</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fff1f2, #fee2e2)', border: '1.5px solid #fca5a5', borderRadius: 18, padding: '18px 22px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Cost</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7f1d1d' }}>Rp {formatRpFull(totalCost)}</div>
          <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: 4 }}>{cost.length} transaksi</div>
        </div>
        <div style={{
          background: net >= 0 ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' : 'linear-gradient(135deg, #fff1f2, #fee2e2)',
          border: `1.5px solid ${net >= 0 ? '#6ee7b7' : '#fca5a5'}`, borderRadius: 18, padding: '18px 22px'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: net >= 0 ? '#059669' : '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {net >= 0 ? '● Surplus' : '● Deficit'}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: net >= 0 ? '#064e3b' : '#7f1d1d' }}>Rp {formatRpFull(Math.abs(net))}</div>
          <div style={{ fontSize: '0.75rem', color: net >= 0 ? '#34d399' : '#f87171', marginTop: 4 }}>
            {net >= 0 ? 'Perusahaan dalam kondisi UNTUNG' : 'Perusahaan dalam kondisi RUGI'}
          </div>
        </div>
      </div>

      {/* ── Bar chart ── */}
      <div className={styles.analyticsMiniChart} style={{ marginBottom: 24 }}>
        <div className={styles.analyticsMiniChartHeader}>
          <div>
            <div className={styles.analyticsMiniChartTitle}>Income vs Cost — Per Bulan</div>
            <div className={styles.analyticsMiniChartSub}>
              Performa keuangan bulanan selama periode dipilih
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: '#10b981' }}>
              <TrendingUp size={14} /> Income
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: '#ef4444' }}>
              <TrendingDown size={14} /> Cost
            </span>
          </div>
        </div>
        <div className={styles.analyticsMiniChartSvgWrap}>
          <CashflowBarChart data={monthlyData} />
        </div>
      </div>

      {/* ── Pie charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Income pie */}
        <div className={styles.analyticsTableCard}>
          <div className={styles.analyticsTableHeader}>
            <div>
              <h3 className={styles.analyticsTableTitle} style={{ color: '#15803d' }}>Breakdown Income by Kategori</h3>
              <p className={styles.analyticsTableSubtitle}>Proporsi pemasukan per kategori</p>
            </div>
          </div>
          <div style={{ padding: '0 8px 8px' }}>
            <CashflowPieChart data={incomeCats} label="income" />
          </div>
        </div>

        {/* Cost pie */}
        <div className={styles.analyticsTableCard}>
          <div className={styles.analyticsTableHeader}>
            <div>
              <h3 className={styles.analyticsTableTitle} style={{ color: '#be123c' }}>Breakdown Cost by Kategori</h3>
              <p className={styles.analyticsTableSubtitle}>Proporsi pengeluaran per kategori</p>
            </div>
          </div>
          <div style={{ padding: '0 8px 8px' }}>
            <CashflowPieChart data={costCats} label="cost" />
          </div>
        </div>
      </div>

      {/* ── Head-to-head table ── */}
      {allCategories.length > 0 && (
        <div className={styles.analyticsTableCard} style={{ marginBottom: 24 }}>
          <div className={styles.analyticsTableHeader}>
            <div>
              <h3 className={styles.analyticsTableTitle}>Head-to-Head Income vs Cost</h3>
              <p className={styles.analyticsTableSubtitle}>Perbandingan per kategori — hijau = untung, merah = rugi</p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.analyticsTable}>
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Kategori</th>
                  <th style={{ width: '22%', textAlign: 'right' }}>Income</th>
                  <th style={{ width: '22%', textAlign: 'right' }}>Cost</th>
                  <th style={{ width: '28%', textAlign: 'right' }}>Net (Surplus/Deficit)</th>
                </tr>
              </thead>
              <tbody>
                {allCategories.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.cat}</span>
                      </div>
                      {/* Progress bar */}
                      <div style={{ marginTop: 6, height: 4, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 999, width: `${((row.income + row.cost) / (maxH2H * 2)) * 100}%`, background: PALETTE[i % PALETTE.length] }} />
                      </div>
                    </td>
                    <td className={styles.analyticsClickCount} style={{ textAlign: 'right', color: '#15803d' }}>
                      {row.income > 0 ? `Rp ${formatRpFull(row.income)}` : '—'}
                    </td>
                    <td className={styles.analyticsClickCount} style={{ textAlign: 'right', color: '#be123c' }}>
                      {row.cost > 0 ? `Rp ${formatRpFull(row.cost)}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 800,
                        background: row.net >= 0 ? '#d1fae5' : '#fee2e2',
                        color: row.net >= 0 ? '#065f46' : '#991b1b'
                      }}>
                        {row.net >= 0 ? '+' : '−'} Rp {formatRpFull(Math.abs(row.net))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Summary footer */}
              <tfoot>
                <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0d3369', fontSize: '0.85rem' }}>TOTAL</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#15803d', fontSize: '0.85rem' }}>Rp {formatRpFull(totalIncome)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#be123c', fontSize: '0.85rem' }}>Rp {formatRpFull(totalCost)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{
                      padding: '6px 14px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 900,
                      background: net >= 0 ? '#064e3b' : '#7f1d1d',
                      color: net >= 0 ? '#d1fae5' : '#fee2e2'
                    }}>
                      {net >= 0 ? '▲ SURPLUS' : '▼ DEFICIT'} Rp {formatRpFull(Math.abs(net))}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Period result card ── */}
      <div style={{
        background: net >= 0
          ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
          : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
        borderRadius: 20, padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: `0 8px 32px ${net >= 0 ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)'}`,
        gap: 20, flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: net >= 0 ? '#6ee7b7' : '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Laporan Periode
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
            {net >= 0 ? '▲ SURPLUS' : '▼ DEFICIT'} Rp {formatRpFull(Math.abs(net))}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>
            {net >= 0
              ? `Perusahaan untung sebesar Rp ${formatRpFull(net)} pada periode ini.`
              : `Perusahaan rugi sebesar Rp ${formatRpFull(Math.abs(net))} pada periode ini.`}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Total Income</span>
            <span style={{ fontSize: '0.88rem', color: '#6ee7b7', fontWeight: 800 }}>Rp {formatRpFull(totalIncome)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Total Cost</span>
            <span style={{ fontSize: '0.88rem', color: '#fca5a5', fontWeight: 800 }}>Rp {formatRpFull(totalCost)}</span>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Net</span>
            <span style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 900 }}>
              {net >= 0 ? '+' : '−'} Rp {formatRpFull(Math.abs(net))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
