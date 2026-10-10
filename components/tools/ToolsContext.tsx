/**
 * @fileoverview Centralized Tools Context & API State Provider
 *
 * Manages the workspace tools state, fetching directly from backend API endpoints
 * (/tools, /tools/:id, /tools/:id/versions).
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Tool, ToolStatus } from './types'
import { ToolResponse } from '../../api/types'
import * as toolsApi from '../../api/tools'
import {
  jsonSchemaToParameters,
  parametersToJsonSchema,
  capabilitiesToArray,
  arrayToCapabilities,
} from './schemaUtils'

export interface ToolsContextValue {
  /** All tools available in the workspace */
  tools: Tool[]
  /** Loading state for initial fetch or mutations */
  isLoading: boolean
  /** Error message if an operation fails */
  error: string | null
  /** Refreshes the tool list from the server */
  refreshTools: () => Promise<void>
  /** Saves a new tool or updates an existing one with atomic versioning */
  saveTool: (tool: Tool) => Promise<Tool>
  /** Deletes or archives a tool by its ID */
  deleteTool: (id: string, purge?: boolean) => Promise<void>
  /** Clones an existing tool into a new tool shell with copied version */
  duplicateTool: (tool: Tool) => Promise<Tool>
  /** Updates the lifecycle status of a tool */
  updateToolStatus: (id: string, status: ToolStatus) => Promise<void>
  /** Retrieves a tool by ID from local state */
  getTool: (id: string) => Tool | undefined
  /** Retrieves or fetches a tool by ID from API with hydrated current version */
  fetchToolById: (id: string) => Promise<Tool>
}

const ToolsContext = createContext<ToolsContextValue | undefined>(undefined)

/**
 * Maps a backend ToolResponse payload to the UI Tool model.
 */
export function mapToolResponseToTool(tool: ToolResponse): Tool {
  return {
    ...tool,
    code: tool.current_version?.code ?? undefined,
    parameters: tool.current_version?.schema_json
      ? jsonSchemaToParameters(tool.current_version.schema_json)
      : [],
    capabilities: arrayToCapabilities(tool.current_version?.capabilities_json),
    published: tool.status === 'verified' || tool.status === 'registered',
  }
}

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
      const fetchedTools = await toolsApi.getTools({ include_public: true })
      const mappedTools = fetchedTools.map(mapToolResponseToTool)
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

  const saveTool = useCallback(
    async (toolToSave: Tool): Promise<Tool> => {
      setIsLoading(true)
      setError(null)
      try {
        const isExisting =
          tools.some((t) => t.id === toolToSave.id) &&
          !toolToSave.id.startsWith('mock_') &&
          toolToSave.id.length > 20

        if (isExisting) {
          // 1. Update Tool metadata
          await toolsApi.updateTool(toolToSave.id, {
            name: toolToSave.name,
            description: toolToSave.description,
            is_public: toolToSave.is_public,
            allow_client_execution: toolToSave.allow_client_execution,
            status: toolToSave.status,
          })

          // 2. Create new atomic version if code/parameters/capabilities provided
          if (toolToSave.type === 'client') {
            await toolsApi.createToolVersion(toolToSave.id, {
              code: toolToSave.code || null,
              schema_json: parametersToJsonSchema(toolToSave.parameters || []),
              capabilities_json: capabilitiesToArray(
                toolToSave.capabilities || { network: true, storage: false, environment: false }
              ),
            })
          }

          // 3. Fetch latest hydrated tool
          const updated = await toolsApi.getToolById(toolToSave.id)
          const mapped = mapToolResponseToTool(updated)
          setTools((prev) => prev.map((t) => (t.id === mapped.id ? mapped : t)))
          return mapped
        } else {
          // 1. Create Tool shell
          const createdShell = await toolsApi.createTool({
            name: toolToSave.name,
            description: toolToSave.description,
            type: toolToSave.type,
            connector_type: toolToSave.connector_type || null,
            is_public: toolToSave.is_public,
            allow_client_execution: toolToSave.allow_client_execution,
          })

          // 2. Create Initial Version v1
          const schema = parametersToJsonSchema(toolToSave.parameters || [])
          const caps = capabilitiesToArray(
            toolToSave.capabilities || { network: true, storage: false, environment: false }
          )

          await toolsApi.createToolVersion(createdShell.id, {
            code: toolToSave.type === 'client' ? toolToSave.code || null : null,
            schema_json: schema,
            capabilities_json: caps,
          })

          // 3. Fetch fully hydrated tool
          const hydrated = await toolsApi.getToolById(createdShell.id)
          const mapped = mapToolResponseToTool(hydrated)
          setTools((prev) => [mapped, ...prev])
          return mapped
        }
      } catch (err: any) {
        console.error('Failed to save tool:', err)
        setError(err.message || 'Failed to save tool')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [tools]
  )

  const deleteTool = useCallback(async (id: string, purge: boolean = false) => {
    setIsLoading(true)
    setError(null)
    try {
      await toolsApi.deleteTool(id, purge)
      setTools((prev) => prev.filter((t) => t.id !== id))
    } catch (err: any) {
      console.error('Failed to delete tool:', err)
      setError(err.message || 'Failed to delete tool')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const duplicateTool = useCallback(async (tool: Tool): Promise<Tool> => {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Create duplicate shell
      const newShell = await toolsApi.createTool({
        name: `${tool.name} (Copy)`,
        description: tool.description,
        type: tool.type,
        connector_type: tool.connector_type || null,
        is_public: false,
        allow_client_execution: tool.allow_client_execution,
      })

      // 2. Duplicate version
      const schema =
        tool.current_version?.schema_json || parametersToJsonSchema(tool.parameters || [])
      const caps =
        tool.current_version?.capabilities_json ||
        capabilitiesToArray(
          tool.capabilities || { network: true, storage: false, environment: false }
        )

      await toolsApi.createToolVersion(newShell.id, {
        code: tool.code || tool.current_version?.code || null,
        schema_json: schema,
        capabilities_json: caps,
      })

      const hydrated = await toolsApi.getToolById(newShell.id)
      const mapped = mapToolResponseToTool(hydrated)
      setTools((prev) => [mapped, ...prev])
      return mapped
    } catch (err: any) {
      console.error('Failed to duplicate tool:', err)
      setError(err.message || 'Failed to duplicate tool')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateToolStatus = useCallback(async (id: string, status: ToolStatus) => {
    try {
      await toolsApi.updateTool(id, { status })
      setTools((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    } catch (err: any) {
      console.error('Failed to update tool status:', err)
      setError(err.message || 'Failed to update tool status')
      throw err
    }
  }, [])

  const getTool = useCallback(
    (id: string) => {
      return tools.find((t) => t.id === id)
    },
    [tools]
  )

  const fetchToolById = useCallback(
    async (id: string): Promise<Tool> => {
      const existing = tools.find((t) => t.id === id)
      if (existing && existing.current_version) {
        return existing
      }
      const res = await toolsApi.getToolById(id)
      const mapped = mapToolResponseToTool(res)
      setTools((prev) => {
        const idx = prev.findIndex((t) => t.id === id)
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = mapped
          return copy
        }
        return [mapped, ...prev]
      })
      return mapped
    },
    [tools]
  )

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
    fetchToolById,
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
