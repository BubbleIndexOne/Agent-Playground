/**
 * @fileoverview History Workspace Screen Component
 *
 * Provides inspection and auditing of previous prompt executions, token usage,
 * execution latencies, and responses. Reads live session history from persistent storage.
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Clock3,
  Search,
  PanelLeft,
  Trash2,
} from 'lucide-react'

export interface HistoryEntry {
  id: string
  prompt: string
  response: string
  model: string
  tokens: number
  latencyMs: number
  timestamp: string
}

export const HISTORY_STORAGE_KEY = 'workspace_history'

export function HistoryScreen() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Load live execution history from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setHistory(parsed)
          }
        }
      } catch (err) {
        console.error('Failed to read workspace execution history from localStorage:', err)
      }
    }
  }, [])

  const handleClearHistory = () => {
    setHistory([])
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY)
      } catch (err) {
        console.error('Failed to clear workspace execution history:', err)
      }
    }
  }

  const filteredHistory = history.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return item.prompt.toLowerCase().includes(q) || item.model.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border px-5 md:px-8">
        <div className="flex items-center gap-3 pl-10 md:pl-0">
          <div className="hidden size-7 items-center justify-center rounded-md bg-accent text-muted-foreground sm:flex">
            <PanelLeft className="size-3.5" />
          </div>
          <div>
            <h1 className="text-[14px] font-semibold tracking-[-0.01em]">History</h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Audit past prompts, responses, and token telemetry
            </p>
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col gap-5 p-5 md:p-8">
        <div className="flex items-end justify-between border-b border-border pb-5">
          <div>
            <p className="text-[11px] font-medium text-primary">Audit Log</p>
            <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.035em]">Recent Runs</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Review and inspect prompts executed during this session.
            </p>
          </div>
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              <Trash2 className="size-3.5" />
              Clear history
            </button>
          )}
        </div>

        {history.length > 0 && (
          <div className="relative max-w-sm pt-1">
            <Search className="pointer-events-none absolute left-3 top-3.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter history..."
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-8 text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredHistory.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredHistory.map(item => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary border border-primary/20">
                        {item.model}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{item.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                      <span>{item.tokens} tokens</span>
                      <span>{item.latencyMs}ms</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-background/60 p-3 font-mono text-[12px] text-foreground/90 whitespace-pre-wrap line-clamp-2">
                    {item.prompt}
                  </div>

                  <div className="rounded-lg bg-accent/30 p-3 text-[12px] text-muted-foreground whitespace-pre-wrap line-clamp-3">
                    {item.response}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl bg-background/40">
              <p className="text-[14px] font-medium text-foreground">No matching history entries</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                We couldn&apos;t find any past runs matching &quot;{searchQuery}&quot;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 text-[12px] font-medium text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl bg-background/40">
              <Clock3 className="size-8 text-muted-foreground/40 mb-3" />
              <p className="text-[14px] font-medium text-foreground">No recent runs recorded</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Run prompts in the Playground to populate your execution history.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
