'use client'

/**
 * @fileoverview History Workspace Route (/history)
 *
 * Dedicated route for auditing past executions, token usage, and latency metrics.
 * Layout and persistent shell are provided by (workspace)/layout.tsx.
 */

import React from 'react'
import { HistoryScreen } from '@/components/history/HistoryScreen'

export default function HistoryPage() {
  return <HistoryScreen />
}
