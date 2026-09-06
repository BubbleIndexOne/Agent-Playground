import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export const providerFactories: Record<string, (apiKey: string) => (modelId: string) => any> = {
  anthropic: (apiKey) => {
    const anthropic = createAnthropic({
      apiKey,
      headers: { 'anthropic-dangerous-direct-browser-access': 'true' },
    })
    return (modelId: string) => anthropic(modelId)
  },
  openai: (apiKey) => {
    const openai = createOpenAI({ apiKey })
    return (modelId: string) => openai(modelId)
  },
  google: (apiKey) => {
    const google = createGoogleGenerativeAI({ apiKey })
    return (modelId: string) => google(modelId)
  },
}
