/**
 * @fileoverview Home Route (/home)
 *
 * Primary landing route — renders the LibreChat-style chat workspace.
 * The ChatScreen manages its own auth guard and full-page layout
 * (sidebar + chat area), so no WorkspaceShell wrapper is needed here.
 */

'use client'

import React from 'react'
import { ChatScreen } from '@/components/chat/ChatScreen'

export default function HomePage() {
  return <ChatScreen />
}
