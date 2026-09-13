/**
 * @fileoverview Edit Tool Sub-Route (/tools/edit?id=...)
 *
 * Dedicated sub-route for inspecting and editing an existing tool.
 * Resolves tool by query ID parameter from persistent ToolsContext.
 * Pressing browser Back returns directly to the /tools workspace.
 */

'use client'

import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { WorkspaceShell } from '@/components/layout/WorkspaceShell'
import { ToolsProvider, useTools } from '@/components/tools/ToolsContext'
import { ClientToolEditor } from '@/components/tools/creation/ClientToolEditor'
import { ConnectServiceForm } from '@/components/tools/creation/ConnectServiceForm'
import { Tool } from '@/components/tools/types'

function EditToolContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toolId = searchParams.get('id')
  const { getTool, saveTool } = useTools()

  const tool = toolId ? getTool(toolId) : undefined

  const handleCancel = () => {
    router.push('/tools')
  }

  const handleSave = (savedTool: Tool) => {
    saveTool(savedTool)
    router.push('/tools')
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
              {tool ? (tool.type === 'client' ? 'Client JavaScript Function' : 'Connected Service') : 'Tool Configuration'}
            </p>
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col gap-5 p-5 md:p-8">
        {tool ? (
          tool.type === 'client' ? (
            <ClientToolEditor initialTool={tool} onCancel={handleCancel} onSave={handleSave} />
          ) : (
            <ConnectServiceForm initialTool={tool} onCancel={handleCancel} onSave={handleSave} />
          )
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl bg-background/50">
            <AlertCircle className="size-8 text-destructive mb-3" />
            <h3 className="text-[16px] font-semibold text-foreground">Tool Not Found</h3>
            <p className="mt-1 text-[13px] text-muted-foreground max-w-sm">
              The tool with ID &quot;{toolId || 'unknown'}&quot; could not be located in this workspace session.
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
    <WorkspaceShell>
      <ToolsProvider>
        <Suspense fallback={<div className="p-8 text-[12px] text-muted-foreground">Loading tool editor...</div>}>
          <EditToolContent />
        </Suspense>
      </ToolsProvider>
    </WorkspaceShell>
  )
}
