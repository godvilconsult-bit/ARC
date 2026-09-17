import { useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Users, Zap, AlertTriangle, Webhook } from 'lucide-react'
import { VOLUME_DATA, ANALYTICS_7D, formatNumber, formatUSD } from '../data/demo'

type Range = '7D' | '30D' | '90D' | '1Y'

function BarChart({ data, label }: { data: typeof VOLUME_DATA; label: string }) {
  const max = Math.max(...data.map(d => d.volume))
  return (
    <div>
      <p className="text-xs font-semibold text-[var(--muted)] mb-3">{label}</p>
      <div className="flex items-end gap-1 h-24">
        {data.map((d, i) => {
          const h = (d.volume / max) * 100
          const isLast = i === data.length - 1
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                style={{ height: `${h}%` }}
                className={`w-full rounded-t-sm transition-all ${isLast ? 'bg-[var(--ink)]' : 'bg-[var(--border)] group-hover:bg-[var(--accent-mid)]'}`}
                title={`${d.day}: ${formatUSD(d.volume)}`}
              />
              {i % 4 === 0 && <span className="text-[9px] text-[var(--subtle)] hidden sm:block">{d.day.split(' ')[1]}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Analytics() {
  const [range, setRange] = useState<Range>('7D')

  const stats = [
    { label: 'Total Volume', value: formatUSD(ANALYTICS_7D.totalVolume), sub: `${range}`, trend: 12.4, icon: <TrendingUp size={15} className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'Transactions', value: formatNumber(ANALYTICS_7D.totalCount), sub: `${range}`, trend: 8.1, icon: <Activity size={15} className="text-violet-600" />, color: 'bg-violet-50' },
    { label: 'Avg Transaction', value: formatUSD(ANALYTICS_7D.avgTx), sub: `${range}`, trend: 3.2, icon: <Zap size={15} className="text-emerald-600" />, color: 'bg-emerald-50' },
    { label: 'Success Rate', value: `${ANALYTICS_7D.successRate}%`, sub: `${range}`, trend: 0.1, icon: <TrendingUp size={15} className="text-teal-600" />, color: 'bg-teal-50' },
    { label: 'Failed Transactions', value: formatNumber(ANALYTICS_7D.failedTx), sub: `${range}`, trend: -1.4, icon: <AlertTriangle size={15} className="text-red-600" />, color: 'bg-red-50' },
    { label: 'Active Customers', value: formatNumber(ANALYTICS_7D.activeCustomers), sub: `${range}`, trend: 5.6, icon: <Users size={15} className="text-amber-600" />, color: 'bg-amber-50' },
    { label: 'API Requests', value: formatNumber(ANALYTICS_7D.apiRequests), sub: `${range}`, trend: 14.2, icon: <Activity size={15} className="text-indigo-600" />, color: 'bg-indigo-50' },
    { label: 'Webhook Deliveries', value: formatNumber(ANALYTICS_7D.webhookDeliveries), sub: `${range}`, trend: 9.8, icon: <Webhook size={15} className="text-orange-600" />, color: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-bold text-[var(--ink)]">Analytics</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Platform metrics and performance</p>
        </div>
        <div className="flex gap-1 bg-[var(--surface-muted)] rounded-xl p-1">
          {(['7D', '30D', '90D', '1Y'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${range === r ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--muted)]'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[var(--border)] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--subtle)]">{s.label}</span>
              <div className={`w-7 h-7 rounded-lg ${s.color} flex items-center justify-center`}>{s.icon}</div>
            </div>
            <div className="display text-2xl font-bold text-[var(--ink)] tabular">{s.value}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-[var(--subtle)]">{s.sub}</span>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.trend >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {s.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(s.trend)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <h2 className="font-semibold text-[var(--ink)] mb-5">Payment Volume ({range})</h2>
        <BarChart data={VOLUME_DATA} label="" />
      </div>

      {/* Volume breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
          <h3 className="font-semibold text-[var(--ink)] mb-4">Volume by Type</h3>
          <div className="space-y-3">
            {[
              { label: 'Payments', pct: 48, value: '$421,866' },
              { label: 'Transfers', pct: 31, value: '$271,838' },
              { label: 'Bridge', pct: 14, value: '$122,811' },
              { label: 'Swap', pct: 7, value: '$61,405' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--muted)]">{item.label}</span>
                  <span className="font-semibold tabular text-[var(--ink)]">{item.value}</span>
                </div>
                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--ink)] rounded-full"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
          <h3 className="font-semibold text-[var(--ink)] mb-4">Top Networks</h3>
          <div className="space-y-3">
            {[
              { label: 'Arc', pct: 72, value: '$631,198' },
              { label: 'Ethereum', pct: 14, value: '$122,811' },
              { label: 'Base', pct: 9, value: '$78,950' },
              { label: 'Polygon', pct: 5, value: '$43,861' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--muted)]">{item.label}</span>
                  <span className="font-semibold tabular text-[var(--ink)]">{item.value}</span>
                </div>
                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-blue)] rounded-full"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
