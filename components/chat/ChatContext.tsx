'use client'

/**
 * @fileoverview ChatContext & Provider
 *
 * Centralizes chat state across the application shell and chat views.
 * Implements ephemeral draft lifecycle:
 * - Empty conversations are NOT persisted to localStorage.
 * - Idempotent newConversation: clicking '+' when already on an empty draft does not duplicate.
 * - Existing corrupted/empty conversations in localStorage are pruned on initial load.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getProviders, getKey, saveKey, callModel, ModelConfig, getModelConfigs, saveModelConfigs } from '@/src/lib/api'
import { useModelPresets } from '@/components/model-presets/ModelPresetsContext'
import { ModelPresetItem } from '@/components/model-presets/types'
import { Conversation, ChatMessage } from './types'

const STORAGE_KEY = 'loom_chat_conversations'
const ACTIVE_CONV_KEY = 'loom_chat_active_conversation'

function generateId() {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

function generateTitle(firstMessage: string): string {
  const words = firstMessage.trim().split(/\s+/).slice(0, 7)
  return words.join(' ') + (firstMessage.split(/\s+/).length > 7 ? '...' : '')
}

/**
 * Loads and prunes empty conversations from localStorage.
 */
function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Conversation[]
    // Prune any empty conversations that have no messages
    const valid = parsed.filter(c => Array.isArray(c.messages) && c.messages.length > 0)
    // Synchronize cleaned list back to localStorage if empty items were found
    if (valid.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid))
    }
    return valid.map(c => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })),
    }))
  } catch {
    return []
  }
}

/**
 * Persists ONLY conversations that have at least one message.
 */
function saveConversations(convs: Conversation[]) {
  if (typeof window === 'undefined') return
  try {
    const withMessages = convs.filter(c => c.messages && c.messages.length > 0)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withMessages))
  } catch {}
}

