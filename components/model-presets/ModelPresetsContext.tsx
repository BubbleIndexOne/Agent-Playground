'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { ModelPresetItem, CreateModelPresetInput, UpdateModelPresetInput } from './types'
import { apiClient } from '../../api/requests'

export interface ModelPresetsContextValue {
  presets: ModelPresetItem[]
  isLoading: boolean
  error: string | null
  defaults: any | null
  refreshPresets: () => Promise<void>
  fetchDefaults: () => Promise<void>
  createPreset: (input: CreateModelPresetInput) => Promise<ModelPresetItem>
  updatePreset: (id: string, input: UpdateModelPresetInput) => Promise<ModelPresetItem>
  deletePreset: (id: string, purge?: boolean) => Promise<void>
  getPreset: (id: string) => ModelPresetItem | undefined
}

const ModelPresetsContext = createContext<ModelPresetsContextValue | undefined>(undefined)

export function ModelPresetsProvider({ children }: { children: ReactNode }) {
  const [presets, setPresets] = useState<ModelPresetItem[]>([])
  const [defaults, setDefaults] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshPresets = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<{ success: boolean; presets: ModelPresetItem[] }>('/model-presets')
      setPresets(response.presets || [])
    } catch (err: any) {
      console.error('Failed to fetch model presets:', err)
      setError(err.message || 'Failed to fetch model presets')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchDefaults = useCallback(async () => {
    try {
      const response = await apiClient.get<{ success: boolean; defaults: any }>('/model-presets/defaults')
      setDefaults(response.defaults || null)
    } catch (err: any) {
      console.error('Failed to fetch model preset defaults:', err)
    }
  }, [])

  useEffect(() => {
    refreshPresets()
    fetchDefaults()
  }, [refreshPresets, fetchDefaults])

  const createPreset = useCallback(async (input: CreateModelPresetInput) => {
    try {
      const response = await apiClient.post<{ success: boolean; preset: ModelPresetItem }>('/model-presets', input)
      setPresets(prev => [response.preset, ...prev])
      return response.preset
    } catch (err: any) {
      console.error('Failed to create preset:', err)
      throw err
    }
  }, [])

  const updatePreset = useCallback(async (id: string, input: UpdateModelPresetInput) => {
    try {
      const response = await apiClient.patch<{ success: boolean; preset: ModelPresetItem }>(`/model-presets/${id}`, input)
      setPresets(prev => prev.map(p => (p.id === id ? response.preset : p)))
      return response.preset
    } catch (err: any) {
      console.error('Failed to update preset:', err)
      throw err
    }
  }, [])

  const deletePreset = useCallback(async (id: string, purge = false) => {
    try {
      await apiClient.delete(`/model-presets/${id}${purge ? '?purge=true' : ''}`)
      if (purge) {
        setPresets(prev => prev.filter(p => p.id !== id))
      } else {
        setPresets(prev => prev.map(p => (p.id === id ? { ...p, is_archived: true } : p)))
      }
    } catch (err: any) {
      console.error('Failed to delete preset:', err)
      throw err
    }
  }, [])

  const getPreset = useCallback((id: string) => {
    return presets.find(p => p.id === id)
  }, [presets])

  const value: ModelPresetsContextValue = {
    presets,
    isLoading,
    error,
    defaults,
    refreshPresets,
    fetchDefaults,
    createPreset,
    updatePreset,
    deletePreset,
    getPreset,
  }

  return <ModelPresetsContext.Provider value={value}>{children}</ModelPresetsContext.Provider>
}

export function useModelPresets(): ModelPresetsContextValue {
  const context = useContext(ModelPresetsContext)
  if (!context) {
    throw new Error('useModelPresets must be used within a ModelPresetsProvider')
  }
  return context
}
