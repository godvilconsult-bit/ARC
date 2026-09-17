import { useState } from 'react'
import { ArrowDown, Loader2, CheckCircle, Info } from 'lucide-react'
import { toast } from 'sonner'

const CHAINS = ['Arc', 'Ethereum', 'Base', 'Polygon', 'Arbitrum', 'Optimism']

type Step = 'form' | 'review' | 'bridging' | 'success'

export default function Bridge() {
  const [from, setFrom] = useState('Arc')
  const [to, setTo] = useState('Ethereum')
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [txId, setTxId] = useState('')

  const fee = amount ? Math.max(0.5, Number(amount) * 0.001).toFixed(2) : '0.00'
  const received = amount ? (Number(amount) - Number(fee)).toFixed(2) : '0.00'
  const estTime = from === 'Arc' || to === 'Arc' ? '< 30 seconds' : '2–5 minutes'

  const proceed = () => {
    if (!amount || Number(amount) <= 0) { toast.error('Enter an amount to bridge'); return }
    if (from === to) { toast.error('Source and destination cannot be the same'); return }
    setStep('review')
  }

  const bridge = async () => {
    setStep('bridging')
    await new Promise(r => setTimeout(r, 3000))
    setTxId('brg_' + Math.random().toString(36).slice(2, 10).toUpperCase())
    setStep('success')
  }

  const swap = () => { const tmp = from; setFrom(to); setTo(tmp) }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-bold text-[var(--ink)]">Bridge</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Move USDC between networks instantly</p>
      </div>

      <div className="max-w-md space-y-4">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-2.5">
          <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">Powered by Arc App Kit CCTP bridge. Funds are settled on the destination network in seconds, not minutes.</p>
        </div>

        {step === 'form' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-4">
            {/* From */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">From</label>
              <div className="bg-[var(--surface-muted)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <select
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-[var(--ink)] border-0 outline-none cursor-pointer"
                  >
                    {CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="text-xs font-semibold text-[var(--muted)] bg-white px-2 py-1 rounded-lg border border-[var(--border)]">USDC</span>
                </div>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-lg text-[var(--muted)] font-semibold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-5 bg-transparent display text-2xl font-bold text-[var(--ink)] border-0 outline-none tabular placeholder:text-[var(--subtle)] placeholder:font-normal placeholder:text-xl"
                  />
                </div>
              </div>
            </div>

            {/* Swap button */}
            <div className="flex justify-center">
              <button
                onClick={() => { void swap() }}
                className="w-10 h-10 rounded-full bg-white border-2 border-[var(--border)] flex items-center justify-center hover:border-[var(--ink)] transition-colors"
              >
                <ArrowDown size={16} className="text-[var(--muted)]" />
              </button>
            </div>

            {/* To */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">To</label>
              <div className="bg-[var(--surface-muted)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <select
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-[var(--ink)] border-0 outline-none cursor-pointer"
                  >
                    {CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="text-xs font-semibold text-[var(--muted)] bg-white px-2 py-1 rounded-lg border border-[var(--border)]">USDC</span>
                </div>
                <div className="display text-2xl font-bold tabular text-[var(--ink)]">
                  {amount ? `$${received}` : <span className="text-[var(--subtle)] text-xl font-normal">0.00</span>}
                </div>
              </div>
            </div>

            {/* Preview */}
            {amount && Number(amount) > 0 && (
              <div className="space-y-2 bg-[var(--surface-muted)] rounded-xl p-4">
                {[
                  ['Bridge fee', `$${fee} USDC`],
                  ['You receive', `$${received} USDC`],
                  ['Est. completion', estTime],
                  ['Network', `${from} → ${to}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">{k}</span>
                    <span className="font-medium text-[var(--ink)] tabular">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={proceed} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">
              Review Transfer
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
            <h2 className="font-semibold text-[var(--ink)]">Confirm Bridge</h2>
            <div className="bg-[var(--surface-muted)] rounded-xl p-4 text-center">
              <div className="display text-3xl font-bold tabular text-[var(--ink)]">${Number(amount).toFixed(2)}</div>
              <div className="text-sm text-[var(--muted)] mt-1">{from} → {to}</div>
            </div>
            <div className="space-y-2">
              {[
                ['You send', `$${Number(amount).toFixed(2)} USDC on ${from}`],
                ['Bridge fee', `$${fee} USDC`],
                ['You receive', `$${received} USDC on ${to}`],
                ['Est. completion', estTime],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-xs text-[var(--subtle)]">{k}</span>
                  <span className="text-sm font-medium text-[var(--ink)]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">Back</button>
              <button onClick={() => { void bridge() }} className="flex-1 py-3 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors">Confirm Bridge</button>
            </div>
          </div>
        )}

        {step === 'bridging' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center space-y-4">
            <Loader2 size={32} className="mx-auto text-[var(--accent-blue)] animate-spin" />
            <div className="font-semibold text-[var(--ink)]">Bridging in progress…</div>
            <div className="text-sm text-[var(--muted)]">{from} → {to}</div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--success-bg)] flex items-center justify-center mx-auto">
              <CheckCircle size={24} className="text-[var(--success)]" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)] text-lg">Bridge Complete</div>
              <div className="text-sm text-[var(--muted)] mt-1">${received} USDC is available on {to}</div>
            </div>
            <div className="bg-[var(--surface-muted)] rounded-xl p-3.5">
              <div className="mono text-xs text-[var(--ink)]">{txId}</div>
            </div>
            <button onClick={() => { setStep('form'); setAmount('') }} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">New Bridge</button>
          </div>
        )}
      </div>
    </div>
  )
}
