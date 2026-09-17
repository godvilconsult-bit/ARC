// Demo data for WEKA GlobalPay prototype

export type TxStatus = 'completed' | 'pending' | 'failed' | 'processing'
export type CustomerStatus = 'active' | 'suspended' | 'pending_kyc'
export type WalletStatus = 'active' | 'frozen' | 'inactive'
export type RequestStatus = 'pending' | 'paid' | 'expired' | 'cancelled'

export interface Transaction {
  id: string
  customer: string
  customerId: string
  amount: number
  currency: string
  type: 'payment' | 'transfer' | 'bridge' | 'swap' | 'deposit' | 'withdrawal'
  status: TxStatus
  date: string
  sender?: string
  recipient?: string
  fee?: number
  network?: string
  requestId?: string
  metadata?: Record<string, string>
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  country: string
  status: CustomerStatus
  balance: number
  created: string
  verified: boolean
  transactions: number
}

export interface Wallet {
  id: string
  customerId: string
  customer: string
  balance: number
  pending: number
  currency: string
  status: WalletStatus
  created: string
  network: string
}

export interface ApiLog {
  id: string
  timestamp: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  status: number
  responseTime: number
  requestId: string
  body?: string
  response?: string
}

export interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  created: string
  secret: string
}

export interface WebhookDelivery {
  id: string
  endpointId: string
  event: string
  status: 'success' | 'failed'
  attempts: number
  timestamp: string
  responseCode?: number
}

export interface PaymentLink {
  id: string
  amount: number
  description: string
  currency: string
  status: 'active' | 'expired' | 'paid'
  expires: string
  paymentsReceived: number
  created: string
  url: string
}

export interface PaymentRequest {
  id: string
  from: string
  amount: number
  description: string
  status: RequestStatus
  created: string
  expires: string
}

