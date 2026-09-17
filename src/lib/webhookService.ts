/**
 * WEKA Webhook Service
 * Fires real HTTP POST requests to registered webhook endpoints.
 * Falls back gracefully when Supabase is not configured.
 */
import { supabase } from './supabase'

const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

interface WebhookPayload {
  id: string
  event: string
  created: string
  data: Record<string, unknown>
}

interface DeliveryResult {
  success: boolean
  code: number | null
  ms: number
}

/**
 * Fetch all active endpoints from Supabase (or fall back to nothing)
 */
async function getActiveEndpoints(): Promise<Array<{ id: string; url: string; events: string[]; secret: string }>> {
  if (!hasSupabase) return []
  /* oxlint-disable typescript/no-unsafe-assignment */
  const { data, error } = await supabase
    .from('webhook_endpoints')
    .select('id, url, events, secret')
    .eq('status', 'active')
  if (error || !data) return []
  return data
  /* oxlint-enable typescript/no-unsafe-assignment */
}

/**
 * Deliver a single webhook POST and record the delivery in Supabase.
 */
async function deliver(
  endpoint: { id: string; url: string; secret: string },
  payload: WebhookPayload
): Promise<DeliveryResult> {
  const start = Date.now()
  let code: number | null = null
  let success = false

  try {
    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GlobalPay-Event': payload.event,
        'X-GlobalPay-Delivery': payload.id,
        'X-GlobalPay-Signature': `sha256=${endpoint.secret}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    })
    code = res.status
    success = res.ok
  } catch {
    success = false
  }

  const ms = Date.now() - start

  // Record delivery in Supabase
  if (hasSupabase) {
    await supabase.from('webhook_deliveries').insert({
      endpoint_id: endpoint.id,
      event: payload.event,
      status: success ? 'success' : 'failed',
      attempts: 1,
      response_code: code,
      response_body: null,
    })
  }

  return { success, code, ms }
}

/**
 * Fire an event to all subscribed active endpoints.
 */
export async function fireWebhookEvent(
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const endpoints = await getActiveEndpoints()
  const subscribed = endpoints.filter(ep => ep.events.includes(event))
  if (subscribed.length === 0) return

  const payload: WebhookPayload = {
    id: 'wh_' + Math.random().toString(36).slice(2, 10),
    event,
    created: new Date().toISOString(),
    data,
  }

  await Promise.all(subscribed.map(ep => deliver(ep, payload)))
}

/**
 * Send a test event to a specific endpoint by ID.
 */
export async function sendTestWebhook(endpointId: string): Promise<DeliveryResult> {
  if (!hasSupabase) {
    // Simulate in demo mode
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
    const code = Math.random() > 0.15 ? 200 : 500
    return { success: code === 200, code, ms: Math.round(800 + Math.random() * 600) }
  }

  /* oxlint-disable typescript/no-unsafe-assignment */
  const { data, error } = await supabase
    .from('webhook_endpoints')
    .select('id, url, secret')
    .eq('id', endpointId)
    .single()
  /* oxlint-enable typescript/no-unsafe-assignment */

  if (error || !data) {
    return { success: false, code: null, ms: 0 }
  }

  const ep = data

  const payload: WebhookPayload = {
    id: 'wh_test_' + Math.random().toString(36).slice(2, 10),
    event: 'test',
    created: new Date().toISOString(),
    data: { message: 'This is a test webhook delivery from WEKA GlobalPay.' },
  }

  return deliver(ep, payload)
}
