/* oxlint-disable react/set-state-in-effect, react/use-memo */
import { useState, useEffect, useCallback, useRef } from 'react'
import * as db from './db'
import { supabase } from './supabase'
import type { DbCustomer, DbWallet, DbTransaction, DbPaymentLink, DbPaymentRequest, DbApiLog, DbWebhookEndpoint, DbWebhookDelivery } from './supabase'

const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

type AsyncState<T> = { data: T; loading: boolean; error: string | null; refetch: () => void }

function useAsync<T>(fetcher: () => Promise<T>, initial: T): AsyncState<T> {
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => { void run() }, [run])
  return { data, loading, error, refetch: () => { void run() } }
}

/**
 * Subscribe to Supabase Realtime on a table.
 * Returns a function to call that re-fetches data when changes arrive.
 */
function useRealtime(table: string, onEvent: () => void) {
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  })

  useEffect(() => {
    if (!hasSupabase) return
    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        onEventRef.current()
      })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [table])
}

export function useCustomers() {
  const state = useAsync<DbCustomer[]>(db.fetchCustomers, [])
  useRealtime('customers', state.refetch)
  return state
}

export function useWallets() {
  const state = useAsync<DbWallet[]>(db.fetchWallets, [])
  useRealtime('wallets', state.refetch)
  return state
}

export function useTransactions(opts?: Parameters<typeof db.fetchTransactions>[0]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetcher = useCallback(() => db.fetchTransactions(opts), [JSON.stringify(opts)])
  const state = useAsync<DbTransaction[]>(fetcher, [])
  useRealtime('transactions', state.refetch)
  return state
}

export function usePaymentLinks() {
  const state = useAsync<DbPaymentLink[]>(db.fetchPaymentLinks, [])
  useRealtime('payment_links', state.refetch)
  return state
}

export function usePaymentRequests() {
  const state = useAsync<DbPaymentRequest[]>(db.fetchPaymentRequests, [])
  useRealtime('payment_requests', state.refetch)
  return state
}

export function useApiLogs(limit = 50) {
  const fetcher = useCallback(() => db.fetchApiLogs(limit), [limit])
  const state = useAsync<DbApiLog[]>(fetcher, [])
  useRealtime('api_logs', state.refetch)
  return state
}

export function useWebhookEndpoints() {
  const state = useAsync<DbWebhookEndpoint[]>(db.fetchWebhookEndpoints, [])
  useRealtime('webhook_endpoints', state.refetch)
  return state
}

export function useWebhookDeliveries() {
  const state = useAsync<DbWebhookDelivery[]>(db.fetchWebhookDeliveries, [])
  useRealtime('webhook_deliveries', state.refetch)
  return state
}

// Re-export mutation functions for use in components
export { db }
export { insertApiLog } from './db'
export type { DbCustomer, DbWallet, DbTransaction, DbPaymentLink, DbPaymentRequest, DbApiLog, DbWebhookEndpoint, DbWebhookDelivery }
