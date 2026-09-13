/**
 * @fileoverview Centralized Tools Context & Persistent State Provider
 *
 * Manages the workspace tools state across route transitions (/tools, /tools/new, /tools/edit),
 * synchronizing state with browser `localStorage` and falling back to INITIAL_TOOLS.
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Tool } from './types'
import { INITIAL_TOOLS } from './constants'

const TOOLS_STORAGE_KEY = 'workspace_tools'

export interface ToolsContextValue {
  /** All tools available in the workspace */
  tools: Tool[]
  /** Saves a new tool or updates an existing one */
  saveTool: (tool: Tool) => void
  /** Deletes a tool by its ID */
  deleteTool: (id: string) => void
  /** Clones an existing tool with a new ID */
  duplicateTool: (tool: Tool) => Tool
  /** Toggles published status on a tool */
  togglePublishTool: (id: string, published: boolean) => void
  /** Retrieves a tool by ID */
  getTool: (id: string) => Tool | undefined
}

const ToolsContext = createContext<ToolsContextValue | undefined>(undefined)

/**
 * Provider component that wraps tools workspace pages with persistent state.
 */
export function ToolsProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(TOOLS_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTools(parsed)
          }
        }
      } catch (err) {
        console.error('Failed to load workspace tools from localStorage:', err)
      } finally {
        setIsInitialized(true)
      }
    }
  }, [])

  // Persist to localStorage whenever tools update after initial hydration
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        localStorage.setItem(TOOLS_STORAGE_KEY, JSON.stringify(tools))
      } catch (err) {
        console.error('Failed to persist workspace tools to localStorage:', err)
      }
    }
  }, [tools, isInitialized])

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
      published: false,
      updatedAt: 'Just now',
    }
    setTools(prev => [duplicated, ...prev])
    return duplicated
  }, [])

  const togglePublishTool = useCallback((id: string, published: boolean) => {
    setTools(prev => prev.map(t => (t.id === id ? { ...t, published } : t)))
  }, [])

  const getTool = useCallback((id: string) => {
    return tools.find(t => t.id === id)
  }, [tools])

  const value: ToolsContextValue = {
    tools,
    saveTool,
    deleteTool,
    duplicateTool,
    togglePublishTool,
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
