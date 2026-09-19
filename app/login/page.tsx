/**
 * @fileoverview Blank Login & Sign-Up Route Placeholder (/login)
 *
 * Dedicated destination route for unauthenticated redirects when /auth/me returns 401.
 * Authentication UI will be implemented in subsequent milestones.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Command, ShieldAlert, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground selection:bg-primary/20">
      {/* Background glow decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]"
      />

      <div className="w-full max-w-sm rounded-xl border border-border bg-card/60 p-8 shadow-2xl backdrop-blur-md">
        {/* Brand Icon */}
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <Command className="size-5" strokeWidth={2.5} />
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Sign in to Console
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Authentication UI is coming soon. API client integration is active.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3.5 py-3 text-left text-xs text-amber-300">
          <ShieldAlert className="size-4 shrink-0 text-amber-400" />
          <p className="leading-5">
            You were redirected here because your session is unauthenticated (401 Unauthorized).
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-border/60 text-center">
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Playground</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
