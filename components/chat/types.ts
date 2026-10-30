/**
 * @fileoverview Chat – Shared types
 */

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  model?: string
  tokens?: number
  latencyMs?: number
  isStreaming?: boolean
  error?: string
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  model?: string
  providerId?: string
  pinned?: boolean
}
