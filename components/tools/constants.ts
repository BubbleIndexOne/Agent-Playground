/**
 * @fileoverview Default Tools & Filter Options
 *
 * Defines the initial workspace tools (including a real-world client weather tool
 * using Open-Meteo APIs, and a sample PostgreSQL connected service) along with filter
 * configuration options for the tools screen.
 */

import { Tool, ToolFilter } from './types'

/**
 * Filter options available in the Tools screen header for categorizing tools.
 */
export const FILTER_OPTIONS: { id: ToolFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'client', label: 'Client Tools' },
  { id: 'mcp', label: 'Connected' },
  { id: 'verified', label: 'Verified' },
  { id: 'draft', label: 'Drafts' },
]


