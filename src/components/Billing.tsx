import { Check, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

const PLANS = [
  {
    id: 'developer',
    name: 'Developer',
    price: 0,
    unit: '/month',
    tagline: 'Test and prototype for free',
    features: ['Sandbox environment', 'Up to 100 API calls/day', 'Basic webhooks', 'Community support', '2 team members'],
    current: false,
    cta: 'Current Plan',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 149,
    unit: '/month',
    tagline: 'For growing payment platforms',
    features: ['Everything in Developer', '0.08% per transaction', 'Unlimited API calls', 'Priority webhooks', 'Up to 15 team members', 'Email support'],
    current: true,
    cta: 'Current Plan',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    unit: 'Custom pricing',
    tagline: 'For large payment infrastructure',
    features: ['Everything in Growth', 'Custom transaction fees', 'Dedicated support', 'SLA guarantee', 'Custom integrations', 'Unlimited team members', 'Audit logs & compliance'],
    current: false,
    cta: 'Contact Sales',
  },
]

const INVOICES = [
  { id: 'inv_001', date: 'Sep 1, 2026', amount: '$149.00', status: 'Paid', period: 'September 2026' },
  { id: 'inv_002', date: 'Aug 1, 2026', amount: '$149.00', status: 'Paid', period: 'August 2026' },
  { id: 'inv_003', date: 'Jul 1, 2026', amount: '$149.00', status: 'Paid', period: 'July 2026' },
  { id: 'inv_004', date: 'Jun 1, 2026', amount: '$149.00', status: 'Paid', period: 'June 2026' },
]

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl font-bold text-[var(--ink)]">Billing</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Manage your plan, usage, and payment methods</p>
      </div>

      {/* Usage summary */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <h2 className="font-semibold text-[var(--ink)] mb-4">Current Usage — September 2026</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'API Requests', used: '24,880', limit: 'Unlimited', pct: 0 },
            { label: 'Transaction Volume', used: '$877,220', limit: 'Unlimited', pct: 0 },
            { label: 'Team Members', used: '8', limit: '15', pct: 53 },
          ].map(s => (
            <div key={s.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-[var(--muted)]">{s.label}</span>
                <span className="text-xs font-semibold tabular text-[var(--ink)]">{s.used}</span>
              </div>
              {s.pct > 0 ? (
                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-blue)] rounded-full" style={{ width: `${s.pct}%` }} />
                </div>
              ) : (
                <div className="text-[11px] text-[var(--success)] font-medium">Unlimited</div>
              )}
              <div className="text-[11px] text-[var(--subtle)] mt-0.5">of {s.limit}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between items-center">
          <div>
            <div className="text-sm font-semibold text-[var(--ink)]">Estimated bill this month</div>
            <div className="text-xs text-[var(--muted)] mt-0.5">Platform fee + transaction fees</div>
          </div>
          <div className="display text-2xl font-bold tabular text-[var(--ink)]">$149.00</div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="font-semibold text-[var(--ink)] mb-4">Plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 relative flex flex-col ${plan.highlight ? 'border-[var(--ink)] shadow-lg' : 'border-[var(--border)] bg-white'} ${plan.highlight ? 'bg-white' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[var(--ink)] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Current Plan</span>
                </div>
              )}
              <div>
                <div className="font-bold text-[var(--ink)] text-lg">{plan.name}</div>
                <div className="mt-1">
                  {plan.price !== null ? (
                    <span className="display text-3xl font-bold tabular text-[var(--ink)]">${plan.price}<span className="text-sm font-normal text-[var(--muted)]">{plan.unit}</span></span>
                  ) : (
                    <span className="display text-xl font-bold text-[var(--ink)]">{plan.unit}</span>
                  )}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">{plan.tagline}</div>
              </div>

              <div className="mt-5 flex-1 space-y-2">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Check size={13} className="text-[var(--success)] flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => plan.id === 'enterprise' ? toast.info('Contact sales@globalpay.io') : toast.success(`You're on the ${plan.name} plan`)}
                className={`mt-6 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-[var(--ink)] text-white hover:bg-[var(--accent-mid)]'
                    : 'border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--surface-muted)]'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--ink)]">Invoices</h2>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <CreditCard size={13} />
            Visa ending in 4242
          </div>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {INVOICES.map(inv => (
            <div key={inv.id} className="px-6 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[var(--ink)]">{inv.period}</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">{inv.date} · {inv.id}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tabular text-[var(--ink)]">{inv.amount}</span>
                <span className="text-[11px] font-semibold badge-success px-2 py-0.5 rounded-full">{inv.status}</span>
                <button
                  onClick={() => toast.success('Invoice downloaded')}
                  className="text-xs text-[var(--accent-blue)] font-medium hover:underline"
                >
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
