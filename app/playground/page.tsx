/**
 * @fileoverview Playground Alias Route (/playground)
 *
 * Redirects to the canonical default home route (/home).
 */

'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WorkspaceShell } from '@/components/layout/WorkspaceShell'
import { PlaygroundScreen } from '@/components/playground/PlaygroundScreen'

export default function PlaygroundAliasPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/home')
  }, [router])

  return (
    <WorkspaceShell>
      <PlaygroundScreen />
    </WorkspaceShell>
  )
}
