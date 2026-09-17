import { useState } from 'react'
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { CUSTOMERS, formatUSD } from '../data/demo'
import { toast } from 'sonner'

type Step = 'form' | 'review' | 'sending' | 'success'

export default function Transfers() {
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({
    customerId: '',
    recipient: '',
    amount: '',
    currency: 'USDC',
    reference: '',
  })
  const [txId, setTxId] = useState('')

  const customer = CUSTOMERS.find(c => c.id === form.customerId)

  const proceed = () => {
    if (!form.customerId || !form.recipient || !form.amount) {
      toast.error('Please fill all required fields')
      return
    }
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setStep('review')
  }

  const send = async () => {
    setStep('sending')
    await new Promise(r => setTimeout(r, 2000))
    const id = 'txn_' + Math.random().toString(36).slice(2, 10).toUpperCase()
    setTxId(id)
    setStep('success')
  }

  const reset = () => {
    setStep('form')
    setForm({ customerId: '', recipient: '', amount: '', currency: 'USDC', reference: '' })
    setTxId('')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-bold text-[var(--ink)]">Send Transfer</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Move funds between customers or external recipients</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {['Details', 'Review', 'Confirm'].map((label, i) => {
          const idx = ['form', 'review', 'sending'].indexOf(step) === -1 ? 2 : ['form', 'review', 'sending'].indexOf(step)
          const isSuccess = (step as string) === 'success'
          const done = i < idx || isSuccess
          const active = i === idx && !isSuccess
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done || (isSuccess && i <= 2) ? 'bg-[var(--success)] text-white' : active ? 'bg-[var(--ink)] text-white' : 'bg-[var(--surface-muted)] text-[var(--subtle)]'}`}>
                {done || isSuccess ? <CheckCircle size={13} /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${active ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>{label}</span>
              {i < 2 && <div className="w-8 h-px bg-[var(--border)] mx-1" />}
            </div>
          )
        })}
      </div>

      <div className="max-w-lg">
        {step === 'form' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Source Customer *</label>
              <select
                value={form.customerId}
                onChange={e => setForm({ ...form, customerId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)]"
              >
                <option value="">Select customer…</option>
                {CUSTOMERS.filter(c => c.status === 'active').map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {formatUSD(c.balance)} available</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Recipient *</label>
              <input
                value={form.recipient}
                onChange={e => setForm({ ...form, recipient: e.target.value })}
                placeholder="Email, wallet address, or customer ID"
                className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Amount *</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)] font-semibold">$</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-7 pr-4 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] tabular placeholder:text-[var(--subtle)]"
                  />
                </div>
                <div className="px-4 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm font-semibold text-[var(--ink)]">USDC</div>
              </div>
              {customer && form.amount && (
                <p className="text-xs text-[var(--muted)] mt-1.5">
                  Available: {formatUSD(customer.balance)} · Remaining after: {formatUSD(Math.max(0, customer.balance - Number(form.amount)))}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Reference (optional)</label>
              <input
                value={form.reference}
                onChange={e => setForm({ ...form, reference: e.target.value })}
                placeholder="Invoice #, note, or reference ID"
                className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
              />
            </div>

            {/* API preview */}
            <div className="bg-[var(--surface-muted)] rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--subtle)] mb-2">API Request Preview</p>
              <pre className="mono text-xs text-[var(--ink)] whitespace-pre-wrap">{JSON.stringify({
                customer_id: form.customerId || 'cus_123',
                recipient: form.recipient || 'recipient@example.com',
                amount: form.amount || '0.00',
                currency: 'USDC',
                ...(form.reference ? { reference: form.reference } : {}),
              }, null, 2)}</pre>
            </div>

            <button onClick={proceed} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors flex items-center justify-center gap-2">
              Review Transfer <ArrowRight size={15} />
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
            <h2 className="font-semibold text-[var(--ink)]">Review Transfer</h2>
            <div className="bg-[var(--surface-muted)] rounded-xl p-5 text-center">
              <div className="display text-3xl font-bold tabular text-[var(--ink)]">{formatUSD(Number(form.amount))}</div>
              <div className="text-sm text-[var(--muted)] mt-1">USDC</div>
            </div>
            <div className="space-y-2">
              {[
                ['From', customer?.name ?? form.customerId],
                ['To', form.recipient],
                ['Amount', formatUSD(Number(form.amount)) + ' USDC'],
                ['Fee', '$0.10 USDC'],
                ['Net sent', formatUSD(Number(form.amount)) + ' USDC'],
                ['Settlement', 'Instant · Arc network'],
                ...(form.reference ? [['Reference', form.reference]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-xs text-[var(--subtle)]">{k}</span>
                  <span className="text-sm font-medium text-[var(--ink)]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">Back</button>
              <button onClick={() => { void send() }} className="flex-1 py-3 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors">Confirm Transfer</button>
            </div>
          </div>
        )}

        {step === 'sending' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center space-y-4">
            <Loader2 size={32} className="mx-auto text-[var(--accent-blue)] animate-spin" />
            <div className="font-semibold text-[var(--ink)]">Sending transfer…</div>
            <div className="text-sm text-[var(--muted)]">Processing via Arc network</div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--success-bg)] flex items-center justify-center mx-auto">
              <CheckCircle size={24} className="text-[var(--success)]" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)] text-lg">Transfer Sent</div>
              <div className="text-sm text-[var(--muted)] mt-1">{formatUSD(Number(form.amount))} USDC delivered successfully</div>
            </div>
            <div className="bg-[var(--surface-muted)] rounded-xl p-3.5 text-left">
              <div className="text-[10px] text-[var(--subtle)] uppercase tracking-wide mb-1">Transaction ID</div>
              <div className="mono text-sm text-[var(--ink)]">{txId}</div>
            </div>
            <button onClick={reset} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">New Transfer</button>
          </div>
        )}
      </div>
    </div>
  )
}
