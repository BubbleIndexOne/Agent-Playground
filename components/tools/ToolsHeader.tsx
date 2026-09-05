import { Plus } from 'lucide-react'

interface ToolsHeaderProps {
  activeTab: 'my-tools' | 'marketplace'
  onTabChange: (tab: 'my-tools' | 'marketplace') => void
  onNewTool: () => void
}

export function ToolsHeader({ activeTab, onTabChange, onNewTool }: ToolsHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-4">
      <div className="flex gap-4">
        <button
          onClick={() => onTabChange('my-tools')}
          className={`text-[14px] font-medium transition-colors ${
            activeTab === 'my-tools' ? 'text-foreground border-b-2 border-primary pb-2 -mb-[18px]' : 'text-muted-foreground hover:text-foreground pb-2 -mb-[18px] border-b-2 border-transparent'
          }`}
        >
          My Tools
        </button>
        <button
          onClick={() => onTabChange('marketplace')}
          className={`text-[14px] font-medium transition-colors ${
            activeTab === 'marketplace' ? 'text-foreground border-b-2 border-primary pb-2 -mb-[18px]' : 'text-muted-foreground hover:text-foreground pb-2 -mb-[18px] border-b-2 border-transparent'
          }`}
        >
          Marketplace
        </button>
      </div>
      <button
        onClick={onNewTool}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90"
      >
        <Plus className="size-3.5" />
        New Tool
      </button>
    </div>
  )
}
