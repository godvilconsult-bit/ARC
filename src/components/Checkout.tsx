import { useState } from 'react'
import { CheckCircle, Loader2, Shield, Globe, ChevronLeft, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatUSD } from '../data/demo'

type CheckoutStep = 'landing' | 'pay' | 'processing' | 'success'

interface Props {
  onBack: () => void
}

export default function Checkout({ onBack }: Props) {
  const [step, setStep] = useState<CheckoutStep>('landing')
  const [txRef, setTxRef] = useState('')

  const amount = 500
  const merchant = 'Studio Creative Co.'
  const description = 'Payment for Invoice #1024'

  const pay = async () => {
    setStep('processing')
    await new Promise(r => setTimeout(r, 2500))
    setTxRef('txn_' + Math.random().toString(36).slice(2, 10).toUpperCase())
    setStep('success')
    toast.success('Payment confirmed!')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #f8f9fc 0%, #f0f4ff 100%)' }}>
      {/* Nav bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--ink)] flex items-center justify-center">
            <Globe size={13} className="text-white" />
          </div>
          <span className="display font-bold text-[var(--ink)] text-sm tracking-tight">WEKA</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
          <Shield size={12} className="text-[var(--success)]" />
          Secure checkout
        </div>
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--muted)]">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {step === 'landing' && (
            <div className="bg-white rounded-3xl shadow-xl border border-[var(--border)] overflow-hidden">
              <div className="px-8 pt-8 pb-6 text-center border-b border-[var(--border)]">
                {/* Merchant logo */}
                <div className="w-16 h-16 rounded-2xl bg-[var(--surface-muted)] flex items-center justify-center mx-auto mb-4 text-xl font-bold text-[var(--muted)]">SC</div>
                <div className="font-bold text-[var(--ink)] text-lg">{merchant}</div>
                <div className="text-sm text-[var(--muted)] mt-1">{description}</div>
                <div className="display text-4xl font-bold tabular text-[var(--ink)] mt-4">{formatUSD(amount)}</div>
                <div className="text-xs text-[var(--muted)] mt-1">USDC · One-time payment</div>
              </div>
              <div className="px-8 py-6 space-y-3">
                <button
                  onClick={() => setStep('pay')}
                  className="w-full py-4 bg-[var(--ink)] text-white font-bold text-base rounded-2xl hover:bg-[var(--accent-mid)] transition-colors"
                >
                  Pay with WEKA
                </button>
                <div className="flex items-center gap-2 text-center">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs text-[var(--subtle)]">or pay with wallet</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
                <button
                  onClick={() => { setStep('processing'); setTimeout(() => { setTxRef('txn_ext_' + Math.random().toString(36).slice(2, 8)); setStep('success') }, 2000) }}
                  className="w-full py-3.5 border-2 border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--ink)] transition-colors"
                >
                  Connect Wallet
                </button>
                <p className="text-[11px] text-center text-[var(--subtle)]">
                  Powered by WEKA · Your payment is secured and processed instantly
                </p>
              </div>
            </div>
          )}

          {step === 'pay' && (
            <div className="bg-white rounded-3xl shadow-xl border border-[var(--border)] overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border)]">
                <button onClick={() => setStep('landing')} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)]"><ChevronLeft size={16} /></button>
                <span className="font-semibold text-[var(--ink)]">Complete payment</span>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="bg-[var(--surface-muted)] rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-[var(--muted)]">{merchant}</div>
                    <div className="font-bold text-[var(--ink)] tabular">{formatUSD(amount)}</div>
                  </div>
                  <span className="text-xs bg-[var(--ink)] text-white px-2.5 py-1 rounded-full font-semibold">USDC</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Email</label>
                  <input
                    defaultValue="jamie@example.com"
                    className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)]"
                  />
                </div>
                <div className="bg-[var(--success-bg)] rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle size={13} className="text-[var(--success)]" />
                  <span className="text-xs text-[var(--success)] font-medium">WEKA balance: $2,450.00 available</span>
                </div>
                <button onClick={() => { void pay() }} className="w-full py-4 bg-[var(--ink)] text-white font-bold text-base rounded-2xl hover:bg-[var(--accent-mid)] transition-colors">
                  Pay {formatUSD(amount)}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="bg-white rounded-3xl shadow-xl border border-[var(--border)] p-12 text-center space-y-4">
              <Loader2 size={36} className="mx-auto text-[var(--accent-blue)] animate-spin" />
              <div className="font-semibold text-[var(--ink)]">Processing payment…</div>
              <div className="text-sm text-[var(--muted)]">Settling on Arc network</div>
            </div>
          )}

          {step === 'success' && (
            <div className="bg-white rounded-3xl shadow-xl border border-[var(--border)] p-8 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-[var(--success-bg)] flex items-center justify-center mx-auto">
                <CheckCircle size={36} className="text-[var(--success)]" />
              </div>
              <div>
                <div className="display text-2xl font-bold text-[var(--ink)]">Payment Complete</div>
                <div className="text-[var(--muted)] mt-1">{formatUSD(amount)} sent to {merchant}</div>
              </div>
              <div className="bg-[var(--surface-muted)] rounded-2xl p-4 text-left">
                <div className="text-[10px] text-[var(--subtle)] uppercase tracking-wide mb-1">Transaction Reference</div>
                <div className="mono text-sm text-[var(--ink)]">{txRef}</div>
              </div>
              <p className="text-xs text-[var(--muted)]">A receipt has been sent to your email. You can close this page.</p>
              <button onClick={onBack} className="w-full py-3 border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
