import { useState, useRef, useEffect } from 'react'
import {
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Sparkles,
  Layers,
  Calendar,
} from 'lucide-react'
import { Tool } from './types'

interface ToolCardProps {
  tool: Tool
  onEdit: (tool: Tool) => void
  onDuplicate: (tool: Tool) => void
  onDelete: (id: string) => void
  onTogglePublish?: (id: string, published: boolean) => void
}

export function ToolCard({
  tool,
  onEdit,
  onDuplicate,
  onDelete,
  onTogglePublish,
}: ToolCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <div
      onClick={() => onEdit(tool)}
      className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-primary/50 hover:bg-accent/40 cursor-pointer shadow-sm"
    >
      {/* Top Header info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-foreground truncate group-hover:text-primary transition-colors">
              {tool.name}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${
                tool.type === 'client'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {tool.type === 'client' ? 'Client' : 'Connected'}
            </span>
          </div>

          <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
            {tool.description || 'No description provided.'}
          </p>
        </div>

        {/* Action Menu (...) */}
        <div
          ref={menuRef}
          className="relative"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Tool actions menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <MoreVertical className="size-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl shadow-black/40 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onEdit(tool)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] text-foreground transition-colors hover:bg-accent"
              >
                <Edit3 className="size-3.5 text-muted-foreground" />
                Edit Tool
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onDuplicate(tool)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] text-foreground transition-colors hover:bg-accent"
              >
                <Copy className="size-3.5 text-muted-foreground" />
                Duplicate
              </button>

              <div className="my-1 border-t border-border" />

              <div className="flex items-center justify-between px-2.5 py-1.5 text-[12px] text-muted-foreground opacity-70 cursor-not-allowed">
                <span className="flex items-center gap-2.5">
                  <Sparkles className="size-3.5" />
                  In Playground
                </span>
                <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                  Soon
                </span>
              </div>

              <div className="my-1 border-t border-border" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onDelete(tool.id)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
                Delete Tool
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Meta tags & Details */}
      <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
        {tool.parameters && tool.parameters.length > 0 ? (
          <span className="flex items-center gap-1">
            <Layers className="size-3 text-muted-foreground/70" />
            {tool.parameters.length} {tool.parameters.length === 1 ? 'argument' : 'arguments'}
          </span>
        ) : tool.type === 'client' ? (
          <span className="flex items-center gap-1 text-muted-foreground/60">
            <Layers className="size-3" />
            0 arguments
          </span>
        ) : (
          <span className="capitalize">{tool.serviceConfig?.serviceType || 'Service'}</span>
        )}

        {tool.updatedAt && (
          <span className="flex items-center gap-1">
            <Calendar className="size-3 text-muted-foreground/70" />
            {tool.updatedAt}
          </span>
        )}
      </div>

      {/* Bottom Publish Bar */}
      <div
        className="mt-4 pt-3 border-t border-border flex items-center justify-between"
        onClick={e => e.stopPropagation()}
      >
        <span className="text-[11px] font-medium text-muted-foreground">
          {tool.published ? 'Published' : 'Draft'}
        </span>
        <button
          type="button"
          aria-label={tool.published ? 'Unpublish tool' : 'Publish tool'}
          onClick={() => onTogglePublish?.(tool.id, !tool.published)}
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
            tool.published ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block size-3 transform rounded-full bg-white transition-transform ${
              tool.published ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
