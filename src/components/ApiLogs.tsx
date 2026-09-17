import { useState } from 'react'
import { X, ChevronRight, Clock, RefreshCw, Loader2 } from 'lucide-react'
import { useApiLogs } from '../lib/useDb'
import type { DbApiLog } from '../lib/useDb'

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-50 text-blue-700',
  POST: 'bg-emerald-50 text-emerald-700',
  PUT: 'bg-amber-50 text-amber-700',
  PATCH: 'bg-orange-50 text-orange-700',
  DELETE: 'bg-red-50 text-red-700',
}

function LogDetail({ log, onClose }: { log: DbApiLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${METHOD_COLORS[log.method]}`}>{log.method}</span>
              <span className="mono text-sm text-[var(--ink)]">{log.endpoint}</span>
            </div>
            <p className="mono text-xs text-[var(--muted)] mt-1">{log.request_id ?? '—'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)]"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Status', value: log.status_code.toString(), color: log.status_code < 300 ? 'text-[var(--success)]' : 'text-[var(--danger)]' },
              { label: 'Response time', value: `${log.response_time}ms`, color: undefined },
              { label: 'Timestamp', value: new Date(log.created_at).toLocaleTimeString(), color: undefined },
            ].map(s => (
              <div key={s.label} className="bg-[var(--surface-muted)] rounded-xl p-3 text-center">
                <div className={`text-lg font-bold tabular ${s.color ?? 'text-[var(--ink)]'}`}>{s.value}</div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {log.request_body && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--subtle)] mb-2">Request Body</p>
              <pre className="mono text-xs bg-[var(--surface-muted)] rounded-xl p-4 overflow-x-auto text-[var(--ink)] whitespace-pre-wrap">
                {JSON.stringify(log.request_body, null, 2)}
              </pre>
            </div>
          )}

          {log.response_body && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--subtle)] mb-2">Response</p>
              <pre className="mono text-xs bg-[var(--surface-muted)] rounded-xl p-4 overflow-x-auto text-[var(--ink)] whitespace-pre-wrap">
                {JSON.stringify(log.response_body, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--subtle)] mb-2">Headers</p>
            <div className="bg-[var(--surface-muted)] rounded-xl p-4 space-y-1.5">
              {[
                ['Content-Type', 'application/json'],
                ['Authorization', 'Bearer pk_test_••••••••'],
                ['X-Request-ID', log.request_id ?? '—'],
                ['X-API-Version', '2026-01-01'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 text-xs">
                  <span className="mono text-[var(--muted)] w-36 flex-shrink-0">{k}</span>
                  <span className="mono text-[var(--ink)]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ApiLogs() {
  const { data: logs, loading, refetch } = useApiLogs(100)
  const [selected, setSelected] = useState<DbApiLog | null>(null)
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all')

  const filtered = logs.filter(l => {
    if (filter === 'success') return l.status_code < 300
    if (filter === 'error') return l.status_code >= 400
    return true
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-2xl font-bold text-[var(--ink)]">API Logs</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Real-time API request monitoring</p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 border border-[var(--border)] text-sm text-[var(--muted)] rounded-xl hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh
        </button>
      </div>

      <div className="flex gap-1.5 bg-[var(--surface-muted)] rounded-xl p-1 w-fit">
        {(['all', 'success', 'error'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--muted)]'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-[var(--muted)]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                  {['Timestamp', 'Method', 'Endpoint', 'Status', 'Time', 'Request ID', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--subtle)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-[var(--muted)]">No logs found</td></tr>
                )}
                {filtered.map(log => (
                  <tr
                    key={log.id}
                    className="hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                    onClick={() => setSelected(log)}
                  >
                    <td className="px-5 py-3.5 text-xs text-[var(--muted)] tabular">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${METHOD_COLORS[log.method]}`}>{log.method}</span>
                    </td>
                    <td className="px-5 py-3.5 mono text-xs text-[var(--ink)]">{log.endpoint}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-bold tabular ${log.status_code < 300 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                        {log.status_code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs tabular text-[var(--muted)]">
                      <span className="flex items-center gap-1"><Clock size={11} /> {log.response_time}ms</span>
                    </td>
                    <td className="px-5 py-3.5 mono text-[11px] text-[var(--subtle)]">{log.request_id ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <ChevronRight size={14} className="text-[var(--subtle)]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <LogDetail log={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