// ---- TRANSACTIONS ----
export const TRANSACTIONS: Transaction[] = [
  { id: 'txn_9k2mP3qR', customer: 'Acme Corp', customerId: 'cus_001', amount: 12500.00, currency: 'USDC', type: 'payment', status: 'completed', date: '2026-09-17T14:32:00Z', sender: 'Acme Corp', recipient: 'Vendor LLC', fee: 0.25, network: 'Arc', requestId: 'req_aB3cD4eF', metadata: { invoice: 'INV-2026-0881', po: 'PO-44123' } },
  { id: 'txn_7hJkL8mN', customer: 'TechFlow Inc', customerId: 'cus_002', amount: 3250.00, currency: 'USDC', type: 'transfer', status: 'processing', date: '2026-09-17T13:55:00Z', sender: 'TechFlow Inc', recipient: 'Remote Contractor', fee: 0.10, network: 'Arc', requestId: 'req_gH5iJ6kL' },
  { id: 'txn_2nOpQ5rS', customer: 'Global Markets', customerId: 'cus_003', amount: 85000.00, currency: 'USDC', type: 'bridge', status: 'completed', date: '2026-09-17T12:10:00Z', sender: 'Arc', recipient: 'Ethereum', fee: 1.20, network: 'Arc → Ethereum', requestId: 'req_mN7oP8qR' },
  { id: 'txn_4tUvW9xY', customer: 'Sunrise Payments', customerId: 'cus_004', amount: 750.00, currency: 'USDC', type: 'payment', status: 'failed', date: '2026-09-17T11:44:00Z', sender: 'Sunrise Payments', recipient: 'Partner Co', fee: 0, network: 'Arc', requestId: 'req_sT9uV0wX' },
  { id: 'txn_6zA1B2cD', customer: 'NovaPay', customerId: 'cus_005', amount: 4800.00, currency: 'USDC', type: 'transfer', status: 'completed', date: '2026-09-17T10:22:00Z', sender: 'NovaPay', recipient: 'Employee Pool', fee: 0.15, network: 'Arc', requestId: 'req_yZ0aB1cD' },
  { id: 'txn_3eF4G5hI', customer: 'Acme Corp', customerId: 'cus_001', amount: 220.50, currency: 'USDC', type: 'swap', status: 'completed', date: '2026-09-17T09:31:00Z', fee: 0.05, network: 'Arc', requestId: 'req_eF2gH3iJ' },
  { id: 'txn_8jK9L0mN', customer: 'CloudBase', customerId: 'cus_006', amount: 18000.00, currency: 'USDC', type: 'deposit', status: 'pending', date: '2026-09-17T08:15:00Z', fee: 0.50, network: 'Base', requestId: 'req_kL4mN5oP' },
  { id: 'txn_5pQ6R7sT', customer: 'TechFlow Inc', customerId: 'cus_002', amount: 1100.00, currency: 'USDC', type: 'payment', status: 'completed', date: '2026-09-16T22:10:00Z', sender: 'TechFlow Inc', recipient: 'SaaS Vendor', fee: 0.08, network: 'Arc', requestId: 'req_pQ6rS7tU' },
  { id: 'txn_1uV2W3xY', customer: 'Meridian Fund', customerId: 'cus_007', amount: 125000.00, currency: 'USDC', type: 'transfer', status: 'completed', date: '2026-09-16T18:40:00Z', fee: 3.00, network: 'Arc', requestId: 'req_uV8wX9yZ' },
  { id: 'txn_9zA0B1cD', customer: 'Sunrise Payments', customerId: 'cus_004', amount: 560.00, currency: 'USDC', type: 'payment', status: 'processing', date: '2026-09-16T16:55:00Z', fee: 0.12, network: 'Polygon', requestId: 'req_aB2cD3eF' },
  { id: 'txn_7eF8G9hI', customer: 'NovaPay', customerId: 'cus_005', amount: 9200.00, currency: 'USDC', type: 'withdrawal', status: 'completed', date: '2026-09-16T14:30:00Z', fee: 0.25, network: 'Arc', requestId: 'req_fG4hI5jK' },
  { id: 'txn_4jK5L6mN', customer: 'Global Markets', customerId: 'cus_003', amount: 340.00, currency: 'USDC', type: 'payment', status: 'failed', date: '2026-09-16T11:20:00Z', fee: 0, network: 'Arc', requestId: 'req_lM6nO7pQ' },
]

// ---- CUSTOMERS ----
export const CUSTOMERS: Customer[] = [
  { id: 'cus_001', name: 'Acme Corp', email: 'finance@acmecorp.io', phone: '+1 415 555 0101', country: 'United States', status: 'active', balance: 84920.50, created: '2025-03-12', verified: true, transactions: 1482 },
  { id: 'cus_002', name: 'TechFlow Inc', email: 'payments@techflow.com', phone: '+44 20 7946 0102', country: 'United Kingdom', status: 'active', balance: 22100.00, created: '2025-06-01', verified: true, transactions: 644 },
  { id: 'cus_003', name: 'Global Markets', email: 'treasury@globalmarkets.co', phone: '+65 6988 0103', country: 'Singapore', status: 'active', balance: 195000.00, created: '2024-11-22', verified: true, transactions: 3210 },
  { id: 'cus_004', name: 'Sunrise Payments', email: 'ops@sunrisepay.app', phone: '+1 212 555 0104', country: 'United States', status: 'active', balance: 12450.75, created: '2026-01-15', verified: true, transactions: 892 },
  { id: 'cus_005', name: 'NovaPay', email: 'admin@novapay.io', phone: '+49 30 5555 0105', country: 'Germany', status: 'active', balance: 48200.00, created: '2025-09-08', verified: true, transactions: 2104 },
  { id: 'cus_006', name: 'CloudBase', email: 'billing@cloudbase.dev', phone: '+1 650 555 0106', country: 'United States', status: 'pending_kyc', balance: 5000.00, created: '2026-09-01', verified: false, transactions: 14 },
  { id: 'cus_007', name: 'Meridian Fund', email: 'ops@meridianfund.com', phone: '+852 2100 0107', country: 'Hong Kong', status: 'active', balance: 510000.00, created: '2024-08-30', verified: true, transactions: 5421 },
  { id: 'cus_008', name: 'Zephyr Retail', email: 'payments@zephyrretail.com', phone: '+61 2 9200 0108', country: 'Australia', status: 'suspended', balance: 0, created: '2025-12-05', verified: false, transactions: 88 },
]

