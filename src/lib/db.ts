/* oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-argument, typescript/no-unsafe-member-access, typescript/no-unsafe-return, typescript/no-unsafe-call */
/**
 * WEKA Data Layer
 * Each function tries Supabase first; falls back to static demo data
 * so the app works even without env vars configured.
 * Supabase JS v2 returns `any` for untyped schemas — suppressed at file level.
 */
import { supabase, DbCustomer, DbWallet, DbTransaction, DbPaymentLink, DbPaymentRequest, DbApiLog, DbWebhookEndpoint, DbWebhookDelivery } from './supabase'
import {
  CUSTOMERS as DEMO_CUSTOMERS,
  WALLETS as DEMO_WALLETS,
  TRANSACTIONS as DEMO_TRANSACTIONS,
  PAYMENT_LINKS as DEMO_PAYMENT_LINKS,
  PAYMENT_REQUESTS as DEMO_PAYMENT_REQUESTS,
  API_LOGS as DEMO_API_LOGS,
  WEBHOOK_ENDPOINTS as DEMO_WEBHOOK_ENDPOINTS,
  WEBHOOK_DELIVERIES as DEMO_WEBHOOK_DELIVERIES,
} from '../data/demo'

const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

// ── Customers ─────────────────────────────────────────────────────────────────

export async function fetchCustomers(): Promise<DbCustomer[]> {
  if (!hasSupabase) return DEMO_CUSTOMERS.map(toCust)
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
  if (error) { console.error(error); return DEMO_CUSTOMERS.map(toCust) }
  return data as DbCustomer[]
}

export async function createCustomer(input: Partial<DbCustomer>): Promise<DbCustomer | null> {
  if (!hasSupabase) return null
  const { data, error } = await supabase.from('customers').insert(input).select().single()
  if (error) { console.error(error); return null }
  return data as DbCustomer
}

export async function updateCustomer(id: string, input: Partial<DbCustomer>): Promise<DbCustomer | null> {
  if (!hasSupabase) return null
  const { data, error } = await supabase.from('customers').update(input).eq('id', id).select().single()
  if (error) { console.error(error); return null }
  return data as DbCustomer
}

// ── Wallets ───────────────────────────────────────────────────────────────────

export async function fetchWallets(): Promise<DbWallet[]> {
  if (!hasSupabase) return DEMO_WALLETS.map(toWallet)
  const { data, error } = await supabase.from('wallets').select('*').order('created_at', { ascending: false })
  if (error) { console.error(error); return DEMO_WALLETS.map(toWallet) }
  return data as DbWallet[]
}

export async function createWallet(input: Partial<DbWallet>): Promise<DbWallet | null> {
  if (!hasSupabase) return null
  const { data, error } = await supabase.from('wallets').insert(input).select().single()
  if (error) { console.error(error); return null }
  return data as DbWallet
}

// ── Transactions ──────────────────────────────────────────────────────────────

export async function fetchTransactions(opts?: { customerId?: string; status?: string; limit?: number }): Promise<DbTransaction[]> {
  if (!hasSupabase) {
    let list = DEMO_TRANSACTIONS.map(toTx) as DbTransaction[]
    if (opts?.customerId) list = list.filter(t => t.customer_id === opts.customerId)
    if (opts?.status) list = list.filter(t => t.status === opts.status)
    return opts?.limit ? list.slice(0, opts.limit) : list
  }
  let query = supabase.from('transactions').select('*').order('created_at', { ascending: false })
  if (opts?.customerId) query = query.eq('customer_id', opts.customerId)
  if (opts?.status) query = query.eq('status', opts.status)
  if (opts?.limit) query = query.limit(opts.limit)
  const { data, error } = await query
  if (error) { console.error(error); return DEMO_TRANSACTIONS.map(toTx) }
  return data as DbTransaction[]
}

export async function createTransaction(input: Partial<DbTransaction>): Promise<DbTransaction | null> {
  if (!hasSupabase) return null
  const { data, error } = await supabase.from('transactions').insert(input).select().single()
  if (error) { console.error(error); return null }
  return data as DbTransaction
}

// ── Payment Links ─────────────────────────────────────────────────────────────

export async function fetchPaymentLinks(): Promise<DbPaymentLink[]> {
  if (!hasSupabase) return DEMO_PAYMENT_LINKS.map(toPL)
  const { data, error } = await supabase.from('payment_links').select('*').order('created_at', { ascending: false })
  if (error) { console.error(error); return DEMO_PAYMENT_LINKS.map(toPL) }
  return data as DbPaymentLink[]
}

export async function createPaymentLink(input: Partial<DbPaymentLink>): Promise<DbPaymentLink | null> {
  if (!hasSupabase) return null
  const { data, error } = await supabase.from('payment_links').insert(input).select().single()
  if (error) { console.error(error); return null }
  return data as DbPaymentLink
}

// ── Payment Requests ──────────────────────────────────────────────────────────

