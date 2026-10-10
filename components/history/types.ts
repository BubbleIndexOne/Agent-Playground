/**
 * @fileoverview History – Shared Types & Constants
 */

export interface HistoryEntry {
  id: string
  prompt: string
  response: string
  model: string
  tokens: number
  latencyMs: number
  timestamp: string
}

export const HISTORY_STORAGE_KEY = 'workspace_history'
