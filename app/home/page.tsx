/**
 * @fileoverview Default Playground Route (/home)
 *
 * Primary landing route for the Agent Playground workspace.
 */

'use client'

import React from 'react'
import { WorkspaceShell } from '@/components/layout/WorkspaceShell'
import { PlaygroundScreen } from '@/components/playground/PlaygroundScreen'

export default function HomePage() {
  return (
    <WorkspaceShell>
      <PlaygroundScreen />
    </WorkspaceShell>
  )
}
