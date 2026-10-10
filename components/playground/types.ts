/**
 * @fileoverview Playground – Shared Types
 */

export interface PlaygroundState {
  prompt: string
  values: Record<string, string>
  providerId: string
  modelId: string
  apiKey: string
}
