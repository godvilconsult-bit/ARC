/* oxlint-disable react/set-state-in-effect, react/use-memo */
import { useState, useEffect, useCallback } from 'react'
import * as db from './db'
import type { DbCustomer, DbWallet, DbTransaction, DbPaymentLink, DbPaymentRequest, DbApiLog, DbWebhookEndpoint, DbWebhookDelivery } from './supabase'

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

export function useCustomers() {
  return useAsync<DbCustomer[]>(db.fetchCustomers, [])
}

export function useWallets() {
  return useAsync<DbWallet[]>(db.fetchWallets, [])
}

export function useTransactions(opts?: Parameters<typeof db.fetchTransactions>[0]) {
  const fetcher = useCallback(() => db.fetchTransactions(opts), [JSON.stringify(opts)])
  return useAsync<DbTransaction[]>(fetcher, [])
}

export function usePaymentLinks() {
  return useAsync<DbPaymentLink[]>(db.fetchPaymentLinks, [])
}

export function usePaymentRequests() {
  return useAsync<DbPaymentRequest[]>(db.fetchPaymentRequests, [])
}

export function useApiLogs(limit = 50) {
  const fetcher = useCallback(() => db.fetchApiLogs(limit), [limit])
  return useAsync<DbApiLog[]>(fetcher, [])
}

export function useWebhookEndpoints() {
  return useAsync<DbWebhookEndpoint[]>(db.fetchWebhookEndpoints, [])
}

export function useWebhookDeliveries() {
  return useAsync<DbWebhookDelivery[]>(db.fetchWebhookDeliveries, [])
}

// Re-export mutation functions for use in components
export { db }
export type { DbCustomer, DbWallet, DbTransaction, DbPaymentLink, DbPaymentRequest, DbApiLog, DbWebhookEndpoint, DbWebhookDelivery }
