import type { CoreMessage } from 'ai'
import { REASONING_LEVELS, TOOL_CHOICES } from '../constants'

export interface Model {
  id: string
  name: string
}

export interface Provider {
  id: string
  name: string
  models: Model[]
}

export interface ModelConfig {
  temperature?: number
  topP?: number
  topK?: number
  presencePenalty?: number
  frequencyPenalty?: number
  maxOutputTokens?: number
  seed?: number
  stopSequences?: string[]
  reasoning?: typeof REASONING_LEVELS[number] | string
  toolChoice?: typeof TOOL_CHOICES[number] | string
  [key: string]: any // Allow other configs
}

export interface CallResult {
  text: string
  usage: { input: number; output: number; total: number }
}
