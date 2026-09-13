/**
 * @fileoverview Tools Workspace Main Screen
 *
 * Top-level view orchestrator for the Tools workspace.
 * Coordinates:
 * - Tab navigation (My Tools vs. Marketplace).
 * - Multi-criteria search and filter queries.
 * - Routing to `/tools/new` on "New Tool".
 * - Routing to `/tools/edit?id=...` on tool card click.
 * - Tool mutations (duplication, deletion, publishing) via `ToolsContext`.
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PanelLeft, Sparkles, Activity, Wrench } from 'lucide-react'
import { Tool, ToolFilter } from './types'
import { ToolsHeader } from './ToolsHeader'
import { ToolCard } from './ToolCard'
import { useTools } from './ToolsContext'

/**
 * Main Tools screen component for viewing, searching, and managing workspace tools.
 */
export function ToolsScreen() {
  const router = useRouter()
  const { tools, deleteTool, duplicateTool, togglePublishTool } = useTools()

  const [activeTab, setActiveTab] = useState<'my-tools' | 'marketplace'>('my-tools')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ToolFilter>('all')

  // Filter tools according to search query and filter chips
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = tool.name.toLowerCase().includes(q)
        const matchesDesc = tool.description.toLowerCase().includes(q)
        const matchesParam = tool.parameters?.some(
          p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        )
        if (!matchesName && !matchesDesc && !matchesParam) return false
      }

      // 2. Status / Category Filter
      if (activeFilter === 'client') return tool.type === 'client'
      if (activeFilter === 'mcp') return tool.type === 'mcp'
      if (activeFilter === 'published') return tool.published === true
      if (activeFilter === 'draft') return !tool.published

      return true
    })
  }, [tools, searchQuery, activeFilter])

  // Lifecycle Handlers navigating to sub-routes
  const handleNewTool = () => {
    router.push('/tools/new')
  }

  const handleEditTool = (tool: Tool) => {
    router.push(`/tools/edit?id=${encodeURIComponent(tool.id)}`)
  }

  const handleDuplicateTool = (tool: Tool) => {
    duplicateTool(tool)
  }

  const handleDeleteTool = (id: string) => {
    deleteTool(id)
  }

  const handleTogglePublish = (id: string, published: boolean) => {
    togglePublishTool(id, published)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border px-5 md:px-8">
        <div className="flex items-center gap-3 pl-10 md:pl-0">
          <div className="hidden size-7 items-center justify-center rounded-md bg-accent text-muted-foreground sm:flex">
            <PanelLeft className="size-3.5" />
          </div>
          <div>
            <h1 className="text-[14px] font-semibold tracking-[-0.01em]">Tools</h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Build, test, and manage workspace capabilities
            </p>
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col gap-5 p-5 md:p-8">
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          <ToolsHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onNewTool={handleNewTool}
            toolCount={tools.length}
          />

          {activeTab === 'my-tools' && (
            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTools.map(tool => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onEdit={handleEditTool}
                      onDuplicate={handleDuplicateTool}
                      onDelete={handleDeleteTool}
                      onTogglePublish={handleTogglePublish}
                    />
                  ))}
                </div>
              ) : (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl bg-background/50">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-accent mb-4">
                    {searchQuery ? (
                      <Wrench className="size-4 text-muted-foreground" />
                    ) : (
                      <Activity className="size-4 text-primary" />
                    )}
                  </div>
                  <p className="text-[14px] font-medium text-foreground">
                    {searchQuery ? 'No matching tools found' : 'No tools in this category'}
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground max-w-[280px]">
                    {searchQuery
                      ? `We couldn't find any tools matching "${searchQuery}".`
                      : 'Create a new tool or adjust your filter options.'}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setActiveFilter('all')
                      }}
                      className="mt-3 text-[12px] font-medium text-primary hover:underline"
                    >
                      Clear search &amp; filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent mb-5">
                <Sparkles className="size-5 text-primary" />
              </div>
              <h3 className="text-[16px] font-semibold text-foreground">Marketplace</h3>
              <p className="mt-2 text-[13px] text-muted-foreground max-w-sm">
                Discover, preview, and install pre-built tools created by the community. Coming soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
