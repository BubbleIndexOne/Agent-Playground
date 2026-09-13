/**
 * @fileoverview Tools Workspace Route (/tools)
 *
 * Renders the main tools list, categories, search, and marketplace view.
 */

'use client'

import React from 'react'
import { WorkspaceShell } from '@/components/layout/WorkspaceShell'
import { ToolsProvider } from '@/components/tools/ToolsContext'
import { ToolsScreen } from '@/components/tools/ToolsScreen'

export default function ToolsPage() {
  return (
    <WorkspaceShell>
      <ToolsProvider>
        <ToolsScreen />
      </ToolsProvider>
    </WorkspaceShell>
  )
}