export async function fetchPaymentRequests(): Promise<DbPaymentRequest[]> {
  if (!hasSupabase) return DEMO_PAYMENT_REQUESTS.map(toPR)
  const { data, error } = await supabase.from('payment_requests').select('*').order('created_at', { ascending: false })
  if (error) { console.error(error); return DEMO_PAYMENT_REQUESTS.map(toPR) }
  return data as DbPaymentRequest[]
}

export async function createPaymentRequest(input: Partial<DbPaymentRequest>): Promise<DbPaymentRequest | null> {
  if (!hasSupabase) return null
  const { data, error } = await supabase.from('payment_requests').insert(input).select().single()
  if (error) { console.error(error); return null }
  return data as DbPaymentRequest
}

// ── API Logs ──────────────────────────────────────────────────────────────────

export async function fetchApiLogs(limit = 50): Promise<DbApiLog[]> {
  if (!hasSupabase) return DEMO_API_LOGS.map(toLog)
  const { data, error } = await supabase.from('api_logs').select('*').order('created_at', { ascending: false }).limit(limit)
  if (error) { console.error(error); return DEMO_API_LOGS.map(toLog) }
  return data as DbApiLog[]
}

export async function insertApiLog(input: Partial<DbApiLog>): Promise<void> {
  if (!hasSupabase) return
  await supabase.from('api_logs').insert(input)
}

// ── Webhooks ──────────────────────────────────────────────────────────────────

export async function fetchWebhookEndpoints(): Promise<DbWebhookEndpoint[]> {
  if (!hasSupabase) return DEMO_WEBHOOK_ENDPOINTS.map(toWHEp)
  const { data, error } = await supabase.from('webhook_endpoints').select('*').order('created_at', { ascending: false })
  if (error) { console.error(error); return DEMO_WEBHOOK_ENDPOINTS.map(toWHEp) }
  return data as DbWebhookEndpoint[]
}

export async function createWebhookEndpoint(input: Partial<DbWebhookEndpoint>): Promise<DbWebhookEndpoint | null> {
  if (!hasSupabase) return null
  const { data, error } = await supabase.from('webhook_endpoints').insert(input).select().single()
  if (error) { console.error(error); return null }
  return data as DbWebhookEndpoint
}

export async function deleteWebhookEndpoint(id: string): Promise<boolean> {
  if (!hasSupabase) return false
  const { error } = await supabase.from('webhook_endpoints').delete().eq('id', id)
  return !error
}

export async function fetchWebhookDeliveries(): Promise<DbWebhookDelivery[]> {
  if (!hasSupabase) return DEMO_WEBHOOK_DELIVERIES.map(toWHDel)
  const { data, error } = await supabase.from('webhook_deliveries').select('*').order('created_at', { ascending: false })
  if (error) { console.error(error); return DEMO_WEBHOOK_DELIVERIES.map(toWHDel) }
  return data as DbWebhookDelivery[]
}

// ── Demo-to-DB shape adapters ─────────────────────────────────────────────────

function toCust(c: typeof DEMO_CUSTOMERS[0]) {
  return { ...c, phone: c.phone ?? null, country: c.country ?? null, transaction_count: c.transactions ?? 0, metadata: {}, created_at: c.created + 'T00:00:00Z', updated_at: c.created + 'T00:00:00Z' }
}
function toWallet(w: typeof DEMO_WALLETS[0]) {
  return { ...w, customer_id: w.customerId, metadata: {}, created_at: w.created + 'T00:00:00Z', updated_at: w.created + 'T00:00:00Z' }
}
function toTx(t: typeof DEMO_TRANSACTIONS[0]) {
  return { ...t, customer_id: t.customerId, sender: t.sender ?? null, recipient: t.recipient ?? null, fee: t.fee ?? null, network: t.network ?? null, request_id: t.requestId ?? null, metadata: t.metadata ?? {}, created_at: t.date, updated_at: t.date }
}
function toPL(p: typeof DEMO_PAYMENT_LINKS[0]) {
  return { ...p, expires_at: p.expires + 'T23:59:59Z', payments_received: p.paymentsReceived, url: p.url ?? null, metadata: {}, created_at: p.created + 'T00:00:00Z', updated_at: p.created + 'T00:00:00Z' }
}
function toPR(r: typeof DEMO_PAYMENT_REQUESTS[0]) {
  return { ...r, from_email: r.from, expires_at: r.expires + 'T23:59:59Z', metadata: {}, created_at: r.created + 'T00:00:00Z', updated_at: r.created + 'T00:00:00Z' }
}
function toLog(l: typeof DEMO_API_LOGS[0]) {
  return { ...l, status_code: l.status, response_time: l.responseTime, request_id: l.requestId, request_body: l.body ? JSON.parse(l.body) : null, response_body: l.response ? JSON.parse(l.response) : null, ip_address: null, created_at: l.timestamp }
}
function toWHEp(w: typeof DEMO_WEBHOOK_ENDPOINTS[0]) {
  return { ...w, created_at: w.created + 'T00:00:00Z', updated_at: w.created + 'T00:00:00Z' }
}
function toWHDel(d: typeof DEMO_WEBHOOK_DELIVERIES[0]) {
  return { ...d, endpoint_id: d.endpointId, response_code: d.responseCode ?? null, response_body: null, created_at: d.timestamp }
}
