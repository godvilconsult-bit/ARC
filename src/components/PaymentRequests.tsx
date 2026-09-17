import { useState } from 'react'
import { Plus, X, Send, CheckCircle, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-react'
import { formatUSD, formatDate, STATUS_BADGE, STATUS_LABELS } from '../data/demo'
import { usePaymentRequests, db } from '../lib/useDb'
import type { DbPaymentRequest } from '../lib/useDb'
import { toast } from 'sonner'

function CreateRequestModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ from: '', amount: '', description: '', expires: '7' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (!form.from || !form.amount) { toast.error('Recipient and amount required'); return }
    setLoading(true)
    const expiresAt = new Date(Date.now() + Number(form.expires) * 86400000).toISOString()
    await db.createPaymentRequest({
      from_email: form.from,
      amount: Number(form.amount),
      description: form.description,
      status: 'pending',
      expires_at: expiresAt,
    })
    setDone(true)
    setLoading(false)
    onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--ink)]">{done ? 'Request Sent' : 'Request Payment'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)]"><X size={16} /></button>
        </div>
        {!done ? (
          <>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Request payment from *</label>
                <input
                  value={form.from}
                  onChange={e => setForm({ ...form, from: e.target.value })}
                  placeholder="Email, wallet ID, or customer"
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Amount (USDC) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)] font-semibold">$</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-7 pr-4 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] tabular placeholder:text-[var(--subtle)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Invoice #1024, project fee…"
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Expires in</label>
                <select
                  value={form.expires}
                  onChange={e => setForm({ ...form, expires: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)]"
                >
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border)] flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">Cancel</button>
              <button onClick={() => { void submit() }} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                <Send size={13} /> {loading ? 'Sending…' : 'Send Request'}
              </button>
            </div>
          </>
        ) : (
          <div className="px-6 py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--success-bg)] flex items-center justify-center mx-auto">
              <CheckCircle size={24} className="text-[var(--success)]" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)]">Request Sent</div>
              <div className="text-sm text-[var(--muted)] mt-1">
                A payment request for {formatUSD(Number(form.amount))} was sent to {form.from}
              </div>
            </div>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors">Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

const STATUS_ICONS = {
  pending: <Clock size={13} className="text-[var(--pending)]" />,
  paid: <CheckCircle size={13} className="text-[var(--success)]" />,
  expired: <AlertCircle size={13} className="text-[var(--muted)]" />,
  cancelled: <XCircle size={13} className="text-[var(--danger)]" />,
}

function ReqRow({ r }: { r: DbPaymentRequest }) {
  return (
    <tr className="hover:bg-[var(--surface-muted)] transition-colors">
      <td className="px-5 py-3.5 mono text-xs text-[var(--muted)]">{r.id}</td>
      <td className="px-5 py-3.5 text-sm text-[var(--ink)]">{r.from_email}</td>
      <td className="px-5 py-3.5 text-sm font-semibold tabular text-[var(--ink)]">{formatUSD(r.amount)}</td>
      <td className="px-5 py-3.5 text-sm text-[var(--muted)]">{r.description}</td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_BADGE[r.status]}`}>
          {STATUS_ICONS[r.status]}
          {STATUS_LABELS[r.status]}
        </span>
      </td>
      <td className="px-5 py-3.5 text-xs text-[var(--muted)]">{r.expires_at ? formatDate(r.expires_at) : '—'}</td>
      <td className="px-5 py-3.5">
        {r.status === 'pending' && (
          <button onClick={() => toast.success('Reminder sent')} className="text-xs text-[var(--accent-blue)] font-medium hover:underline">
            Remind
          </button>
        )}
      </td>
    </tr>
  )
}

export default function PaymentRequests() {
  const { data: requests, loading, refetch } = usePaymentRequests()
  const [showCreate, setShowCreate] = useState(false)

  const stats = [
    { label: 'Total', count: requests.length },
    { label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { label: 'Paid', count: requests.filter(r => r.status === 'paid').length },
    { label: 'Expired', count: requests.filter(r => r.status === 'expired').length },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-bold text-[var(--ink)]">Payment Requests</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Track and manage payment requests</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--ink)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors"
        >
          <Plus size={15} /> New Request
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[var(--border)] p-4 text-center">
            <div className="display text-xl font-bold text-[var(--ink)] tabular">{s.count}</div>
            <div className="text-xs text-[var(--muted)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-[var(--muted)]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                  {['ID', 'From', 'Amount', 'Description', 'Status', 'Expires', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--subtle)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {requests.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-[var(--muted)]">No payment requests yet</td></tr>
                )}
                {requests.map(r => <ReqRow key={r.id} r={r} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateRequestModal onClose={() => setShowCreate(false)} onCreated={refetch} />}
    </div>
  )
}
