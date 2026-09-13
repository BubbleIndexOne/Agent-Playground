/**
 * @fileoverview Application Constants & Defaults
 *
 * Defines centralized configuration keys, API provider endpoints,
 * default hyper-parameters, and supported enumeration types for model execution.
 */

/**
 * Storage keys used for persisting playground session state in browser `sessionStorage`.
 * Ensuring credentials and runtime configurations remain scoped to the active browser tab.
 */
export const STORAGE_KEYS = {
  /** Session storage key for user-provided LLM provider API key */
  MODEL_API_KEY: 'model_api_key',
  /** Session storage key for the currently selected provider ID */
  SELECTED_PROVIDER: 'selected_provider',
  /** Session storage key for the currently selected model identifier */
  SELECTED_MODEL: 'selected_model',
  /** Session storage key for JSON-serialized model tuning hyper-parameters */
  MODEL_CONFIGS: 'model_configs'
};

/** Direct REST endpoint for Anthropic Claude messages API */
export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
/** Default API version header for Anthropic API requests */
export const ANTHROPIC_VERSION = '2023-06-01';

/** Direct REST endpoint for OpenAI Chat Completions API */
export const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
/** Base URL for Google Generative AI (Gemini) v1beta models API */
export const GOOGLE_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Default hyper-parameters applied during model invocation when user-specific
 * overrides are not explicitly configured.
 */
export const DEFAULT_MODEL_CONFIGS = {
  /** Default sampling temperature (1.0 = standard creative balance) */
  temperature: 1.0,
  /** Default nucleus sampling threshold (1.0 = full probability distribution) */
  topP: 1,
  /** Default Top-K sampling cutoff (limits selection to top 40 candidate tokens) */
  topK: 40,
  /** Default presence penalty (0 = neutral penalty for already-generated tokens) */
  presencePenalty: 0,
  /** Default frequency penalty (0 = neutral penalty based on token frequency) */
  frequencyPenalty: 0,
};

/** Supported reasoning effort levels for reasoning-capable models */
export const REASONING_LEVELS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'provider-default'] as const;

/** Permitted tool selection modes during tool-assisted execution */
export const TOOL_CHOICES = ['auto', 'required', 'none'] as const;

