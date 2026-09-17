/**
 * wagmi configuration — WEKA on Arc Testnet
 * Built with Arc Studio — https://studio.arc.io
 */

import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { arcTestnet } from 'viem/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'
import { registerChain } from './tracing'

// Pre-register chain RPC URLs so trace events show correct chain names immediately
registerChain(arcTestnet.id, arcTestnet.rpcUrls.default.http[0])

export const config = createConfig({
  chains: [arcTestnet, mainnet],
  connectors: [
    injected(),                                      // MetaMask, browser wallets
    coinbaseWallet({ appName: 'WEKA GlobalPay' }),   // Coinbase Wallet
  ],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.io'),
    [mainnet.id]: http(),
  },
})
