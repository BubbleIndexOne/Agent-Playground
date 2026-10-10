/**
 * @fileoverview Playground – useModelConfigDrawer hook
 *
 * Encapsulates all state and handlers for the ModelConfigurationDrawer:
 * - Draft copies of provider/model/key/configs
 * - save / clear actions
 * - visibility toggles for API key & advanced panel
 */

import { useState } from 'react'
import { saveKey, clearKey, ModelConfig, saveModelConfigs } from '@/src/lib/api'
import { ModelPresetItem } from '../model-presets/types'

export interface UseModelConfigDrawerOptions {
  providerId: string
  modelId: string
  apiKey: string
  configs: ModelConfig
  setProviderId: (v: string) => void
  setModelId: (v: string) => void
  setApiKey: (v: string) => void
  setConfigs: (v: ModelConfig) => void
  onClose: () => void
}

export function useModelConfigDrawer({
  providerId,
  modelId,
  apiKey,
  configs,
  setProviderId,
  setModelId,
  setApiKey,
  setConfigs,
  onClose,
}: UseModelConfigDrawerOptions) {
  const [draftProvider, setDraftProvider] = useState(providerId)
  const [draftModel, setDraftModel] = useState(modelId)
  const [draftKey, setDraftKey] = useState(apiKey)
  const [draftConfigs, setDraftConfigs] = useState<ModelConfig>(configs)
  const [visible, setVisible] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const save = () => {
    setProviderId(draftProvider)
    setModelId(draftModel)
    setApiKey(draftKey.trim())
    saveKey(draftKey.trim())
    setConfigs(draftConfigs)
    saveModelConfigs(draftConfigs)
    onClose()
  }

  const clear = () => {
    setDraftKey('')
    setApiKey('')
    clearKey()
  }

  const updateConfig = (key: keyof ModelConfig, value: any) => {
    setDraftConfigs(prev => ({ ...prev, [key]: value }))
  }

  const applyPreset = (preset: ModelPresetItem, providers: any[]) => {
    setDraftProvider(preset.provider)
    setDraftModel(preset.model_id || '')
    setDraftConfigs(prev => ({
      ...prev,
      temperature: preset.params?.temperature,
      topP: preset.params?.topP,
      topK: preset.params?.topK,
      maxOutputTokens: preset.params?.maxOutputTokens,
      presencePenalty: preset.params?.presencePenalty,
      frequencyPenalty: preset.params?.frequencyPenalty,
      seed: preset.params?.seed,
      stopSequences: preset.params?.stopSequences,
    }))
  }

  const handleProviderChange = (newProviderId: string, providers: any[]) => {
    setDraftProvider(newProviderId)
    const p = providers.find(p => p.id === newProviderId)
    if (p) setDraftModel(p.models[0].id)
  }

  return {
    draftProvider,
    setDraftProvider,
    draftModel,
    setDraftModel,
    draftKey,
    setDraftKey,
    draftConfigs,
    visible,
    setVisible,
    showAdvanced,
    setShowAdvanced,
    save,
    clear,
    updateConfig,
    applyPreset,
    handleProviderChange,
  }
}
