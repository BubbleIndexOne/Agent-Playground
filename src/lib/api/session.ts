/**
 * @fileoverview Browser Session Management for API Credentials & Model Configs
 *
 * Provides safe client-side persistence utilities for API keys and tuning parameters
 * using browser `sessionStorage`. All credentials are wiped when the browser tab is closed
 * and are never persisted to disk or external servers.
 */

import { STORAGE_KEYS } from '../constants'
import { ModelConfig } from './types'

/**
 * Saves a provider API key into the current browser tab's `sessionStorage`.
 * Includes an SSR guard to ensure safe execution in Next.js server rendering passes.
 *
 * @param key - The raw API key string provided by the user.
 */
export const saveKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.MODEL_API_KEY, key)
  }
}

/**
 * Retrieves the currently saved API key from `sessionStorage`.
 *
 * @returns The stored API key string, or `null` if not found or running on the server.
 */
export const getKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(STORAGE_KEYS.MODEL_API_KEY)
  }
  return null
}

/**
 * Removes the stored API key from `sessionStorage`, clearing credentials for the session.
 */
export const clearKey = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEYS.MODEL_API_KEY)
  }
}

/**
 * Serializes and stores custom model tuning configurations in `sessionStorage`.
 *
 * @param configs - The ModelConfig object containing tuning parameters (temperature, topP, etc.).
 */
export const saveModelConfigs = (configs: ModelConfig): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.MODEL_CONFIGS, JSON.stringify(configs))
  }
}

/**
 * Retrieves and deserializes the saved model configurations from `sessionStorage`.
 * Gracefully handles parsing errors by returning `null` if corrupted.
 *
 * @returns The parsed ModelConfig object, or `null` if not found, malformed, or running on server.
 */
export const getModelConfigs = (): ModelConfig | null => {
  if (typeof window !== 'undefined') {
    const data = sessionStorage.getItem(STORAGE_KEYS.MODEL_CONFIGS)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        return null
      }
    }
  }
  return null
}

