import { useState, useEffect } from 'react'
import { Globe, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase, signIn, signUp } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface Props {
  children: React.ReactNode
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const hasSupabase = !!(
  supabaseUrl && import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !supabaseUrl.includes('placeholder')
)

export default function AuthGate({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    if (!hasSupabase) { setChecking(false); return }

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-gradient)]">
        <Loader2 size={24} className="animate-spin text-[var(--muted)]" />
      </div>
    )
  }

  // No Supabase configured — skip auth entirely (demo mode)
  if (!hasSupabase || session) return <>{children}</>

  return <LoginScreen />
}

function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Email and password are required'); return }
    setLoading(true)
    try {
      const fn = mode === 'login' ? signIn : signUp
      const { error } = await fn(email, password)
      if (error) {
        toast.error(error.message)
      } else if (mode === 'signup') {
        toast.success('Account created. Check your email to confirm.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-gradient)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--ink)] flex items-center justify-center mb-3">
            <Globe size={18} className="text-white" />
          </div>
          <h1 className="display text-2xl font-bold text-[var(--ink)] tracking-tight">WEKA</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Global payment infrastructure</p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-lg p-8">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-1">
            {mode === 'login' ? 'Sign in to dashboard' : 'Create your account'}
          </h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            {mode === 'login' ? 'Welcome back.' : 'Get started with WEKA.'}
          </p>

          <form onSubmit={(e) => { void submit(e) }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)]"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[var(--surface-muted)] rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-[var(--focus)] text-[var(--ink)] placeholder:text-[var(--subtle)] pr-10"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--subtle)] hover:text-[var(--muted)]"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[var(--ink)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--accent-mid)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[var(--border)] text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm text-[var(--accent-blue)] hover:underline font-medium"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--subtle)] mt-6">
          Secured by Supabase Auth. Your credentials are encrypted.
        </p>
      </div>
    </div>
  )
}
