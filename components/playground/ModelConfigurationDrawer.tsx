'use client'

/**
 * @fileoverview ModelConfigurationDrawer – Slide-over settings panel.
 *
 * Renders the full provider / model / API key / advanced-params drawer.
 * All logic is delegated to `useModelConfigDrawer`.
 */

import React from 'react'
import {
  ChevronDown,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
  X,
  Wrench,
  Check,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Provider, ModelConfig } from '@/src/lib/api'
import { DEFAULT_MODEL_CONFIGS } from '@/src/lib/constants'
import { ModelPresetItem } from '../model-presets/types'
import { useTools } from '@/components/tools/ToolsContext'
import { useModelConfigDrawer } from './useModelConfigDrawer'

export interface ModelConfigurationDrawerProps {
  providers: Provider[]
  providerId: string
  modelId: string
  apiKey: string
  configs: ModelConfig
  setProviderId: (v: string) => void
  setModelId: (v: string) => void
  setApiKey: (v: string) => void
  setConfigs: (v: ModelConfig) => void
  onClose: () => void
  presets?: ModelPresetItem[]
  onApplyPreset?: (preset: ModelPresetItem) => void
}

export function ModelConfigurationDrawer(props: ModelConfigurationDrawerProps) {
  const {
    providers,
    onClose,
    presets,
    onApplyPreset,
  } = props

  const { tools } = useTools()
  const searchParams = useSearchParams()
  const preselectedTool = searchParams?.get('tool')
  const [activeToolIds, setActiveToolIds] = React.useState<string[]>(
    preselectedTool ? [preselectedTool] : []
  )

  const toggleTool = (id: string) => {
    setActiveToolIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const {
    draftProvider,
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
  } = useModelConfigDrawer(props)

  const currentProvider = providers.find(p => p.id === draftProvider) || providers[0]

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="model-settings-title"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-[420px] h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-accent/10">
          <div>
            <h2 id="model-settings-title" className="text-[19px] font-semibold tracking-[-0.025em]">
              Model Configuration
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Configure your workspace and model parameters.</p>
          </div>
          <button
            aria-label="Close settings"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* PRESETS SECTION */}
          {presets && onApplyPreset && (
            <div className="flex flex-col gap-2 p-5 border border-primary/20 bg-primary/[0.03] rounded-xl">
              <label htmlFor="preset" className="text-[12px] font-medium text-primary flex items-center gap-2">
                <Sparkles className="size-3.5" />
                Apply a Model Preset
              </label>
              <div className="relative">
                <select
                  id="preset"
                  disabled={presets.length === 0}
                  onChange={e => {
                    const selected = presets.find(p => p.id === e.target.value)
                    if (selected) {
                      applyPreset(selected, providers)
                      onApplyPreset(selected)
                    }
                  }}
                  className="h-10 w-full appearance-none rounded-lg border border-border bg-card px-3 text-[12px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  <option value="">{presets.length === 0 ? 'No presets available' : '-- Choose a preset --'}</option>
                  {presets.filter(p => !p.is_archived).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
              </div>
              {presets.length === 0 && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Create a preset in the Models tab to quickly apply settings.
                </p>
              )}
            </div>
          )}

          {/* ACTIVE WORKSPACE TOOLS SECTION */}
          <div className="flex flex-col gap-3 border border-border p-5 rounded-xl bg-card shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[12px] font-semibold text-foreground flex items-center gap-2">
                  <Wrench className="size-3.5 text-primary" /> Active Workspace Tools
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Attach verified tools to this session for LLM function calling.
                </p>
              </div>
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                {activeToolIds.length} attached
              </span>
            </div>

            {tools.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-[11px] text-muted-foreground">
                No tools created yet in this workspace. Create client or MCP tools in the Tools tab.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                {tools.map((t) => {
                  const isChecked = activeToolIds.includes(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTool(t.id)}
                      className={`flex items-center justify-between rounded-lg border p-2.5 text-left transition-all text-[11px] ${
                        isChecked
                          ? 'border-primary/40 bg-primary/5 text-foreground'
                          : 'border-border/70 bg-background/50 text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`flex size-4 items-center justify-center rounded border ${
                            isChecked
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/40'
                          }`}
                        >
                          {isChecked && <Check className="size-3" />}
                        </div>
                        <span className="font-semibold truncate">{t.name}</span>
                        <span className="rounded bg-accent/80 px-1.5 py-0.2 font-mono text-[9px] text-muted-foreground">
                          {t.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {t.parameters?.length || 0} args
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* PROVIDER & MODEL SECTION */}
          <div className="flex flex-col gap-5 border border-border p-5 rounded-xl bg-card shadow-sm">
            <input type="text" name="prevent_autofill_adv" className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="off" />
            <input type="password" name="prevent_autofill_adv_pwd" className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="off" />

            <div className="flex flex-col gap-2">
              <label htmlFor="adv-provider" className="text-[12px] font-medium">Model provider</label>
              <div className="relative">
                <select
                  id="adv-provider"
                  value={draftProvider}
                  onChange={e => handleProviderChange(e.target.value, providers)}
                  className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="adv-model" className="text-[12px] font-medium">Model</label>
              <div className="relative">
                <select
                  id="adv-model"
                  value={draftModel}
                  onChange={e => setDraftModel(e.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {currentProvider.models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="adv-settings-key" className="text-[12px] font-medium">API key</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  id="adv-settings-key"
                  name="model_api_secret_key"
                  type={visible ? 'text' : 'password'}
                  value={draftKey}
                  onChange={e => setDraftKey(e.target.value)}
                  placeholder="sk-ant-..."
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  className="h-10 w-full rounded-lg border border-border bg-background px-10 pr-10 font-mono text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  aria-label={visible ? 'Hide API key' : 'Show API key'}
                  onClick={() => setVisible(!visible)}
                  className="absolute right-2 top-2 flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                >
                  {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-[11px] leading-5 text-muted-foreground">Stored only for this browser session.</p>
            </div>
          </div>

          {/* ADVANCED PARAMS */}
          <div className="flex flex-col border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between p-4 bg-accent/5 hover:bg-accent/30 transition-colors"
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[13px] font-medium">Advanced Parameters</span>
                <span className="text-[11px] text-muted-foreground">Temperature, Top P, Penalties, etc.</span>
              </div>
              <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="p-5 flex flex-col gap-8 border-t border-border bg-card animate-in slide-in-from-top-2 fade-in duration-200">
                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Creativity</p>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium flex justify-between">
                        Temperature <span className="text-muted-foreground">{draftConfigs.temperature ?? DEFAULT_MODEL_CONFIGS.temperature}</span>
                      </label>
                      <input type="range" min="0" max="2" step="0.1"
                        value={draftConfigs.temperature ?? DEFAULT_MODEL_CONFIGS.temperature}
                        onChange={e => updateConfig('temperature', parseFloat(e.target.value))}
                        className="accent-primary" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium flex justify-between">Stop Sequences</label>
                      <input type="text"
                        value={draftConfigs.stopSequences?.join(', ') ?? ''}
                        onChange={e => {
                          const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          updateConfig('stopSequences', vals.length > 0 ? vals : undefined)
                        }}
                        placeholder="e.g. stop, 🛑"
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[12px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Length</p>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium flex justify-between">Max Output Tokens</label>
                      <input type="number" min="1"
                        value={draftConfigs.maxOutputTokens ?? ''}
                        onChange={e => updateConfig('maxOutputTokens', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Provider default"
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[12px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Sampling</p>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium flex justify-between">
                        Top P <span className="text-muted-foreground">{draftConfigs.topP ?? DEFAULT_MODEL_CONFIGS.topP}</span>
                      </label>
                      <input type="range" min="0" max="1" step="0.05"
                        value={draftConfigs.topP ?? DEFAULT_MODEL_CONFIGS.topP}
                        onChange={e => updateConfig('topP', parseFloat(e.target.value))}
                        className="accent-primary" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium flex justify-between">
                        Top K <span className="text-muted-foreground">{draftConfigs.topK ?? 'Provider default'}</span>
                      </label>
                      <input type="range" min="2" max="100" step="1"
                        value={draftConfigs.topK ?? DEFAULT_MODEL_CONFIGS.topK}
                        onChange={e => updateConfig('topK', parseInt(e.target.value))}
                        className="accent-primary" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Penalties</p>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium flex justify-between">
                        Presence Penalty <span className="text-muted-foreground">{draftConfigs.presencePenalty ?? DEFAULT_MODEL_CONFIGS.presencePenalty}</span>
                      </label>
                      <input type="range" min="-2" max="2" step="0.1"
                        value={draftConfigs.presencePenalty ?? DEFAULT_MODEL_CONFIGS.presencePenalty}
                        onChange={e => updateConfig('presencePenalty', parseFloat(e.target.value))}
                        className="accent-primary" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium flex justify-between">
                        Frequency Penalty <span className="text-muted-foreground">{draftConfigs.frequencyPenalty ?? DEFAULT_MODEL_CONFIGS.frequencyPenalty}</span>
                      </label>
                      <input type="range" min="-2" max="2" step="0.1"
                        value={draftConfigs.frequencyPenalty ?? DEFAULT_MODEL_CONFIGS.frequencyPenalty}
                        onChange={e => updateConfig('frequencyPenalty', parseFloat(e.target.value))}
                        className="accent-primary" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Determinism</p>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium flex justify-between">Seed</label>
                      <input type="number" min="0"
                        value={draftConfigs.seed ?? ''}
                        onChange={e => updateConfig('seed', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Provider default"
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[12px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-border bg-card flex justify-between items-center z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={clear}
            className="rounded-md px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10"
          >
            Clear key
          </button>
          <button
            onClick={save}
            className="glow-hover rounded-lg bg-primary px-6 py-2.5 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 shadow-md"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  )
}
