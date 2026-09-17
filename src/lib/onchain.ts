/**
 * WEKA — Arc Testnet onchain constants and helpers.
 * Arc Testnet: chain ID 5042002, USDC at 0x3600000000000000000000000000000000000000
 * USDC has 6 decimals via ERC-20 interface; 18 via native view (gas only).
 * Always use ERC-20 interface (6 decimals) for balances, transfers, display.
 * Never double-count native + ERC-20 — they are the same pool.
 */
import { erc20Abi, type Address } from 'viem'
import { arcTestnet } from 'viem/chains'

// ── Chain ──────────────────────────────────────────────────────────────────────
export const ARC_TESTNET_CHAIN_ID = arcTestnet.id          // 5042002
export const ARC_TESTNET_EXPLORER = 'https://explorer.testnet.arc.io'
export const ARC_TESTNET_FAUCET   = 'https://faucet.circle.com'

// ── USDC ──────────────────────────────────────────────────────────────────────
// Same address on mainnet and testnet (native predeploy)
export const USDC_ADDRESS: Address = '0x3600000000000000000000000000000000000000'
export const USDC_DECIMALS = 6
export const USDC_ABI = erc20Abi

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Parse a human-readable USDC amount to raw uint256 (6 decimals) */
export function parseUsdc(amount: string | number): bigint {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n) || n < 0) throw new Error('Invalid USDC amount')
  return BigInt(Math.round(n * 10 ** USDC_DECIMALS))
}

/** Format raw uint256 (6 decimals) to human-readable string */
export function formatUsdc(raw: bigint | undefined): string {
  if (raw === undefined) return '0.00'
  return (Number(raw) / 10 ** USDC_DECIMALS).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Build an explorer URL for a transaction hash */
export function explorerTxUrl(hash: string): string {
  return `${ARC_TESTNET_EXPLORER}/tx/${hash}`
}

/** Build an explorer URL for an address */
export function explorerAddressUrl(address: string): string {
  return `${ARC_TESTNET_EXPLORER}/address/${address}`
}

/** Shorten a 0x address for display */
export function shortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

/** True if string looks like a valid EVM address */
export function isValidAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr)
}

export { arcTestnet }