// ---- WALLETS ----
export const WALLETS: Wallet[] = [
  { id: 'wal_A1b2C3d4', customerId: 'cus_001', customer: 'Acme Corp', balance: 84920.50, pending: 0, currency: 'USDC', status: 'active', created: '2025-03-12', network: 'Arc' },
  { id: 'wal_E5f6G7h8', customerId: 'cus_002', customer: 'TechFlow Inc', balance: 22100.00, pending: 1100.00, currency: 'USDC', status: 'active', created: '2025-06-01', network: 'Arc' },
  { id: 'wal_I9j0K1l2', customerId: 'cus_003', customer: 'Global Markets', balance: 195000.00, pending: 0, currency: 'USDC', status: 'active', created: '2024-11-22', network: 'Arc' },
  { id: 'wal_M3n4O5p6', customerId: 'cus_004', customer: 'Sunrise Payments', balance: 12450.75, pending: 560.00, currency: 'USDC', status: 'active', created: '2026-01-15', network: 'Arc' },
  { id: 'wal_Q7r8S9t0', customerId: 'cus_005', customer: 'NovaPay', balance: 48200.00, pending: 0, currency: 'USDC', status: 'active', created: '2025-09-08', network: 'Arc' },
  { id: 'wal_U1v2W3x4', customerId: 'cus_006', customer: 'CloudBase', balance: 5000.00, pending: 18000.00, currency: 'USDC', status: 'active', created: '2026-09-01', network: 'Base' },
  { id: 'wal_Y5z6A7b8', customerId: 'cus_007', customer: 'Meridian Fund', balance: 510000.00, pending: 0, currency: 'USDC', status: 'active', created: '2024-08-30', network: 'Arc' },
  { id: 'wal_C9d0E1f2', customerId: 'cus_008', customer: 'Zephyr Retail', balance: 0, pending: 0, currency: 'USDC', status: 'frozen', created: '2025-12-05', network: 'Arc' },
]

