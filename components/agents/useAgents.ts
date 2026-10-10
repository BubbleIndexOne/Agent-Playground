/**
 * @fileoverview Agents – useAgents hook
 *
 * Encapsulates loading agent data from localStorage,
 * search/filter logic, and filter state management.
 */

import { useState, useEffect } from 'react'
import { AgentItem, AgentFilter, AGENTS_STORAGE_KEY } from './types'

export function useAgents() {
  const [agents, setAgents] = useState<AgentItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<AgentFilter>('all')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(AGENTS_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) setAgents(parsed)
        }
      } catch (err) {
        console.error('Failed to read workspace agents from localStorage:', err)
      }
    }
  }, [])

  const filteredAgents = agents.filter(agent => {
    if (filter !== 'all' && agent.status !== filter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        agent.name.toLowerCase().includes(q) ||
        agent.description.toLowerCase().includes(q)
      )
    }
    return true
  })

  return {
    agents,
    filteredAgents,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
  }
}
