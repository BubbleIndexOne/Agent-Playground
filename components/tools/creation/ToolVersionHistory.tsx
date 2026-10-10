/**
 * @fileoverview Tool Historical Versions List & Comparison Tab
 *
 * Displays all historical versions of a tool utilizing GET /tools/{id}/versions.
 * Allows comparing any version against the current or selecting two versions to diff.
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  History,
  GitCompare,
  Clock,
  Layers,
  FileCode2,
  Loader2,
  AlertCircle,
  Hash,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import * as toolsApi from '../../../api/tools'
import { ToolVersionResponse } from '../../../api/types'
import { ToolDiffModal } from './ToolDiffModal'

export interface ToolVersionHistoryProps {
  toolId?: string
  currentVersionNumber?: number
}

export function ToolVersionHistory({
  toolId,
  currentVersionNumber,
}: ToolVersionHistoryProps) {
  const [versions, setVersions] = useState<ToolVersionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Compare modal state
  const [diffModal, setDiffModal] = useState<{
    open: boolean
    fromVersion: number
    toVersion: number
  }>({
    open: false,
    fromVersion: 1,
    toVersion: 1,
  })

  // Selected preview code
  const [previewVersion, setPreviewVersion] = useState<ToolVersionResponse | null>(null)

  useEffect(() => {
    if (!toolId) {
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    toolsApi
      .getToolVersions(toolId)
      .then((data) => {
        if (isMounted) {
          setVersions(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load historical versions')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [toolId])

  if (!toolId) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center text-muted-foreground">
        <History className="size-8 mb-2 opacity-50" />
        <p className="text-[13px] font-semibold text-foreground">No Version History Yet</p>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
          Save this tool to create the initial version v1 and begin tracking atomic revisions.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center">
        <Loader2 className="size-8 text-primary animate-spin mb-3" />
        <p className="text-[13px] font-medium text-foreground">Loading version history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center text-destructive">
        <AlertCircle className="size-8 mb-2" />
        <p className="text-[14px] font-semibold">Failed to load versions</p>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">{error}</p>
      </div>
    )
  }

  const latestVersion = versions.length > 0 ? versions[0].version_number : 1

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
            <History className="size-4 text-primary" /> Version History &amp; Revisions
          </h4>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Every code or schema modification generates an immutable version with code hashing.
          </p>
        </div>
        <span className="rounded-full bg-accent border border-border px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </span>
      </div>

      {/* Version timeline list */}
      <div className="flex flex-col gap-3">
        {versions.map((ver) => {
          const isCurrent =
            ver.version_number === (currentVersionNumber || latestVersion)
          const paramCount = ver.schema_json?.properties
            ? Object.keys(ver.schema_json.properties).length
            : 0

          return (
            <div
              key={ver.id}
              className={`flex flex-col gap-3 rounded-xl border p-4 transition-all shadow-sm ${
                isCurrent
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border bg-card/60 hover:bg-card'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[12px] font-mono font-bold ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    v{ver.version_number}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-foreground">
                        Revision {ver.version_number}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="size-2.5" /> Current
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <Clock className="size-3 text-muted-foreground/70" />
                      {new Date(ver.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewVersion(ver)}
                    className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-accent transition-colors"
                    title="Inspect version code"
                  >
                    <Eye className="size-3" />
                    Inspect
                  </button>

                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() =>
                        setDiffModal({
                          open: true,
                          fromVersion: ver.version_number,
                          toVersion: currentVersionNumber || latestVersion,
                        })
                      }
                      className="flex items-center gap-1 rounded-md bg-accent border border-border px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-accent/80 transition-colors"
                      title="Compare against current version"
                    >
                      <GitCompare className="size-3" />
                      Diff vs Current
                    </button>
                  )}
                </div>
              </div>

              {/* Version metadata tags */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Layers className="size-3" />
                  {paramCount} {paramCount === 1 ? 'argument' : 'arguments'}
                </span>

                {ver.code_hash && (
                  <span className="flex items-center gap-1 font-mono">
                    <Hash className="size-3 text-muted-foreground/60" />
                    SHA: {ver.code_hash.substring(0, 8)}
                  </span>
                )}

                {ver.capabilities_json && ver.capabilities_json.length > 0 && (
                  <div className="flex items-center gap-1">
                    {ver.capabilities_json.map((c, i) => (
                      <span
                        key={i}
                        className="rounded bg-accent/60 px-1 py-0.2 font-mono text-[9px] text-muted-foreground"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Code Inspection Preview Modal */}
      {previewVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="flex flex-col w-full max-w-2xl max-h-[80vh] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/20">
              <span className="text-[14px] font-semibold text-foreground flex items-center gap-2">
                <FileCode2 className="size-4 text-primary" /> Inspecting Revision v
                {previewVersion.version_number} Code
              </span>
              <button
                type="button"
                onClick={() => setPreviewVersion(null)}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] select-text bg-card/40">
              <pre className="whitespace-pre-wrap leading-relaxed text-foreground">
                {previewVersion.code || '// No code stored for this revision'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Visual Diff Modal */}
      {diffModal.open && (
        <ToolDiffModal
          toolId={toolId}
          fromVersion={diffModal.fromVersion}
          toVersion={diffModal.toVersion}
          onClose={() => setDiffModal({ open: false, fromVersion: 1, toVersion: 1 })}
        />
      )}
    </div>
  )
}
