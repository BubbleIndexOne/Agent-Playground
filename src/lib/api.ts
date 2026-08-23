import { generateText, type CoreMessage } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import mockData from './mockdata.json';
import { STORAGE_KEYS } from './constants';

export interface Model {
  id: string;
  name: string;
}

export interface Provider {
  id: string;
  name: string;
  models: Model[];
}

export const getProviders = (): Provider[] => {
  return mockData.providers;
};

// sessionStorage helpers — unchanged, this part was already fine
export const saveKey = (key: string) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.MODEL_API_KEY, key);
  }
};

export const getKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(STORAGE_KEYS.MODEL_API_KEY);
  }
  return null;
};

export const clearKey = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEYS.MODEL_API_KEY);
  }
};

// --- This is the part that replaces every future if/else branch ---
// Each entry just configures a provider factory. Adding provider #4
// means adding one line here, not a new request/response translation.
const providerFactories: Record<string, (apiKey: string) => (modelId: string) => any> = {
  anthropic: (apiKey) => {
    const anthropic = createAnthropic({
      apiKey,
      // Required for BYOK client-side calls — see prior discussion on
      // why this header is intentionally named "dangerous": it's fine
      // here because the key belongs to the user, not to us.
      headers: { 'anthropic-dangerous-direct-browser-access': 'true' },
    });
    return (modelId: string) => anthropic(modelId);
  },
  openai: (apiKey) => {
    const openai = createOpenAI({ apiKey });
    return (modelId: string) => openai(modelId);
  },
  google: (apiKey) => {
    const google = createGoogleGenerativeAI({ apiKey });
    return (modelId: string) => google(modelId);
  },
};

export interface CallResult {
  text: string;
  usage: { input: number; output: number; total: number };
}

// One function, any provider. This fully replaces the old if/else callModel.
export async function callModel(
  apiKey: string,
  providerId: string,
  modelId: string,
  messages: CoreMessage[]
): Promise<CallResult> {
  const factory = providerFactories[providerId];
  if (!factory) {
    throw new Error(`Integration for provider '${providerId}' is not implemented yet.`);
  }

  const model = factory(apiKey)(modelId);

  const result = await generateText({
    model,
    messages,
  });

  return {
    text: result.text,
    usage: {
      input: result.usage.inputTokens ?? 0,
      output: result.usage.outputTokens ?? 0,
      total: result.usage.totalTokens ?? 0,
    },
  };
}
