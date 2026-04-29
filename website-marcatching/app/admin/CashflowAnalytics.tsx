'use client'

import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import styles from './admin.module.css'
import type { FinanceRecord } from './FinanceTab'

// ─── Colour palette (Monochromatic Navy/Blue) ────────────────
const PALETTE = [
  '#0d3369', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd',
  '#1e3a8a', '#2563eb', '#3b82f6', '#475569', '#64748b',
  '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#f8fafc'
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
          <stop offset="0%" stopColor="#0d3369" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="cfCostG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y}
            stroke={i === 0 ? '#cbd5e1' : '#f1f5f9'} strokeWidth={i === 0 ? 1 : 1} />
          <text x={PAD.left - 8} y={parseFloat(t.y) + 4} textAnchor="end"
            fontSize="10" fill="#94a3b8" fontWeight="500">{t.label}</text>
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
            <text x={gx + barW + 2} y={baseY + 16} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">{d.month}</text>
          </g>
        )
      })}

      {/* Legend */}
      <g>
        <rect x={PAD.left} y={baseY + 30} width={10} height={10} rx="2" fill="#0d3369" />
        <text x={PAD.left + 14} y={baseY + 39} fontSize="10" fill="#0d3369" fontWeight="700">Income</text>
        <rect x={PAD.left + 72} y={baseY + 30} width={10} height={10} rx="2" fill="#cbd5e1" />
        <text x={PAD.left + 86} y={baseY + 39} fontSize="10" fill="#94a3b8" fontWeight="700">Cost</text>
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
      No {label} data
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
          <path key={i} d={s.path} fill={s.color} stroke="#ffffff" strokeWidth="2">
            <title>{s.name}: {s.pct}% — Rp {formatRpFull(s.value)}</title>
          </path>
        ))}
        {/* Centre hole */}
        <circle cx={cx} cy={cy} r={r * 0.45} fill="#ffffff" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">TOTAL</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="11" fill="#0d3369" fontWeight="900">
          {formatRp(total)}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, whiteSpace: 'nowrap' }}>
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

  // ── Daily bar chart data ──────────────────────────────────
  const monthlyData = useMemo(() => {
    const map: Record<string, { income: number; cost: number }> = {}
    const addRecord = (r: FinanceRecord, type: 'income' | 'cost') => {
      if (!r.date) return
      // Use YYYY-MM-DD for daily grouping
      const key = r.date.substring(0, 10)
      if (!map[key]) map[key] = { income: 0, cost: 0 }
      map[key][type] += Number(r.nominal) || 0
    }
    income.forEach(r => addRecord(r, 'income'))
    cost.forEach(r => addRecord(r, 'cost'))
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => {
        const [y, m, d] = key.split('-')
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return { month: `${d} ${months[parseInt(m) - 1]}`, income: v.income, cost: v.cost }
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
          {loading ? 'Update Data...' : 'Refresh'}
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className={styles.financeKpiCard}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Income</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0d3369', letterSpacing: '-0.02em' }}>Rp {formatRpFull(totalIncome)}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 6, fontWeight: 500 }}>{income.length} transaksi ditransfer</div>
        </div>
        <div className={styles.financeKpiCard}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Cost</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Rp {formatRpFull(totalCost)}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 6, fontWeight: 500 }}>{cost.length} pengeluaran tercatat</div>
        </div>
        <div className={styles.financeKpiCard} style={{ background: '#0d3369', borderColor: '#0d3369' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            {net >= 0 ? 'Net Surplus' : 'Net Deficit'}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>Rp {formatRpFull(Math.abs(net))}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: 6, fontWeight: 500 }}>
            Status: {net >= 0 ? 'Profit Terjaga' : 'Evaluasi Pengeluaran'}
          </div>
        </div>
      </div>

      {/* ── Bar chart ── */}
      <div className={styles.cashflowChartWrap}>
        <div className={styles.analyticsMiniChartHeader}>
          <div>
            <div className={styles.analyticsMiniChartTitle} style={{ color: '#0d3369' }}>Balance Trend</div>
            <div className={styles.analyticsMiniChartSub}>Trend pemasukan &amp; pengeluaran bulanan</div>
          </div>
        </div>
        <div className={styles.analyticsMiniChartSvgWrap} style={{ marginTop: 24 }}>
          <CashflowBarChart data={monthlyData} />
        </div>
      </div>

      {/* ── Pie charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Income pie */}
        <div className={styles.cashflowChartWrap}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d3369', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Income Breakdown</h3>
          <CashflowPieChart data={incomeCats} label="income" />
        </div>

        {/* Cost pie */}
        <div className={styles.cashflowChartWrap}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d3369', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost Breakdown</h3>
          <CashflowPieChart data={costCats} label="cost" />
        </div>
      </div>

      {/* ── Head-to-head table ── */}
      {allCategories.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0d3369' }}>Category Performance</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.financeTable}>
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>Kategori</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Income</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Cost</th>
                  <th style={{ width: '25%', textAlign: 'right' }}>Net</th>
                </tr>
              </thead>
              <tbody>
                {allCategories.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{row.cat}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', color: '#0d3369', fontWeight: 800 }}>
                      {row.income > 0 ? `Rp ${formatRpFull(row.income)}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', color: '#64748b', fontWeight: 700 }}>
                      {row.cost > 0 ? `Rp ${formatRpFull(row.cost)}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 900,
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        color: row.net >= 0 ? '#0d3369' : '#64748b'
                      }}>
                        {row.net >= 0 ? '+' : '−'} Rp {formatRpFull(Math.abs(row.net))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Period result card ── */}
      <div className={styles.cashflowResultCard}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
            Financial Report Summary
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 950, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.04em' }}>
            {net >= 0 ? 'SURPLUS' : 'DEFICIT'} Rp {formatRpFull(Math.abs(net))}
          </div>
          <div className={styles.cashflowResultCardSub} style={{ fontSize: '0.88rem', marginTop: 16, fontWeight: 500 }}>
            {net >= 0
              ? `Marcatching mencatatkan profit sebesar Rp ${formatRpFull(net)} pada periode ini.`
              : `Terjadi defisit anggaran sebesar Rp ${formatRpFull(Math.abs(net))} pada periode ini.`}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 240, padding: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Total Income</span>
            <span style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 800 }}>Rp {formatRpFull(totalIncome)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Total Cost</span>
            <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Rp {formatRpFull(totalCost)}</span>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>Balance</span>
            <span style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 950 }}>
              {net >= 0 ? '+' : '−'} Rp {formatRpFull(Math.abs(net))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
