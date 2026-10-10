/**
 * @fileoverview Model Presets - useModelPresetEditor hook
 */

import { useState, useEffect } from 'react'
import { ModelPresetItem, ModelPresetParams } from './types'
import { useModelPresets } from './ModelPresetsContext'
import { MODELS_BY_PROVIDER } from './constants'

export function useModelPresetEditor(preset?: ModelPresetItem, onClose?: () => void) {
  const { createPreset, updatePreset, defaults } = useModelPresets()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(preset?.name || '')
  const [provider, setProvider] = useState(preset?.provider || 'anthropic')
  const [modelId, setModelId] = useState(preset?.model_id || 'claude-3-5-sonnet-20240620')
  
  const [params, setParams] = useState<ModelPresetParams>({
    temperature: preset?.params?.temperature ?? defaults?.temperature ?? 0.7,
    topP: preset?.params?.topP ?? defaults?.topP ?? 1.0,
    topK: preset?.params?.topK ?? defaults?.topK,
    maxOutputTokens: preset?.params?.maxOutputTokens ?? defaults?.maxOutputTokens,
  })

  useEffect(() => {
    if (!preset) {
      const availableModels = MODELS_BY_PROVIDER[provider] || []
      if (availableModels.length > 0) {
        setModelId(availableModels[0].id)
      } else {
        setModelId('')
      }
    }
  }, [provider, preset])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please provide a name for the preset')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (preset) {
        await updatePreset(preset.id, {
          name,
          provider,
          model_id: modelId,
          params
        })
      } else {
        await createPreset({
          name,
          provider,
          model_id: modelId,
          params
        })
      }
      onClose?.()
    } catch (err: any) {
      setError(err.message || 'Failed to save preset')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateParam = (key: keyof ModelPresetParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  return {
    isSubmitting,
    showAdvanced,
    setShowAdvanced,
    error,
    name,
    setName,
    provider,
    setProvider,
    modelId,
    setModelId,
    params,
    handleSave,
    updateParam,
  }
}
