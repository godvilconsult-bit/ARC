import { useState } from 'react'
import { Key, Eye, EyeOff, Copy, RefreshCw, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ApiKey {
  id: string
  name: string
  prefix: string
  type: 'publishable' | 'secret'
  created: string
  lastUsed: string
  env: 'test' | 'live'
}

const INITIAL_KEYS: ApiKey[] = [
  { id: 'key_001', name: 'Default Test Key', prefix: 'pk_test', type: 'publishable', created: '2026-01-15', lastUsed: '2026-09-17', env: 'test' },
  { id: 'key_002', name: 'Default Test Secret', prefix: 'sk_test', type: 'secret', created: '2026-01-15', lastUsed: '2026-09-17', env: 'test' },
  { id: 'key_003', name: 'Production Key', prefix: 'pk_live', type: 'publishable', created: '2026-03-01', lastUsed: '2026-09-16', env: 'live' },
]

const SDKS = [
  { name: 'Node.js', install: 'npm install @globalpay/node', version: 'v2.4.1' },
  { name: 'Python', install: 'pip install globalpay', version: 'v2.4.1' },
  { name: 'Go', install: 'go get github.com/globalpay/globalpay-go', version: 'v2.3.0' },
  { name: 'Ruby', install: 'gem install globalpay', version: 'v2.2.5' },
  { name: 'PHP', install: 'composer require globalpay/globalpay-php', version: 'v2.1.0' },
]

export default function Developers() {
  const [keys, setKeys] = useState(INITIAL_KEYS)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [creatingKey, setCreatingKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')

  const toggleReveal = (id: string) => {
    const next = new Set(revealed)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setRevealed(next)
  }

  const copyKey = (key: ApiKey) => {
    void navigator.clipboard.writeText(`${key.prefix}_${'x'.repeat(16)}`)
    toast.success('Key copied to clipboard')
  }

  const createKey = () => {
    if (!newKeyName) { toast.error('Enter a key name'); return }
    const newKey: ApiKey = {
      id: 'key_' + Math.random().toString(36).slice(2, 8),
      name: newKeyName,
      prefix: 'pk_test',
      type: 'publishable',
      created: '2026-09-17',
      lastUsed: 'Never',
      env: 'test',
    }
    setKeys([...keys, newKey])
    setNewKeyName('')
    setCreatingKey(false)
    toast.success('API key created')
  }

  const deleteKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id))
    toast.success('Key revoked')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl font-bold text-[var(--ink)]">Developer Platform</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Manage API keys, view documentation, and configure integrations</p>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-[var(--muted)]" />
            <h2 className="font-semibold text-[var(--ink)]">API Keys</h2>
          </div>
          <button
            onClick={() => setCreatingKey(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ink)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--accent-mid)] transition-colors"
          >
            <Plus size={12} /> Create Key
          </button>
        </div>

        {creatingKey && (
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-muted)] flex items-center gap-3">
            <input
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g. Production Server)"
              className="flex-1 px-3.5 py-2 bg-white rounded-xl text-sm border border-[var(--border)] outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
              onKeyDown={e => e.key === 'Enter' && createKey()}
              autoFocus
            />
            <button onClick={createKey} className="px-3 py-2 bg-[var(--ink)] text-white text-xs font-semibold rounded-lg">Create</button>
            <button onClick={() => setCreatingKey(false)} className="px-3 py-2 border border-[var(--border)] text-xs font-semibold rounded-lg text-[var(--muted)] hover:bg-white transition-colors">Cancel</button>
          </div>
        )}

        <div className="divide-y divide-[var(--border)]">
          {keys.map(key => (
            <div key={key.id} className="px-6 py-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] flex items-center justify-center">
                <Key size={13} className="text-[var(--muted)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--ink)]">{key.name}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${key.env === 'test' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{key.env}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="mono text-xs text-[var(--muted)]">
                    {revealed.has(key.id) ? `${key.prefix}_${'x'.repeat(16)}` : `${key.prefix}_${'•'.repeat(16)}`}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--subtle)] mt-0.5">Last used: {key.lastUsed}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => toggleReveal(key.id)} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--muted)] transition-colors">
                  {revealed.has(key.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => copyKey(key)} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--muted)] transition-colors">
                  <Copy size={14} />
                </button>
                <button onClick={() => toast.success('Key rotated')} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--muted)] transition-colors">
                  <RefreshCw size={14} />
                </button>
                <button onClick={() => deleteKey(key.id)} className="p-1.5 rounded-lg hover:bg-[var(--danger-bg)] text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-[var(--surface-muted)] border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <AlertCircle size={12} />
            Secret keys are shown only once at creation. Never share secret keys in client-side code.
          </div>
        </div>
      </div>

      {/* SDKs */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--ink)]">Official SDKs</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Client libraries for major languages</p>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {SDKS.map(sdk => (
            <div key={sdk.name} className="px-6 py-3.5 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-[var(--ink)]">{sdk.name}</span>
                <span className="ml-2 text-[11px] text-[var(--muted)] bg-[var(--surface-muted)] px-1.5 py-0.5 rounded-md">{sdk.version}</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="mono text-xs text-[var(--muted)] bg-[var(--surface-muted)] px-2.5 py-1.5 rounded-lg">{sdk.install}</code>
                <button
                  onClick={() => { void navigator.clipboard.writeText(sdk.install); toast.success('Copied') }}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--muted)] transition-colors"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sandbox info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle size={18} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Sandbox Environment Active</h3>
            <p className="text-sm text-blue-700 mt-1">You're operating in test mode. All transactions are simulated — no real funds are moved. Switch to Live Mode when you're ready to go live.</p>
            <div className="mt-3 flex gap-2">
              <code className="mono text-xs bg-white border border-blue-200 text-blue-800 px-2.5 py-1.5 rounded-lg">api.globalpay.io/v1</code>
              <code className="mono text-xs bg-white border border-blue-200 text-blue-800 px-2.5 py-1.5 rounded-lg">sandbox.globalpay.io/v1</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