function createNewDraft(): Conversation {
  return {
    id: generateId(),
    title: 'New conversation',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export interface ChatContextValue {
  conversations: Conversation[]
  activeConvId: string | null
  activeConversation: Conversation | null
  activeMessages: ChatMessage[]
  newConversation: () => void
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  updateConversationTitle: (id: string, title: string) => void
  pinConversation: (id: string) => void
  providers: ReturnType<typeof getProviders>
  providerId: string
  setProviderId: (id: string) => void
  modelId: string
  setModelId: (id: string) => void
  apiKey: string
  setApiKey: (key: string) => void
  configs: ModelConfig
  setConfigs: (configs: ModelConfig) => void
  currentModelName: string
  currentProvider: ReturnType<typeof getProviders>[0] | undefined
  presets: ModelPresetItem[]
  handleApplyPreset: (preset: ModelPresetItem) => void
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  sendMessage: (content?: string) => Promise<void>
  loading: boolean
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  configPanelOpen: boolean
  setConfigPanelOpen: React.Dispatch<React.SetStateAction<boolean>>
  systemPrompt: string
  setSystemPrompt: React.Dispatch<React.SetStateAction<string>>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const providers = getProviders()
  const { presets } = useModelPresets()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)

  const [providerId, setProviderIdState] = useState(providers[0].id)
  const [modelId, setModelIdState] = useState(providers[0].models[0].id)
  const [apiKey, setApiKey] = useState('')
  const [configs, setConfigs] = useState<ModelConfig>({})

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [configPanelOpen, setConfigPanelOpen] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Hydrate on mount
  useEffect(() => {
    const savedConvs = loadConversations()
    const savedKey = getKey()
    const savedConfigs = getModelConfigs()
    if (savedKey) setApiKey(savedKey)
    if (savedConfigs) setConfigs(savedConfigs)

    if (savedConvs.length > 0) {
      setConversations(savedConvs)
      const lastActive = localStorage.getItem(ACTIVE_CONV_KEY)
      const found = savedConvs.find(c => c.id === lastActive)
      setActiveConvId(found ? found.id : savedConvs[0].id)
    } else {
      // Start with a fresh draft in memory (not written to localStorage)
      const fresh = createNewDraft()
      setConversations([fresh])
      setActiveConvId(fresh.id)
    }
  }, [])

  // Persist conversations whenever they change (filtering empty ones)
  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  // Persist active conv ID if it belongs to a saved conversation
  useEffect(() => {
    if (activeConvId && typeof window !== 'undefined') {
      const active = conversations.find(c => c.id === activeConvId)
      if (active && active.messages.length > 0) {
        localStorage.setItem(ACTIVE_CONV_KEY, activeConvId)
      }
    }
  }, [activeConvId, conversations])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, activeConvId])

  const activeConversation = conversations.find(c => c.id === activeConvId) ?? null
  const activeMessages = activeConversation?.messages ?? []

  const currentProvider = providers.find(p => p.id === providerId)
  const currentModelName = currentProvider?.models.find(m => m.id === modelId)?.name ?? modelId

  const setProviderId = useCallback((id: string) => {
    setProviderIdState(id)
    const provider = providers.find(p => p.id === id)
    if (provider?.models[0]) setModelIdState(provider.models[0].id)
  }, [providers])

  const setModelId = useCallback((id: string) => {
    setModelIdState(id)
  }, [])

  /**
   * Idempotent New Conversation:
   * If current conversation is empty, stay on it. Never duplicate empty chats.
   */
  const newConversation = useCallback(() => {
    const current = conversations.find(c => c.id === activeConvId)
    if (current && current.messages.length === 0) {
      setInput('')
      return
    }

    const existingEmpty = conversations.find(c => c.messages.length === 0)
    if (existingEmpty) {
      setActiveConvId(existingEmpty.id)
      setInput('')
      return
    }

    const fresh = createNewDraft()
    setConversations(prev => [fresh, ...prev.filter(c => c.messages.length > 0)])
    setActiveConvId(fresh.id)
    setInput('')
  }, [conversations, activeConvId])

  const selectConversation = useCallback((id: string) => {
    setActiveConvId(id)
    setInput('')
  }, [])

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id)
      if (next.length === 0) {
        const fresh = createNewDraft()
        setActiveConvId(fresh.id)
        return [fresh]
      }
      return next
    })
    setActiveConvId(prev => {
      if (prev !== id) return prev
      const remaining = conversations.filter(c => c.id !== id)
      return remaining[0]?.id ?? null
    })
  }, [conversations])

  const updateConversationTitle = useCallback((id: string, title: string) => {
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, title } : c)
    )
  }, [])

  const pinConversation = useCallback((id: string) => {
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c)
    )
  }, [])

  const sendMessage = useCallback(async (content?: string) => {
    const text = (content ?? input).trim()
    if (!text || loading) return

    let convId = activeConvId

    // If no active conversation, create one
    if (!convId) {
      const fresh = createNewDraft()
      setConversations(prev => [fresh, ...prev])
      setActiveConvId(fresh.id)
      convId = fresh.id
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    const assistantMsgId = generateId()
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      model: currentModelName,
    }

    // Add user + placeholder assistant message
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c
        const isFirstMsg = c.messages.length === 0
        return {
          ...c,
          title: isFirstMsg ? generateTitle(text) : c.title,
          messages: [...c.messages, userMsg, assistantMsg],
          updatedAt: new Date(),
        }
      })
    )
    setInput('')
    setLoading(true)

    const start = Date.now()
    try {
      const currentConv = conversations.find(c => c.id === convId)
      const history = (currentConv?.messages ?? [])
        .filter(m => m.role !== 'assistant' || !m.isStreaming)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      const apiMessages = [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        ...history,
        { role: 'user' as const, content: text },
      ]

      const res = await callModel(apiKey, providerId, modelId, apiMessages, configs)
      const outputText = res.text || JSON.stringify(res, null, 2)
      const latencyMs = Date.now() - start

      setConversations(prev =>
        prev.map(c => {
          if (c.id !== convId) return c
          return {
            ...c,
            messages: c.messages.map(m =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: outputText,
                    isStreaming: false,
                    tokens: res.usage?.total,
                    latencyMs,
                  }
                : m
            ),
            updatedAt: new Date(),
          }
        })
      )
    } catch (e: any) {
      setConversations(prev =>
        prev.map(c => {
          if (c.id !== convId) return c
          return {
            ...c,
            messages: c.messages.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: '', isStreaming: false, error: e.message ?? 'An error occurred' }
                : m
            ),
          }
        })
      )
    } finally {
      setLoading(false)
    }
  }, [input, loading, activeConvId, conversations, apiKey, providerId, modelId, configs, systemPrompt, currentModelName])

  const handleApplyPreset = useCallback((preset: ModelPresetItem) => {
    const newConfigs = { ...configs }
    if (preset.params?.temperature !== undefined) newConfigs.temperature = preset.params.temperature
    if (preset.params?.topP !== undefined) newConfigs.topP = preset.params.topP
    if (preset.params?.topK !== undefined) newConfigs.topK = preset.params.topK
    if (preset.params?.maxOutputTokens !== undefined) newConfigs.maxOutputTokens = preset.params.maxOutputTokens
    if (preset.params?.presencePenalty !== undefined) newConfigs.presencePenalty = preset.params.presencePenalty
    if (preset.params?.frequencyPenalty !== undefined) newConfigs.frequencyPenalty = preset.params.frequencyPenalty
    if (preset.params?.seed !== undefined) newConfigs.seed = preset.params.seed
    if (preset.params?.stopSequences !== undefined) newConfigs.stopSequences = preset.params.stopSequences
    setConfigs(newConfigs)
    saveModelConfigs(newConfigs)
  }, [configs])

  const saveApiKey = useCallback((key: string) => {
    setApiKey(key)
    saveKey(key)
  }, [])

  const updateConfigs = useCallback((newConfigs: ModelConfig) => {
    setConfigs(newConfigs)
    saveModelConfigs(newConfigs)
  }, [])

  const value: ChatContextValue = {
    conversations,
    activeConvId,
    activeConversation,
    activeMessages,
    newConversation,
    selectConversation,
    deleteConversation,
    updateConversationTitle,
    pinConversation,
    providers,
    providerId,
    setProviderId,
    modelId,
    setModelId,
    apiKey,
    setApiKey: saveApiKey,
    configs,
    setConfigs: updateConfigs,
    currentModelName,
    currentProvider,
    presets,
    handleApplyPreset,
    input,
    setInput,
    sendMessage,
    loading,
    sidebarOpen,
    setSidebarOpen,
    configPanelOpen,
    setConfigPanelOpen,
    systemPrompt,
    setSystemPrompt,
    messagesEndRef,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
