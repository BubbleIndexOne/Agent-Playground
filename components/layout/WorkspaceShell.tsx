'use client'

/**
 * @fileoverview Workspace Shell & Unified Layout Shell
 *
 * Provides the persistent outer shell with the unified LibreChat-style AppSidebar.
 */

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { tokenStorage } from '@/api/requests'
import { AppSidebar } from './AppSidebar'
import { ChatProvider } from '@/components/chat/ChatContext'
import { LoomIcon } from '@/components/ui/LoomIcon'

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !tokenStorage.hasAuthToken()) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || (!isAuthenticated && !tokenStorage.hasAuthToken())) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#070709]">
        <LoomIcon className="size-8 text-indigo-400 animate-pulse" />
      </div>
    )
  }

  return (
    <ChatProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0c] text-foreground">
        <AppSidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">{children}</main>
      </div>
    </ChatProvider>
  )
}
