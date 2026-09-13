/**
 * @fileoverview Agents Workspace Screen Component
 *
 * Provides the interactive UI for configuring, launching, and managing automated
 * multi-step agent workflows.
 */

'use client'

import React, { useState } from 'react'
import {
  Bot,
  Plus,
  Search,
  Sparkles,
  Play,
  MoreVertical,
  Activity,
  Layers,
  ArrowRight,
  PanelLeft,
} from 'lucide-react'

interface AgentItem {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'draft'
  model: string
  toolsCount: number
  lastRun: string
}

const SAMPLE_AGENTS: AgentItem[] = [
  {
    id: 'agent-1',
    name: 'Research & Synthesis Agent',
    description: 'Scrapes live web sources, aggregates multi-perspective insights, and compiles markdown briefings.',
    status: 'active',
    model: 'Claude 3.5 Sonnet',
    toolsCount: 3,
    lastRun: '12m ago',
  },
  {
    id: 'agent-2',
    name: 'Database Query Validator',
    description: 'Inspects incoming SQL queries against security rules and optimizes execution plans.',
    status: 'paused',
    model: 'GPT-4o',
    toolsCount: 2,
    lastRun: '2h ago',
  },
  {
    id: 'agent-3',
    name: 'Customer Triage Assistant',
    description: 'Evaluates user tickets, extracts sentiment, and routes urgent incidents to designated team members.',
    status: 'draft',
    model: 'Gemini 3.7 Flash',
    toolsCount: 4,
    lastRun: 'Yesterday',
  },
]

export function AgentsScreen() {
  const [agents] = useState<AgentItem[]>(SAMPLE_AGENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all')

  const filteredAgents = agents.filter(agent => {
    if (filter !== 'all' && agent.status !== filter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return agent.name.toLowerCase().includes(q) || agent.description.toLowerCase().includes(q)
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
            <h1 className="text-[14px] font-semibold tracking-[-0.01em]">Agents</h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Build, run, and orchestrate autonomous AI workflows
            </p>
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col gap-5 p-5 md:p-8">
        <div className="flex flex-col gap-4 border-b border-border pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-primary">Automation</p>
              <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.035em]">Agent Systems</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Deploy autonomous systems equipped with customized tools, system prompts, and memory.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90"
            >
              <Plus className="size-3.5" />
              New Agent
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search agents..."
                className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-8 text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['all', 'active', 'paused', 'draft'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-colors shrink-0 ${
                    filter === tab
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-card text-muted-foreground border border-border hover:border-border/80 hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map(agent => (
              <div
                key={agent.id}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Bot className="size-3.5" />
                      </div>
                      <h3 className="text-[14px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {agent.name}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize shrink-0 border ${
                        agent.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : agent.status === 'paused'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <p className="mt-3 text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {agent.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Layers className="size-3" />
                    {agent.toolsCount} tools
                  </span>
                  <span>Ran {agent.lastRun}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
