/**
 * @fileoverview Live Tool Sandbox Execution Runner
 *
 * Pure UI shell for the LiveTestSandbox. Logic is in useLiveTestSandbox.
 */

import React from 'react'
import {
  Play,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Terminal,
  GripHorizontal,
} from 'lucide-react'
import { ToolParameter, ToolCapabilities } from '../types'
import { useLiveTestSandbox } from './useLiveTestSandbox'

export interface LiveTestSandboxProps {
  code: string
  parameters: ToolParameter[]
  capabilities: ToolCapabilities
  toolName: string
}

export function LiveTestSandbox(props: LiveTestSandboxProps) {
  const { capabilities, toolName } = props
  const {
    inputArgsJson, setInputArgsJson,
    isRunning,
    result,
    error,
    latency,
    logs,
    hasRun,
    inputHeightPercent,
    isResizingVertical, setIsResizingVertical,
    sandboxContainerRef,
    handleResetInputs,
    handleFormatJson,
    handleRun,
  } = useLiveTestSandbox(props)

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      {/* Header Bar */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-[13px] font-semibold text-foreground">Live Sandbox Runner</h4>
            {!capabilities.network && (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                Network Blocked
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Test tool execution with live sandboxed permissions and typed mock parameters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetInputs}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border/60 bg-background/50"
            title="Reset arguments using parsed JSDoc parameter names & types"
          >
            <RotateCcw className="size-3" />
            Reset Inputs
          </button>
          <button
            type="button"
            id="run-sandbox-test-btn"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90 disabled:opacity-50 shadow-sm"
          >
            {isRunning ? <Activity className="size-3.5 animate-spin" /> : <Play className="size-3.5 fill-current" />}
            Run Test
          </button>
        </div>
      </div>

      {/* Main Sandbox Workspace with vertical resizer */}
      <div
        ref={sandboxContainerRef}
        className="flex flex-col flex-1 min-h-0 relative select-none"
        style={{ userSelect: isResizingVertical ? 'none' : 'auto' }}
      >
        {/* Input Parameters Box */}
        <div
          style={{ height: `${inputHeightPercent}%` }}
          className="flex flex-col rounded-xl border border-border bg-background/40 overflow-hidden shrink-0 min-h-[100px] shadow-sm transition-[height] duration-75"
        >
          <div className="flex items-center justify-between border-b border-border/80 bg-muted/30 px-3.5 py-2 text-[11px] font-medium shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Input Arguments</span>
              <span className="rounded bg-primary/10 px-1.5 py-0.2 font-mono text-[10px] text-primary">
                args
              </span>
            </div>
            <button
              type="button"
              onClick={handleFormatJson}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              title="Prettify JSON"
            >
              Prettify JSON
            </button>
          </div>
          <textarea
            id="sandbox-input-json"
            value={inputArgsJson}
            onChange={e => setInputArgsJson(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full resize-none bg-background/50 p-3 font-mono text-[11px] leading-relaxed text-foreground outline-none focus:ring-0 overflow-y-auto"
            placeholder="{\n  &quot;param&quot;: &quot;value&quot;\n}"
          />
        </div>

        {/* Vertical Resizer Handle */}
        <div
          onMouseDown={e => {
            e.preventDefault()
            setIsResizingVertical(true)
          }}
          className="group relative flex items-center justify-center h-4 my-0.5 cursor-row-resize z-20 select-none shrink-0"
          title="Drag to resize console panels"
        >
          <div
            className={`w-full h-[2px] transition-colors rounded-full ${
              isResizingVertical ? 'bg-primary' : 'bg-border/60 group-hover:bg-primary/50'
            }`}
          />
          <div
            className={`absolute flex size-5 items-center justify-center rounded-full border border-border bg-card shadow-md transition-all ${
              isResizingVertical
                ? 'scale-110 border-primary text-primary bg-accent'
                : 'opacity-60 group-hover:opacity-100 text-muted-foreground group-hover:scale-105'
            }`}
          >
            <GripHorizontal className="size-3" />
          </div>
        </div>

        {/* Execution Output Console Box */}
        <div className="flex flex-col rounded-xl border border-border bg-background/40 overflow-hidden flex-1 min-h-[120px] shadow-sm">
          <div className="flex items-center justify-between border-b border-border/80 bg-muted/30 px-3.5 py-2 text-[11px] font-medium shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Execution Console</span>
              {result !== null && !error && (
                <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="size-3" />
                  Success
                </span>
              )}
              {error && (
                <span className="flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive border border-destructive/20">
                  <AlertCircle className="size-3" />
                  Error
                </span>
              )}
            </div>

            {latency !== null && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                <Clock className="size-3 text-primary" />
                {latency}ms
              </span>
            )}
          </div>

          <div
            id="sandbox-output-console"
            className="flex-1 overflow-auto bg-background/70 p-3.5 font-mono text-[11px]"
          >
            {isRunning ? (
              <div className="flex h-full flex-col items-center justify-center gap-2.5 text-muted-foreground">
                <Activity className="size-5 animate-spin text-primary" />
                <span className="text-[12px] font-medium">Executing tool sandbox...</span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-2.5 text-destructive rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-[11px]">Execution Error:</span>
                  <span className="whitespace-pre-wrap leading-relaxed text-[11px]">{error}</span>
                </div>
              </div>
            ) : result !== null ? (
              <div className="flex flex-col gap-3">
                {logs.length > 0 && (
                  <div className="rounded-lg bg-card/80 p-2.5 border border-border/70 text-[10px] text-muted-foreground flex flex-col gap-1.5">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground text-[9px] uppercase tracking-wider">
                      <Terminal className="size-3 text-primary" /> Captured Console Logs
                    </span>
                    <div className="flex flex-col gap-0.5 divide-y divide-border/30">
                      {logs.map((l, i) => (
                        <span key={i} className="font-mono pt-1">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Returned Value
                  </span>
                  <pre className="text-foreground whitespace-pre-wrap leading-relaxed rounded-lg bg-card/50 p-2.5 border border-border/50 overflow-x-auto">
                    {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
                  </pre>
                </div>
              </div>
            ) : hasRun ? (
              <span className="text-muted-foreground">Execution completed with undefined return.</span>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground/60 py-6">
                <Terminal className="size-6 text-muted-foreground/40 mb-2" />
                <p className="text-[12px] font-medium">Console Ready</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">Click &quot;Run Test&quot; above to execute &quot;{toolName || 'Tool'}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
