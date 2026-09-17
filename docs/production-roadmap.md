# WEKA — Production Roadmap

> Global payments infrastructure through one API.
> Powered by Arc App Kits · USDC-native · Chain-abstracted

---

## Current State (Prototype — September 2026)

The prototype demonstrates the full product surface: business dashboard, consumer app, checkout, developer hub, and analytics. All UI flows are functional with realistic demo data. The underlying architecture is structured for a clean migration to live infrastructure.

**What is live today:**
- Full business dashboard (Overview, Payments, Transfers, Customers, Wallets, Bridge, Swap, Analytics, Billing, Settings)
- Developer hub (API Keys, API Logs, Webhooks, Docs)
- Consumer App demo
- Public Checkout experience
- Supabase schema and typed data hooks throughout every component
- Auth gate (login/logout) via Supabase Auth
- Arc App Kit integration points scaffolded (bridge, swap, unified balance, send)

---

## Phase 1 — Live Infrastructure (Weeks 1–4)

### 1.1 Supabase Production Setup
- [ ] Provision a production Supabase project (separate from dev)
- [ ] Run `schema.sql` against production database
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in production environment
- [ ] Enable Row Level Security (RLS) on all tables — policies ship in `schema.sql`
- [ ] Enable Supabase Auth email/password and Magic Link providers
- [ ] Add OAuth providers (Google, GitHub) for developer sign-up flow

### 1.2 Arc App Kit — Real Transactions
All Arc App Kit calls are currently behind `isMock` guards in `src/lib/arcKit.ts`. To go live:

**Send / Transfer**
```ts
// Replace mock in src/lib/arcKit.ts sendPayment()
import { createSendKit } from '@circle-fin/app-kit'
const kit = createSendKit({ apiKey: process.env.CIRCLE_API_KEY })
await kit.send({ to: recipient, amount, currency: 'USDC' })
```

**Bridge**
```ts
import { createBridgeKit } from '@circle-fin/app-kit'
const kit = createBridgeKit({ apiKey: process.env.CIRCLE_API_KEY })
await kit.bridge({ fromChain, toChain, amount, currency: 'USDC' })
```

**Swap**
```ts
import { createSwapKit } from '@circle-fin/app-kit'
const kit = createSwapKit({ apiKey: process.env.CIRCLE_API_KEY })
await kit.swap({ fromToken, toToken, amount })
```

**Unified Balance**
```ts
import { createUnifiedBalanceKit } from '@circle-fin/app-kit'
const kit = createUnifiedBalanceKit({ apiKey: process.env.CIRCLE_API_KEY })
const balances = await kit.getBalances({ walletId })
```

**Onramp**
```ts
import { createOnrampKit } from '@circle-fin/app-kit'
const kit = createOnrampKit({ apiKey: process.env.CIRCLE_API_KEY })
kit.mountIframe({ containerId: 'onramp-container', sessionToken })
```

### 1.3 Circle Developer-Controlled Wallets
- [ ] Register entity secret via Arc Studio's register-entity-secret flow
- [ ] Provision `CIRCLE_DEVELOPER_CONTROLLED_API_KEY` in `.env`
- [ ] Implement `createWalletSet` + `createWallets` in customer onboarding flow
- [ ] Replace demo wallet IDs in `Wallets.tsx` with live wallet data from Circle API
- [ ] Implement balance polling via `getWalletBalance` on the Wallets page

### 1.4 Real API Key Management
Currently API keys are stored in Supabase `api_keys` table as display objects. For production:
- [ ] Generate real key pairs server-side (never in the browser)
- [ ] Store only a hashed version of the secret key — never the plaintext
- [ ] Return the plaintext secret exactly once, immediately on creation
- [ ] Add a backend endpoint `POST /api/keys` that signs and issues keys
- [ ] Validate inbound API keys on every request via HMAC verification

---

## Phase 2 — Backend API Layer (Weeks 3–6)

WEKA's core value is the API. Build a proper backend so customers can integrate via REST.

### 2.1 API Server (Bun + Hono recommended)
```
POST   /v1/customers
GET    /v1/customers/:id
POST   /v1/wallets
GET    /v1/wallets/:id/balance
POST   /v1/transfers
GET    /v1/transfers/:id
POST   /v1/payment-links
GET    /v1/payment-links/:id
POST   /v1/payment-requests
GET    /v1/transactions
POST   /v1/webhooks
DELETE /v1/webhooks/:id
GET    /v1/balances
POST   /v1/bridge
POST   /v1/swap
```

### 2.2 Authentication Middleware
- API key auth via `Authorization: Bearer sk_live_...` header
- Rate limiting per key (sliding window, Redis-backed)
- Request ID generation and propagation to `api_logs` table
- IP allowlist support for enterprise keys

### 2.3 Webhook Delivery Engine
- [ ] Background worker (Bun queue or pg_cron) that fires webhook deliveries
- [ ] Exponential backoff with up to 5 retry attempts
- [ ] HMAC-SHA256 signature on each delivery (`Weka-Signature` header)
- [ ] Dead-letter queue for permanently failed deliveries
- [ ] Write each delivery to `webhook_deliveries` table (already defined in schema)

### 2.4 API Log Ingestion
- [ ] Middleware writes every inbound request + response to `api_logs` table
- [ ] Include request body (scrub PII), response body, status code, latency, request ID
- [ ] 30-day retention with pg_cron cleanup job

---

## Phase 3 — Consumer Product (Weeks 5–8)

