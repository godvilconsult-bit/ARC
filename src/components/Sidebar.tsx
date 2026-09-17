import { useState } from 'react'
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, Users, Wallet, BarChart3,
  Code2, Webhook, TrendingUp, Settings, ChevronRight, Globe, Menu, X,
  Zap, Bell, Shuffle, GitMerge
} from 'lucide-react'

export type DashboardView =
  | 'overview' | 'payments' | 'transfers' | 'customers' | 'wallets'
  | 'balances' | 'developers' | 'api-logs' | 'webhooks' | 'analytics'
  | 'billing' | 'settings' | 'consumer' | 'checkout' | 'payment-links'
  | 'payment-requests' | 'bridge' | 'swap'

interface NavItem {
  id: DashboardView
  label: string
  icon: React.ReactNode
  group?: string
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} />, group: 'main' },
  { id: 'payments', label: 'Payments', icon: <CreditCard size={16} />, group: 'main' },
  { id: 'transfers', label: 'Transfers', icon: <ArrowLeftRight size={16} />, group: 'main' },
  { id: 'customers', label: 'Customers', icon: <Users size={16} />, group: 'main' },
  { id: 'wallets', label: 'Wallets', icon: <Wallet size={16} />, group: 'main' },
  { id: 'payment-links', label: 'Payment Links', icon: <Zap size={16} />, group: 'main' },
  { id: 'payment-requests', label: 'Requests', icon: <Bell size={16} />, group: 'main' },
  { id: 'bridge', label: 'Bridge', icon: <GitMerge size={16} />, group: 'main' },
  { id: 'swap', label: 'Swap', icon: <Shuffle size={16} />, group: 'main' },
  { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} />, group: 'data' },
  { id: 'developers', label: 'Developers', icon: <Code2 size={16} />, group: 'developer' },
  { id: 'api-logs', label: 'API Logs', icon: <BarChart3 size={16} />, group: 'developer' },
  { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={16} />, group: 'developer' },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={16} />, group: 'account' },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} />, group: 'account' },
]

const GROUP_LABELS: Record<string, string> = {
  main: 'Payments',
  data: 'Insights',
  developer: 'Developer',
  account: 'Account',
}

interface Props {
  active: DashboardView
  onNavigate: (view: DashboardView) => void
  testMode: boolean
  onToggleMode: () => void
}

interface ContentProps extends Props {
  onCloseMobile: () => void
}

function SidebarContent({ active, onNavigate, testMode, onToggleMode, onCloseMobile }: ContentProps) {
  const groups = Array.from(new Set(NAV_ITEMS.map(i => i.group)))
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[var(--ink)] flex items-center justify-center">
            <Globe size={14} className="text-white" />
          </div>
          <span className="display font-bold text-[var(--ink)] text-base tracking-tight">WEKA</span>
        </div>
        {/* Mode switcher */}
        <button
          onClick={onToggleMode}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
            testMode
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${testMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {testMode ? 'Test Mode' : 'Live Mode'}
          </span>
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {groups.map(group => {
          const items = NAV_ITEMS.filter(i => i.group === group)
          return (
            <div key={group}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--subtle)]">
                {GROUP_LABELS[group!]}
              </p>
              <div className="space-y-0.5">
                {items.map(item => {
                  const isActive = active === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); onCloseMobile() }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[var(--ink)] text-white'
                          : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)]'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto text-[10px] font-bold bg-[var(--accent-blue)] text-white rounded-full px-1.5 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Consumer demo link */}
      <div className="px-3 py-4 border-t border-[var(--border)]">
        <button
          onClick={() => { onNavigate('consumer'); onCloseMobile() }}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
            active === 'consumer'
              ? 'bg-[var(--ink)] text-white border-transparent'
              : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]'
          }`}
        >
          <Globe size={15} />
          Consumer App Demo
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ active, onNavigate, testMode, onToggleMode }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-[var(--border)]"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-56 bg-white border-r border-[var(--border)] h-screen
        transform transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent active={active} onNavigate={onNavigate} testMode={testMode} onToggleMode={onToggleMode} onCloseMobile={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}
