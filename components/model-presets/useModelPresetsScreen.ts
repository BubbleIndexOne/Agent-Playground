/**
 * @fileoverview Model Presets - useModelPresetsScreen hook
 */

import { useState, useMemo, useEffect } from 'react'
import { useModelPresets } from './ModelPresetsContext'
import { ModelPresetItem } from './types'

export function useModelPresetsScreen() {
  const { presets, isLoading, error, refreshPresets, deletePreset } = useModelPresets()
  const [searchQuery, setSearchQuery] = useState('')
  const [editorState, setEditorState] = useState<{ isOpen: boolean; preset?: ModelPresetItem }>({ isOpen: false })

  // Background revalidation on mount (SWR pattern)
  useEffect(() => {
    refreshPresets(true)
  }, [refreshPresets])

  const filteredPresets = useMemo(() => {
    return presets.filter(preset => {
      if (preset.is_archived) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return preset.name.toLowerCase().includes(q) || preset.provider.toLowerCase().includes(q)
      }
      return true
    })
  }, [presets, searchQuery])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      await deletePreset(id)
    }
  }

  const openNewEditor = () => setEditorState({ isOpen: true })
  const openEditEditor = (preset: ModelPresetItem) => setEditorState({ isOpen: true, preset })
  const closeEditor = () => setEditorState({ isOpen: false })

  return {
    presets,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filteredPresets,
    handleDelete,
    editorState,
    openNewEditor,
    openEditEditor,
    closeEditor,
  }
}
