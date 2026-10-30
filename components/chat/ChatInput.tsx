'use client'

/**
 * @fileoverview ChatInput – LibreChat-style message input bar
 *
 * Clean rounded input box with model selector chip, system prompt, settings, and send.
 * Matches LibreChat's minimal bottom input aesthetic.
 */

import React, { useRef, useEffect, useState, KeyboardEvent } from 'react'
import {
  ArrowUp,
  ChevronDown,
  Loader2,
  Paperclip,
  SquarePen,
  Wrench,
  Zap,
} from 'lucide-react'
import { Provider, ModelConfig } from '@/src/lib/api'

interface ChatInputProps {
  input: string
  setInput: (v: string) => void
  onSend: () => void
  loading: boolean
  providers: Provider[]
  providerId: string
  modelId: string
  onSelectProvider: (id: string) => void
  onSelectModel: (id: string) => void
  currentModelName: string
  onOpenConfig: () => void
  systemPrompt: string
  setSystemPrompt: (v: string) => void
}

export function ChatInput({
  input,
  setInput,
  onSend,
  loading,
  providers,
  providerId,
  modelId,
  onSelectProvider,
  onSelectModel,
  currentModelName,
  onOpenConfig,
  systemPrompt,
  setSystemPrompt,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [modelPickerOpen, setModelPickerOpen] = useState(false)
  const [systemPromptOpen, setSystemPromptOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 220) + 'px'
  }, [input])

  // Close picker on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setModelPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!loading && input.trim()) onSend()
    }
  }

  return (
    <div className="px-4 pb-5 pt-2">
      {/* System prompt expander */}
      {systemPromptOpen && (
        <div className="mb-2 rounded-xl border border-white/[0.08] bg-[#111114] p-3 animate-in slide-in-from-bottom-1 duration-150">
          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            <SquarePen className="size-2.5" /> System Prompt
          </label>
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            placeholder="You are a helpful AI assistant..."
            rows={3}
            className="w-full resize-none bg-transparent text-[13px] leading-6 text-foreground outline-none placeholder:text-muted-foreground/40"
          />
        </div>
      )}

      {/* Input container — LibreChat style rounded box */}
      <div className="relative rounded-2xl border border-white/[0.1] bg-[#111115] transition-all focus-within:border-white/[0.18]">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Loom..."
          rows={1}
          disabled={loading}
          className="block w-full resize-none bg-transparent px-4 pt-4 pb-3 text-[14px] leading-7 text-foreground outline-none placeholder:text-muted-foreground/35"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between gap-2 border-t border-white/[0.05] px-3 py-2">
          {/* Left: controls */}
          <div className="flex items-center gap-0.5">
            {/* Model picker */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setModelPickerOpen(p => !p)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
              >
                <Zap className="size-3 text-primary/60" />
                <span className="max-w-[100px] truncate">{currentModelName}</span>
                <ChevronDown className="size-2.5 opacity-60" />
              </button>

              {modelPickerOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 rounded-xl border border-white/[0.1] bg-[#111115] p-2 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
                  {providers.map(provider => (
                    <div key={provider.id} className="mb-3 last:mb-0">
                      <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">
                        {provider.name}
                      </p>
                      {provider.models.map(model => {
                        const isActive = provider.id === providerId && model.id === modelId
                        return (
                          <button
                            key={model.id}
                            onClick={() => {
                              onSelectProvider(provider.id)
                              onSelectModel(model.id)
                              setModelPickerOpen(false)
                            }}
                            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                              isActive
                                ? 'bg-primary/[0.1] text-primary'
                                : 'text-foreground hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className={`flex size-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${
                              isActive ? 'bg-primary/20 text-primary' : 'bg-white/[0.06] text-muted-foreground'
                            }`}>
                              {model.name[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-medium">{model.name}</p>
                            </div>
                            {isActive && <div className="ml-auto size-1.5 rounded-full bg-primary shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System prompt toggle */}
            <button
              onClick={() => setSystemPromptOpen(p => !p)}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
                systemPromptOpen
                  ? 'bg-primary/[0.1] text-primary'
                  : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
              }`}
              title="System prompt"
            >
              <SquarePen className="size-3" />
              <span className="hidden sm:inline">System</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenConfig}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
              title="Model settings"
            >
              <Wrench className="size-3" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>

          {/* Right: send button */}
          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-black shadow-sm transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-25"
          >
            {loading
              ? <Loader2 className="size-3.5 animate-spin" />
              : <ArrowUp className="size-3.5" strokeWidth={2.5} />
            }
          </button>
        </div>
      </div>

      <p className="mt-2 text-center text-[10px] text-muted-foreground/25">
        Loom can make mistakes. Consider checking important information.
      </p>
    </div>
  )
}
