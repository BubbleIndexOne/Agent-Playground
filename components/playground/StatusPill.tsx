'use client'

/**
 * @fileoverview StatusPill – Compact header pill showing the active model.
 */

import { ChevronDown } from 'lucide-react'
import { Activity } from 'lucide-react'

export interface StatusPillProps {
  icon: typeof Activity
  label: string
  value: string
  onClick: () => void
  connected?: boolean
}

export function StatusPill({ icon: Icon, label, value, onClick, connected = false }: StatusPillProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 transition-colors hover:border-primary/50 hover:bg-accent"
      aria-label={`${label}: ${value}. Open model settings`}
    >
      <Icon className="size-3.5 text-muted-foreground group-hover:text-primary" />
      <span className="hidden text-[11px] text-muted-foreground sm:inline">{label}</span>
      <span className="text-[11px] font-medium text-foreground">{value}</span>
      {connected ? (
        <span className="size-1.5 rounded-full bg-emerald-400" />
      ) : (
        <ChevronDown className="size-3 text-muted-foreground" />
      )}
    </button>
  )
}
