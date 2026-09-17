import { useState } from 'react'
import { Plus, X, Wallet as WalletIcon, RefreshCw, Activity } from 'lucide-react'
import { formatUSD, formatDate, STATUS_BADGE, STATUS_LABELS } from '../data/demo'
import { useWallets, db } from '../lib/useDb'
import type { DbWallet } from '../lib/useDb'
import { toast } from 'sonner'

function CreateWalletModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [customerId, setCustomerId] = useState('')
  const [network, setNetwork] = useState('Arc')
  const [loading, setLoading] = useState(false)

  const submit = () => {
    if (!customerId) { toast.error('Customer ID is required'); return }
    setLoading(true)
    void db.createWallet({ customer_id: customerId, balance: 0, pending: 0, currency: 'USDC', status: 'active', network, metadata: {} }).then(() => {
      toast.success('Wallet created successfully')
      setLoading(false)
      onCreated()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--ink)]">Create Wallet</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)]"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">
            Create a USDC wallet for a customer. The wallet will use WEKA's unified balance infrastructure powered by Arc.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Customer ID</label>
            <input
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              placeholder="cus_001"
              className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)] mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Network</label>
            <select
              value={network}
              onChange={e => setNetwork(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)]"
            >
              <option value="Arc">Arc (Recommended)</option>
              <option value="Base">Base</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Polygon">Polygon</option>
              <option value="Arbitrum">Arbitrum</option>
            </select>
          </div>
          <div className="bg-blue-50 rounded-xl p-3.5">
            <p className="text-xs text-blue-700 font-medium">Powered by Arc App Kit unified balance. Funds are accessible across supported networks through automatic bridging.</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--border)] flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">Cancel</button>
          <button onClick={submit} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors disabled:opacity-60">
            {loading ? 'Creating…' : 'Create Wallet'}
          </button>
        </div>
      </div>
    </div>
  )
}

function WalletCard({ w }: { w: DbWallet }) {
  const total = w.balance + w.pending
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-[var(--ink)] text-sm">{w.customer_id}</div>
          <div className="mono text-[10px] text-[var(--subtle)] mt-0.5">{w.id}</div>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_BADGE[w.status]}`}>{STATUS_LABELS[w.status]}</span>
      </div>

      <div>
        <div className="text-xs text-[var(--muted)] mb-1">Available Balance</div>
        <div className="display text-2xl font-bold text-[var(--ink)] tabular">{formatUSD(w.balance)}</div>
        <div className="text-xs text-[var(--subtle)] mt-0.5">USDC · {w.network}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[var(--surface-muted)] rounded-xl p-3">
          <div className="text-[10px] text-[var(--subtle)] mb-0.5">Pending</div>
          <div className="text-sm font-semibold tabular text-[var(--warning)]">{formatUSD(w.pending)}</div>
        </div>
        <div className="bg-[var(--surface-muted)] rounded-xl p-3">
          <div className="text-[10px] text-[var(--subtle)] mb-0.5">Total</div>
          <div className="text-sm font-semibold tabular text-[var(--ink)]">{formatUSD(total)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-[var(--subtle)]">Created {formatDate(w.created_at)}</span>
        <div className="flex gap-2">
          <button onClick={() => toast.success('Refreshed')} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--muted)] transition-colors"><RefreshCw size={13} /></button>
          <button onClick={() => toast.success('Viewing activity')} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--muted)] transition-colors"><Activity size={13} /></button>
        </div>
      </div>
    </div>
  )
}

export default function Wallets() {
  const { data: wallets, refetch } = useWallets()
  const [showCreate, setShowCreate] = useState(false)

  const activeWallets = wallets.filter(w => w.status === 'active')
  const totalBalance = activeWallets.reduce((s, w) => s + w.balance, 0)
  const totalPending = wallets.reduce((s, w) => s + w.pending, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-bold text-[var(--ink)]">Wallets</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{wallets.length} wallets · {activeWallets.length} active</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--ink)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors"
        >
          <Plus size={15} /> New Wallet
        </button>
      </div>

      {/* Unified balance summary */}
      <div className="bg-gradient-to-br from-[var(--ink)] to-[#1a3a5f] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-1">
          <WalletIcon size={15} className="opacity-60" />
          <span className="text-xs font-semibold uppercase tracking-[0.08em] opacity-60">Platform Unified Balance</span>
        </div>
        <div className="display text-4xl font-bold tabular mb-1">{formatUSD(totalBalance)}</div>
        <div className="text-sm opacity-70">USDC · Across all active wallets</div>
        <div className="flex gap-8 mt-5">
          <div>
            <div className="text-xs opacity-50 uppercase tracking-wide">Pending</div>
            <div className="text-lg font-semibold tabular mt-0.5">{formatUSD(totalPending)}</div>
          </div>
          <div>
            <div className="text-xs opacity-50 uppercase tracking-wide">Total</div>
            <div className="text-lg font-semibold tabular mt-0.5">{formatUSD(totalBalance + totalPending)}</div>
          </div>
          <div>
            <div className="text-xs opacity-50 uppercase tracking-wide">Wallets</div>
            <div className="text-lg font-semibold tabular mt-0.5">{activeWallets.length}</div>
          </div>
        </div>
        <div className="mt-4 text-[11px] opacity-40 font-medium">Powered by Arc App Kit · Unified Balance Infrastructure</div>
      </div>

      {/* Wallet cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {wallets.map(w => <WalletCard key={w.id} w={w} />)}
      </div>

      {showCreate && <CreateWalletModal onClose={() => setShowCreate(false)} onCreated={refetch} />}
    </div>
  )
}
