import { useState } from 'react'
import { Copy, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface DocSection {
  id: string
  title: string
  method: 'POST' | 'GET' | 'PUT' | 'DELETE'
  endpoint: string
  description: string
  request: string
  response: string
}

const DOCS: DocSection[] = [
  {
    id: 'create-customer',
    title: 'Create Customer',
    method: 'POST',
    endpoint: '/v1/customers',
    description: 'Creates a new customer object in GlobalPay. Use this to onboard businesses or individuals who will send or receive payments.',
    request: `{
  "name": "Acme Corp",
  "email": "billing@acmecorp.io",
  "phone": "+1 415 555 0100",
  "country": "US",
  "metadata": {
    "internal_id": "usr_99102",
    "plan": "enterprise"
  }
}`,
    response: `{
  "id": "cus_a1B2c3D4",
  "name": "Acme Corp",
  "email": "billing@acmecorp.io",
  "status": "active",
  "created": "2026-09-17T14:00:00Z"
}`,
  },
  {
    id: 'create-wallet',
    title: 'Create Wallet',
    method: 'POST',
    endpoint: '/v1/wallets',
    description: 'Creates a USDC wallet for a customer. Wallets are backed by Arc App Kit unified balance infrastructure.',
    request: `{
  "customer_id": "cus_a1B2c3D4",
  "network": "arc",
  "currency": "USDC"
}`,
    response: `{
  "id": "wal_x9Y8z7W6",
  "customer_id": "cus_a1B2c3D4",
  "currency": "USDC",
  "balance": "0.00",
  "network": "arc",
  "status": "active",
  "created": "2026-09-17T14:01:00Z"
}`,
  },
  {
    id: 'get-balance',
    title: 'Get Balance',
    method: 'GET',
    endpoint: '/v1/wallets/{wallet_id}/balance',
    description: 'Returns the current balance of a wallet, including available and pending amounts.',
    request: `GET /v1/wallets/wal_x9Y8z7W6/balance`,
    response: `{
  "wallet_id": "wal_x9Y8z7W6",
  "available": "24820.45",
  "pending": "1240.00",
  "total": "26060.45",
  "currency": "USDC"
}`,
  },
  {
    id: 'create-transfer',
    title: 'Create Transfer',
    method: 'POST',
    endpoint: '/v1/transfers',
    description: 'Send USDC from a customer wallet to a recipient. Supports email, customer ID, or wallet address as recipient.',
    request: `{
  "customer_id": "cus_a1B2c3D4",
  "recipient": "vendor@example.com",
  "amount": "250.00",
  "currency": "USDC",
  "reference": "Invoice #1024"
}`,
    response: `{
  "id": "txn_pQ5rS6tU",
  "status": "processing",
  "amount": "250.00",
  "currency": "USDC",
  "fee": "0.10",
  "created": "2026-09-17T14:02:00Z"
}`,
  },
  {
    id: 'create-payment-link',
    title: 'Create Payment Link',
    method: 'POST',
    endpoint: '/v1/payment-links',
    description: 'Generate a shareable payment link that customers can pay via the hosted checkout page.',
    request: `{
  "amount": "500.00",
  "currency": "USDC",
  "description": "Design project",
  "expires_in": "7d",
  "metadata": {
    "project_id": "proj_88"
  }
}`,
    response: `{
  "id": "pl_nB3mA2kP",
  "url": "https://pay.globalpay.io/pl_nB3mA2kP",
  "amount": "500.00",
  "status": "active",
  "expires": "2026-09-24T00:00:00Z"
}`,
  },
  {
    id: 'create-bridge',
    title: 'Create Bridge Transfer',
    method: 'POST',
    endpoint: '/v1/bridge',
    description: 'Move USDC between supported blockchain networks. Uses CCTP for cross-chain settlement.',
    request: `{
  "customer_id": "cus_a1B2c3D4",
  "from_network": "arc",
  "to_network": "ethereum",
  "amount": "1000.00",
  "currency": "USDC"
}`,
    response: `{
  "id": "brg_vW7xX8yY",
  "status": "processing",
  "from_network": "arc",
  "to_network": "ethereum",
  "amount": "1000.00",
  "fee": "1.00",
  "estimated_completion": "30s"
}`,
  },
  {
    id: 'create-webhook',
    title: 'Create Webhook',
    method: 'POST',
    endpoint: '/v1/webhooks',
    description: 'Register a webhook endpoint to receive real-time event notifications for your integration.',
    request: `{
  "url": "https://api.yourapp.com/webhooks",
  "events": [
    "payment.completed",
    "transfer.completed",
    "deposit.received"
  ]
}`,
    response: `{
  "id": "wh_zZ1aA2bB",
  "url": "https://api.yourapp.com/webhooks",
  "events": ["payment.completed", "transfer.completed"],
  "secret": "whsec_...",
  "status": "active"
}`,
  },
]

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-50 text-blue-700 border-blue-200',
  POST: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PUT: 'bg-amber-50 text-amber-700 border-amber-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
}

