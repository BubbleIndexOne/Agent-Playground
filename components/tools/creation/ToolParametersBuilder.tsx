import { Plus, Trash2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import { ToolParameter, ParameterType } from '../types'

interface ToolParametersBuilderProps {
  parameters: ToolParameter[]
  onAddParam: (newParam: ToolParameter) => void
  onUpdateParam: (id: string, oldName: string, updatedParam: ToolParameter) => void
  onRemoveParam: (id: string, name: string) => void
  parseStatus?: 'idle' | 'parsing' | 'error' | 'success'
}

const PARAM_TYPES: ParameterType[] = ['string', 'number', 'boolean', 'object', 'array']

export function ToolParametersBuilder({
  parameters,
  onAddParam,
  onUpdateParam,
  onRemoveParam,
  parseStatus = 'idle'
}: ToolParametersBuilderProps) {
  const handleAdd = () => {
    const newParam: ToolParameter = {
      id: Math.random().toString(36).substring(2, 9),
      name: `new_param_${parameters.length + 1}`,
      type: 'string',
      description: 'Description...',
      required: true,
    }
    onAddParam(newParam)
  }

  const handleUpdate = (param: ToolParameter, updates: Partial<ToolParameter>) => {
    const updated = { ...param, ...updates }
    // Enforce valid name
    updated.name = updated.name.replace(/[^a-zA-Z0-9_]/g, '')
    onUpdateParam(param.id, param.name, updated)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header & Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-[13px] font-semibold text-foreground">Input Parameters</h4>
          
          {/* Status Indicator */}
          {parseStatus === 'parsing' && (
            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
              <RefreshCw className="size-3 animate-spin" />
              <span>Parsing...</span>
            </div>
          )}
          {parseStatus === 'error' && (
            <div className="flex items-center gap-1 text-[10px] text-destructive font-medium" title="JSDoc parsing failed. Showing last valid state.">
              <AlertCircle className="size-3" />
              <span>Parse Error</span>
            </div>
          )}
          {parseStatus === 'success' && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium opacity-0 animate-[fade-in-out_2s_ease-in-out]">
              <CheckCircle2 className="size-3" />
              <span>Synced</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <Plus className="size-3" />
            Add Argument
          </button>
        </div>
      </div>
      
      <p className="text-[11px] text-muted-foreground -mt-3">
        Define arguments for the AI model. Changes sync directly to code comments.
      </p>

      {parameters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/50 p-5 text-center flex flex-col items-center justify-center gap-2">
          <p className="text-[12px] text-muted-foreground">No parameters configured.</p>
          <p className="text-[11px] text-muted-foreground/70 max-w-xs">
            Add arguments manually or type them in your code's JSDoc to see them appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {parameters.map((param, index) => (
            <div
              key={param.id}
              className="group flex flex-col gap-2.5 rounded-lg border border-border bg-background/60 p-3 transition-colors hover:border-border/80"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded bg-accent text-[10px] font-mono text-muted-foreground">
                  {index + 1}
                </span>

                <input
                  type="text"
                  value={param.name}
                  onChange={e => handleUpdate(param, { name: e.target.value })}
                  placeholder="param_name"
                  className="h-8 flex-1 rounded-md border border-border bg-card px-2.5 font-mono text-[12px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
                />

                <select
                  value={param.type}
                  onChange={e => handleUpdate(param, { type: e.target.value as ParameterType })}
                  className="h-8 rounded-md border border-border bg-card px-2 text-[12px] font-medium text-foreground outline-none focus:border-primary"
                >
                  {PARAM_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-1.5 px-1.5 text-[11px] text-muted-foreground select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={param.required}
                    onChange={e => handleUpdate(param, { required: e.target.checked })}
                    className="accent-primary rounded size-3.5"
                  />
                  Required
                </label>

                <button
                  type="button"
                  onClick={() => onRemoveParam(param.id, param.name)}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Remove parameter"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <input
                type="text"
                value={param.description}
                onChange={e => handleUpdate(param, { description: e.target.value })}
                placeholder="Documentation for AI (e.g. City name, e.g. Tokyo, Paris)"
                className="h-7 w-full rounded-md border border-border/70 bg-card/60 px-2.5 text-[11px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
