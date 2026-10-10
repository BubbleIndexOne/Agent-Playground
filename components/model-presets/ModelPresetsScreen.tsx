'use client'

import React, { useState, useMemo } from 'react'
import { Plus, Search, Settings2, SlidersHorizontal, Trash2, Edit3, Loader2, AlertCircle } from 'lucide-react'
import { useModelPresets } from './ModelPresetsContext'
import { ModelPresetItem } from './types'
import { WorkspaceShell } from '../layout/WorkspaceShell'

export function ModelPresetsScreen() {
  const { presets, isLoading, error, deletePreset } = useModelPresets()
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <WorkspaceShell>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border px-5 md:px-8">
          <div className="flex items-center gap-3 pl-10 md:pl-0">
            <div className="hidden size-7 items-center justify-center rounded-md bg-accent text-muted-foreground sm:flex">
              <Settings2 className="size-3.5" />
            </div>
            <div>
              <h1 className="text-[14px] font-semibold tracking-[-0.01em]">Model Presets</h1>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Configure hyperparameters and default models
              </p>
            </div>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col gap-5 p-5 md:p-8">
          <div className="flex flex-col gap-4 border-b border-border pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-primary">Configuration</p>
                <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.035em]">Model Templates</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Create tuned configuration templates to use across agents and playground experiments.
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90"
              >
                <Plus className="size-3.5" />
                New Preset
              </button>
            </div>

            <div className="relative flex-1 max-w-sm pt-2">
              <Search className="pointer-events-none absolute left-3 top-4.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search presets..."
                className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-8 text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <Loader2 className="size-8 text-primary animate-spin mb-4" />
                <p className="text-[14px] font-medium text-foreground">Loading presets...</p>
              </div>
            ) : error ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 mb-5">
                  <AlertCircle className="size-5 text-destructive" />
                </div>
                <h3 className="text-[16px] font-semibold text-foreground">Failed to load presets</h3>
                <p className="mt-2 text-[13px] text-muted-foreground max-w-sm">{error}</p>
              </div>
            ) : filteredPresets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-primary/50 hover:bg-accent/40 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-foreground truncate group-hover:text-primary transition-colors">
                            {preset.name}
                          </h3>
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-1 capitalize">
                          {preset.provider} • {preset.model_id || 'Default Model'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
                          <Edit3 className="size-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(preset.id)}
                          className="flex size-7 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-t border-border pt-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono bg-accent px-1.5 py-0.5 rounded text-[10px]">T</span>
                        <span>Temp: {preset.params?.temperature ?? 'Auto'}</span>
                      </div>
                      {preset.params?.maxOutputTokens && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono bg-accent px-1.5 py-0.5 rounded text-[10px]">M</span>
                          <span>Max: {preset.params.maxOutputTokens}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl bg-background/50">
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent mb-4">
                  <SlidersHorizontal className="size-4 text-primary" />
                </div>
                <p className="text-[14px] font-medium text-foreground">
                  {searchQuery ? 'No matching presets found' : 'No presets created'}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground max-w-[280px]">
                  {searchQuery
                    ? `We couldn't find any presets matching "${searchQuery}".`
                    : 'Create a preset to quickly apply model configurations.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-[12px] font-medium text-primary hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  )
}