function DocCard({ doc }: { doc: DocSection }) {
  const [open, setOpen] = useState(false)
  const copy = (s: string) => { void navigator.clipboard.writeText(s); toast.success('Copied') }

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[var(--surface-muted)] transition-colors text-left"
      >
        <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase border ${METHOD_COLORS[doc.method]}`}>{doc.method}</span>
        <span className="mono text-sm text-[var(--ink)] font-medium">{doc.endpoint}</span>
        <span className="text-sm text-[var(--muted)] flex-1">{doc.title}</span>
        {open ? <ChevronDown size={14} className="text-[var(--subtle)]" /> : <ChevronRight size={14} className="text-[var(--subtle)]" />}
      </button>

      {open && (
        <div className="border-t border-[var(--border)] px-6 py-5 space-y-5">
          <p className="text-sm text-[var(--muted)]">{doc.description}</p>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--subtle)]">Request</p>
              <button onClick={() => copy(doc.request)} className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                <Copy size={11} /> Copy
              </button>
            </div>
            <pre className="mono text-xs bg-[var(--ink)] text-green-400 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">{doc.request}</pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--subtle)]">Response</p>
              <button onClick={() => copy(doc.response)} className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                <Copy size={11} /> Copy
              </button>
            </div>
            <pre className="mono text-xs bg-[var(--surface-muted)] text-[var(--ink)] rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">{doc.response}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ApiDocs() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-bold text-[var(--ink)]">API Documentation</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Build global payment flows through one API</p>
      </div>

      {/* Quick start */}
      <div className="bg-gradient-to-br from-[var(--ink)] to-[#1a3a5f] rounded-2xl p-6 text-white">
        <h2 className="font-bold text-lg mb-1">Quick Start</h2>
        <p className="text-sm opacity-70 mb-4">Install the SDK and make your first API call in under 2 minutes.</p>
        <pre className="mono text-xs bg-white/10 rounded-xl p-4 text-white whitespace-pre">{`const globalpay = require('@globalpay/node')
const gp = globalpay('sk_test_your_key_here')

// Create a customer
const customer = await gp.customers.create({
  name: 'Acme Corp',
  email: 'billing@acmecorp.io'
})

// Send a payment
const transfer = await gp.transfers.create({
  customer_id: customer.id,
  recipient: 'vendor@example.com',
  amount: '1000.00',
  currency: 'USDC'
})`}</pre>
      </div>

      {/* Base URL */}
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-[var(--border)] px-5 py-3.5">
        <span className="text-xs font-semibold text-[var(--subtle)] uppercase tracking-wide">Base URL</span>
        <code className="mono text-sm text-[var(--ink)] flex-1">https://api.globalpay.io/v1</code>
        <button
          onClick={() => { void navigator.clipboard.writeText('https://api.globalpay.io/v1'); toast.success('Copied') }}
          className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--muted)] transition-colors"
        >
          <Copy size={13} />
        </button>
      </div>

      {/* Doc sections */}
      <div className="space-y-3">
        {DOCS.map(doc => <DocCard key={doc.id} doc={doc} />)}
      </div>
    </div>
  )
}
