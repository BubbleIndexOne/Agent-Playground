import { useState } from 'react'
import { ChevronDown, Database, Plug, MessageSquare } from 'lucide-react'

interface ConnectServiceFormProps {
  onCancel: () => void
  onSave: () => void
}

const SERVICES = [
  { id: 'postgresql', name: 'PostgreSQL Database', icon: Database },
  { id: 'slack', name: 'Slack Workspace', icon: MessageSquare },
  { id: 'custom', name: 'Custom HTTP Service', icon: Plug },
]

export function ConnectServiceForm({ onCancel, onSave }: ConnectServiceFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [serviceId, setServiceId] = useState(SERVICES[0].id)
  const [connectionString, setConnectionString] = useState('')

  return (
    <div className="flex flex-col mx-auto max-w-lg w-full rounded-xl border border-border bg-card">
      <div className="border-b border-border p-6">
        <h3 className="text-[18px] font-semibold tracking-[-0.025em]">Connect a service</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">Add a new external service capability to your workspace.</p>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-foreground">Service Type</label>
          <div className="relative">
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {SERVICES.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-foreground">Tool Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Production DB"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-foreground">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this service do?"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-foreground">Connection Details</label>
          <input
            type="password"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            placeholder="postgres://user:pass@host:5432/db"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[13px] font-mono text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Stored securely, only used by tools you run.</p>
        </div>
      </div>

      <div className="border-t border-border p-6 flex items-center justify-between bg-background/50 rounded-b-xl mt-auto">
        <button
          onClick={onCancel}
          className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!name.trim() || !connectionString.trim()}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect Service
        </button>
      </div>
    </div>
  )
}
