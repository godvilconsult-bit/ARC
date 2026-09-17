import { useState } from 'react'
import { TrendingUp, TrendingDown, ArrowUpRight, Users, Wallet, CreditCard, Zap, Activity, Loader2 } from 'lucide-react'
import { VOLUME_DATA, formatUSD, formatDateTime, STATUS_BADGE, STATUS_LABELS } from '../data/demo'
import { useTransactions, useCustomers, useWallets } from '../lib/useDb'
import type { DashboardView } from './Sidebar'
interface Props { onNavigate: (v: DashboardView) => void }

function StatCard({ label, value, sub, trend, icon, color }: {
  label: string; value: string; sub: string; trend?: number; icon: React.ReactNode; color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--subtle)]">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <div>
        <div className="display text-2xl font-bold text-[var(--ink)] tabular">{value}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs text-[var(--subtle)]">{sub}</span>
          {trend !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniChart({ data }: { data: typeof VOLUME_DATA }) {
  const max = Math.max(...data.map(d => d.volume))
  const w = 500
  const h = 80
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - (d.volume / max) * h * 0.85 - 6
    return `${x},${y}`
  }).join(' ')

  const fillPts = `0,${h} ${pts} ${w},${h}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-16">
      <defs>
        <linearGradient id="vol-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#vol-grad)" />
      <polyline points={pts} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * w
        const y = h - (d.volume / max) * h * 0.85 - 6
        if (i === data.length - 1) return <circle key={i} cx={x} cy={y} r="3" fill="#2563eb" />
        return null
      })}
    </svg>
  )
}

export default function Overview({ onNavigate }: Props) {
  const [range] = useState<'7D' | '30D'>('30D')
  const { data: transactions, loading: txLoading } = useTransactions()
  const { data: customers } = useCustomers()
  const { data: wallets } = useWallets()

  // Compute live stats (fall back to indicative values while loading)
  const totalVolume = transactions.reduce((s, t) => s + t.amount, 0)
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const totalBalance = wallets.reduce((s, w) => s + (w.balance ?? 0), 0)
  const pendingBalance = wallets.reduce((s, w) => s + (w.pending ?? 0), 0)
  const successCount = transactions.filter(t => t.status === 'completed').length
  const successRate = transactions.length ? ((successCount / transactions.length) * 100).toFixed(1) : '—'

  const stats = [
    { label: 'Total Volume', value: txLoading ? '…' : formatUSD(totalVolume), sub: 'All transactions', trend: 12.4, icon: <TrendingUp size={16} className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'Transactions', value: txLoading ? '…' : transactions.length.toLocaleString(), sub: 'Total recorded', trend: 8.1, icon: <Activity size={16} className="text-violet-600" />, color: 'bg-violet-50' },
    { label: 'Active Customers', value: txLoading ? '…' : activeCustomers.toLocaleString(), sub: 'Across all platforms', trend: 3.2, icon: <Users size={16} className="text-emerald-600" />, color: 'bg-emerald-50' },
    { label: 'Available Balance', value: txLoading ? '…' : formatUSD(totalBalance), sub: 'Ready to transfer', icon: <Wallet size={16} className="text-amber-600" />, color: 'bg-amber-50' },
    { label: 'Pending Transfers', value: txLoading ? '…' : formatUSD(pendingBalance), sub: 'In-flight transfers', icon: <CreditCard size={16} className="text-orange-600" />, color: 'bg-orange-50' },
    { label: 'Success Rate', value: txLoading ? '…' : `${successRate}%`, sub: 'Completed / total', trend: 0.1, icon: <Zap size={16} className="text-teal-600" />, color: 'bg-teal-50' },
  ]

  const recent = transactions.slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-bold text-[var(--ink)]">Overview</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">September 2026 · All platforms</p>
        </div>
        <div className="flex gap-1.5 bg-[var(--surface-muted)] rounded-lg p-1">
          {(['7D', '30D'] as const).map(r => (
            <button key={r} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${range === r ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--muted)]'}`}>{r}</button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Volume Chart */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-[var(--ink)]">Payment Volume</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Sep 1 – Sep 17, 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs text-[var(--muted)]">USDC Volume</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-[var(--subtle)] mb-2 tabular">
          {VOLUME_DATA.filter((_, i) => i % 4 === 0 || i === VOLUME_DATA.length - 1).map(d => (
            <span key={d.day}>{d.day}</span>
          ))}
        </div>
        <MiniChart data={VOLUME_DATA} />
        <div className="flex justify-between mt-2 text-xs text-[var(--subtle)] tabular">
          {VOLUME_DATA.filter((_, i) => i % 4 === 0 || i === VOLUME_DATA.length - 1).map(d => (
            <span key={d.day}>${(d.volume / 1000).toFixed(0)}k</span>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--ink)]">Recent Activity</h2>
          <button
            onClick={() => onNavigate('payments')}
            className="flex items-center gap-1 text-xs text-[var(--accent-blue)] font-medium hover:underline"
          >
            View all <ArrowUpRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Transaction ID', 'Customer', 'Amount', 'Type', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--subtle)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {txLoading && (
                <tr><td colSpan={6} className="px-5 py-12 text-center"><Loader2 size={18} className="animate-spin mx-auto text-[var(--muted)]" /></td></tr>
              )}
              {!txLoading && recent.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--muted)]">No transactions yet</td></tr>
              )}
              {!txLoading && recent.map(tx => (
                <tr key={tx.id} className="hover:bg-[var(--surface-muted)] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5 mono text-xs text-[var(--accent-blue)]">{tx.id.slice(0, 14)}…</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[var(--ink)]">{customers.find(c => c.id === tx.customer_id)?.name ?? tx.customer_id.slice(0, 10)}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold tabular text-[var(--ink)]">{formatUSD(tx.amount)}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--surface-muted)] text-[var(--muted)] capitalize">{tx.type}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_BADGE[tx.status] ?? ''}`}>
                      {STATUS_LABELS[tx.status] ?? tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[var(--muted)] tabular">{formatDateTime(tx.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
