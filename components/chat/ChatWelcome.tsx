'use client'

/**
 * @fileoverview ChatWelcome – LibreChat-style clean welcome screen
 *
 * Centered brand logo + name, subtitle, and a minimal message input feel.
 * No grid of suggestion cards — stays ultra-clean like LibreChat.
 */

import React from 'react'
import { LoomIcon } from '@/components/ui/LoomIcon'

interface ChatWelcomeProps {
  displayName?: string
  onSelectSuggestion: (text: string) => void
}

const QUICK_ACTIONS = [
  { label: 'Write code', prompt: 'Write a TypeScript function that debounces async calls with a configurable delay and cancellation support.' },
  { label: 'Summarize', prompt: 'Summarize the following text in 3 concise bullet points:\n\n' },
  { label: 'Brainstorm', prompt: 'Give me 10 creative product ideas for a B2B SaaS targeting remote engineering teams.' },
  { label: 'Explain', prompt: 'Explain how transformer attention mechanisms work in simple terms with a real-world analogy.' },
]

export function ChatWelcome({ displayName, onSelectSuggestion }: ChatWelcomeProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16 animate-in fade-in duration-300">
      {/* Brand */}
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/10 ring-1 ring-primary/15 shadow-[0_0_40px_rgba(116,103,247,0.15)]">
        <LoomIcon className="size-8 text-primary" />
      </div>

      <h1 className="mb-1 text-[26px] font-semibold tracking-[-0.03em] text-foreground">
        Loom
      </h1>
      <p className="mb-10 text-[13px] text-muted-foreground/70">
        {displayName && displayName !== 'User'
          ? `Good to see you, ${displayName.split(' ')[0]}.`
          : 'Your AI workspace.'}
      </p>

      {/* Quick action chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {QUICK_ACTIONS.map(({ label, prompt }) => (
          <button
            key={label}
            onClick={() => onSelectSuggestion(prompt)}
            className="rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 text-[12px] font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/[0.07] hover:text-foreground"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
