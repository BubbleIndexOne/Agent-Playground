/**
 * @fileoverview Agents Workspace Route (/agents)
 *
 * Dedicated route for building and orchestrating automated agent workflows.
 */

'use client'

import React from 'react'
import { WorkspaceShell } from '@/components/layout/WorkspaceShell'
import { AgentsScreen } from '@/components/agents/AgentsScreen'

export default function AgentsPage() {
  return (
    <WorkspaceShell>
      <AgentsScreen />
    </WorkspaceShell>
  )
}
