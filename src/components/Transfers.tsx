/**
 * WEKA Transfers — Real on-chain USDC transfer via Arc Testnet
 * Uses wagmi useWriteContract + useWaitForTransactionReceipt
 * USDC ERC-20 at 0x3600000000000000000000000000000000000000 (6 decimals)
 */
import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { ArrowRight, CheckCircle, Loader2, ExternalLink, AlertCircle, Wallet } from 'lucide-react'
import { ConnectKitButton } from 'connectkit'
import { toast } from 'sonner'
import {
  USDC_ADDRESS, USDC_ABI, USDC_DECIMALS, ARC_TESTNET_CHAIN_ID,
  parseUsdc, formatUsdc, explorerTxUrl, isValidAddress, shortAddress,
  ARC_TESTNET_FAUCET,
} from '../lib/onchain'
import { db } from '../lib/useDb'

type Step = 'form' | 'review' | 'signing' | 'confirming' | 'success' | 'error'

export default function Transfers() {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({ recipient: '', amount: '', reference: '' })
  const [errorMsg, setErrorMsg] = useState('')

  // Read sender's USDC balance
  const { data: rawBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: !!address },
  })
  const balance = rawBalance
  const balanceDisplay = formatUsdc(balance)

  // Write contract
  const { writeContract, data: txHash, isPending: isSigning, reset } = useWriteContract()

  // Wait for confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: ARC_TESTNET_CHAIN_ID,
  })

  // Step transitions from contract state
  if (isSigning && step !== 'signing') setStep('signing')
  if (isConfirming && step !== 'confirming') setStep('confirming')
  if (isSuccess && step === 'confirming') {
    setStep('success')
    // Write to DB
    void db.createTransaction({
      customer_id: 'cus_001',
      amount: parseFloat(form.amount),
      currency: 'USDC',
      type: 'transfer',
      status: 'completed',
      sender: address ?? null,
      recipient: form.recipient,
      fee: 0.001,
      network: 'Arc Testnet',
      request_id: txHash ?? null,
      metadata: form.reference ? { reference: form.reference } : {},
    })
    toast.success('Transfer confirmed on Arc Testnet')
  }

  const isWrongChain = isConnected && chainId !== ARC_TESTNET_CHAIN_ID

  const validate = () => {
    if (!isConnected) { toast.error('Connect your wallet first'); return false }
    if (isWrongChain) { toast.error('Switch to Arc Testnet'); return false }
    if (!isValidAddress(form.recipient)) { toast.error('Enter a valid wallet address (0x…)'); return false }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) { toast.error('Enter a valid amount'); return false }
    const needed = parseUsdc(form.amount)
    if (balance !== undefined && needed > balance) {
      toast.error(`Insufficient balance. You have ${balanceDisplay} USDC.`)
      return false
    }
    return true
  }

  const proceed = () => { if (validate()) setStep('review') }

  const send = () => {
    if (!validate()) return
    try {
      writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [form.recipient as `0x${string}`, parseUsdc(form.amount)],
        chainId: ARC_TESTNET_CHAIN_ID,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Transaction failed'
      if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied')) {
        toast.info('Transaction cancelled')
        setStep('review')
      } else {
        setErrorMsg(msg)
        setStep('error')
      }
    }
  }

  const resetAll = () => {
    reset()
    setStep('form')
    setForm({ recipient: '', amount: '', reference: '' })
    setErrorMsg('')
  }

  const stepIndex = { form: 0, review: 1, signing: 2, confirming: 2, success: 3, error: 1 }[step] ?? 0
  const isSuccess_ = step === 'success'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-bold text-[var(--ink)]">Send Transfer</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">On-chain USDC transfer via Arc Testnet</p>
      </div>

      {/* Chain / wallet status bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {!isConnected ? (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            <Wallet size={14} className="text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">Connect your wallet to send real USDC</span>
            <ConnectKitButton label="Connect" />
          </div>
        ) : isWrongChain ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-xs font-semibold text-red-700">Wrong network — switch to Arc Testnet</span>
            <button
              onClick={() => switchChain({ chainId: ARC_TESTNET_CHAIN_ID })}
              className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors"
            >Switch</button>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="mono text-xs text-emerald-700">{shortAddress(address!)}</span>
            <span className="text-xs text-[var(--muted)]">·</span>
            <span className="text-xs font-semibold text-emerald-700">{balanceDisplay} USDC available</span>
            <a href={ARC_TESTNET_FAUCET} target="_blank" rel="noopener noreferrer"
              className="text-xs text-[var(--accent-blue)] hover:underline">Get testnet USDC</a>
          </div>
        )}
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {['Details', 'Review', 'Confirm'].map((label, i) => {
          const done = i < stepIndex || isSuccess_
          const active = i === stepIndex && !isSuccess_
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done || isSuccess_ ? 'bg-[var(--success)] text-white' : active ? 'bg-[var(--ink)] text-white' : 'bg-[var(--surface-muted)] text-[var(--subtle)]'}`}>
                {done || isSuccess_ ? <CheckCircle size={13} /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${active ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>{label}</span>
              {i < 2 && <div className="w-8 h-px bg-[var(--border)] mx-1" />}
            </div>
          )
        })}
      </div>

      <div className="max-w-lg">

        {/* FORM */}
        {step === 'form' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Recipient Address *</label>
              <input
                value={form.recipient}
                onChange={e => setForm({ ...form, recipient: e.target.value })}
                placeholder="0x… wallet address on Arc Testnet"
                className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)] mono"
              />
              {form.recipient && !isValidAddress(form.recipient) && (
                <p className="text-xs text-[var(--danger)] mt-1">Must be a valid 0x Ethereum address</p>
              )}
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
                  min="0.000001"
                  step="0.01"
                  className="w-full pl-7 pr-20 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] tabular placeholder:text-[var(--subtle)]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--muted)]">USDC</span>
              </div>
              {balance !== undefined && form.amount && (
                <p className="text-xs text-[var(--muted)] mt-1">
                  Available: {balanceDisplay} USDC ·
                  After: {formatUsdc(balance - parseUsdc(Number(form.amount) > 0 ? form.amount : '0'))} USDC
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Reference (optional)</label>
              <input
                value={form.reference}
                onChange={e => setForm({ ...form, reference: e.target.value })}
                placeholder="Invoice #, note, or reference"
                className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
              />
            </div>
            {/* API preview */}
            <div className="bg-[var(--surface-muted)] rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--subtle)] mb-2">On-chain Call Preview</p>
              <pre className="mono text-xs text-[var(--ink)] whitespace-pre-wrap">{`USDC.transfer(
  to:     ${form.recipient || '0x…'},
  amount: ${form.amount ? parseUsdc(form.amount).toString() : '0'} (${form.amount || '0'} USDC)
)`}</pre>
            </div>
            <button
              onClick={proceed}
              disabled={!isConnected || isWrongChain}
              className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review Transfer <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* REVIEW */}
        {step === 'review' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
            <h2 className="font-semibold text-[var(--ink)]">Confirm Transfer</h2>
            <div className="bg-[var(--surface-muted)] rounded-xl p-5 text-center">
              <div className="display text-3xl font-bold tabular text-[var(--ink)]">${Number(form.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div className="text-sm text-[var(--muted)] mt-1">USDC on Arc Testnet</div>
            </div>
            <div className="space-y-2">
              {[
                ['From', shortAddress(address ?? '')],
                ['To', shortAddress(form.recipient)],
                ['Amount', `${form.amount} USDC`],
                ['Network fee', '~0.001 USDC (Arc gas)'],
                ['Settlement', 'Instant · Arc Testnet'],
                ['Network', 'Arc Testnet (chain ID 5042002)'],
                ...(form.reference ? [['Reference', form.reference]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-xs text-[var(--subtle)]">{k}</span>
                  <span className="text-sm font-medium text-[var(--ink)] mono">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              This will submit a real USDC transfer on Arc Testnet. Your wallet will prompt for confirmation.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">Back</button>
              <button onClick={send} className="flex-1 py-3 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors flex items-center justify-center gap-2">
                Send {form.amount} USDC <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* SIGNING */}
        {step === 'signing' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center space-y-4">
            <Loader2 size={32} className="mx-auto text-[var(--accent-blue)] animate-spin" />
            <div className="font-semibold text-[var(--ink)]">Waiting for wallet confirmation…</div>
            <div className="text-sm text-[var(--muted)]">Check your wallet and approve the transaction</div>
          </div>
        )}

        {/* CONFIRMING */}
        {step === 'confirming' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center space-y-4">
            <Loader2 size={32} className="mx-auto text-[var(--accent-blue)] animate-spin" />
            <div className="font-semibold text-[var(--ink)]">Confirming on Arc Testnet…</div>
            <div className="text-sm text-[var(--muted)]">Sub-second finality — almost there</div>
            {txHash && (
              <a href={explorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-blue)] hover:underline">
                <ExternalLink size={11} /> View on Arc Explorer
              </a>
            )}
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--success-bg)] flex items-center justify-center mx-auto">
              <CheckCircle size={24} className="text-[var(--success)]" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)] text-lg">Transfer Confirmed</div>
              <div className="text-sm text-[var(--muted)] mt-1">{form.amount} USDC sent on Arc Testnet</div>
            </div>
            {txHash && (
              <div className="bg-[var(--surface-muted)] rounded-xl p-4 text-left space-y-2">
                <div>
                  <p className="text-[10px] text-[var(--subtle)] uppercase tracking-wide mb-0.5">Transaction Hash</p>
                  <p className="mono text-xs text-[var(--ink)] break-all">{txHash}</p>
                </div>
                <a href={explorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-blue)] hover:underline">
                  <ExternalLink size={11} /> View on Arc Testnet Explorer
                </a>
              </div>
            )}
            <button onClick={resetAll} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">New Transfer</button>
          </div>
        )}

        {/* ERROR */}
        {step === 'error' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--danger-bg)] flex items-center justify-center mx-auto">
              <AlertCircle size={24} className="text-[var(--danger)]" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)] text-lg">Transfer Failed</div>
              <div className="text-sm text-[var(--muted)] mt-1">{errorMsg || 'The transaction was rejected or failed.'}</div>
            </div>
            <button onClick={resetAll} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">Try Again</button>
          </div>
        )}
      </div>
    </div>
  )
}
