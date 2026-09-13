/**
 * @fileoverview Type Definitions for AI Model Execution & Configuration
 *
 * Defines the core interfaces and types used across the playground for provider
 * definitions, model specifications, hyper-parameter configs, and invocation results.
 */

import type { CoreMessage } from 'ai'
import { REASONING_LEVELS, TOOL_CHOICES } from '../constants'

/**
 * Represents a specific LLM model offering under a provider.
 */
export interface Model {
  /** Unique model identifier used for API requests (e.g., 'gpt-4o', 'claude-3-5-sonnet-20240620') */
  id: string
  /** Human-readable display label for the model in UI dropdowns */
  name: string
}

/**
 * Represents an LLM provider and its supported models.
 */
export interface Provider {
  /** Unique provider identifier key (e.g., 'anthropic', 'openai', 'google') */
  id: string
  /** Display title of the provider */
  name: string
  /** List of models available for selection under this provider */
  models: Model[]
}

/**
 * User-configurable hyper-parameters and generation constraints passed to the model runner.
 */
export interface ModelConfig {
  /** Controls randomness. Lower values yield more deterministic output (0.0 to 2.0). */
  temperature?: number
  /** Nucleus sampling threshold. Specifies cumulative probability cutoff (0.0 to 1.0). */
  topP?: number
  /** Top-K cutoff limiting token consideration to top K most probable tokens (2 to 100). */
  topK?: number
  /** Penalizes newly generated tokens based on whether they have appeared in text (-2.0 to 2.0). */
  presencePenalty?: number
  /** Penalizes newly generated tokens based on frequency of occurrence in text (-2.0 to 2.0). */
  frequencyPenalty?: number
  /** Maximum number of tokens the model is permitted to generate in the completion. */
  maxOutputTokens?: number
  /** Random seed integer for deterministic response reproducibility. */
  seed?: number
  /** Array of literal string sequences where token generation will halt immediately. */
  stopSequences?: string[]
  /** Reasoning effort mode for supported reasoning models (e.g., 'low', 'medium', 'high'). */
  reasoning?: typeof REASONING_LEVELS[number] | string
  /** Mode determining how tool invocations should be handled (e.g., 'auto', 'required', 'none'). */
  toolChoice?: typeof TOOL_CHOICES[number] | string
  /** Dynamic provider-specific extended configurations. */
  [key: string]: any
}

/**
 * Normalized result payload returned by model invocation.
 */
export interface CallResult {
  /** Generated text output from the model */
  text: string
  /** Token consumption metrics for the execution */
  usage: {
    /** Number of input / prompt tokens processed */
    input: number
    /** Number of output / completion tokens generated */
    output: number
    /** Total combined token count */
    total: number
  }
}

