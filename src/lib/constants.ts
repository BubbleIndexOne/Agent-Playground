export const STORAGE_KEYS = {
  MODEL_API_KEY: 'model_api_key',
  SELECTED_PROVIDER: 'selected_provider',
  SELECTED_MODEL: 'selected_model',
  MODEL_CONFIGS: 'model_configs'
};

export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
export const ANTHROPIC_VERSION = '2023-06-01';

export const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
export const GOOGLE_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export const DEFAULT_MODEL_CONFIGS = {
  temperature: 1.0,
  topP: 1,
  topK: 40,
  presencePenalty: 0,
  frequencyPenalty: 0,
};

export const REASONING_LEVELS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'provider-default'] as const;
export const TOOL_CHOICES = ['auto', 'required', 'none'] as const;
