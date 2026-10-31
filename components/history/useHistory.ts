/**
 * @fileoverview History – useHistory hook
 *
 * Encapsulates loading history from localStorage, search filtering,
 * and clear-history action.
 */

import { useState, useCallback } from 'react'
import { HistoryEntry, HISTORY_STORAGE_KEY } from './types'

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) return parsed
        }
      } catch (err) {
        console.error('Failed to read workspace execution history from localStorage:', err)
      }
    }
    return []
  })
  const [searchQuery, setSearchQuery] = useState('')

  const handleClearHistory = useCallback(() => {
    setHistory([])
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY)
      } catch (err) {
        console.error('Failed to clear workspace execution history:', err)
      }
    }
  }, [])

  const filteredHistory = history.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return item.prompt.toLowerCase().includes(q) || item.model.toLowerCase().includes(q)
    }
    return true
  })

  return {
    history,
    filteredHistory,
    searchQuery,
    setSearchQuery,
    handleClearHistory,
  }
}
