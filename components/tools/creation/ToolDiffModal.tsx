/**
 * @fileoverview Tool Historical Version Diff Modal
 *
 * Compares two historical versions of a tool utilizing GET /tools/{id}/diff?from=X&to=Y.
 * Displays code deltas (lines added/removed) and schema parameter differences.
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  GitCompare,
  FileCode2,
  Sliders,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react'
import * as toolsApi from '../../../api/tools'
import { ToolDiffResponse, ToolVersionResponse } from '../../../api/types'

export interface ToolDiffModalProps {
  toolId: string
  fromVersion: number
  toVersion: number
  onClose: () => void
}

export function ToolDiffModal({
  toolId,
  fromVersion,
  toVersion,
  onClose,
}: ToolDiffModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [diffData, setDiffData] = useState<ToolDiffResponse | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    toolsApi
      .diffToolVersions(toolId, fromVersion, toVersion)
      .then((data) => {
        if (isMounted) {
          setDiffData(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to compare tool versions')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [toolId, fromVersion, toVersion])

  const renderCodeDiff = (fromCode: string | null, toCode: string | null) => {
    const fromLines = (fromCode || '').split('\n')
    const toLines = (toCode || '').split('\n')

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px] leading-relaxed select-text">
        {/* Base Version */}
        <div className="flex flex-col rounded-lg border border-border bg-card/60 overflow-hidden">
          <div className="bg-muted/40 px-3 py-1.5 border-b border-border text-[10px] font-semibold text-muted-foreground flex items-center justify-between">
            <span>Base Version (v{fromVersion})</span>
            <span>{fromLines.length} lines</span>
          </div>
          <div className="p-3 overflow-x-auto max-h-[360px] divide-y divide-border/20">
            {fromLines.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2 py-0.5">
                <span className="w-6 shrink-0 text-right text-muted-foreground/40 text-[10px] select-none">
                  {idx + 1}
                </span>
                <span className="whitespace-pre text-muted-foreground">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Target Version */}
        <div className="flex flex-col rounded-lg border border-border bg-card/60 overflow-hidden">
          <div className="bg-muted/40 px-3 py-1.5 border-b border-border text-[10px] font-semibold text-primary flex items-center justify-between">
            <span>Target Version (v{toVersion})</span>
            <span>{toLines.length} lines</span>
          </div>
          <div className="p-3 overflow-x-auto max-h-[360px] divide-y divide-border/20">
            {toLines.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2 py-0.5">
                <span className="w-6 shrink-0 text-right text-primary/40 text-[10px] select-none">
                  {idx + 1}
                </span>
                <span className="whitespace-pre text-foreground">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="flex flex-col w-full max-w-4xl max-h-[85vh] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GitCompare className="size-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">
                Version Comparison: v{fromVersion} ➔ v{toVersion}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Analyzing atomic differences between historical versions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="size-8 text-primary animate-spin mb-3" />
              <p className="text-[13px] font-medium text-foreground">Comparing versions...</p>
            </div>
          ) : error ? (
            <div className="py-16 flex flex-col items-center justify-center text-center text-destructive">
              <AlertCircle className="size-8 mb-2" />
              <p className="text-[14px] font-semibold">Failed to load diff</p>
              <p className="text-[12px] text-muted-foreground mt-1 max-w-sm">{error}</p>
            </div>
          ) : diffData ? (
            <div className="flex flex-col gap-5">
              {/* Diff summary badges */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border ${
                    diffData.diff.code_changed
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <FileCode2 className="size-3.5" />
                  Code: {diffData.diff.code_changed ? 'Modified' : 'Unchanged'}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border ${
                    diffData.diff.schema_changed
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <Sliders className="size-3.5" />
                  Schema: {diffData.diff.schema_changed ? 'Modified' : 'Unchanged'}
                </span>
              </div>

              {/* Code comparison */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                  <FileCode2 className="size-4 text-primary" /> Function Code Comparison
                </h4>
                {renderCodeDiff(diffData.from.code, diffData.to.code)}
              </div>

              {/* Schema JSON comparison */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                  <Sliders className="size-4 text-primary" /> Schema JSON Comparison
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="flex flex-col rounded-lg border border-border bg-card/60 p-3 overflow-x-auto max-h-[220px]">
                    <span className="text-[10px] font-semibold text-muted-foreground mb-1">
                      v{fromVersion} Schema
                    </span>
                    <pre className="text-muted-foreground">
                      {JSON.stringify(diffData.from.schema_json, null, 2)}
                    </pre>
                  </div>
                  <div className="flex flex-col rounded-lg border border-border bg-card/60 p-3 overflow-x-auto max-h-[220px]">
                    <span className="text-[10px] font-semibold text-primary mb-1">
                      v{toVersion} Schema
                    </span>
                    <pre className="text-foreground">
                      {JSON.stringify(diffData.to.schema_json, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border px-6 py-3 bg-muted/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-1.5 text-[12px] font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Close Diff
          </button>
        </div>
      </div>
    </div>
  )
}
