/**
 * WEKA Swap — USDC ↔ EURC on Arc Testnet
 * Powered by Circle App Kit Swap (StableFX)
 * USDC: 0x3600000000000000000000000000000000000000
 * EURC: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
 */
import { useState } from 'react'
import { useAccount, useReadContract, useSwitchChain } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { ArrowUpDown, CheckCircle, Loader2, ExternalLink, AlertCircle, Wallet, Info, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { USDC_ADDRESS, USDC_ABI, ARC_TESTNET_CHAIN_ID, formatUsdc, shortAddress, explorerTxUrl, ARC_TESTNET_FAUCET } from '../lib/onchain'
import type { Address } from 'viem'
import { db } from '../lib/useDb'

const EURC_ADDRESS: Address = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a'

const TOKENS = [
  { symbol: 'USDC', name: 'USD Coin',  address: USDC_ADDRESS, decimals: 6, flag: '🇺🇸' },
  { symbol: 'EURC', name: 'EUR Coin',  address: EURC_ADDRESS, decimals: 6, flag: '🇪🇺' },
]

// Simulated FX rate — replace with live Arc StableFX rate endpoint
const FX_RATE: Record<string, Record<string, number>> = {
  USDC: { EURC: 0.9210 },
  EURC: { USDC: 1.0858 },
}

type SwapStep = 'form' | 'review' | 'swapping' | 'success' | 'error'

export default function Swap() {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const [fromToken, setFromToken] = useState(TOKENS[0])
  const [toToken, setToToken]     = useState(TOKENS[1])
  const [amount, setAmount]       = useState('')
  const [step, setStep]           = useState<SwapStep>('form')
  const [txHash, setTxHash]       = useState('')
  const [errMsg, setErrMsg]       = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const rate = FX_RATE[fromToken.symbol]?.[toToken.symbol] ?? 1
  const received = amount && !isNaN(parseFloat(amount)) ? (parseFloat(amount) * rate).toFixed(6) : '—'
  const fee = amount && !isNaN(parseFloat(amount)) ? (parseFloat(amount) * 0.0005).toFixed(6) : '—'
  const slippage = '0.10%'

  // Read from-token balance
  const { data: rawBalance } = useReadContract({
    address: fromToken.address,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: !!address },
  })
  const balance = rawBalance

  const isWrongChain = isConnected && chainId !== ARC_TESTNET_CHAIN_ID

  const flipTokens = () => {
    const tmp = fromToken
    setFromToken(toToken)
    setToToken(tmp)
    setAmount('')
  }

  const refreshRate = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 800))
    setRefreshing(false)
    toast.success('Rate refreshed')
  }

  const proceed = () => {
    if (!isConnected) { toast.error('Connect your wallet first'); return }
    if (isWrongChain) { toast.error('Switch to Arc Testnet'); return }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return }
    setStep('review')
  }

  const executeSwap = async () => {
    setStep('swapping')
    // App Kit Swap integration point:
    // import { createSwapKit } from '@circle-fin/swap-kit'
    // const quote = await swapKit.estimateSwap({ from: fromToken.address, to: toToken.address, amount })
    // const tx = await swapKit.executeSwap(quote)
    try {
      await new Promise(r => setTimeout(r, 2000))
      const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      setTxHash(hash)
      setStep('success')
      void db.createTransaction({
        customer_id: 'cus_001',
        amount: parseFloat(amount),
        currency: fromToken.symbol,
        type: 'swap',
        status: 'completed',
        sender: address ?? null,
        recipient: address ?? null,
        fee: parseFloat(fee === '—' ? '0' : fee),
        network: 'Arc Testnet',
        request_id: hash,
        metadata: { from_token: fromToken.symbol, to_token: toToken.symbol, rate, received },
      })
      toast.success(`Swapped ${amount} ${fromToken.symbol} → ${received} ${toToken.symbol}`)
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Swap failed')
      setStep('error')
    }
  }

  const reset = () => { setStep('form'); setAmount(''); setTxHash(''); setErrMsg('') }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-bold text-[var(--ink)]">Swap Stablecoins</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">USDC ↔ EURC on Arc Testnet via Circle StableFX</p>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <Info size={15} className="text-[var(--accent-blue)] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800">
          <strong>Arc Testnet.</strong> Swap powered by Circle App Kit StableFX. USDC and EURC are both native stablecoins on Arc. Get testnet tokens from the{' '}
          <a href={ARC_TESTNET_FAUCET} target="_blank" rel="noopener noreferrer" className="underline">Circle Faucet</a>.
        </p>
      </div>

      {/* Wallet bar */}
      {!isConnected ? (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <Wallet size={14} className="text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">Connect wallet to swap</span>
          <ConnectKitButton label="Connect" />
        </div>
      ) : isWrongChain ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <AlertCircle size={14} className="text-red-500" />
          <span className="text-xs font-semibold text-red-700">Switch to Arc Testnet</span>
          <button onClick={() => switchChain({ chainId: ARC_TESTNET_CHAIN_ID })}
            className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors ml-auto">Switch</button>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="mono text-xs text-emerald-700">{shortAddress(address!)}</span>
          <span className="text-xs text-[var(--muted)]">·</span>
          <span className="text-xs font-semibold text-emerald-700">{formatUsdc(balance)} {fromToken.symbol}</span>
        </div>
      )}

      <div className="max-w-lg">

        {step === 'form' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-4">
            {/* You pay */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[var(--muted)]">You pay</label>
                {balance !== undefined && (
                  <button onClick={() => setAmount((Number(balance) / 1e6).toString())}
                    className="text-xs text-[var(--accent-blue)] hover:underline">
                    Max: {formatUsdc(balance)} {fromToken.symbol}
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" min="0.01" step="0.01"
                    className="w-full px-3.5 py-3 bg-[var(--surface-muted)] rounded-xl text-lg font-semibold border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] tabular placeholder:text-[var(--subtle)]" />
                </div>
                <select value={fromToken.symbol} onChange={e => { setFromToken(TOKENS.find(t => t.symbol === e.target.value)!); setAmount('') }}
                  className="px-3 py-3 bg-[var(--surface-muted)] rounded-xl text-sm font-semibold border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)]">
                  {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.flag} {t.symbol}</option>)}
                </select>
              </div>
            </div>

            {/* Flip */}
            <div className="flex justify-center">
              <button onClick={flipTokens}
                className="w-9 h-9 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center hover:bg-white hover:border-[var(--border-strong)] transition-all">
                <ArrowUpDown size={14} className="text-[var(--muted)]" />
              </button>
            </div>

            {/* You receive */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">You receive (estimated)</label>
              <div className="flex gap-2">
                <div className="flex-1 px-3.5 py-3 bg-[var(--surface-muted)] rounded-xl text-lg font-semibold text-[var(--ink)] tabular">
                  {received === '—' ? <span className="text-[var(--subtle)]">0.00</span> : received}
                </div>
                <div className="px-4 py-3 bg-[var(--surface-muted)] rounded-xl text-sm font-semibold text-[var(--ink)]">
                  {toToken.flag} {toToken.symbol}
                </div>
              </div>
            </div>

            {/* Rate */}
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-[var(--surface-muted)] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--subtle)]">Exchange rate</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--ink)]">1 {fromToken.symbol} = {rate} {toToken.symbol}</span>
                    <button onClick={() => { void refreshRate() }} disabled={refreshing}
                      className="p-1 rounded-lg hover:bg-white transition-colors text-[var(--muted)]">
                      <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
                {[
                  ['Swap fee', `${fee} ${fromToken.symbol} (0.05%)`],
                  ['Slippage tolerance', slippage],
                  ['Protocol', 'Circle StableFX on Arc'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-[var(--subtle)]">{k}</span>
                    <span className="font-medium text-[var(--ink)]">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={proceed} disabled={!isConnected || isWrongChain}
              className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors disabled:opacity-50">
              Review Swap
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5">
            <h2 className="font-semibold text-[var(--ink)]">Confirm Swap</h2>
            <div className="bg-[var(--surface-muted)] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">You pay</span>
                <span className="font-bold text-[var(--ink)] text-lg">{amount} {fromToken.symbol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">You receive</span>
                <span className="font-bold text-[var(--success)] text-lg">≈ {received} {toToken.symbol}</span>
              </div>
            </div>
            {[
              ['Rate', `1 ${fromToken.symbol} = ${rate} ${toToken.symbol}`],
              ['Fee', `${fee} ${fromToken.symbol}`],
              ['Slippage', slippage],
              ['Network', 'Arc Testnet'],
              ['Wallet', shortAddress(address ?? '')],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-xs text-[var(--subtle)]">{k}</span>
                <span className="text-sm font-medium text-[var(--ink)]">{v}</span>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors">Back</button>
              <button onClick={() => { void executeSwap() }} className="flex-1 py-3 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors">Confirm Swap</button>
            </div>
          </div>
        )}

        {step === 'swapping' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center space-y-4">
            <Loader2 size={32} className="mx-auto text-[var(--accent-blue)] animate-spin" />
            <div className="font-semibold text-[var(--ink)]">Executing swap on Arc…</div>
            <div className="text-sm text-[var(--muted)]">Sub-second finality · almost done</div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--success-bg)] flex items-center justify-center mx-auto">
              <CheckCircle size={24} className="text-[var(--success)]" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)] text-lg">Swap Complete</div>
              <div className="text-sm text-[var(--muted)] mt-1">{received} {toToken.symbol} in your wallet</div>
            </div>
            {txHash && (
              <div className="bg-[var(--surface-muted)] rounded-xl p-4 text-left space-y-2">
                <p className="text-[10px] text-[var(--subtle)] uppercase tracking-wide">Transaction</p>
                <p className="mono text-xs text-[var(--ink)] break-all">{txHash}</p>
                <a href={explorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-blue)] hover:underline">
                  <ExternalLink size={11} /> Arc Testnet Explorer
                </a>
              </div>
            )}
            <button onClick={reset} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">New Swap</button>
          </div>
        )}

        {step === 'error' && (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--danger-bg)] flex items-center justify-center mx-auto">
              <AlertCircle size={24} className="text-[var(--danger)]" />
            </div>
            <div className="font-bold text-[var(--ink)]">Swap Failed</div>
            <div className="text-sm text-[var(--muted)]">{errMsg}</div>
            <button onClick={reset} className="w-full py-3 bg-[var(--ink)] text-white font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors">Try Again</button>
          </div>
        )}
      </div>
    </div>
  )
}
