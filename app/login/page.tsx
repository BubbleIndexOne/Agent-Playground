/**
 * @fileoverview Loom Sign In / Sign Up Route (/login)
 *
 * Two-column full-screen authentication page:
 * - Left panel: email/password form with in-place tab switching between sign-in and sign-up.
 * - Right panel: brand marketing panel with feature highlights.
 * - Authenticated users are immediately redirected to /home.
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Zap, BarChart2, Package } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

// ─── Loom Brand Icon ──────────────────────────────────────────────────────────

function LoomIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z" />
      <path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z" />
    </svg>
  )
}

// ─── OAuth Button ─────────────────────────────────────────────────────────────

function OAuthButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="group relative">
      <button
        type="button"
        disabled
        className="flex w-full items-center gap-3 rounded-lg border border-border/70 bg-card/50 px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors"
        aria-describedby={`${label}-tooltip`}
      >
        <span className="size-5 shrink-0 opacity-50">{icon}</span>
        <span>Continue with {label}</span>
      </button>
      <div
        id={`${label}-tooltip`}
        role="tooltip"
        className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100"
      >
        Coming soon
      </div>
    </div>
  )
}

// ─── GitHub SVG ──────────────────────────────────────────────────────────────

const GitHubIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

// ─── Google SVG ───────────────────────────────────────────────────────────────

const GoogleIcon = (
  <svg viewBox="0 0 24 24" className="size-full">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

// ─── Input Field Component ────────────────────────────────────────────────────

function FormInput({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  rightElement,
  autoComplete,
}: {
  id: string
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  rightElement?: React.ReactNode
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-border/80 bg-card/60 px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Right Panel Feature Card ─────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-white/45">{description}</p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Panel = 'login' | 'signup'

export default function LoginPage() {
  const { login, signUp, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [panel, setPanel] = useState<Panel>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Redirect already-authenticated users to the workspace
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/home')
    }
  }, [isAuthenticated, authLoading, router])

  const handlePanelSwitch = (next: Panel) => {
    setPanel(next)
    setFormError(null)
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      if (panel === 'login') {
        await login({ email, password })
      } else {
        await signUp({ email, password, first_name: firstName, last_name: lastName || undefined })
        // Auto-login after successful signup
        await login({ email, password })
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-foreground">

      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
      <div className="relative flex w-full max-w-[380px] shrink-0 flex-col justify-between border-r border-border/60 px-10 py-8">
        {/* Brand header */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-[9px] bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <LoomIcon className="size-4" />
            </div>
            <span className="text-[17px] font-semibold tracking-[-0.02em]">Loom</span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">An architecture studio for AI systems.</p>
        </div>

        {/* Form section */}
        <div className="flex flex-col gap-6 py-8">
          {/* Panel heading */}
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.03em] text-foreground">
              {panel === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {panel === 'login' ? 'Sign in to continue building.' : 'Start building your AI systems.'}
            </p>
          </div>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-2.5">
            <OAuthButton icon={GitHubIcon} label="GitHub" />
            <OAuthButton icon={GoogleIcon} label="Google" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[11px] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {panel === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  id="first-name"
                  label="First name"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={setFirstName}
                  autoComplete="given-name"
                />
                <FormInput
                  id="last-name"
                  label="Last name"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={setLastName}
                  autoComplete="family-name"
                />
              </div>
            )}

            <FormInput
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[12px] font-medium text-foreground">
                  Password
                </label>
                {panel === 'login' && (
                  <button
                    type="button"
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={panel === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-lg border border-border/80 bg-card/60 py-2.5 pl-3.5 pr-10 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            {/* Inline form error */}
            {formError && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-[12px] text-destructive">
                {formError}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              id="submit-auth"
              disabled={isSubmitting}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <>
                  <span>{panel === 'login' ? 'Sign in' : 'Create account'}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Panel switcher */}
          <p className="text-center text-[12px] text-muted-foreground">
            {panel === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => handlePanelSwitch('signup')}
                  className="font-medium text-primary hover:underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handlePanelSwitch('login')}
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Bottom footer */}
        <div className="flex items-center gap-2">
          <span className="h-px w-5 bg-primary/60" />
          <span className="text-[11px] text-muted-foreground">Build what&apos;s next.</span>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────────────── */}
      <div className="relative hidden flex-1 flex-col overflow-hidden lg:flex">

        {/* Background gradient layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[#0d0d10]" />
          {/* Deep violet radial glow */}
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-[120px]" />
          {/* Bottom horizon glow */}
          <div className="absolute bottom-0 left-0 right-0 h-[280px] bg-gradient-to-t from-primary/[0.06] to-transparent blur-[60px]" />
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
        </div>

        {/* Top label row */}
        <div className="relative flex items-start justify-between p-10">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-white/25 uppercase">
            <span>Ideas</span>
            <span className="text-primary/50">→</span>
            <span>Systems</span>
            <span className="text-primary/50">→</span>
            <span>Impact</span>
          </div>
          <div className="text-right text-[9px] font-semibold tracking-[0.15em] text-white/20 uppercase leading-relaxed">
            More<br />Capable<br />Tomorrow
          </div>
        </div>

        {/* Central content */}
        <div className="relative flex flex-1 flex-col justify-center px-14">
          <div className="max-w-lg">
            <h2 className="text-[46px] font-bold leading-[1.05] tracking-[-0.04em] text-white">
              From ideas to{' '}
              <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                intelligent systems.
              </span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-white/45">
              Compose agents, connect tools, and deploy powerful AI systems — all in one place.
            </p>

            {/* Feature cards grid */}
            <div className="mt-10 grid grid-cols-1 gap-3">
              <FeatureCard
                icon={Zap}
                title="Build faster"
                description="Reusable blocks for real systems. Stop rebuilding from scratch."
              />
              <FeatureCard
                icon={BarChart2}
                title="Stay in control"
                description="Test, trace, and iterate with full observability into every run."
              />
              <FeatureCard
                icon={Package}
                title="Deploy with confidence"
                description="Turn ideas into real impact. Ship AI systems that work in production."
              />
            </div>
          </div>
        </div>

        {/* Bottom label row */}
        <div className="relative flex items-end justify-end p-10">
          <div className="text-right text-[9px] font-semibold tracking-[0.15em] text-white/15 uppercase leading-relaxed">
            A More<br />Capable<br />Tomorrow.
          </div>
        </div>
      </div>
    </div>
  )
}
