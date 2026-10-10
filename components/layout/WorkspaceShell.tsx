/**
 * @fileoverview Workspace Shell & Unified Layout
 *
 * Provides the persistent outer shell with a responsive sidebar and route-based navigation.
 */

'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { tokenStorage } from '@/api/requests'
import { Sidebar } from './Sidebar'
import { LoomIcon } from '@/components/ui/LoomIcon'

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !tokenStorage.hasAuthToken()) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // While validating session on initial page load, prevent flash of workspace contents
  if (isLoading || (!isAuthenticated && !tokenStorage.hasAuthToken())) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#070709]">
        <LoomIcon className="size-8 text-indigo-400 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