// ---- API LOGS ----
export const API_LOGS: ApiLog[] = [
  { id: 'log_001', timestamp: '2026-09-17T14:32:00Z', method: 'POST', endpoint: '/v1/transfers', status: 200, responseTime: 184, requestId: 'req_aB3cD4eF', body: '{"customer_id":"cus_001","recipient":"vendor@acme.io","amount":"12500.00","currency":"USDC"}', response: '{"id":"txn_9k2mP3qR","status":"processing","amount":"12500.00"}' },
  { id: 'log_002', timestamp: '2026-09-17T14:31:00Z', method: 'GET', endpoint: '/v1/balances', status: 200, responseTime: 92, requestId: 'req_xY1zA2bC' },
  { id: 'log_003', timestamp: '2026-09-17T14:30:00Z', method: 'POST', endpoint: '/v1/payment-links', status: 201, responseTime: 143, requestId: 'req_dE3fG4hI' },
  { id: 'log_004', timestamp: '2026-09-17T14:28:00Z', method: 'GET', endpoint: '/v1/customers/cus_001', status: 200, responseTime: 68, requestId: 'req_jK5lM6nO' },
  { id: 'log_005', timestamp: '2026-09-17T14:25:00Z', method: 'POST', endpoint: '/v1/webhooks/test', status: 200, responseTime: 320, requestId: 'req_pQ7rS8tU' },
  { id: 'log_006', timestamp: '2026-09-17T14:20:00Z', method: 'POST', endpoint: '/v1/customers', status: 201, responseTime: 112, requestId: 'req_vW9xY0zA' },
  { id: 'log_007', timestamp: '2026-09-17T14:18:00Z', method: 'GET', endpoint: '/v1/transactions', status: 200, responseTime: 156, requestId: 'req_bC1dE2fG' },
  { id: 'log_008', timestamp: '2026-09-17T14:15:00Z', method: 'POST', endpoint: '/v1/bridge', status: 200, responseTime: 228, requestId: 'req_hI3jK4lM' },
  { id: 'log_009', timestamp: '2026-09-17T14:10:00Z', method: 'GET', endpoint: '/v1/wallets', status: 200, responseTime: 74, requestId: 'req_nO5pQ6rS' },
  { id: 'log_010', timestamp: '2026-09-17T14:05:00Z', method: 'POST', endpoint: '/v1/transfers', status: 422, responseTime: 45, requestId: 'req_tU7vW8xY' },
  { id: 'log_011', timestamp: '2026-09-17T14:00:00Z', method: 'DELETE', endpoint: '/v1/webhooks/wh_001', status: 200, responseTime: 61, requestId: 'req_zA9bC0dE' },
  { id: 'log_012', timestamp: '2026-09-17T13:55:00Z', method: 'GET', endpoint: '/v1/transactions/txn_7hJkL8mN', status: 200, responseTime: 89, requestId: 'req_fG1hI2jK' },
]

// ---- WEBHOOKS ----
export const WEBHOOK_ENDPOINTS: WebhookEndpoint[] = [
  { id: 'wh_001', url: 'https://api.acmecorp.io/webhooks/globalpay', events: ['payment.created', 'payment.completed', 'transfer.completed', 'deposit.received'], status: 'active', created: '2025-03-12', secret: 'whsec_••••••••••••••••' },
  { id: 'wh_002', url: 'https://hooks.techflow.com/payments', events: ['payment.failed', 'transfer.failed', 'customer.created'], status: 'active', created: '2025-06-01', secret: 'whsec_••••••••••••••••' },
  { id: 'wh_003', url: 'https://backend.novapay.io/events', events: ['wallet.created', 'payment.completed', 'transfer.created'], status: 'inactive', created: '2025-09-08', secret: 'whsec_••••••••••••••••' },
]

export const WEBHOOK_DELIVERIES: WebhookDelivery[] = [
  { id: 'del_001', endpointId: 'wh_001', event: 'payment.completed', status: 'success', attempts: 1, timestamp: '2026-09-17T14:32:05Z', responseCode: 200 },
  { id: 'del_002', endpointId: 'wh_001', event: 'transfer.completed', status: 'success', attempts: 1, timestamp: '2026-09-17T10:22:10Z', responseCode: 200 },
  { id: 'del_003', endpointId: 'wh_002', event: 'payment.failed', status: 'failed', attempts: 3, timestamp: '2026-09-17T11:44:15Z', responseCode: 500 },
  { id: 'del_004', endpointId: 'wh_001', event: 'deposit.received', status: 'success', attempts: 1, timestamp: '2026-09-17T08:15:05Z', responseCode: 200 },
  { id: 'del_005', endpointId: 'wh_002', event: 'customer.created', status: 'success', attempts: 1, timestamp: '2026-09-17T07:00:02Z', responseCode: 200 },
]

