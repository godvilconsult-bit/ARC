import { useState } from 'react'
import { CheckCircle, Circle, ExternalLink, ChevronDown, ChevronUp, Copy, Zap } from 'lucide-react'

const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

interface Step {
  id: string
  title: string
  description: string
  done: boolean
  content: React.ReactNode
}

export default function SetupGuide() {
  const [open, setOpen] = useState<string | null>('supabase')
  const [copied, setCopied] = useState<string | null>(null)

  if (hasSupabase) return null // Hide once configured

  const copy = (text: string, id: string) => {
    void navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const envSnippet = `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`

  const steps: Step[] = [
    {
      id: 'supabase',
      title: 'Create a Supabase project',
      description: 'Free tier is enough for development and prototyping.',
      done: false,
      content: (
        <div className="space-y-3">
          <ol className="space-y-2 text-sm text-[var(--muted)]">
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">1.</span> Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[var(--accent-blue)] underline">supabase.com</a> and create a free account</li>
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">2.</span> Click "New Project" and choose your region</li>
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">3.</span> Wait ~2 minutes for the project to provision</li>
          </ol>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ink)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-mid)] transition-colors"
          >
            Open Supabase Dashboard <ExternalLink size={13} />
          </a>
        </div>
      ),
    },
    {
      id: 'schema',
      title: 'Run the database schema',
      description: 'Creates all tables, indexes, RLS policies, and seeds demo data.',
      done: false,
      content: (
        <div className="space-y-3">
          <ol className="space-y-2 text-sm text-[var(--muted)]">
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">1.</span> In your Supabase project, open <strong>SQL Editor</strong></li>
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">2.</span> Open the file <code className="mono bg-[var(--surface-muted)] px-1.5 py-0.5 rounded text-xs">supabase/schema.sql</code> from the project</li>
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">3.</span> Paste the entire contents into the SQL Editor and click Run</li>
          </ol>
          <p className="text-xs text-[var(--muted)] bg-amber-50 border border-amber-200 rounded-xl p-3">
            The schema creates 7 tables, enables Row Level Security, and seeds 8 demo customers, wallets, transactions, payment links, and webhook endpoints.
          </p>
        </div>
      ),
    },
    {
      id: 'env',
      title: 'Add environment variables',
      description: 'Connect the app to your Supabase project.',
      done: false,
      content: (
        <div className="space-y-3">
          <ol className="space-y-2 text-sm text-[var(--muted)]">
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">1.</span> In Supabase, go to <strong>Project Settings → API</strong></li>
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">2.</span> Copy your <strong>Project URL</strong> and <strong>anon public</strong> key</li>
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">3.</span> Open <code className="mono bg-[var(--surface-muted)] px-1.5 py-0.5 rounded text-xs">.env</code> in the project root and add:</li>
          </ol>
          <div className="relative bg-[var(--ink)] rounded-xl p-4">
            <pre className="mono text-xs text-emerald-300 whitespace-pre-wrap">{envSnippet}</pre>
            <button
              onClick={() => copy(envSnippet, 'env')}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {copied === 'env' ? <CheckCircle size={12} /> : <Copy size={12} />}
            </button>
          </div>
          <p className="text-xs text-[var(--muted)]">After saving .env, the dev server will restart automatically and pick up the new values.</p>
        </div>
      ),
    },
    {
      id: 'realtime',
      title: 'Enable Realtime (optional)',
      description: 'Get live dashboard updates without page refresh.',
      done: false,
      content: (
        <div className="space-y-3">
          <ol className="space-y-2 text-sm text-[var(--muted)]">
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">1.</span> In Supabase, go to <strong>Database → Replication</strong></li>
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">2.</span> Enable Realtime for: <code className="mono bg-[var(--surface-muted)] px-1 rounded text-xs">transactions</code>, <code className="mono bg-[var(--surface-muted)] px-1 rounded text-xs">customers</code>, <code className="mono bg-[var(--surface-muted)] px-1 rounded text-xs">wallets</code></li>
            <li className="flex gap-2"><span className="font-semibold text-[var(--ink)] tabular">3.</span> Once enabled, new transactions will appear as toast notifications in real time</li>
          </ol>
        </div>
      ),
    },
  ]

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-indigo-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[var(--accent-blue)] flex items-center justify-center flex-shrink-0">
          <Zap size={15} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-[var(--ink)]">Connect Live Data</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Currently running on demo data. Follow these steps to enable a live Supabase database.</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Demo Mode
        </div>
      </div>

      <div className="divide-y divide-indigo-100">
        {steps.map((step, i) => (
          <div key={step.id}>
            <button
              onClick={() => setOpen(open === step.id ? null : step.id)}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/50 transition-colors text-left"
            >
              <div className="flex-shrink-0">
                {step.done
                  ? <CheckCircle size={18} className="text-[var(--success)]" />
                  : <Circle size={18} className="text-indigo-300" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-indigo-400 tabular">Step {i + 1}</span>
                </div>
                <div className="font-semibold text-[var(--ink)] text-sm">{step.title}</div>
                <div className="text-xs text-[var(--muted)]">{step.description}</div>
              </div>
              {open === step.id ? <ChevronUp size={15} className="text-[var(--muted)] flex-shrink-0" /> : <ChevronDown size={15} className="text-[var(--muted)] flex-shrink-0" />}
            </button>
            {open === step.id && (
              <div className="px-6 pb-5 ml-10">
                {step.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-white/50 border-t border-indigo-100 flex items-center justify-between">
        <p className="text-xs text-[var(--muted)]">The app works fully with demo data — live DB is optional but recommended for production.</p>
        <a
          href="https://supabase.com/docs"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[var(--accent-blue)] font-semibold hover:underline flex items-center gap-1"
        >
          Supabase Docs <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}
