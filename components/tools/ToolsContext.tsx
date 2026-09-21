/**
 * @fileoverview Centralized Tools Context & API State Provider
 *
 * Manages the workspace tools state, fetching directly from the backend API.
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Tool, ToolStatus } from './types'
import { apiClient } from '../../api/requests'
import { jsonSchemaToParameters } from './schemaUtils'

export interface ToolsContextValue {
  /** All tools available in the workspace */
  tools: Tool[]
  /** Loading state for initial fetch */
  isLoading: boolean
  /** Error message if fetch fails */
  error: string | null
  /** Refreshes the tool list from the server */
  refreshTools: () => Promise<void>
  /** Saves a new tool or updates an existing one (Mocked until Phase 1) */
  saveTool: (tool: Tool) => void
  /** Deletes a tool by its ID (Mocked until Phase 2) */
  deleteTool: (id: string) => void
  /** Clones an existing tool with a new ID (Mocked until Phase 2) */
  duplicateTool: (tool: Tool) => Tool
  /** Updates the lifecycle status of a tool (Mocked until Phase 1) */
  updateToolStatus: (id: string, status: ToolStatus) => void
  /** Retrieves a tool by ID from local state */
  getTool: (id: string) => Tool | undefined
}

const ToolsContext = createContext<ToolsContextValue | undefined>(undefined)

/**
 * Provider component that wraps tools workspace pages with persistent API state.
 */
export function ToolsProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshTools = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedTools = await apiClient.get<Tool[]>('/tools')
      
      // Map API responses to UI requirements (e.g. expanding parameters)
      const mappedTools = fetchedTools.map(tool => {
        return {
          ...tool,
          parameters: tool.current_version?.schema_json 
            ? jsonSchemaToParameters(tool.current_version.schema_json)
            : []
        }
      })

      setTools(mappedTools)
    } catch (err: any) {
      console.error('Failed to fetch tools:', err)
      setError(err.message || 'Failed to fetch tools')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    refreshTools()
  }, [refreshTools])

  // --- MOCK IMPLEMENTATIONS (To be fully implemented in Phase 1 & 2) ---

  const saveTool = useCallback((toolToSave: Tool) => {
    setTools(prev => {
      const exists = prev.some(t => t.id === toolToSave.id)
      if (exists) {
        return prev.map(t => (t.id === toolToSave.id ? toolToSave : t))
      }
      return [toolToSave, ...prev]
    })
  }, [])

  const deleteTool = useCallback((id: string) => {
    setTools(prev => prev.filter(t => t.id !== id))
  }, [])

  const duplicateTool = useCallback((tool: Tool): Tool => {
    const duplicated: Tool = {
      ...tool,
      id: Math.random().toString(36).substring(2, 9),
      name: `${tool.name} (Copy)`,
      status: 'draft',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    setTools(prev => [duplicated, ...prev])
    return duplicated
  }, [])

  const updateToolStatus = useCallback((id: string, status: ToolStatus) => {
    setTools(prev => prev.map(t => (t.id === id ? { ...t, status } : t)))
  }, [])

  const getTool = useCallback((id: string) => {
    return tools.find(t => t.id === id)
  }, [tools])

  const value: ToolsContextValue = {
    tools,
    isLoading,
    error,
    refreshTools,
    saveTool,
    deleteTool,
    duplicateTool,
    updateToolStatus,
    getTool,
  }

  return <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>
}

/**
 * Custom hook to access the Tools context.
 *
 * @throws {Error} If called outside of a ToolsProvider.
 */
export function useTools(): ToolsContextValue {
  const context = useContext(ToolsContext)
  if (!context) {
    throw new Error('useTools must be used within a ToolsProvider')
  }
  return context
}
