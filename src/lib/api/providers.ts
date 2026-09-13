/**
 * @fileoverview LLM Provider Factory Initializers
 *
 * Instantiates provider-specific SDK clients (`@ai-sdk/anthropic`, `@ai-sdk/openai`,
 * and `@ai-sdk/google`) using user-supplied API keys for direct client-side execution.
 */

import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

/**
 * Registry mapping provider keys ('anthropic', 'openai', 'google') to factory functions.
 * Each factory accepts a user's API key and returns a curried function that instantiates
 * the target language model instance by model ID.
 *
 * Special handling:
 * - Anthropic: Injects the `anthropic-dangerous-direct-browser-access: 'true'` header to allow
 *   direct CORS client calls without an intermediate backend proxy.
 */
export const providerFactories: Record<string, (apiKey: string) => (modelId: string) => any> = {
  /**
   * Anthropic provider factory.
   * Enables direct browser access with user's key for Claude models.
   */
  anthropic: (apiKey: string) => {
    const anthropic = createAnthropic({
      apiKey,
      headers: { 'anthropic-dangerous-direct-browser-access': 'true' },
    })
    return (modelId: string) => anthropic(modelId)
  },

  /**
   * OpenAI provider factory.
   * Initializes OpenAI client for GPT models.
   */
  openai: (apiKey: string) => {
    const openai = createOpenAI({ apiKey })
    return (modelId: string) => openai(modelId)
  },

  /**
   * Google Generative AI provider factory.
   * Initializes Gemini client using official Google AI SDK.
   */
  google: (apiKey: string) => {
    const google = createGoogleGenerativeAI({ apiKey })
    return (modelId: string) => google(modelId)
  },
}

