import { Tool } from './types'

interface ToolCardProps {
  tool: Tool
  onTogglePublish?: (id: string, published: boolean) => void
}

export function ToolCard({ tool, onTogglePublish }: ToolCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent/50">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-foreground">{tool.name}</h3>
          <p className="text-[12px] text-muted-foreground line-clamp-2">{tool.description}</p>
        </div>
        <div
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            tool.type === 'client' 
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {tool.type === 'client' ? 'Client' : 'Connected'}
        </div>
      </div>
      
      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">
          {tool.published ? 'Published' : 'Draft'}
        </span>
        <button
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
