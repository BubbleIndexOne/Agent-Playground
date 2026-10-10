'use client'

/**
 * @fileoverview Model Preset Editor - Pure UI
 */

import React from 'react'
import { X, SlidersHorizontal, Loader2, Save } from 'lucide-react'
import { ModelPresetItem } from './types'
import { useModelPresetEditor } from './useModelPresetEditor'
import { PROVIDERS, MODELS_BY_PROVIDER } from './constants'

export interface ModelPresetEditorProps {
  /** If provided, we are in Edit mode. If undefined, we are creating a new preset. */
  preset?: ModelPresetItem
  onClose: () => void
}

export function ModelPresetEditor({ preset, onClose }: ModelPresetEditorProps) {
  const {
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
  } = useModelPresetEditor(preset, onClose)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl flex flex-col max-h-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-[16px] font-semibold text-foreground">
              {preset ? 'Edit Model Preset' : 'Create Model Preset'}
            </h2>
            <p className="text-[12px] text-muted-foreground mt-1">
              Configure parameters for LLM generations.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 min-h-0">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-[12px] text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          {/* Basic Settings */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">Preset Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Creative Writer"
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">Provider</label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  {PROVIDERS.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">Model</label>
                {MODELS_BY_PROVIDER[provider]?.length > 0 ? (
                  <select
                    value={modelId}
                    onChange={e => setModelId(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    {MODELS_BY_PROVIDER[provider].map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={modelId}
                    onChange={e => setModelId(e.target.value)}
                    placeholder="Enter custom model ID"
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border my-6" />

          {/* Advanced Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <SlidersHorizontal className="size-4" />
            Advanced Parameters
            <span className="ml-auto text-[10px] bg-accent px-1.5 py-0.5 rounded text-muted-foreground">
              {showAdvanced ? 'Hide' : 'Show'}
            </span>
          </button>

          {/* Advanced Settings Panel */}
          {showAdvanced && (
            <div className="space-y-5 animate-in slide-in-from-top-2 duration-200 fade-in pt-2">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-[12px] font-medium text-foreground">Temperature</label>
                  <span className="text-[12px] text-muted-foreground">{params.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={params.temperature}
                  onChange={e => updateParam('temperature', parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Controls randomness. Higher values produce more diverse output.
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-[12px] font-medium text-foreground">Top P</label>
                  <span className="text-[12px] text-muted-foreground">{params.topP}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={params.topP}
                  onChange={e => updateParam('topP', parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Nucleus sampling threshold.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">Max Output Tokens</label>
                <input
                  type="number"
                  value={params.maxOutputTokens || ''}
                  onChange={e => updateParam('maxOutputTokens', parseInt(e.target.value) || 0)}
                  placeholder="Leave empty for provider default"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border p-5 bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[12px] font-medium text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                Save Preset
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
