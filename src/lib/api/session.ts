import { STORAGE_KEYS } from '../constants'
import { ModelConfig } from './types'

export const saveKey = (key: string) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.MODEL_API_KEY, key)
  }
}

export const getKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(STORAGE_KEYS.MODEL_API_KEY)
  }
  return null
}

export const clearKey = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEYS.MODEL_API_KEY)
  }
}

export const saveModelConfigs = (configs: ModelConfig) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.MODEL_CONFIGS, JSON.stringify(configs))
  }
}

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
