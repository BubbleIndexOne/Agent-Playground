/**
 * @fileoverview Live Tool Sandbox Execution Runner
 *
 * Pure UI shell for the LiveTestSandbox.
 * Supports both local browser execution and Cloudflare Sandbox Worker verification audit (POST /tools/{id}/register).
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
  ShieldCheck,
  Cpu,
} from 'lucide-react'
import { ToolParameter, ToolCapabilities } from '../types'
import { ToolRegistrationResponse } from '../../../api/types'
import { useLiveTestSandbox } from './useLiveTestSandbox'

export interface LiveTestSandboxProps {
  code: string
  parameters: ToolParameter[]
  capabilities: ToolCapabilities
  toolName: string
  toolId?: string
  onRegisterSuccess?: (res: ToolRegistrationResponse) => void
}

export function LiveTestSandbox(props: LiveTestSandboxProps) {
  const { capabilities, toolName, toolId } = props
  const {
    inputArgsJson,
    setInputArgsJson,
    isRunning,
    result,
    error,
    latency,
    logs,
    hasRun,
    isAuditing,
    auditResult,
    auditError,
    inputHeightPercent,
    isResizingVertical,
    setIsResizingVertical,
    sandboxContainerRef,
    handleResetInputs,
    handleFormatJson,
    handleRun,
    handleCloudflareRegister,
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
            {toolId && (
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                Cloudflare Ready
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Test tool execution with live permissions or run automated Cloudflare sandbox audit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetInputs}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border/60 bg-background/50"
            title="Reset arguments using parsed parameters"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>

          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || isAuditing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-foreground hover:bg-accent transition-colors disabled:opacity-50 shadow-sm"
            title="Run rapid test in browser sandbox"
          >
            {isRunning ? <Activity className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            Local Run
          </button>

          <button
            type="button"
            id="run-cloudflare-audit-btn"
            onClick={handleCloudflareRegister}
            disabled={isRunning || isAuditing || !toolId}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90 disabled:opacity-50 shadow-sm"
            title={
              toolId
                ? 'Execute Cloudflare Worker isolated sandbox audit to transition to Registered status'
                : 'Save tool first to enable Cloudflare verification'
            }
          >
            {isAuditing ? (
              <Activity className="size-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="size-3.5" />
            )}
            Verify &amp; Register
          </button>
        </div>
      </div>

      {auditError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-[12px] text-destructive shrink-0">
          <AlertCircle className="size-4 shrink-0" />
          <span>{auditError}</span>
        </div>
      )}

      {/* Cloudflare Sandbox Audit Results Card */}
      {auditResult && (
        <div
          className={`shrink-0 rounded-xl border p-4 shadow-sm transition-all ${
            auditResult.success && auditResult.testResults.status === 'passed'
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-destructive/30 bg-destructive/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {auditResult.success && auditResult.testResults.status === 'passed' ? (
                <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="size-4" />
                </div>
              ) : (
                <div className="flex size-6 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                  <AlertCircle className="size-4" />
                </div>
              )}
              <div>
                <span className="text-[13px] font-semibold text-foreground">
                  Cloudflare Sandbox Audit:{' '}
                  <span
                    className={
                      auditResult.success && auditResult.testResults.status === 'passed'
                        ? 'text-emerald-400 uppercase tracking-wide text-[11px] font-bold'
                        : 'text-destructive uppercase tracking-wide text-[11px] font-bold'
                    }
                  >
                    {auditResult.testResults.status}
                  </span>
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">{auditResult.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              {auditResult.testResults.durationMs !== undefined && (
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="size-3 text-muted-foreground/70" />
                  {auditResult.testResults.durationMs}ms
                </span>
              )}
              <span className="flex items-center gap-1">
                <Cpu className="size-3 text-primary" />
                Cloudflare Worker
              </span>
            </div>
          </div>

          {/* Observed syscalls / network calls */}
          {auditResult.testResults.observedCalls &&
            auditResult.testResults.observedCalls.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-[11px]">
                <span className="text-muted-foreground font-medium">Observed Calls:</span>
                <div className="flex flex-wrap gap-1.5">
                  {auditResult.testResults.observedCalls.map((call, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-accent/80 border border-border px-1.5 py-0.5 font-mono text-[10px] text-primary"
                    >
                      {call}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {auditResult.testResults.reason && (
            <p className="mt-2 text-[11px] text-destructive font-mono bg-destructive/10 p-2 rounded">
              {auditResult.testResults.reason}
            </p>
          )}
        </div>
      )}

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
                JSON
              </span>
            </div>
            <button
              type="button"
              onClick={handleFormatJson}
              className="text-[10px] text-muted-foreground hover:text-foreground font-mono transition-colors"
            >
              Format JSON
            </button>
          </div>
          <div className="flex-1 p-2 bg-card/40">
            <textarea
              value={inputArgsJson}
              onChange={(e) => setInputArgsJson(e.target.value)}
              placeholder="{}"
              spellCheck={false}
              className="size-full resize-none bg-transparent font-mono text-[11px] leading-relaxed text-foreground outline-none p-1 placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        {/* Resizer Divider Bar */}
        <div
          onMouseDown={() => setIsResizingVertical(true)}
          className="group relative flex h-3 w-full cursor-row-resize items-center justify-center hover:bg-primary/20 transition-colors shrink-0"
        >
          <div className="h-0.5 w-full bg-border group-hover:bg-primary transition-colors" />
          <div className="absolute flex size-4 items-center justify-center rounded-sm bg-border text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
            <GripHorizontal className="size-2.5" />
          </div>
        </div>

        {/* Output Console Box */}
        <div className="flex flex-col flex-1 min-h-[120px] rounded-xl border border-border bg-background/40 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-border/80 bg-muted/30 px-3.5 py-2 text-[11px] font-medium shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="size-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">Execution Output</span>
            </div>
            {latency !== null && (
              <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                <Clock className="size-3 text-muted-foreground/70" />
                <span>{latency}ms</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] select-text">
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
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                  Click &quot;Local Run&quot; or &quot;Verify &amp; Register&quot; above to execute &quot;
                  {toolName || 'Tool'}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
