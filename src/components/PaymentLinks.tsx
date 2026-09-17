import { useState } from 'react'
import { Plus, Copy, X, Link, CheckCircle, Loader2 } from 'lucide-react'
import { formatUSD, formatDate, STATUS_BADGE, STATUS_LABELS } from '../data/demo'
import { usePaymentLinks, db } from '../lib/useDb'
import type { DbPaymentLink } from '../lib/useDb'
import { toast } from 'sonner'

function QRCode({ value }: { value: string }) {
  const size = 120
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-[var(--border)]">
      <svg width={size} height={size} viewBox="0 0 120 120">
        <rect width="120" height="120" fill="white" />
        {/* Simplified QR pattern for demo */}
        {Array.from({ length: 11 }, (_, i) =>
          Array.from({ length: 11 }, (__, j) => {
            const seed = (i * 17 + j * 13 + value.charCodeAt(0)) % 3
            if (seed === 0) return <rect key={`${i}-${j}`} x={5 + j * 10} y={5 + i * 10} width="9" height="9" fill="#0f1f35" rx="1" />
            return null
          })
        )}
        {/* Corner squares */}
        <rect x="5" y="5" width="29" height="29" fill="none" stroke="#0f1f35" strokeWidth="3" rx="3" />
        <rect x="11" y="11" width="17" height="17" fill="#0f1f35" rx="2" />
        <rect x="86" y="5" width="29" height="29" fill="none" stroke="#0f1f35" strokeWidth="3" rx="3" />
        <rect x="92" y="11" width="17" height="17" fill="#0f1f35" rx="2" />
        <rect x="5" y="86" width="29" height="29" fill="none" stroke="#0f1f35" strokeWidth="3" rx="3" />
        <rect x="11" y="92" width="17" height="17" fill="#0f1f35" rx="2" />
      </svg>
      <p className="text-[10px] text-[var(--muted)] mt-2 mono">{value}</p>
    </div>
  )
}

function CreateLinkModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ amount: '', description: '', expires: '7' })
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<string | null>(null)

  const submit = async () => {
    if (!form.amount || !form.description) { toast.error('Amount and description required'); return }
    setLoading(true)
    const id = 'pl_' + Math.random().toString(36).slice(2, 8)
    const url = `pay.weka.io/${id}`
    await db.createPaymentLink({
      id,
      amount: Number(form.amount),
      description: form.description,
      currency: 'USDC',
      status: 'active',
      url,
      payments_received: 0,
    })
    setCreated(url)
    setLoading(false)
    onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--ink)]">{created ? 'Payment Link Created' : 'Create Payment Link'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)]"><X size={16} /></button>
        </div>
        {!created ? (
          <>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Amount (USDC)</label>
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
                  placeholder="Design project, Invoice #42…"
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Expiration</label>
                <select
                  value={form.expires}
                  onChange={e => setForm({ ...form, expires: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)]"
                >
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="never">No expiration</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border)] flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">Cancel</button>
              <button onClick={() => { void submit() }} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors disabled:opacity-60">
                {loading ? 'Creating…' : 'Create Link'}
              </button>
            </div>
          </>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div className="flex justify-center">
              <QRCode value={created} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Payment Link</label>
              <div className="flex items-center gap-2 bg-[var(--surface-muted)] rounded-xl px-3.5 py-2.5">
                <span className="flex-1 text-sm mono text-[var(--accent-blue)] truncate">{created}</span>
                <button onClick={() => { void navigator.clipboard.writeText('https://' + created); toast.success('Copied!') }} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                  <Copy size={13} className="text-[var(--muted)]" />
                </button>
              </div>
            </div>
            <div className="bg-[var(--success-bg)] rounded-xl p-3.5 flex items-center gap-2.5">
              <CheckCircle size={15} className="text-[var(--success)] flex-shrink-0" />
              <p className="text-xs text-[var(--success)] font-medium">Your payment link is live and accepting payments</p>
            </div>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors">Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

function PLCard({ pl }: { pl: DbPaymentLink }) {
  const copy = (v: string) => { void navigator.clipboard.writeText(v); toast.success('Copied!') }
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-[var(--ink)]">{pl.description}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5 mono">{pl.id}</div>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_BADGE[pl.status]}`}>{STATUS_LABELS[pl.status]}</span>
      </div>
      <div className="display text-2xl font-bold tabular text-[var(--ink)]">{formatUSD(pl.amount)}</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[var(--surface-muted)] rounded-xl p-3">
          <div className="text-[10px] text-[var(--subtle)]">Received</div>
          <div className="text-sm font-semibold text-[var(--ink)] mt-0.5 tabular">{pl.payments_received} payment{pl.payments_received !== 1 ? 's' : ''}</div>
        </div>
        <div className="bg-[var(--surface-muted)] rounded-xl p-3">
          <div className="text-[10px] text-[var(--subtle)]">Expires</div>
          <div className="text-sm font-semibold text-[var(--ink)] mt-0.5">{pl.expires_at ? formatDate(pl.expires_at) : 'Never'}</div>
        </div>
      </div>
      {pl.url && (
        <div className="flex items-center gap-2 bg-[var(--surface-muted)] rounded-xl px-3 py-2">
          <Link size={12} className="text-[var(--muted)]" />
          <span className="flex-1 text-xs mono text-[var(--accent-blue)] truncate">{pl.url}</span>
          <button onClick={() => copy('https://' + pl.url)} className="p-1.5 hover:bg-white rounded-lg transition-colors">
            <Copy size={12} className="text-[var(--muted)]" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function PaymentLinks() {
  const { data: links, loading, refetch } = usePaymentLinks()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-bold text-[var(--ink)]">Payment Links</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Share a link to collect USDC payments</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--ink)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors"
        >
          <Plus size={15} /> New Link
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-[var(--muted)]" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {links.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl border border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
              No payment links yet. Create your first one.
            </div>
          )}
          {links.map(pl => <PLCard key={pl.id} pl={pl} />)}
        </div>
      )}

      {showCreate && <CreateLinkModal onClose={() => setShowCreate(false)} onCreated={refetch} />}
    </div>
  )
}
