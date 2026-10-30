import React from 'react'
import { WorkspaceShell } from '@/components/layout/WorkspaceShell'
import { ToolsProvider } from '@/components/tools/ToolsContext'
import { ModelPresetsProvider } from '@/components/model-presets/ModelPresetsContext'

/**
 * @fileoverview Shared Workspace Layout
 *
 * This layout wraps all workspace routes (/home, /tools, /agents, /models, /history).
 * Next.js App Router maintains this layout mounted during client-side navigation,
 * ensuring:
 * 1. The AppSidebar and Icon Rail never unmount or re-render unnecessarily.
 * 2. Session validation runs once, eliminating all full-screen loading flickers.
 * 3. Navigation between sections is instantaneous with seamless state preservation.
 */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToolsProvider>
      <ModelPresetsProvider>
        <WorkspaceShell>{children}</WorkspaceShell>
      </ModelPresetsProvider>
    </ToolsProvider>
  )
}