// ---- PAYMENT LINKS ----
export const PAYMENT_LINKS: PaymentLink[] = [
  { id: 'pl_001', amount: 500, description: 'Design project payment', currency: 'USDC', status: 'active', expires: '2026-09-24', paymentsReceived: 0, created: '2026-09-17', url: 'pay.globalpay.io/pl_001' },
  { id: 'pl_002', amount: 1200, description: 'Monthly subscription — September', currency: 'USDC', status: 'paid', expires: '2026-09-20', paymentsReceived: 1, created: '2026-09-10', url: 'pay.globalpay.io/pl_002' },
  { id: 'pl_003', amount: 75, description: 'API consultation session', currency: 'USDC', status: 'active', expires: '2026-09-30', paymentsReceived: 3, created: '2026-09-05', url: 'pay.globalpay.io/pl_003' },
  { id: 'pl_004', amount: 2500, description: 'Platform integration setup', currency: 'USDC', status: 'expired', expires: '2026-09-01', paymentsReceived: 0, created: '2026-08-25', url: 'pay.globalpay.io/pl_004' },
]

// ---- PAYMENT REQUESTS ----
export const PAYMENT_REQUESTS: PaymentRequest[] = [
  { id: 'preq_001', from: 'john@example.com', amount: 250, description: 'Invoice #1024', status: 'pending', created: '2026-09-17', expires: '2026-09-24' },
  { id: 'preq_002', from: 'sarah@startup.io', amount: 1000, description: 'Consulting retainer', status: 'paid', created: '2026-09-10', expires: '2026-09-17' },
  { id: 'preq_003', from: 'ops@enterprise.com', amount: 5500, description: 'Q3 services', status: 'expired', created: '2026-09-01', expires: '2026-09-08' },
]

// ---- VOLUME CHART DATA ----
export const VOLUME_DATA = [
  { day: 'Sep 1', volume: 88420, count: 412 },
  { day: 'Sep 2', volume: 94200, count: 438 },
  { day: 'Sep 3', volume: 72100, count: 368 },
  { day: 'Sep 4', volume: 65800, count: 310 },
  { day: 'Sep 5', volume: 108900, count: 521 },
  { day: 'Sep 6', volume: 115400, count: 548 },
  { day: 'Sep 7', volume: 89300, count: 422 },
  { day: 'Sep 8', volume: 132000, count: 608 },
  { day: 'Sep 9', volume: 141800, count: 652 },
  { day: 'Sep 10', volume: 118600, count: 570 },
  { day: 'Sep 11', volume: 96400, count: 468 },
  { day: 'Sep 12', volume: 78900, count: 382 },
  { day: 'Sep 13', volume: 156200, count: 712 },
  { day: 'Sep 14', volume: 144800, count: 680 },
  { day: 'Sep 15', volume: 162400, count: 744 },
  { day: 'Sep 16', volume: 138200, count: 630 },
  { day: 'Sep 17', volume: 84420, count: 398 },
]

// ---- ANALYTICS DATA ----
export const ANALYTICS_7D = {
  totalVolume: 877220,
  totalCount: 4124,
  avgTx: 212.7,
  successRate: 99.2,
  failedTx: 33,
  activeCustomers: 812,
  apiRequests: 24880,
  webhookDeliveries: 2140,
}

export const formatUSD = (amount: number, decimals = 2) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount)

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('en-US').format(n)

export const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  pending: 'Pending',
  failed: 'Failed',
  processing: 'Processing',
  active: 'Active',
  suspended: 'Suspended',
  pending_kyc: 'Pending KYC',
  frozen: 'Frozen',
  inactive: 'Inactive',
  paid: 'Paid',
  expired: 'Expired',
  cancelled: 'Cancelled',
  success: 'Success',
}

export const STATUS_BADGE: Record<string, string> = {
  completed: 'badge-success',
  paid: 'badge-success',
  active: 'badge-success',
  success: 'badge-success',
  pending: 'badge-pending',
  pending_kyc: 'badge-warning',
  processing: 'badge-warning',
  warning: 'badge-warning',
  failed: 'badge-danger',
  suspended: 'badge-danger',
  frozen: 'badge-danger',
  inactive: 'badge-muted',
  expired: 'badge-muted',
  cancelled: 'badge-muted',
}
