/**
 * @fileoverview Create Tool Sub-Route (/tools/new)
 *
 * Dedicated sub-route for creating a new client tool or connected service.
 * Pressing browser Back returns directly to the /tools workspace.
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PanelLeft } from 'lucide-react'
import { WorkspaceShell } from '@/components/layout/WorkspaceShell'
import { ToolsProvider, useTools } from '@/components/tools/ToolsContext'
import { ChooseToolType } from '@/components/tools/creation/ChooseToolType'
import { ClientToolEditor } from '@/components/tools/creation/ClientToolEditor'
import { ConnectServiceForm } from '@/components/tools/creation/ConnectServiceForm'
import { Tool } from '@/components/tools/types'

function CreateToolContent() {
  const router = useRouter()
  const { saveTool } = useTools()
  const [creationStep, setCreationStep] = useState<'choose' | 'client' | 'service'>('choose')

  const handleCancel = () => {
    if (creationStep !== 'choose') {
      setCreationStep('choose')
    } else {
      router.push('/tools')
    }
  }

  const handleSave = (tool: Tool) => {
    saveTool(tool)
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
            <h1 className="text-[14px] font-semibold tracking-[-0.01em]">New Tool</h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              {creationStep === 'choose'
                ? 'Select tool execution model'
                : creationStep === 'client'
                ? 'Author browser JavaScript tool'
                : 'Connect external database or API'}
            </p>
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col gap-5 p-5 md:p-8">
        {creationStep === 'choose' && (
          <ChooseToolType onSelect={type => setCreationStep(type)} />
        )}

        {creationStep === 'client' && (
          <ClientToolEditor
            onCancel={handleCancel}
            onSave={handleSave}
          />
        )}

        {creationStep === 'service' && (
          <ConnectServiceForm
            onCancel={handleCancel}
            onSave={handleSave}
          />
        )}
      </section>
    </div>
  )
}

export default function NewToolPage() {
  return (
    <WorkspaceShell>
      <ToolsProvider>
        <CreateToolContent />
      </ToolsProvider>
    </WorkspaceShell>
  )
}