### 3.1 Consumer Auth
- [ ] Phone number + SMS OTP sign-in (Supabase Auth + Twilio)
- [ ] Biometric auth (WebAuthn/passkeys via Circle Modular Wallets)
- [ ] Session management with refresh token rotation

### 3.2 Real Consumer Wallet
- [ ] Each consumer gets a Circle developer-controlled wallet on first login
- [ ] Display real USDC balance from unified balance kit
- [ ] Wire Send flow to Arc App Kit `sendPayment`
- [ ] Wire Receive screen to real wallet address + QR generation
- [ ] Transaction history from Supabase `transactions` table (written by backend on each transfer)

### 3.3 Fiat Onramp
- [ ] Embed Arc Onramp Kit iframe on the "Add Money" screen in Consumer App
- [ ] Server mints a short-lived session token via `createOnrampServerKit`
- [ ] Handle `DEPOSIT_SUBMITTED` and `DEPOSIT_SETTLED` events to update balance UI

### 3.4 Push Notifications
- [ ] Web Push for payment received / sent confirmations
- [ ] Email notifications via Resend for payment requests and receipts

---

## Phase 4 — Merchant & Checkout (Weeks 6–10)

### 4.1 Embeddable Checkout
- [ ] Serve public checkout at `pay.weka.io/:linkId`
- [ ] Connect wallet or pay via onramp without creating an account
- [ ] Emit `payment.completed` webhook to merchant on success
- [ ] Confirmation email to payer and merchant

### 4.2 Checkout Widget (iframe embed)
```html
<script src="https://js.weka.io/v1/checkout.js"></script>
<weka-checkout
  link-id="pl_abc123"
  theme="light"
  on-success="handleSuccess"
/>
```

### 4.3 Merchant SDK
```ts
import Weka from '@weka/node'
const weka = new Weka({ apiKey: 'sk_live_...' })
const link = await weka.paymentLinks.create({ amount: 500, currency: 'USDC', description: 'Invoice #42' })
```

---

## Phase 5 — Enterprise & Compliance (Weeks 8–14)

### 5.1 KYC / KYB
- [ ] Integrate Persona or Stripe Identity for business verification
- [ ] Customer KYC check before wallet creation (configurable by business)
- [ ] Store verification status in `customers.kyc_status`

### 5.2 Transaction Monitoring (AML)
- [ ] Screen all outbound transfers against OFAC/SDN lists
- [ ] Flag and hold transactions above configurable thresholds
- [ ] Audit log for all compliance actions

### 5.3 Multi-Tenancy
- [ ] Workspace model: each business is an `organization` with isolated data
- [ ] Team members + roles (Owner / Admin / Developer / Viewer) — RLS enforces this
- [ ] SSO via SAML 2.0 for enterprise customers

### 5.4 Billing & Revenue
- [ ] Integrate Stripe Billing for subscription management
- [ ] Meter API calls and transaction volume via Stripe usage records
- [ ] Generate PDF invoices monthly
- [ ] Dunning management for failed subscription payments

---

## Phase 6 — Scale & Reliability

### 6.1 Infrastructure
- [ ] Deploy backend API on Railway or Fly.io (multiple regions)
- [ ] Supabase connection pooling via PgBouncer
- [ ] Redis (Upstash) for rate limiting and session cache
- [ ] CDN for static assets (Cloudflare)

### 6.2 Observability
- [ ] Structured logging to Axiom or Datadog
- [ ] Distributed tracing with OpenTelemetry
- [ ] Uptime monitoring with Better Uptime
- [ ] Alerting on error rate, p99 latency, failed webhook delivery rate

### 6.3 Testing
- [ ] Unit tests for all Arc Kit integration functions
- [ ] Integration tests against Circle Sandbox environment
- [ ] E2E tests with Playwright covering: sign-up → wallet creation → send payment → webhook delivery
- [ ] Load testing: 1,000 concurrent transfer requests

---

## Environment Variables Reference

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Circle / Arc
CIRCLE_DEVELOPER_CONTROLLED_API_KEY=TEST_API_KEY:...
CIRCLE_ENTITY_SECRET=...
VITE_ARC_ENVIRONMENT=sandbox   # or production

# Backend
JWT_SECRET=...
WEBHOOK_SIGNING_SECRET=...

# Notifications
RESEND_API_KEY=re_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...

# Billing
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Observability
AXIOM_TOKEN=...
AXIOM_DATASET=weka-production
```

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Payment infrastructure | Arc App Kits | USDC-native, chain-abstracted, single API |
| Wallet custody | Circle developer-controlled | Business retains custody, simplest integration |
| Database | Supabase (Postgres) | RLS, auth, real-time, type-safe client |
| API server | Bun + Hono | Fast, type-safe, minimal overhead |
| Frontend | Vite + React + TypeScript | Already scaffolded, fast HMR |
| Styling | Tailwind CSS | Utility-first, consistent tokens |
| Notifications | Resend (email) + Web Push | Low cost, developer-friendly |

---

## Timeline Summary

| Phase | Focus | ETA |
|---|---|---|
| 1 | Live infrastructure + Arc Kit wiring | Weeks 1–4 |
| 2 | Backend API layer + webhooks | Weeks 3–6 |
| 3 | Consumer product + onramp | Weeks 5–8 |
| 4 | Merchant checkout + SDK | Weeks 6–10 |
| 5 | Enterprise + compliance | Weeks 8–14 |
| 6 | Scale + reliability | Ongoing |

---

*Last updated: September 2026. This roadmap is a living document — update it as priorities shift.*
