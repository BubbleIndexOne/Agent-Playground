import { ToolParameter, ParameterType } from './types'

/**
 * Converts the frontend ToolParameter array into a JSON Schema object
 * expected by the backend.
 */
export function parametersToJsonSchema(parameters: ToolParameter[]): Record<string, any> {
  if (!parameters || parameters.length === 0) {
    return {
      type: 'object',
      properties: {},
      required: [],
    }
  }

  const properties: Record<string, any> = {}
  const required: string[] = []

  parameters.forEach((param) => {
    properties[param.name] = {
      type: param.type,
      description: param.description,
    }
    
    if (param.defaultValue !== undefined && param.defaultValue !== '') {
      properties[param.name].default = param.defaultValue
    }

    if (param.required) {
      required.push(param.name)
    }
  })

  const schema: Record<string, any> = {
    type: 'object',
    properties,
  }

  if (required.length > 0) {
    schema.required = required
  }

  return schema
}

/**
 * Converts a backend JSON Schema object back into the frontend ToolParameter array.
 */
export function jsonSchemaToParameters(schema: Record<string, any> | null | undefined): ToolParameter[] {
  if (!schema || schema.type !== 'object' || !schema.properties) {
    return []
  }

  const properties = schema.properties
  const requiredFields = Array.isArray(schema.required) ? schema.required : []

  return Object.keys(properties).map((key) => {
    const prop = properties[key]
    return {
      id: Math.random().toString(36).substring(2, 9), // Generate temporary ID for UI mapping
      name: key,
      type: (prop.type as ParameterType) || 'string',
      description: prop.description || '',
      required: requiredFields.includes(key),
      defaultValue: prop.default !== undefined ? String(prop.default) : undefined,
    }
  })
}

/**
 * Converts frontend ToolCapabilities object to backend string array (capabilities_json).
 */
export function capabilitiesToArray(capabilities: {
  network: boolean
  storage: boolean
  environment: boolean
}): string[] {
  const caps: string[] = []
  if (capabilities.network) caps.push('network:http_get', 'network')
  if (capabilities.storage) caps.push('storage')
  if (capabilities.environment) caps.push('environment')
  return caps
}

/**
 * Converts backend capabilities string array into frontend ToolCapabilities object.
 */
export function arrayToCapabilities(capsArray?: string[] | null): {
  network: boolean
  storage: boolean
  environment: boolean
} {
  if (!Array.isArray(capsArray)) {
    return { network: true, storage: false, environment: false }
  }
  return {
    network: capsArray.some(c => c.startsWith('network')),
    storage: capsArray.includes('storage'),
    environment: capsArray.includes('environment'),
  }
}
