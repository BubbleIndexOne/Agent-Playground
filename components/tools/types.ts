export interface Tool {
  id: string
  name: string
  description: string
  type: 'client' | 'mcp'
  published?: boolean
}

export type CreationStep = 'none' | 'choose' | 'client' | 'service'
