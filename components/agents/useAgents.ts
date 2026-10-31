/**
 * @fileoverview Agents – useAgents hook
 *
 * Encapsulates search/filter logic and filter state management,
 * consuming persistent agents from AgentsContext.
 */

import { useState } from 'react'
import { AgentFilter } from './types'
import { useAgentsContext } from './AgentsContext'

export function useAgents() {
  const { agents, isLoading, saveAgent, deleteAgent, refreshAgents } = useAgentsContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<AgentFilter>('all')

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
    isLoading,
    saveAgent,
    deleteAgent,
    refreshAgents,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
  }
}
