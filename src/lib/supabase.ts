import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[WEKA] Supabase env vars missing — app will fall back to demo data. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env')
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')

// ── Database types ──────────────────────────────────────────────────────────

export interface DbCustomer {
  id: string
  name: string
  email: string
  phone: string | null
  country: string | null
  status: 'active' | 'suspended' | 'pending_kyc'
  balance: number
  verified: boolean
  transactions: number
  transaction_count: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbWallet {
  id: string
  customer_id: string
  balance: number
  pending: number
  currency: string
  status: 'active' | 'frozen' | 'inactive'
  network: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbTransaction {
  id: string
  customer_id: string
  amount: number
  currency: string
  type: 'payment' | 'transfer' | 'bridge' | 'swap' | 'deposit' | 'withdrawal'
  status: 'completed' | 'pending' | 'failed' | 'processing'
  sender: string | null
  recipient: string | null
  fee: number | null
  network: string | null
  request_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbPaymentLink {
  id: string
  amount: number
  description: string
  currency: string
  status: 'active' | 'expired' | 'paid'
  expires_at: string | null
  payments_received: number
  url: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbPaymentRequest {
  id: string
  from_email: string
  amount: number
  description: string
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  expires_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbApiLog {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  endpoint: string
  status_code: number
  response_time: number
  request_id: string | null
  request_body: Record<string, unknown> | null
  response_body: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface DbWebhookEndpoint {
  id: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  secret: string
  created_at: string
  updated_at: string
}

export interface DbWebhookDelivery {
  id: string
  endpoint_id: string
  event: string
  status: 'success' | 'failed' | 'pending'
  attempts: number
  response_code: number | null
  response_body: string | null
  created_at: string
}

// ── Auth helpers ─────────────────────────────────────────────────────────────

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUp = (email: string, password: string) =>
  supabase.auth.signUp({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()
