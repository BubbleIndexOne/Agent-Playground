/**
 * @fileoverview History Workspace Route (/history)
 *
 * Dedicated route for auditing past executions, token usage, and latency metrics.
 */

'use client'

import React from 'react'
import { WorkspaceShell } from '@/components/layout/WorkspaceShell'
import { HistoryScreen } from '@/components/history/HistoryScreen'

export default function HistoryPage() {
  return (
    <WorkspaceShell>
      <HistoryScreen />
    </WorkspaceShell>
  )
}
