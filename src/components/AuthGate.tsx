import { useState, useEffect } from 'react'
import { Globe, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { supabase, signIn, signUp } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface Props { children: React.ReactNode }

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const hasSupabase = !!(
  supabaseUrl && import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !supabaseUrl.includes('placeholder')
)

export default function AuthGate({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

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

  // No Supabase, existing session, or demo bypass — render app
  if (!hasSupabase || session || demoMode) return <>{children}</>

  return <LoginScreen onDemoMode={() => setDemoMode(true)} />
}

function LoginScreen({ onDemoMode }: { onDemoMode: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailConfirmPending, setEmailConfirmPending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Email and password are required'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await signUp(email, password)
        if (signUpError) {
          // User already exists — try logging in instead
          if (signUpError.message.includes('already registered')) {
            const { error: loginErr } = await signIn(email, password)
            if (loginErr) toast.error(loginErr.message)
          } else {
            toast.error(signUpError.message)
          }
          return
        }
        // Try immediate login (works when email confirmation is disabled)
        const { error: loginErr } = await signIn(email, password)
        if (loginErr) {
          if (loginErr.message.includes('Email not confirmed')) {
            setEmailConfirmPending(true)
          } else {
            toast.error(loginErr.message)
          }
        } else {
          toast.success('Welcome to WEKA!')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setEmailConfirmPending(true)
          } else if (error.message.includes('Invalid login')) {
            toast.error('Incorrect email or password')
          } else {
            toast.error(error.message)
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  if (emailConfirmPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-gradient)] px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-[var(--ink)] flex items-center justify-center mb-3">
              <Globe size={18} className="text-white" />
            </div>
            <h1 className="display text-2xl font-bold text-[var(--ink)] tracking-tight">WEKA</h1>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--border)] shadow-lg p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
              <span className="text-2xl">📧</span>
            </div>
            <div>
              <h2 className="font-semibold text-[var(--ink)]">Confirm your email</h2>
              <p className="text-sm text-[var(--muted)] mt-2">
                A confirmation link was sent to <strong>{email}</strong>. Click it to activate your account.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-left text-xs text-amber-800 space-y-1">
              <p className="font-semibold">To skip this step:</p>
              <p>In Supabase → Authentication → Providers → Email → turn off <strong>"Confirm email"</strong> → Save → then sign up again.</p>
            </div>
            <button
              onClick={onDemoMode}
              className="w-full py-2.5 border border-[var(--border)] rounded-xl text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors flex items-center justify-center gap-2"
            >
              Continue with demo data <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setEmailConfirmPending(false)}
              className="text-sm text-[var(--accent-blue)] hover:underline"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    )
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

          {/* Demo bypass */}
          <div className="mt-4">
            <button
              onClick={onDemoMode}
              className="w-full py-2 border border-[var(--border)] rounded-xl text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              Continue with demo data (no account needed)
            </button>
          </div>

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
          Secured by Supabase Auth · <span className="text-[var(--accent-blue)]">WEKA GlobalPay</span>
        </p>
      </div>
    </div>
  )
}
