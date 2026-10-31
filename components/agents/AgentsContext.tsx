'use client'

/**
 * @fileoverview Agents Context – Persistent layout-level cache for Agent Personas
 *
 * Keeps agent personas in memory across navigation between tabs, preventing empty-array flashes.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { AgentItem, AGENTS_STORAGE_KEY } from './types'

export interface AgentsContextValue {
  agents: AgentItem[]
  isLoading: boolean
  saveAgent: (agent: AgentItem) => void
  deleteAgent: (id: string) => void
  refreshAgents: () => void
}

const AgentsContext = createContext<AgentsContextValue | undefined>(undefined)

export function AgentsProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<AgentItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(AGENTS_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) return parsed
        }
      } catch (err) {
        console.error('Failed to read workspace agents from localStorage:', err)
      }
    }
    return []
  })
  const [isLoading, setIsLoading] = useState(false)

  const loadFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(AGENTS_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setAgents(parsed)
          }
        }
      } catch (err) {
        console.error('Failed to read workspace agents from localStorage:', err)
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const saveAgent = useCallback((agent: AgentItem) => {
    setAgents((prev) => {
      const idx = prev.findIndex((a) => a.id === agent.id)
      let updated: AgentItem[]
      if (idx >= 0) {
        updated = [...prev]
        updated[idx] = agent
      } else {
        updated = [agent, ...prev]
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(updated))
        } catch (err) {
          console.error('Failed to save agent to localStorage:', err)
        }
      }
      return updated
    })
  }, [])

  const deleteAgent = useCallback((id: string) => {
    setAgents((prev) => {
      const updated = prev.filter((a) => a.id !== id)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(updated))
        } catch (err) {
          console.error('Failed to delete agent from localStorage:', err)
        }
      }
      return updated
    })
  }, [])

  return (
    <AgentsContext.Provider
      value={{
        agents,
        isLoading,
        saveAgent,
        deleteAgent,
        refreshAgents: loadFromStorage,
      }}
    >
      {children}
    </AgentsContext.Provider>
  )
}

export function useAgentsContext(): AgentsContextValue {
  const context = useContext(AgentsContext)
  if (!context) {
    throw new Error('useAgentsContext must be used within an AgentsProvider')
  }
  return context
}
