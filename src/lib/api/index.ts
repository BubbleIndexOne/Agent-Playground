import { generateText, type CoreMessage } from 'ai'
import mockData from '../mockdata.json'
import { providerFactories } from './providers'
import { Provider, ModelConfig, CallResult } from './types'

export * from './types'
export * from './session'

export const getProviders = (): Provider[] => {
  return mockData.providers
}

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
