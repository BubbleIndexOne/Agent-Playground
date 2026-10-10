/**
 * @fileoverview Playground – usePlayground hook
 *
 * Encapsulates all business logic for the Playground screen:
 * - Prompt state & variable detection
 * - Model config (provider, model, API key, advanced params)
 * - Execution (run, history recording)
 * - Model preset application
 */

import { useState, useEffect, useMemo } from 'react'
import {
  getProviders,
  getKey,
  saveKey,
  clearKey,
  callModel,
  ModelConfig,
  getModelConfigs,
  saveModelConfigs,
} from '@/src/lib/api'
import { useModelPresets } from '../model-presets/ModelPresetsContext'
import { ModelPresetItem } from '../model-presets/types'

export function usePlayground() {
  const [prompt, setPrompt] = useState(
    'Summarize the following text in {{style}} style:\n\n{{content}}'
  )
  const [values, setValues] = useState<Record<string, string>>({ style: '', content: '' })

  const providers = getProviders()
  const [providerId, setProviderId] = useState(providers[0].id)
  const [modelId, setModelId] = useState(providers[0].models[0].id)
  const [apiKey, setApiKey] = useState('')
  const [configs, setConfigs] = useState<ModelConfig>({})

  const { presets } = useModelPresets()

  const [configOpen, setConfigOpen] = useState(false)
  const [ran, setRan] = useState(false)
  const [loading, setLoading] = useState(false)
  const [responseOutput, setResponseOutput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showRaw, setShowRaw] = useState(false)
  const [latency, setLatency] = useState<number | null>(null)
  const [tokens, setTokens] = useState<number | null>(null)

  useEffect(() => {
    const key = getKey()
    if (key) setApiKey(key)

    const savedConfigs = getModelConfigs()
    if (savedConfigs) setConfigs(savedConfigs)
  }, [])

  const variables = useMemo(
    () =>
      Array.from(prompt.matchAll(/\{\{\s*([\w-]+)\s*\}\}/g), match => match[1]).filter(
        (name, index, all) => all.indexOf(name) === index
      ),
    [prompt]
  )

  const ready = variables.length === 0 || variables.every(name => values[name]?.trim())

  const handleApplyPreset = (preset: ModelPresetItem) => {
    const newConfigs = { ...configs }
    if (preset.params?.temperature !== undefined) newConfigs.temperature = preset.params.temperature
    if (preset.params?.topP !== undefined) newConfigs.topP = preset.params.topP
    if (preset.params?.topK !== undefined) newConfigs.topK = preset.params.topK
    if (preset.params?.maxOutputTokens !== undefined)
      newConfigs.maxOutputTokens = preset.params.maxOutputTokens
    if (preset.params?.presencePenalty !== undefined)
      newConfigs.presencePenalty = preset.params.presencePenalty
    if (preset.params?.frequencyPenalty !== undefined)
      newConfigs.frequencyPenalty = preset.params.frequencyPenalty
    if (preset.params?.seed !== undefined) newConfigs.seed = preset.params.seed
    if (preset.params?.stopSequences !== undefined)
      newConfigs.stopSequences = preset.params.stopSequences
    setConfigs(newConfigs)
    saveModelConfigs(newConfigs)
  }

  const run = async () => {
    if (!ready) return
    setRan(true)
    setLoading(true)
    setErrorMsg('')
    setResponseOutput('')
    setLatency(null)
    setTokens(null)

    let finalPrompt = prompt
    for (const name of variables) {
      finalPrompt = finalPrompt.replace(
        new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`, 'g'),
        values[name] || ''
      )
    }

    const start = Date.now()
    try {
      const res = await callModel(
        apiKey,
        providerId,
        modelId,
        [{ role: 'user', content: finalPrompt }],
        configs
      )
      const outputText = res.text || JSON.stringify(res, null, 2)
      setResponseOutput(outputText)
      const totalTokens = res.usage ? res.usage.total : 0
      if (res.usage) setTokens(totalTokens)

      if (typeof window !== 'undefined') {
        try {
          const currentHistory = JSON.parse(
            localStorage.getItem('workspace_history') || '[]'
          )
          const activeModelName =
            providers.find(p => p.id === providerId)?.models.find(m => m.id === modelId)
              ?.name || modelId
          const newEntry = {
            id: 'run-' + Date.now(),
            prompt: finalPrompt,
            response: outputText,
            model: activeModelName,
            tokens: totalTokens,
            latencyMs: Date.now() - start,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }
          localStorage.setItem(
            'workspace_history',
            JSON.stringify([newEntry, ...currentHistory].slice(0, 50))
          )
        } catch (err) {
          console.error('Failed to append to workspace execution history:', err)
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unknown error occurred')
    } finally {
      setLatency(Date.now() - start)
      setLoading(false)
    }
  }

  const currentProvider = providers.find(p => p.id === providerId)
  const currentModelName =
    currentProvider?.models.find(m => m.id === modelId)?.name || modelId

  return {
    // prompt
    prompt,
    setPrompt,
    values,
    setValues,
    variables,
    ready,
    // model config
    providers,
    providerId,
    setProviderId,
    modelId,
    setModelId,
    apiKey,
    setApiKey,
    configs,
    setConfigs,
    currentModelName,
    // presets
    presets,
    handleApplyPreset,
    // drawer
    configOpen,
    setConfigOpen,
    // execution
    run,
    ran,
    loading,
    responseOutput,
    errorMsg,
    showRaw,
    setShowRaw,
    latency,
    tokens,
  }
}
