/**
 * @fileoverview useToolsScreen hook
 */

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Tool, ToolFilter, ToolStatus } from './types'
import { useTools } from './ToolsContext'

export function useToolsScreen() {
  const router = useRouter()
  const { tools, isLoading, error, deleteTool, duplicateTool, updateToolStatus } = useTools()

  const [activeTab, setActiveTab] = useState<'my-tools' | 'marketplace'>('my-tools')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ToolFilter>('all')

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = tool.name.toLowerCase().includes(q)
        const matchesDesc = (tool.description || '').toLowerCase().includes(q)
        const matchesParam = tool.parameters?.some(
          p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        )
        if (!matchesName && !matchesDesc && !matchesParam) return false
      }

      if (activeFilter === 'client') return tool.type === 'client'
      if (activeFilter === 'mcp') return tool.type === 'mcp'
      if (activeFilter === 'verified') return tool.status === 'verified' || tool.status === 'registered'
      if (activeFilter === 'draft') return tool.status === 'draft' || tool.status === 'testing'

      return true
    })
  }, [tools, searchQuery, activeFilter])

  const handleNewTool = () => {
    router.push('/tools/new')
  }

  const handleEditTool = (tool: Tool) => {
    router.push(`/tools/edit?id=${encodeURIComponent(tool.id)}`)
  }

  const handleDuplicateTool = (tool: Tool) => {
    duplicateTool(tool)
  }

  const handleDeleteTool = (id: string) => {
    deleteTool(id)
  }

  const handleStatusChange = (id: string, status: ToolStatus) => {
    updateToolStatus(id, status)
  }

  return {
    tools,
    isLoading,
    error,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    activeFilter, setActiveFilter,
    filteredTools,
    handleNewTool,
    handleEditTool,
    handleDuplicateTool,
    handleDeleteTool,
    handleStatusChange,
  }
}
