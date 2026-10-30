'use client'

/**
 * @fileoverview Agent Studio Workspace Route (/agents)
 *
 * Dedicated route for composing and crafting playful AI agent personas.
 * Layout and persistent shell are provided by (workspace)/layout.tsx.
 */

import React from 'react'
import { AgentsScreen } from '@/components/agents/AgentsScreen'

export default function AgentsPage() {
  return <AgentsScreen />
}
