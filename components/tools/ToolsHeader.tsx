import { Plus, Search, X } from 'lucide-react'
import { ToolFilter, ToolsHeaderProps } from './types'
import { FILTER_OPTIONS } from './constants'

export function ToolsHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onNewTool,
  toolCount,
}: ToolsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5">
      {/* Top Row: Tabs & New Tool Action */}
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => onTabChange('my-tools')}
            className={`text-[14px] font-medium transition-colors ${
              activeTab === 'my-tools'
                ? 'text-foreground border-b-2 border-primary pb-3 -mb-[21px]'
                : 'text-muted-foreground hover:text-foreground pb-3 -mb-[21px] border-b-2 border-transparent'
            }`}
          >
            My Tools <span className="ml-1.5 rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-mono">{toolCount}</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('marketplace')}
            className={`text-[14px] font-medium transition-colors ${
              activeTab === 'marketplace'
                ? 'text-foreground border-b-2 border-primary pb-3 -mb-[21px]'
                : 'text-muted-foreground hover:text-foreground pb-3 -mb-[21px] border-b-2 border-transparent'
            }`}
          >
            Marketplace
          </button>
        </div>

        <button
          type="button"
          onClick={onNewTool}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90"
        >
          <Plus className="size-3.5" />
          New Tool
        </button>
      </div>

      {/* Bottom Row: Search & Filter Pills (shown on My Tools tab) */}
      {activeTab === 'my-tools' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search tools by name, description..."
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-8 text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {FILTER_OPTIONS.map(opt => {
              const selected = activeFilter === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onFilterChange(opt.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors shrink-0 ${
                    selected
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-card text-muted-foreground border border-border hover:border-border/80 hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
