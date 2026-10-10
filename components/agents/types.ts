/**
 * @fileoverview Agents – Shared Types
 */

export interface AgentItem {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'draft'
  model: string
  toolsCount: number
  lastRun: string
}

export type AgentFilter = 'all' | 'active' | 'paused' | 'draft'

export const AGENTS_STORAGE_KEY = 'workspace_agents'
