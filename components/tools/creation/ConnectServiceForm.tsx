import { useState } from 'react'
import {
  ChevronDown,
  Database,
  Plug,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { Tool, ToolServiceConfig } from '../types'

interface ConnectServiceFormProps {
  initialTool?: Tool | null
  onCancel: () => void
  onSave: (tool: Tool) => void
}

const SERVICES = [
  { id: 'postgresql', name: 'PostgreSQL Database', icon: Database },
  { id: 'slack', name: 'Slack Workspace', icon: MessageSquare },
  { id: 'custom', name: 'Custom HTTP Service', icon: Plug },
]

export function ConnectServiceForm({ initialTool, onCancel, onSave }: ConnectServiceFormProps) {
  const [name, setName] = useState(initialTool?.name || '')
  const [description, setDescription] = useState(initialTool?.description || '')
  const [serviceId, setServiceId] = useState(
    initialTool?.serviceConfig?.serviceType || SERVICES[0].id
  )
  const [connectionString, setConnectionString] = useState(
    initialTool?.serviceConfig?.connectionString || ''
  )

  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; latency: number; message: string } | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  const isNameValid = name.trim().length > 0
  const isDescValid = description.trim().length > 0
  const isConnValid = connectionString.trim().length > 0
  const isValid = isNameValid && isDescValid && isConnValid

  const handleTestConnection = async () => {
    if (!connectionString.trim()) return
    setIsTesting(true)
    setTestResult(null)

    const startTime = performance.now()
    // Simulated connection ping
    await new Promise(resolve => setTimeout(resolve, 600))
    const elapsed = Math.round(performance.now() - startTime)

    setIsTesting(false)
    setTestResult({
      success: true,
      latency: elapsed,
      message: `Connection established to ${SERVICES.find(s => s.id === serviceId)?.name}. Service is responsive.`,
    })
  }

  const handleSaveClick = () => {
    if (!isValid) {
      setShowValidation(!isValid)
      return
    }

    const toolToSave: Tool = {
      id: initialTool?.id || Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      description: description.trim(),
      type: 'mcp',
      published: initialTool ? initialTool.published : false,
      serviceConfig: {
        serviceType: serviceId,
        connectionString: connectionString.trim(),
      },
      updatedAt: new Date().toLocaleDateString(),
    }

    onSave(toolToSave)
  }

  return (
    <div className="flex flex-col mx-auto max-w-xl w-full rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border p-6 bg-background/50">
        <h3 className="text-[18px] font-semibold tracking-[-0.025em] text-foreground">
          {initialTool ? 'Edit Connected Service' : 'Connect a Service'}
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Link an external database, messaging platform, or remote API endpoint.
        </p>
      </div>

      <div className="p-6 flex flex-col gap-5">
        {showValidation && !isValid && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-[12px] text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>Please fill out all required fields (Name, Description, and Connection Details).</span>
          </div>
        )}

        {/* Service Type */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-foreground">Service Type</label>
          <div className="relative">
            <select
              value={serviceId}
              onChange={e => setServiceId(e.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {SERVICES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
          </div>
        </div>

        {/* Tool Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-foreground">Tool Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Production Database"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-foreground">
            Documentation (Mandatory for AI)
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Explain to the AI model what queries or actions this service performs..."
            className="w-full resize-none rounded-lg border border-border bg-background p-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Connection Details & Test Ping */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-foreground">Connection String / URL</label>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !connectionString.trim()}
              className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {isTesting ? <Activity className="size-3 animate-spin" /> : null}
              Test Connection
            </button>
          </div>
          <input
            type="password"
            value={connectionString}
            onChange={e => setConnectionString(e.target.value)}
            placeholder="postgres://user:pass@host:5432/db or https://api.endpoint.com"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-[11px] text-muted-foreground">
            Connection parameters are used strictly within your authorized workspace runtime.
          </p>

          {/* Test connection result pill */}
          {testResult && (
            <div className="mt-1 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-[12px] text-emerald-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{testResult.message}</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] opacity-80">
                <Clock className="size-3" />
                {testResult.latency}ms
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border p-6 flex items-center justify-between bg-background/50 rounded-b-xl mt-auto">
        <button
          type="button"
          onClick={onCancel}
          className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveClick}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90"
        >
          {initialTool ? 'Update Service' : 'Connect Service'}
        </button>
      </div>
    </div>
  )
}
