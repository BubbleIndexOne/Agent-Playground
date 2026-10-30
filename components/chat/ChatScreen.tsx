'use client'

/**
 * @fileoverview ChatScreen – Focused Chat Content View
 *
 * Renders the main chat canvas:
 * - Minimal top header (active conversation title, model selector chip, new chat button)
 * - Message feed or clean LibreChat-style welcome screen
 * - Bottom input bar
 * - Model configuration drawer
 *
 * The outer AppSidebar is provided by the persistent WorkspaceLayout.
 */

import React from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ModelConfigurationDrawer } from '@/components/playground/ModelConfigurationDrawer'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ChatWelcome } from './ChatWelcome'
import { useChat } from './ChatContext'

export function ChatScreen() {
  const { user } = useAuth()
  const {
    conversations,
    activeConvId,
    activeMessages,
    newConversation,
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
    presets,
    handleApplyPreset,
    input,
    setInput,
    sendMessage,
    loading,
    configPanelOpen,
    setConfigPanelOpen,
    systemPrompt,
    setSystemPrompt,
    messagesEndRef,
  } = useChat()

  const displayName = user
    ? (user.display_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User')
    : 'User'

  const activeConvTitle = conversations.find(c => c.id === activeConvId)?.title

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#0a0a0c]">
      {/* ── Top Header ── */}
      <header className="flex h-[48px] shrink-0 items-center justify-between border-b border-white/[0.05] px-5">
        {/* Active conversation title */}
        <div className="flex items-center gap-2">
          {activeConvTitle && activeMessages.length > 0 ? (
            <h1 className="max-w-[360px] truncate text-[13px] font-medium text-foreground/80">
              {activeConvTitle}
            </h1>
          ) : (
            <span className="text-[13px] text-muted-foreground/40 font-medium">New conversation</span>
          )}
        </div>

        {/* Right actions: Model pill + New chat */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfigPanelOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/[0.05] hover:text-foreground"
            title="Configure model parameters"
          >
            <Sparkles className="size-3 text-primary/70" />
            <span className="max-w-[120px] truncate">{currentModelName}</span>
          </button>

          <button
            onClick={newConversation}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition-colors"
            title="New conversation"
            aria-label="New conversation"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </header>

      {/* ── Message Area ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeMessages.length === 0 ? (
          <ChatWelcome
            displayName={displayName}
            onSelectSuggestion={text => setInput(text)}
          />
        ) : (
          <div className="mx-auto max-w-3xl py-8 px-4">
            {activeMessages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Bottom Input Bar ── */}
      <div className="shrink-0 pb-4">
        <div className="mx-auto max-w-3xl px-4">
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={sendMessage}
            loading={loading}
            providers={providers}
            providerId={providerId}
            modelId={modelId}
            onSelectProvider={setProviderId}
            onSelectModel={setModelId}
            currentModelName={currentModelName}
            onOpenConfig={() => setConfigPanelOpen(true)}
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
          />
        </div>
      </div>

      {/* ── Model Configuration Drawer ── */}
      {configPanelOpen && (
        <ModelConfigurationDrawer
          providers={providers}
          providerId={providerId}
          modelId={modelId}
          apiKey={apiKey}
          configs={configs}
          setProviderId={setProviderId}
          setModelId={setModelId}
          setApiKey={setApiKey}
          setConfigs={setConfigs}
          onClose={() => setConfigPanelOpen(false)}
          presets={presets}
          onApplyPreset={handleApplyPreset}
        />
      )}
    </div>
  )
}
