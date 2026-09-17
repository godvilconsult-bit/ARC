import { useState } from 'react'
import { Search, Plus, X, Users, CreditCard, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react'
import { formatUSD, formatDate, STATUS_BADGE, STATUS_LABELS } from '../data/demo'
import { useCustomers, useWallets, useTransactions, db } from '../lib/useDb'
import type { DbCustomer } from '../lib/useDb'
import { toast } from 'sonner'

function CustomerDetail({
  c, walletBalance, walletNetwork, walletId, walletStatus, recentTxns, onClose
}: {
  c: DbCustomer
  walletBalance: number
  walletNetwork: string
  walletId: string
  walletStatus: string
  recentTxns: Array<{ id: string; type: string; amount: number; status: string }>
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--ink)] flex items-center justify-center text-white font-bold text-sm">
              {c.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 className="font-semibold text-[var(--ink)]">{c.name}</h2>
              <p className="mono text-xs text-[var(--muted)]">{c.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_BADGE[c.status]}`}>{STATUS_LABELS[c.status]}</span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)]"><X size={16} /></button>
          </div>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Available Balance', value: formatUSD(c.balance ?? 0) },
              { label: 'Transactions', value: (c.transaction_count ?? 0).toLocaleString() },
              { label: 'Member Since', value: formatDate(c.created_at) },
            ].map(s => (
              <div key={s.label} className="bg-[var(--surface-muted)] rounded-xl p-3.5 text-center">
                <div className="display text-lg font-bold text-[var(--ink)] tabular">{s.value}</div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              ['Email', c.email],
              ['Phone', c.phone ?? '—'],
              ['Country', c.country ?? '—'],
              ['Verification', c.verified ? 'Verified' : 'Unverified'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-xs text-[var(--subtle)]">{label}</span>
                <span className={`text-sm font-medium ${label === 'Verification' ? (c.verified ? 'text-[var(--success)]' : 'text-amber-600') : 'text-[var(--ink)]'}`}>
                  {label === 'Verification' ? (
                    <span className="flex items-center gap-1">
                      {c.verified ? <CheckCircle size={13} /> : <Clock size={13} />}
                      {value}
                    </span>
                  ) : value}
                </span>
              </div>
            ))}
          </div>
          {walletId && (
            <div className="bg-[var(--surface-muted)] rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--subtle)] mb-2">Wallet</p>
              <div className="flex justify-between items-center">
                <span className="mono text-xs text-[var(--muted)]">{walletId}</span>
                <span className="text-sm font-semibold tabular text-[var(--ink)]">{formatUSD(walletBalance)} USDC</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-[var(--muted)]">Network: {walletNetwork}</span>
                <span className={`text-[11px] font-semibold ${STATUS_BADGE[walletStatus] ?? ''}`}>{STATUS_LABELS[walletStatus] ?? walletStatus}</span>
              </div>
            </div>
          )}
          {recentTxns.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--subtle)] mb-2">Recent Transactions</p>
              <div className="space-y-1.5">
                {recentTxns.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between bg-[var(--surface-muted)] rounded-lg px-3.5 py-2.5">
                    <div>
                      <div className="mono text-xs text-[var(--accent-blue)]">{tx.id}</div>
                      <div className="text-xs text-[var(--muted)] mt-0.5 capitalize">{tx.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold tabular text-[var(--ink)]">{formatUSD(tx.amount)}</div>
                      <span className={`text-[10px] font-semibold ${STATUS_BADGE[tx.status] ?? ''}`}>{STATUS_LABELS[tx.status] ?? tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={() => toast.success('Payment initiated')} className="flex items-center justify-center gap-1.5 py-2.5 bg-[var(--ink)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">
              <CreditCard size={14} /> Send Payment
            </button>
            <button onClick={() => toast.success('Request sent')} className="flex items-center justify-center gap-1.5 py-2.5 border border-[var(--border)] text-[var(--ink)] text-sm font-semibold rounded-xl hover:bg-[var(--surface-muted)] transition-colors">
              Request Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateCustomerModal({ onRefresh, onClose }: { onRefresh: () => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: 'United States' })
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return }
    setLoading(true)
    const result = await db.createCustomer({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      country: form.country,
      status: 'active',
      balance: 0,
      verified: false,
      transaction_count: 0,
    })
    setLoading(false)
    if (!result) { toast.error('Failed to create customer — check Supabase config'); return }
    toast.success(`Customer ${form.name} created`)
    onRefresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--ink)]">Create Customer</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)]"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { id: 'name', label: 'Company / Full Name', placeholder: 'Acme Corp' },
            { id: 'email', label: 'Email address', placeholder: 'billing@acmecorp.io' },
            { id: 'phone', label: 'Phone (optional)', placeholder: '+1 415 555 0000' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">{f.label}</label>
              <input
                value={form[f.id as keyof typeof form]}
                onChange={e => setForm({ ...form, [f.id]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Country</label>
            <select
              value={form.country}
              onChange={e => setForm({ ...form, country: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)]"
            >
              {['United States', 'United Kingdom', 'Germany', 'Singapore', 'Australia', 'Canada', 'Japan', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--border)] flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">Cancel</button>
          <button onClick={() => { void submit() }} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Creating…' : 'Create Customer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Customers() {
  const { data: customers, loading, refetch } = useCustomers()
  const { data: wallets } = useWallets()
  const { data: transactions } = useTransactions()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<DbCustomer | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.country ?? '').toLowerCase().includes(q)
  })

  const getWallet = (id: string) => wallets.find(w => w.customer_id === id)
  const getTxns = (id: string) => transactions.filter(t => t.customer_id === id).slice(0, 5).map(t => ({
    id: t.id, type: t.type, amount: t.amount, status: t.status
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-bold text-[var(--ink)]">Customers</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {loading ? 'Loading…' : `${customers.length} customers · ${customers.filter(c => c.status === 'active').length} active`}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--ink)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">
          <Plus size={15} /> New Customer
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, icon: <Users size={15} /> },
          { label: 'Active', value: customers.filter(c => c.status === 'active').length, icon: <CheckCircle size={15} /> },
          { label: 'Pending KYC', value: customers.filter(c => c.status === 'pending_kyc').length, icon: <AlertCircle size={15} /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[var(--border)] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-muted)] flex items-center justify-center text-[var(--muted)]">{s.icon}</div>
            <div>
              <div className="display text-xl font-bold text-[var(--ink)] tabular">{s.value}</div>
              <div className="text-xs text-[var(--muted)]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--subtle)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers…"
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-[var(--muted)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading customers…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                  {['Customer', 'Contact', 'Country', 'Balance', 'Transactions', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--subtle)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[var(--muted)]">No customers yet. Create your first one.</td></tr>
                )}
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--surface-muted)] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--muted)]">
                          {c.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--ink)]">{c.name}</div>
                          <div className="mono text-[10px] text-[var(--subtle)]">{c.id.slice(0, 12)}…</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--muted)]">{c.email}</td>
                    <td className="px-5 py-3.5 text-sm text-[var(--muted)]">{c.country ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold tabular text-[var(--ink)]">{formatUSD(c.balance ?? 0)}</td>
                    <td className="px-5 py-3.5 text-sm tabular text-[var(--muted)]">{(c.transaction_count ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_BADGE[c.status] ?? ''}`}>
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelected(c)} className="text-xs text-[var(--accent-blue)] font-medium hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (() => {
        const w = getWallet(selected.id)
        const txns = getTxns(selected.id)
        return (
          <CustomerDetail
            c={selected}
            walletBalance={w?.balance ?? 0}
            walletNetwork={w?.network ?? 'Arc'}
            walletId={w?.id ?? ''}
            walletStatus={w?.status ?? ''}
            recentTxns={txns}
            onClose={() => setSelected(null)}
          />
        )
      })()}
      {showCreate && <CreateCustomerModal onRefresh={refetch} onClose={() => setShowCreate(false)} />}
    </div>
  )
}
