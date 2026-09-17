import { useState } from 'react'
import { Plus, Shield, Users, Bell, Lock, Activity, ChevronRight, X } from 'lucide-react'
import { toast } from 'sonner'

const TEAM_MEMBERS = [
  { name: 'Alex Carter', email: 'alex@globalpay.io', role: 'Owner', joined: '2025-01-01' },
  { name: 'Maria Santos', email: 'maria@globalpay.io', role: 'Admin', joined: '2025-03-15' },
  { name: 'Jamal Reed', email: 'jamal@globalpay.io', role: 'Developer', joined: '2025-08-01' },
  { name: 'Priya Nair', email: 'priya@globalpay.io', role: 'Viewer', joined: '2026-02-20' },
]

const AUDIT_LOG = [
  { action: 'API key created', user: 'Alex Carter', time: '2026-09-17T14:30:00Z', detail: 'Key pk_test_prod_01 created' },
  { action: 'Webhook updated', user: 'Maria Santos', time: '2026-09-17T12:15:00Z', detail: 'Added payment.completed event' },
  { action: 'Team member invited', user: 'Alex Carter', time: '2026-09-15T09:00:00Z', detail: 'priya@globalpay.io invited as Viewer' },
  { action: 'API key rotated', user: 'Jamal Reed', time: '2026-09-10T16:45:00Z', detail: 'Rotated sk_test_default' },
  { action: 'Settings updated', user: 'Alex Carter', time: '2026-09-08T11:30:00Z', detail: 'Daily transaction limit updated to $1M' },
]

const ROLE_COLORS: Record<string, string> = {
  Owner: 'bg-violet-50 text-violet-700',
  Admin: 'bg-blue-50 text-blue-700',
  Developer: 'bg-emerald-50 text-emerald-700',
  Viewer: 'bg-[var(--surface-muted)] text-[var(--muted)]',
}

type SettingsTab = 'team' | 'security' | 'notifications' | 'audit'

export default function Settings() {
  const [tab, setTab] = useState<SettingsTab>('team')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Developer')

  const invite = () => {
    if (!inviteEmail) { toast.error('Enter an email address'); return }
    toast.success(`Invitation sent to ${inviteEmail}`)
    setShowInvite(false)
    setInviteEmail('')
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'team', label: 'Team', icon: <Users size={15} /> },
    { id: 'security', label: 'Security', icon: <Shield size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'audit', label: 'Audit Log', icon: <Activity size={15} /> },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl font-bold text-[var(--ink)]">Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Manage team, security, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--surface-muted)] rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.id ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--muted)]'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Team */}
      {tab === 'team' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--ink)]">Team Members</h2>
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ink)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--accent-mid)] transition-colors"
              >
                <Plus size={12} /> Invite
              </button>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {TEAM_MEMBERS.map(m => (
                <div key={m.email} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-sm font-bold text-[var(--muted)]">
                      {m.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--ink)]">{m.name}</div>
                      <div className="text-xs text-[var(--muted)]">{m.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[m.role]}`}>{m.role}</span>
                    {m.role !== 'Owner' && (
                      <button onClick={() => toast.success('Role updated')} className="text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors">Change role</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role descriptions */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
            <h3 className="text-sm font-semibold text-[var(--ink)] mb-3">Role Permissions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: 'Owner', desc: 'Full access including billing and account deletion' },
                { role: 'Admin', desc: 'Manage team, API keys, webhooks, and all data' },
                { role: 'Developer', desc: 'API keys, logs, and technical configuration' },
                { role: 'Viewer', desc: 'Read-only access to dashboard and reports' },
              ].map(r => (
                <div key={r.role} className="bg-[var(--surface-muted)] rounded-xl p-3">
                  <div className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit mb-1.5 ${ROLE_COLORS[r.role]}`}>{r.role}</div>
                  <div className="text-xs text-[var(--muted)]">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite modal */}
          {showInvite && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
              <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-[var(--ink)]">Invite Team Member</h2>
                  <button onClick={() => setShowInvite(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)]"><X size={16} /></button>
                </div>
                <input
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
                />
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)]"
                >
                  <option>Admin</option>
                  <option>Developer</option>
                  <option>Viewer</option>
                </select>
                <button onClick={invite} className="w-full py-2.5 rounded-xl bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--accent-mid)] transition-colors">Send Invitation</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
            {[
              { icon: <Lock size={15} />, title: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', action: 'Enable', enabled: false },
              { icon: <Shield size={15} />, title: 'IP Allowlist', desc: 'Restrict API access to specific IP addresses', action: 'Configure', enabled: false },
              { icon: <Activity size={15} />, title: 'Transaction Limits', desc: 'Set daily and per-transaction spending limits', action: 'Manage', enabled: true },
            ].map(s => (
              <div key={s.title} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-muted)] flex items-center justify-center text-[var(--muted)]">{s.icon}</div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--ink)]">{s.title}</div>
                    <div className="text-xs text-[var(--muted)]">{s.desc}</div>
                  </div>
                </div>
                <button onClick={() => toast.success(`${s.title} — feature coming soon`)} className="flex items-center gap-1 text-xs font-semibold text-[var(--accent-blue)] hover:underline">
                  {s.action} <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
          {[
            { label: 'Payment received', desc: 'Get notified when a payment is received' },
            { label: 'Payment failed', desc: 'Alerts for failed payment attempts' },
            { label: 'Transfer completed', desc: 'When a transfer is settled' },
            { label: 'Webhook failure', desc: 'When a webhook delivery fails' },
            { label: 'API key usage spike', desc: 'Unusual API activity alerts' },
          ].map((n, i) => (
            <div key={n.label} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[var(--ink)]">{n.label}</div>
                <div className="text-xs text-[var(--muted)]">{n.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" onChange={() => toast.success('Notification preference saved')} />
                <div className="w-10 h-5 bg-[var(--border)] peer-checked:bg-[var(--ink)] rounded-full transition-colors peer-checked:after:translate-x-5 after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform" />
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Audit log */}
      {tab === 'audit' && (
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--ink)]">Audit Log</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">All important account actions</p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {AUDIT_LOG.map((entry, i) => (
              <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[var(--ink)]">{entry.action}</div>
                  <div className="text-xs text-[var(--muted)] mt-0.5">{entry.detail} · by {entry.user}</div>
                </div>
                <div className="text-xs text-[var(--subtle)] tabular whitespace-nowrap">
                  {new Date(entry.time).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
