export type ParameterType = 'string' | 'number' | 'boolean' | 'object' | 'array'

export interface ToolParameter {
  id: string
  name: string
  type: ParameterType
  description: string
  required: boolean
  defaultValue?: string
}

export interface ToolCapabilities {
  network: boolean
  storage: boolean
  environment: boolean
}

export interface ToolServiceConfig {
  serviceType: string
  connectionString: string
}

export interface Tool {
  id: string
  name: string
  description: string
  type: 'client' | 'mcp'
  published?: boolean
  parameters?: ToolParameter[]
  code?: string
  serviceConfig?: ToolServiceConfig
  capabilities?: ToolCapabilities
  updatedAt?: string
}

export type CreationStep = 'none' | 'choose' | 'client' | 'service'
export type ToolFilter = 'all' | 'client' | 'mcp' | 'published' | 'draft'
