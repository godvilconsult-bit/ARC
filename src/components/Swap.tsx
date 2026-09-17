import { useState } from 'react'
import { ArrowUpDown, Loader2, CheckCircle, Info } from 'lucide-react'
import { toast } from 'sonner'

const ASSETS = [
  { symbol: 'USDC', name: 'USD Coin', price: 1.00 },
  { symbol: 'ETH', name: 'Ethereum', price: 3840.00 },
  { symbol: 'USDT', name: 'Tether', price: 1.00 },
]

type Step = 'form' | 'review' | 'swapping' | 'success'

export default function Swap() {
  const [fromAsset, setFromAsset] = useState('USDC')
  const [toAsset, setToAsset] = useState('ETH')
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [txId, setTxId] = useState('')

  const from = ASSETS.find(a => a.symbol === fromAsset)!
  const to = ASSETS.find(a => a.symbol === toAsset)!
  const slippage = 0.5
  const feeRate = 0.003
  const fee = amount ? (Number(amount) * feeRate).toFixed(4) : '0'
  const received = amount ? ((Number(amount) - Number(amount) * feeRate) / (to.price / from.price)).toFixed(6) : '0'
  const rate = (from.price / to.price).toFixed(6)

  const flipAssets = () => {
    const tmp = fromAsset
    setFromAsset(toAsset)
    setToAsset(tmp)
    setAmount('')
  }

  const proceed = () => {
    if (!amount || Number(amount) <= 0) { toast.error('Enter an amount'); return }
    if (fromAsset === toAsset) { toast.error('Select different assets'); return }
    setStep('review')
  }

  const swap = async () => {
    setStep('swapping')
    await new Promise(r => setTimeout(r, 2500))
    setTxId('swp_' + Math.random().toString(36).slice(2, 10).toUpperCase())
    setStep('success')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-bold text-[var(--ink)]">Swap</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Exchange assets instantly on Arc</p>
      </div>

      <div className="max-w-md space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-2.5">
          <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">Powered by Arc App Kit Swap. Rates are indicative — final rate is set at execution.</p>
        </div>

        {step === 'form' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-4">
            {/* You pay */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">You pay</label>
              <div className="bg-[var(--surface-muted)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <select
                    value={fromAsset}
                    onChange={e => setFromAsset(e.target.value)}
                    className="bg-white border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[var(--ink)] outline-none cursor-pointer"
                  >
                    {ASSETS.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                  </select>
                  <span className="text-xs text-[var(--muted)]">${from.price.toFixed(2)}</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent display text-2xl font-bold text-[var(--ink)] border-0 outline-none tabular placeholder:text-[var(--subtle)] placeholder:font-normal placeholder:text-xl"
                />
              </div>
            </div>

            {/* Flip */}
            <div className="flex justify-center">
              <button onClick={flipAssets} className="w-10 h-10 rounded-full bg-white border-2 border-[var(--border)] flex items-center justify-center hover:border-[var(--ink)] transition-colors">
                <ArrowUpDown size={16} className="text-[var(--muted)]" />
              </button>
            </div>

            {/* You receive */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">You receive</label>
              <div className="bg-[var(--surface-muted)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <select
                    value={toAsset}
                    onChange={e => setToAsset(e.target.value)}
                    className="bg-white border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[var(--ink)] outline-none cursor-pointer"
                  >
                    {ASSETS.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                  </select>
                  <span className="text-xs text-[var(--muted)]">${to.price.toFixed(2)}</span>
                </div>
                <div className="display text-2xl font-bold tabular text-[var(--ink)]">
                  {amount && Number(amount) > 0
                    ? received
                    : <span className="text-[var(--subtle)] text-xl font-normal">0.00</span>
                  }
                </div>
              </div>
            </div>

            {/* Preview */}
            {amount && Number(amount) > 0 && (
              <div className="space-y-2 bg-[var(--surface-muted)] rounded-xl p-4">
                {[
                  ['Exchange rate', `1 ${fromAsset} = ${rate} ${toAsset}`],
                  ['Fee (0.3%)', `${fee} ${fromAsset}`],
                  ['Slippage tolerance', `${slippage}%`],
                  ['Est. received', `${received} ${toAsset}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">{k}</span>
                    <span className="font-medium text-[var(--ink)] tabular">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={proceed} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">
              Review Swap
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
            <h2 className="font-semibold text-[var(--ink)]">Confirm Swap</h2>
            <div className="bg-[var(--surface-muted)] rounded-xl p-4 text-center">
              <div className="display text-3xl font-bold tabular text-[var(--ink)]">{amount} {fromAsset}</div>
              <div className="text-sm text-[var(--muted)] mt-1">→ ~{received} {toAsset}</div>
            </div>
            <div className="space-y-2">
              {[
                ['You pay', `${amount} ${fromAsset}`],
                ['Fee', `${fee} ${fromAsset}`],
                ['You receive', `~${received} ${toAsset}`],
                ['Rate', `1 ${fromAsset} = ${rate} ${toAsset}`],
                ['Slippage', `${slippage}%`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-xs text-[var(--subtle)]">{k}</span>
                  <span className="text-sm font-medium text-[var(--ink)]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">Back</button>
              <button onClick={() => { void swap() }} className="flex-1 py-3 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors">Confirm Swap</button>
            </div>
          </div>
        )}

        {step === 'swapping' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center space-y-4">
            <Loader2 size={32} className="mx-auto text-[var(--accent-blue)] animate-spin" />
            <div className="font-semibold text-[var(--ink)]">Swapping…</div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--success-bg)] flex items-center justify-center mx-auto">
              <CheckCircle size={24} className="text-[var(--success)]" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)] text-lg">Swap Complete</div>
              <div className="text-sm text-[var(--muted)] mt-1">Received ~{received} {toAsset}</div>
            </div>
            <div className="bg-[var(--surface-muted)] rounded-xl p-3.5">
              <div className="mono text-xs text-[var(--ink)]">{txId}</div>
            </div>
            <button onClick={() => { setStep('form'); setAmount('') }} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">New Swap</button>
          </div>
        )}
      </div>
    </div>
  )
}
