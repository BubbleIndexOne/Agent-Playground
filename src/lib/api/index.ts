/**
 * @fileoverview Unified Model Invocation Layer
 *
 * Provides a standardized interface for querying LLMs across multiple providers
 * (Anthropic, OpenAI, Google) using the Vercel AI SDK (`ai`). Translates custom user
 * hyper-parameters into vendor-specific options and returns normalized results and metrics.
 */

import { generateText, type CoreMessage } from 'ai'
import mockData from '../mockdata.json'
import { providerFactories } from './providers'
import { Provider, ModelConfig, CallResult } from './types'

export * from './types'
export * from './session'

/**
 * Returns the list of supported LLM providers and their corresponding models.
 * Loaded from static configuration (`mockdata.json`).
 *
 * @returns Array of Provider objects with IDs, names, and available model definitions.
 */
export const getProviders = (): Provider[] => {
  return mockData.providers
}

/**
 * Executes a text completion call against a specific LLM provider and model.
 * Dynamically resolves provider SDK instances and applies configured hyper-parameters.
 *
 * @param apiKey - User's secret API key for the selected provider.
 * @param providerId - Key identifying the target provider ('anthropic' | 'openai' | 'google').
 * @param modelId - Model identifier string supported by the provider (e.g., 'gpt-4o', 'gemini-3.7-flash').
 * @param messages - Array of CoreMessage conversation objects to send to the model.
 * @param config - Optional ModelConfig specifying temperature, topP, topK, penalties, maxTokens, etc.
 * @returns Promise resolving to a CallResult containing the response text and token metrics.
 * @throws {Error} If the specified provider does not have a registered factory implementation.
 *
 * @example
 * ```ts
 * const result = await callModel(
 *   'sk-ant-...',
 *   'anthropic',
 *   'claude-3-5-sonnet-20240620',
 *   [{ role: 'user', content: 'Explain quantum computing simply.' }],
 *   { temperature: 0.7, maxOutputTokens: 500 }
 * );
 * console.log(result.text, result.usage.total);
 * ```
 */
export async function callModel(
  apiKey: string,
  providerId: string,
  modelId: string,
  messages: CoreMessage[],
  config: ModelConfig = {}
): Promise<CallResult> {
  const factory = providerFactories[providerId]
  if (!factory) {
    throw new Error(`Integration for provider '${providerId}' is not implemented yet.`)
  }

  const model = factory(apiKey)(modelId)

  const generateOptions: any = {
    model,
    messages,
  }

  if (config.temperature !== undefined) generateOptions.temperature = config.temperature
  if (config.topP !== undefined) generateOptions.topP = config.topP
  if (config.topK !== undefined) generateOptions.topK = config.topK
  if (config.presencePenalty !== undefined) generateOptions.presencePenalty = config.presencePenalty
  if (config.frequencyPenalty !== undefined) generateOptions.frequencyPenalty = config.frequencyPenalty
  if (config.maxOutputTokens !== undefined) generateOptions.maxTokens = config.maxOutputTokens
  if (config.seed !== undefined) generateOptions.seed = config.seed
  if (config.stopSequences && config.stopSequences.length > 0) generateOptions.stopSequences = config.stopSequences

  const result = await generateText(generateOptions)

  return {
    text: result.text,
    usage: {
      input: result.usage.inputTokens ?? 0,
      output: result.usage.outputTokens ?? 0,
      total: result.usage.totalTokens ?? 0,
    },
  }
}

