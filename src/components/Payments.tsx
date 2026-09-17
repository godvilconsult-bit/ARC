import { useState } from 'react'
import { Search, X, Copy, ChevronDown, Loader2 } from 'lucide-react'
import { formatUSD, formatDateTime, formatDate, STATUS_BADGE, STATUS_LABELS } from '../data/demo'
import { useTransactions, useCustomers } from '../lib/useDb'
import type { DbTransaction } from '../lib/useDb'
import { toast } from 'sonner'

function TxDetail({ tx, customerName, onClose }: { tx: DbTransaction; customerName: string; onClose: () => void }) {
  const copy = (val: string) => { void navigator.clipboard.writeText(val); toast.success('Copied') }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <div>
            <h2 className="font-semibold text-[var(--ink)]">Transaction Details</h2>
            <p className="mono text-xs text-[var(--muted)] mt-0.5">{tx.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)]"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-[var(--surface-muted)] rounded-xl p-5 text-center">
            <div className="display text-3xl font-bold text-[var(--ink)] tabular">{formatUSD(tx.amount)}</div>
            <div className="text-sm text-[var(--muted)] mt-1">{tx.currency}</div>
            <span className={`inline-flex items-center mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[tx.status]}`}>
              {STATUS_LABELS[tx.status]}
            </span>
          </div>
          {[
            ['Payment ID', tx.id],
            ['Customer', customerName],
            ['Type', tx.type.charAt(0).toUpperCase() + tx.type.slice(1)],
            ...(tx.sender ? [['Sender', tx.sender]] : []),
            ...(tx.recipient ? [['Recipient', tx.recipient]] : []),
            ['Network / Settlement', tx.network ?? 'Arc'],
            ['Fee', tx.fee !== undefined && tx.fee !== null ? `$${Number(tx.fee).toFixed(2)} USDC` : '—'],
            ['Created', formatDateTime(tx.created_at)],
            ...(tx.request_id ? [['API Request ID', tx.request_id]] : []),
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-xs font-medium text-[var(--subtle)] w-36 flex-shrink-0">{label}</span>
              <div className="flex items-center gap-2 text-right">
                <span className={`text-sm text-[var(--ink)] ${label === 'Payment ID' || label === 'API Request ID' ? 'mono text-xs' : ''}`}>{value}</span>
                {(label === 'Payment ID' || label === 'API Request ID') && (
                  <button onClick={() => copy(value)} className="p-1 rounded hover:bg-[var(--surface-muted)] text-[var(--muted)]"><Copy size={12} /></button>
                )}
              </div>
            </div>
          ))}
          {tx.metadata && Object.keys(tx.metadata).length > 0 && (
            <div className="bg-[var(--surface-muted)] rounded-lg p-4">
              <p className="text-xs font-semibold text-[var(--subtle)] mb-2 uppercase tracking-wide">Metadata</p>
              {Object.entries(tx.metadata).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-1">
                  <span className="text-[var(--muted)]">{k}</span>
                  <span className="mono text-[var(--ink)]">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Payments() {
  const { data: transactions, loading } = useTransactions()
  const { data: customers } = useCustomers()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<DbTransaction | null>(null)

  const customerName = (id: string) => customers.find(c => c.id === id)?.name ?? id

  const filtered = transactions.filter(tx => {
    const q = search.toLowerCase()
    const name = customerName(tx.customer_id)
    const matchesSearch = !q || tx.id.toLowerCase().includes(q) || name.toLowerCase().includes(q) || tx.amount.toString().includes(q)
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-bold text-[var(--ink)]">Payments</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {loading ? 'Loading…' : `${transactions.length} transactions`}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--ink)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--subtle)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, customer, amount…"
              className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--subtle)] pointer-events-none" />
          </div>
          {(search || statusFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setStatusFilter('all') }} className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-[var(--danger)] hover:bg-red-50 rounded-xl transition-colors">
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-[var(--muted)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading transactions…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                  {['Transaction ID', 'Customer', 'Amount', 'Currency', 'Type', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--subtle)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[var(--muted)]">No transactions match your search</td></tr>
                )}
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-[var(--surface-muted)] transition-colors">
                    <td className="px-5 py-3.5 mono text-xs text-[var(--accent-blue)]">{tx.id}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-[var(--ink)]">{customerName(tx.customer_id)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold tabular text-[var(--ink)]">{formatUSD(tx.amount)}</td>
                    <td className="px-5 py-3.5 text-xs font-medium text-[var(--muted)]">{tx.currency}</td>
                    <td className="px-5 py-3.5 capitalize text-sm text-[var(--muted)]">{tx.type}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_BADGE[tx.status]}`}>
                        {STATUS_LABELS[tx.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--muted)] tabular whitespace-nowrap">{formatDate(tx.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelected(tx)} className="text-xs text-[var(--accent-blue)] font-medium hover:underline">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-[var(--border)] text-xs text-[var(--muted)]">
          Showing {filtered.length} of {transactions.length} transactions
        </div>
      </div>

      {selected && (
        <TxDetail
          tx={selected}
          customerName={customerName(selected.customer_id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
