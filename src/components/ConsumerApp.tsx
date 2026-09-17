import { useState } from 'react'
import { ArrowUp, ArrowDown, Copy, Send, ChevronLeft, CheckCircle, Loader2, X, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { formatUSD } from '../data/demo'

type ConsumerScreen = 'home' | 'send' | 'receive' | 'request' | 'history'
type SendStep = 'form' | 'review' | 'sending' | 'success'

const RECENT_ACTIVITY = [
  { id: '1', name: 'Sarah Chen', avatar: 'SC', amount: 500, type: 'received', note: 'Dinner last week', time: '2 hours ago' },
  { id: '2', name: 'Marcus Johnson', avatar: 'MJ', amount: -200, type: 'sent', note: 'Rent split', time: 'Yesterday' },
  { id: '3', name: 'Priya Sharma', avatar: 'PS', amount: -50, type: 'sent', note: 'Coffee meeting', time: '2 days ago' },
  { id: '4', name: 'Tommy Lee', avatar: 'TL', amount: 150, type: 'received', note: 'Freelance payment', time: '3 days ago' },
  { id: '5', name: 'Global Markets', avatar: 'GM', amount: -1200, type: 'sent', note: 'Invoice #88', time: '4 days ago' },
]

function SendFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<SendStep>('form')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txId, setTxId] = useState('')

  const proceed = () => {
    if (!recipient || !amount || Number(amount) <= 0) { toast.error('Fill all fields'); return }
    setStep('review')
  }

  const confirm = async () => {
    setStep('sending')
    await new Promise(r => setTimeout(r, 2200))
    setTxId('txn_' + Math.random().toString(36).slice(2, 10).toUpperCase())
    setStep('success')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-gradient)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white border border-[var(--border)] flex items-center justify-center">
          <ChevronLeft size={17} />
        </button>
        <span className="font-semibold text-[var(--ink)]">Send Money</span>
      </div>

      <div className="flex-1 px-5 pb-8">
        {step === 'form' && (
          <div className="space-y-4 mt-2">
            <div className="bg-white rounded-2xl border border-[var(--border)] p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">To</label>
                <input
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="Name, email, or phone"
                  className="w-full px-3.5 py-3 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 display text-2xl font-bold text-[var(--muted)]">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-4 py-4 bg-[var(--surface-muted)] rounded-xl display text-3xl font-bold text-[var(--ink)] border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] tabular placeholder:text-[var(--subtle)] placeholder:font-normal"
                  />
                </div>
              </div>
              {/* Quick amounts */}
              <div className="flex gap-2">
                {[10, 25, 50, 100].map(a => (
                  <button key={a} onClick={() => setAmount(a.toString())} className="flex-1 py-2 bg-[var(--surface-muted)] rounded-xl text-sm font-semibold text-[var(--muted)] hover:bg-[var(--border)] transition-colors">
                    ${a}
                  </button>
                ))}
              </div>
            </div>

            {amount && Number(amount) > 0 && (
              <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[var(--muted)]">You send</span>
                  <span className="font-semibold tabular text-[var(--ink)]">{formatUSD(Number(amount))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">They receive</span>
                  <span className="font-semibold tabular text-[var(--success)]">{formatUSD(Number(amount))}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">No fees · Instant via Arc</div>
              </div>
            )}

            <button onClick={proceed} disabled={!recipient || !amount} className="w-full py-4 bg-[var(--ink)] text-white font-bold text-base rounded-2xl hover:bg-[var(--accent-mid)] transition-colors disabled:opacity-40">
              Review
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4 mt-2">
            <div className="bg-white rounded-2xl border border-[var(--border)] p-6 text-center">
              <div className="text-sm text-[var(--muted)] mb-1">Sending to {recipient}</div>
              <div className="display text-5xl font-bold tabular text-[var(--ink)]">{formatUSD(Number(amount))}</div>
              <div className="text-sm text-[var(--muted)] mt-2">USDC · Instant delivery</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 py-4 rounded-2xl border border-[var(--border)] font-semibold text-[var(--muted)]">Back</button>
              <button onClick={() => { void confirm() }} className="flex-1 py-4 rounded-2xl bg-[var(--ink)] text-white font-bold">Confirm Send</button>
            </div>
          </div>
        )}

        {step === 'sending' && (
          <div className="flex flex-col items-center justify-center flex-1 pt-20 space-y-4">
            <Loader2 size={40} className="text-[var(--accent-blue)] animate-spin" />
            <div className="font-semibold text-[var(--ink)]">Sending…</div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center flex-1 pt-16 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-[var(--success-bg)] flex items-center justify-center">
              <CheckCircle size={36} className="text-[var(--success)]" />
            </div>
            <div>
              <div className="display text-2xl font-bold text-[var(--ink)]">Sent!</div>
              <div className="text-[var(--muted)] mt-1">{formatUSD(Number(amount))} delivered to {recipient}</div>
            </div>
            <div className="bg-[var(--surface-muted)] rounded-2xl p-4 w-full">
              <div className="text-[10px] text-[var(--subtle)] uppercase tracking-wide mb-1">Transaction ID</div>
              <div className="mono text-sm text-[var(--ink)]">{txId}</div>
            </div>
            <button onClick={onBack} className="w-full py-4 bg-[var(--ink)] text-white font-bold rounded-2xl">Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

function ReceiveScreen({ onBack }: { onBack: () => void }) {
  const address = 'weka:jsmith@globalpay.io'
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-gradient)]">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white border border-[var(--border)] flex items-center justify-center">
          <ChevronLeft size={17} />
        </button>
        <span className="font-semibold text-[var(--ink)]">Receive Money</span>
      </div>
      <div className="flex-1 px-5 pb-8 flex flex-col items-center gap-5">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-8 flex flex-col items-center gap-4 w-full">
          {/* QR */}
          <div className="p-4 bg-white rounded-xl border-2 border-[var(--border)]">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <rect width="140" height="140" fill="white" />
              {Array.from({ length: 12 }, (_, i) =>
                Array.from({ length: 12 }, (__, j) => {
                  const seed = (i * 19 + j * 11 + 7) % 3
                  if (seed === 0) return <rect key={`${i}-${j}`} x={5 + j * 11} y={5 + i * 11} width="10" height="10" fill="#0f1f35" rx="1.5" />
                  return null
                })
              )}
              <rect x="5" y="5" width="33" height="33" fill="none" stroke="#0f1f35" strokeWidth="3" rx="3" />
              <rect x="13" y="13" width="17" height="17" fill="#0f1f35" rx="2" />
              <rect x="102" y="5" width="33" height="33" fill="none" stroke="#0f1f35" strokeWidth="3" rx="3" />
              <rect x="110" y="13" width="17" height="17" fill="#0f1f35" rx="2" />
              <rect x="5" y="102" width="33" height="33" fill="none" stroke="#0f1f35" strokeWidth="3" rx="3" />
              <rect x="13" y="110" width="17" height="17" fill="#0f1f35" rx="2" />
            </svg>
          </div>
          <div className="text-center">
            <div className="font-semibold text-[var(--ink)]">Jamie Smith</div>
            <div className="text-sm text-[var(--muted)]">GlobalPay</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] p-4 w-full">
          <div className="text-xs font-semibold text-[var(--muted)] mb-2">Your payment address</div>
          <div className="flex items-center gap-2">
            <span className="mono text-sm text-[var(--ink)] flex-1 truncate">{address}</span>
            <button onClick={() => { void navigator.clipboard.writeText(address); toast.success('Copied!') }} className="flex-shrink-0 p-2 rounded-lg bg-[var(--surface-muted)] hover:bg-[var(--border)] transition-colors">
              <Copy size={14} className="text-[var(--muted)]" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] p-4 w-full">
          <div className="text-xs font-semibold text-[var(--muted)] mb-2">Your payment link</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--accent-blue)] flex-1 truncate">pay.globalpay.io/jsmith</span>
            <button onClick={() => { void navigator.clipboard.writeText('https://pay.globalpay.io/jsmith'); toast.success('Copied!') }} className="flex-shrink-0 p-2 rounded-lg bg-[var(--surface-muted)] hover:bg-[var(--border)] transition-colors">
              <Copy size={14} className="text-[var(--muted)]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConsumerApp({ onExitConsumer }: { onExitConsumer: () => void }) {
  const [screen, setScreen] = useState<ConsumerScreen>('home')
  const balance = 2450.00

  if (screen === 'send') return <SendFlow onBack={() => setScreen('home')} />
  if (screen === 'receive') return <ReceiveScreen onBack={() => setScreen('home')} />

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(180deg, #0f1f35 0%, #1a3557 40%, #f8f9fc 40%)' }}>
      {/* Exit to dashboard */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onExitConsumer}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full hover:bg-white/30 transition-colors"
        >
          <X size={12} /> Exit Demo
        </button>
      </div>

      {/* Header */}
      <div className="px-5 pt-12 pb-6 text-white">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.1em] opacity-60">WEKA</div>
            <div className="text-sm opacity-80 mt-0.5">Good morning, Jamie</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">JS</div>
        </div>

        {/* Balance */}
        <div className="text-center">
          <div className="text-sm opacity-60 mb-1">Total Balance</div>
          <div className="display text-5xl font-bold tabular">{formatUSD(balance)}</div>
          <div className="text-sm opacity-50 mt-1">USDC · Updated just now</div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          {[
            { label: 'Send', icon: <ArrowUp size={20} />, action: () => setScreen('send') },
            { label: 'Receive', icon: <ArrowDown size={20} />, action: () => setScreen('receive') },
            { label: 'Request', icon: <Send size={20} />, action: () => toast.info('Request flow — coming soon') },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="flex flex-col items-center gap-2 py-4 bg-white/15 backdrop-blur-sm rounded-2xl text-white hover:bg-white/25 transition-colors active:scale-95"
            >
              {btn.icon}
              <span className="text-xs font-semibold">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity card */}
      <div className="flex-1 bg-[var(--bg-gradient)] rounded-t-3xl px-5 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--ink)]">Recent activity</h2>
          <button onClick={() => setScreen('history')} className="text-xs text-[var(--accent-blue)] font-medium">See all</button>
        </div>

        <div className="space-y-1">
          {RECENT_ACTIVITY.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-[var(--border)]">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-xs font-bold text-[var(--muted)] flex-shrink-0">
                {item.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--ink)]">{item.name}</div>
                <div className="text-xs text-[var(--muted)] truncate">{item.note} · {item.time}</div>
              </div>
              <div className={`text-sm font-bold tabular flex-shrink-0 flex items-center gap-0.5 ${item.amount > 0 ? 'text-[var(--success)]' : 'text-[var(--ink)]'}`}>
                {item.amount > 0 ? <Plus size={11} /> : <Minus size={11} />}
                {formatUSD(Math.abs(item.amount))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
