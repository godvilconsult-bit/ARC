import { useState } from 'react'
import AuthGate from './components/AuthGate'
import Sidebar, { DashboardView } from './components/Sidebar'
import Overview from './components/Overview'
import Payments from './components/Payments'
import Transfers from './components/Transfers'
import Customers from './components/Customers'
import Wallets from './components/Wallets'
import PaymentLinks from './components/PaymentLinks'
import PaymentRequests from './components/PaymentRequests'
import Analytics from './components/Analytics'
import Developers from './components/Developers'
import ApiLogs from './components/ApiLogs'
import Webhooks from './components/Webhooks'
import ApiDocs from './components/ApiDocs'
import Billing from './components/Billing'
import Settings from './components/Settings'
import ConsumerApp from './components/ConsumerApp'
import Checkout from './components/Checkout'
import Bridge from './components/Bridge'
import Swap from './components/Swap'
import { ExternalLink } from 'lucide-react'
import { ConnectKitButton } from 'connectkit'

// Developer section sub-tabs
type DevTab = 'keys' | 'docs' | 'logs' | 'webhooks'

function DeveloperHub() {
  const [devTab, setDevTab] = useState<DevTab>('keys')

  const tabs: { id: DevTab; label: string }[] = [
    { id: 'keys', label: 'API Keys' },
    { id: 'docs', label: 'Documentation' },
    { id: 'logs', label: 'API Logs' },
    { id: 'webhooks', label: 'Webhooks' },
  ]

  return (
    <div className="space-y-5">
      {/* Dev sub-nav */}
      <div className="flex gap-1 bg-[var(--surface-muted)] rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setDevTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${devTab === t.id ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--muted)]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {devTab === 'keys' && <Developers />}
      {devTab === 'docs' && <ApiDocs />}
      {devTab === 'logs' && <ApiLogs />}
      {devTab === 'webhooks' && <Webhooks />}
    </div>
  )
}

function TopBar({ testMode, onToggleMode, onCheckout }: { testMode: boolean; onToggleMode: () => void; onCheckout: () => void }) {
  return (
    <div className="h-14 bg-white border-b border-[var(--border)] flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${testMode ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${testMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          {testMode ? 'Test Mode' : 'Live Mode'}
        </div>
        <span className="text-xs text-[var(--subtle)]">·</span>
        <span className="text-xs text-[var(--muted)]">API v2026-01-01</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onCheckout}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--ink)] transition-colors"
        >
          <ExternalLink size={12} /> View Checkout
        </button>
        <button
          onClick={onToggleMode}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${testMode ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-[var(--surface-muted)] text-[var(--muted)] hover:text-[var(--ink)]'}`}
        >
          {testMode ? 'Switch to Live' : 'Switch to Test'}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<DashboardView>('overview')
  const [testMode, setTestMode] = useState(true)

  // Full-screen views
  if (view === 'consumer') {
    return <ConsumerApp onExitConsumer={() => setView('overview')} />
  }
  if (view === 'checkout') {
    return <Checkout onBack={() => setView('overview')} />
  }

  const renderView = () => {
    switch (view) {
      case 'overview': return <Overview onNavigate={(v) => setView(v)} />
      case 'payments': return <Payments />
      case 'transfers': return <Transfers />
      case 'customers': return <Customers />
      case 'wallets': return <Wallets />
      case 'balances': return <Wallets />
      case 'payment-links': return <PaymentLinks />
      case 'payment-requests': return <PaymentRequests />
      case 'analytics': return <Analytics />
      case 'developers': return <DeveloperHub />
      case 'api-logs': return <ApiLogs />
      case 'webhooks': return <Webhooks />
      case 'bridge': return <Bridge />
      case 'swap': return <Swap />
      case 'billing': return <Billing />
      case 'settings': return <Settings />
      default: return <Overview onNavigate={setView} />
    }
  }

  return (
    <AuthGate>
    <div className="flex h-screen overflow-hidden bg-[var(--bg-gradient)]">
      <Sidebar
        active={view}
        onNavigate={setView}
        testMode={testMode}
        onToggleMode={() => setTestMode(!testMode)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          testMode={testMode}
          onToggleMode={() => setTestMode(!testMode)}
          onCheckout={() => setView('checkout')}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {/* Bridge accessible from transfers section */}
          {view === 'transfers' && (
            <div className="mb-4 flex gap-2">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--ink)] shadow-sm"
              >
                Send Transfer
              </button>
              <button
                onClick={() => setView('balances')}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              >
                Bridge Funds
              </button>
            </div>
          )}

          {renderView()}
        </main>
      </div>
    </div>
    </AuthGate>
  )
}
