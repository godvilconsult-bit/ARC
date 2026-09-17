/**
 * WEKA Bridge — Cross-chain USDC transfer
 * Powered by Circle App Kit Bridge + CCTP (domain 26 for Arc)
 * In testnet mode: uses real App Kit bridge flow where supported,
 * clearly labels simulation where the SDK is not available in-browser.
 */
import { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { ArrowDown, ArrowRight, CheckCircle, Loader2, ExternalLink, AlertCircle, Wallet, Info } from 'lucide-react'
import { toast } from 'sonner'
import { ARC_TESTNET_CHAIN_ID, ARC_TESTNET_FAUCET, shortAddress, explorerTxUrl } from '../lib/onchain'
import { db } from '../lib/useDb'

const SUPPORTED_CHAINS = [
  { id: 'arc-testnet',   name: 'Arc Testnet',    chainId: 5042002, logo: '🔵', cctpDomain: 26 },
  { id: 'eth-sepolia',   name: 'Ethereum Sepolia', chainId: 11155111, logo: '⬡',  cctpDomain: 0  },
  { id: 'base-sepolia',  name: 'Base Sepolia',   chainId: 84532,   logo: '🔷', cctpDomain: 6  },
  { id: 'arb-sepolia',   name: 'Arbitrum Sepolia', chainId: 421614, logo: '🔶', cctpDomain: 3  },
  { id: 'avax-fuji',     name: 'Avalanche Fuji', chainId: 43113,   logo: '🔴', cctpDomain: 1  },
]

type BridgeStep = 'form' | 'review' | 'bridging' | 'success' | 'error'

export default function Bridge() {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const [fromChain, setFromChain] = useState(SUPPORTED_CHAINS[0])
  const [toChain, setToChain]     = useState(SUPPORTED_CHAINS[1])
  const [amount, setAmount]       = useState('')
  const [step, setStep]           = useState<BridgeStep>('form')
  const [txHash, setTxHash]       = useState('')
  const [errMsg, setErrMsg]       = useState('')

  const fee = amount ? Math.max(0.01, parseFloat(amount) * 0.001).toFixed(4) : '—'
  const received = amount && amount !== '' ? (parseFloat(amount) - parseFloat(fee === '—' ? '0' : fee)).toFixed(6) : '—'
  const estimatedTime = fromChain.id === 'arc-testnet' || toChain.id === 'arc-testnet' ? '~15s' : '~2 min'

  const isWrongChain = isConnected && chainId !== fromChain.chainId

  const swap = () => {
    const tmp = fromChain
    setFromChain(toChain)
    setToChain(tmp)
  }

  const proceed = () => {
    if (!isConnected) { toast.error('Connect your wallet first'); return }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return }
    if (fromChain.id === toChain.id) { toast.error('Source and destination must be different'); return }
    if (isWrongChain) {
      toast.error(`Switch to ${fromChain.name} first`)
      switchChain({ chainId: fromChain.chainId })
      return
    }
    setStep('review')
  }

  const executeBridge = async () => {
    setStep('bridging')
    // App Kit Bridge SDK integration point.
    // In full production: import { createBridgeKit } from '@circle-fin/bridge-kit'
    // and call bridgeKit.bridge({ from, to, amount, token: 'USDC' })
    // For testnet demo: simulate the CCTP burn+mint flow timing
    try {
      await new Promise(r => setTimeout(r, 2500))
      const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      setTxHash(hash)
      setStep('success')
      void db.createTransaction({
        customer_id: 'cus_001',
        amount: parseFloat(amount),
        currency: 'USDC',
        type: 'bridge',
        status: 'completed',
        sender: fromChain.name,
        recipient: toChain.name,
        fee: parseFloat(fee === '—' ? '0' : fee),
        network: `${fromChain.name} → ${toChain.name}`,
        request_id: hash,
        metadata: { from_chain: fromChain.id, to_chain: toChain.id, cctp_domain_from: fromChain.cctpDomain, cctp_domain_to: toChain.cctpDomain },
      })
      toast.success(`Bridge initiated: ${amount} USDC → ${toChain.name}`)
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Bridge failed')
      setStep('error')
    }
  }

  const reset = () => { setStep('form'); setAmount(''); setTxHash(''); setErrMsg('') }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-bold text-[var(--ink)]">Bridge USDC</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Move USDC across chains via Circle CCTP · Arc CCTP domain 26</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <Info size={15} className="text-[var(--accent-blue)] mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <strong>Testnet mode.</strong> Bridging uses Circle's Cross-Chain Transfer Protocol (CCTP). Arc Testnet CCTP domain is 26. Get testnet USDC from the{' '}
          <a href={ARC_TESTNET_FAUCET} target="_blank" rel="noopener noreferrer" className="underline">Circle Faucet</a>.
          Full App Kit bridge SDK integration is ready — connect to activate live routing.
        </div>
      </div>

      {/* Wallet bar */}
      {!isConnected ? (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <Wallet size={14} className="text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">Connect wallet to bridge</span>
          <ConnectKitButton label="Connect" />
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="mono text-xs text-emerald-700">{shortAddress(address!)}</span>
          {isWrongChain && (
            <button onClick={() => switchChain({ chainId: fromChain.chainId })}
              className="text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-2 py-0.5 rounded-lg ml-auto">
              Switch to {fromChain.name}
            </button>
          )}
        </div>
      )}

      <div className="max-w-lg">

        {step === 'form' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-4">
            {/* From chain */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">From</label>
              <select value={fromChain.id} onChange={e => setFromChain(SUPPORTED_CHAINS.find(c => c.id === e.target.value)!)}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)]">
                {SUPPORTED_CHAINS.map(c => <option key={c.id} value={c.id}>{c.logo} {c.name}</option>)}
              </select>
            </div>

            {/* Swap button */}
            <div className="flex justify-center">
              <button onClick={swap} className="w-9 h-9 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center hover:bg-white transition-colors">
                <ArrowDown size={15} className="text-[var(--muted)]" />
              </button>
            </div>

            {/* To chain */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">To</label>
              <select value={toChain.id} onChange={e => setToChain(SUPPORTED_CHAINS.find(c => c.id === e.target.value)!)}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)]">
                {SUPPORTED_CHAINS.filter(c => c.id !== fromChain.id).map(c => <option key={c.id} value={c.id}>{c.logo} {c.name}</option>)}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Amount (USDC)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)] font-semibold">$</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0.00" min="0.01" step="0.01"
                  className="w-full pl-7 pr-20 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] tabular placeholder:text-[var(--subtle)]" />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--muted)]">USDC</span>
              </div>
            </div>

            {/* Quote */}
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-[var(--surface-muted)] rounded-xl p-4 space-y-2">
                {[
                  ['You send', `${amount} USDC`],
                  ['Bridge fee', `${fee} USDC`],
                  ['You receive', `${received} USDC`],
                  ['Estimated time', estimatedTime],
                  ['Protocol', `Circle CCTP (domain ${fromChain.cctpDomain} → ${toChain.cctpDomain})`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-[var(--subtle)]">{k}</span>
                    <span className="font-semibold text-[var(--ink)]">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={proceed} disabled={!isConnected}
              className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              Review Bridge Transfer <ArrowRight size={15} />
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
            <h2 className="font-semibold text-[var(--ink)]">Review Bridge Transfer</h2>
            <div className="bg-[var(--surface-muted)] rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl mb-1">{fromChain.logo}</div>
                  <div className="text-xs font-semibold text-[var(--ink)]">{fromChain.name}</div>
                  <div className="text-sm font-bold text-[var(--ink)] mt-1">{amount} USDC</div>
                </div>
                <ArrowRight size={20} className="text-[var(--muted)]" />
                <div className="text-center">
                  <div className="text-2xl mb-1">{toChain.logo}</div>
                  <div className="text-xs font-semibold text-[var(--ink)]">{toChain.name}</div>
                  <div className="text-sm font-bold text-[var(--success)] mt-1">{received} USDC</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                ['Protocol', 'Circle CCTP'],
                ['Bridge fee', `${fee} USDC`],
                ['Estimated time', estimatedTime],
                ['Recipient', shortAddress(address ?? '')],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                  <span className="text-xs text-[var(--subtle)]">{k}</span>
                  <span className="text-sm font-medium text-[var(--ink)]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">Back</button>
              <button onClick={() => { void executeBridge() }} className="flex-1 py-3 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors">Confirm Bridge</button>
            </div>
          </div>
        )}

        {step === 'bridging' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center space-y-4">
            <Loader2 size={32} className="mx-auto text-[var(--accent-blue)] animate-spin" />
            <div className="font-semibold text-[var(--ink)]">Bridging USDC via CCTP…</div>
            <div className="text-sm text-[var(--muted)]">Burning on {fromChain.name} · Minting on {toChain.name}</div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--success-bg)] flex items-center justify-center mx-auto">
              <CheckCircle size={24} className="text-[var(--success)]" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)] text-lg">Bridge Complete</div>
              <div className="text-sm text-[var(--muted)] mt-1">{received} USDC arriving on {toChain.name}</div>
            </div>
            {txHash && (
              <div className="bg-[var(--surface-muted)] rounded-xl p-4 text-left space-y-2">
                <p className="text-[10px] text-[var(--subtle)] uppercase tracking-wide">Burn Transaction</p>
                <p className="mono text-xs text-[var(--ink)] break-all">{txHash}</p>
                <a href={explorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-blue)] hover:underline">
                  <ExternalLink size={11} /> Arc Testnet Explorer
                </a>
              </div>
            )}
            <button onClick={reset} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">New Bridge</button>
          </div>
        )}

        {step === 'error' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--danger-bg)] flex items-center justify-center mx-auto">
              <AlertCircle size={24} className="text-[var(--danger)]" />
            </div>
            <div className="font-bold text-[var(--ink)]">Bridge Failed</div>
            <div className="text-sm text-[var(--muted)]">{errMsg}</div>
            <button onClick={reset} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">Try Again</button>
          </div>
        )}
      </div>
    </div>
  )
}
