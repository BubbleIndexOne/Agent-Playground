import { Code2, Plug } from 'lucide-react'

interface ChooseToolTypeProps {
  onSelect: (type: 'client' | 'service') => void
}

export function ChooseToolType({ onSelect }: ChooseToolTypeProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center mb-8">
        <h2 className="text-[20px] font-semibold tracking-[-0.025em]">Choose tool type</h2>
        <p className="mt-2 text-[13px] text-muted-foreground">Select how you want to provide this capability.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full px-4">
        <button
          onClick={() => onSelect('client')}
          className="group flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/50 hover:bg-accent/50 text-foreground"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
            <Code2 className="size-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold">Client tool</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">Write a JavaScript function that runs securely in the browser.</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('service')}
          className="group flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/50 hover:bg-accent/50 text-foreground"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
            <Plug className="size-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold">Connect a service</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">Link a database, API, or third-party service directly.</p>
          </div>
        </button>
      </div>
    </div>
  )
}
