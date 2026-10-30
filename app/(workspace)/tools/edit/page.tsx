/**
 * @fileoverview Edit Tool Sub-Route (/tools/edit?id=...)
 *
 * Dedicated sub-route for inspecting and editing an existing tool.
 * Resolves tool by query ID parameter from persistent ToolsContext, fetching directly
 * via GET /tools/{id} if not already hydrated in local state.
 * Pressing browser Back returns directly to the /tools workspace.
 */

'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { useTools } from '@/components/tools/ToolsContext'
import { ClientToolEditor } from '@/components/tools/creation/ClientToolEditor'
import { ConnectServiceForm } from '@/components/tools/creation/ConnectServiceForm'
import { Tool } from '@/components/tools/types'

function EditToolContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toolId = searchParams.get('id')
  const { getTool, fetchToolById, saveTool } = useTools()

  const [tool, setTool] = useState<Tool | undefined>(toolId ? getTool(toolId) : undefined)
  const [loading, setLoading] = useState(!tool || !tool.current_version)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!toolId) {
      setLoading(false)
      return
    }

    const localTool = getTool(toolId)
    if (localTool && localTool.current_version) {
      setTool(localTool)
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    fetchToolById(toolId)
      .then((fetched) => {
        if (isMounted) {
          setTool(fetched)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoadError(err.message || 'Failed to load tool details')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [toolId, getTool, fetchToolById])

  const handleCancel = () => {
    router.push('/tools')
  }

  const handleSave = async (savedTool: Tool) => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await saveTool(savedTool)
      router.push('/tools')
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update tool')
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border px-5 md:px-8">
        <div className="flex items-center gap-3 pl-10 md:pl-0">
          <button
            type="button"
            onClick={() => router.push('/tools')}
            className="flex size-7 items-center justify-center rounded-md bg-accent text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground"
            title="Back to tools"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <div>
            <h1 className="text-[14px] font-semibold tracking-[-0.01em]">
              {tool ? `Edit: ${tool.name}` : 'Edit Tool'}
            </h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              {tool
                ? tool.type === 'client'
                  ? 'Client JavaScript Function'
                  : 'Connected Service'
                : 'Tool Configuration'}
            </p>
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col gap-5 p-5 md:p-8">
        {saveError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-[12px] text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="size-8 text-primary animate-spin mb-4" />
            <p className="text-[14px] font-medium text-foreground">Loading tool details...</p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Fetching tool configuration and version details
            </p>
          </div>
        ) : tool ? (
          tool.type === 'client' ? (
            <ClientToolEditor
              initialTool={tool}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          ) : (
            <ConnectServiceForm
              initialTool={tool}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          )
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl bg-background/50">
            <AlertCircle className="size-8 text-destructive mb-3" />
            <h3 className="text-[16px] font-semibold text-foreground">Tool Not Found</h3>
            <p className="mt-1 text-[13px] text-muted-foreground max-w-sm">
              {loadError || `The tool with ID "${toolId || 'unknown'}" could not be located.`}
            </p>
            <button
              type="button"
              onClick={() => router.push('/tools')}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Return to Tools
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default function EditToolPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-[12px] text-muted-foreground">Loading tool editor...</div>
      }
    >
      <EditToolContent />
    </Suspense>
  )
}
