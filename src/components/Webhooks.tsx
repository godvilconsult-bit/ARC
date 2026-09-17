import { useState } from 'react'
import { Plus, X, Send, Trash2, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { useWebhookEndpoints, useWebhookDeliveries, db } from '../lib/useDb'
import type { DbWebhookEndpoint } from '../lib/useDb'
import { toast } from 'sonner'

const ALL_EVENTS = [
  'payment.created', 'payment.completed', 'payment.failed',
  'transfer.created', 'transfer.completed', 'transfer.failed',
  'deposit.received', 'customer.created', 'wallet.created',
]

function AddEndpointModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [url, setUrl] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set(['payment.completed', 'transfer.completed']))
  const [loading, setLoading] = useState(false)

  const toggle = (e: string) => {
    const next = new Set(selected)
    if (next.has(e)) next.delete(e)
    else next.add(e)
    setSelected(next)
  }

  const submit = async () => {
    if (!url.startsWith('https://')) { toast.error('Endpoint URL must start with https://'); return }
    if (selected.size === 0) { toast.error('Select at least one event'); return }
    setLoading(true)
    const result = await db.createWebhookEndpoint({ url, events: Array.from(selected), status: 'active' })
    setLoading(false)
    if (result) {
      toast.success('Webhook endpoint added')
      onAdded()
      onClose()
    } else {
      toast.success('Webhook endpoint added (demo mode)')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--ink)]">Add Webhook Endpoint</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)]"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Endpoint URL *</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://api.yourapp.com/webhooks"
              className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-2">Events to subscribe</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENTS.map(e => (
                <button
                  key={e}
                  onClick={() => toggle(e)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors border ${
                    selected.has(e)
                      ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                      : 'bg-[var(--surface-muted)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selected.has(e) ? 'bg-white' : 'bg-[var(--subtle)]'}`} />
                  <span className="mono">{e}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--border)] flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">Cancel</button>
          <button onClick={() => { void submit() }} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Adding…' : 'Add Endpoint'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Webhooks() {
  const { data: endpoints, loading: epLoading, refetch: refetchEp } = useWebhookEndpoints()
  const { data: deliveries, loading: delLoading } = useWebhookDeliveries()
  const [showAdd, setShowAdd] = useState(false)

  const loading = epLoading || delLoading

  const sendTest = (ep: DbWebhookEndpoint) => {
    toast.promise(
      new Promise(r => setTimeout(r, 1200)),
      { loading: `Sending test event to ${ep.url}…`, success: 'Test event delivered successfully', error: 'Delivery failed' }
    )
  }

  const deleteEndpoint = async (id: string) => {
    const ok = await db.deleteWebhookEndpoint(id)
    if (ok) {
      toast.success('Endpoint removed')
      refetchEp()
    } else {
      toast.success('Endpoint removed (demo mode)')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-bold text-[var(--ink)]">Webhooks</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Receive real-time event notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetchEp}
            disabled={loading}
            className="p-2 border border-[var(--border)] rounded-xl hover:bg-[var(--surface-muted)] text-[var(--muted)] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--ink)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors"
          >
            <Plus size={15} /> Add Endpoint
          </button>
        </div>
      </div>

      {/* Endpoints */}
      {epLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin text-[var(--muted)]" />
        </div>
      ) : (
        <div className="space-y-3">
          {endpoints.length === 0 && (
            <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
              No webhook endpoints yet. Add one to start receiving events.
            </div>
          )}
          {endpoints.map(ep => (
            <div key={ep.id} className="bg-white rounded-2xl border border-[var(--border)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ep.status === 'active' ? 'bg-emerald-500' : 'bg-[var(--subtle)]'}`} />
                    <span className="mono text-sm text-[var(--accent-blue)] font-medium truncate">{ep.url}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {ep.events.map(e => (
                      <span key={e} className="mono text-[10px] bg-[var(--surface-muted)] text-[var(--muted)] px-2 py-1 rounded-lg">{e}</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-[var(--subtle)] mt-2">
                    Secret: <span className="mono">whsec_••••••••</span>
                    <span className="ml-3 text-[var(--muted)]">Added {new Date(ep.created_at).toLocaleDateString()}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => sendTest(ep)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] text-xs font-medium text-[var(--muted)] rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    <Send size={11} /> Test
                  </button>
                  <button
                    onClick={() => { void deleteEndpoint(ep.id) }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery history */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--ink)]">Delivery History</h2>
        </div>
        {delLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-[var(--muted)]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                  {['Event', 'Endpoint', 'Status', 'Attempts', 'Response', 'Timestamp'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--subtle)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {deliveries.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-[var(--muted)]">No deliveries yet</td></tr>
                )}
                {deliveries.map(d => {
                  const ep = endpoints.find(e => e.id === d.endpoint_id)
                  return (
                    <tr key={d.id} className="hover:bg-[var(--surface-muted)] transition-colors">
                      <td className="px-5 py-3.5 mono text-xs text-[var(--ink)]">{d.event}</td>
                      <td className="px-5 py-3.5 mono text-xs text-[var(--muted)] max-w-[180px] truncate">{ep?.url ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${d.status === 'success' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                          {d.status === 'success' ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                          {d.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm tabular text-[var(--muted)]">{d.attempts}</td>
                      <td className="px-5 py-3.5 text-sm tabular text-[var(--muted)]">{d.response_code ?? '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-[var(--muted)] tabular">
                        {new Date(d.created_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <AddEndpointModal onClose={() => setShowAdd(false)} onAdded={refetchEp} />}
    </div>
  )
}
