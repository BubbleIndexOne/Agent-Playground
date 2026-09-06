import { ToolParameter, ParameterType } from '../types'
import { parse as parseJSDoc } from 'comment-parser'

/**
 * Parses JSDoc comments from JavaScript code to infer parameters,
 * tool title, and descriptions. This makes the code the single source of truth.
 */
export function parseParametersFromCode(code: string): {
  parameters: ToolParameter[]
  extractedTitle?: string
  extractedDescription?: string
} {
  const parameters: ToolParameter[] = []
  let extractedTitle: string | undefined
  let extractedDescription: string | undefined

  const parsed = parseJSDoc(code)
  
  if (parsed.length > 0) {
    const mainBlock = parsed[0]
    
    // Extract title and description
    const desc = mainBlock.description.trim()
    if (desc) {
      const descLines = desc.split('\n')
      extractedTitle = descLines[0].trim()
      if (descLines.length > 1) {
        extractedDescription = descLines.slice(1).join('\n').trim()
      }
    }

    const paramMap = new Map<string, ToolParameter>()

    // Parse tags
    for (const tag of mainBlock.tags) {
      if (tag.tag === 'param') {
        const name = tag.name.replace(/^args\./, '')
        if (!name || name === 'args') continue

        let type: ParameterType = 'string'
        const rawType = (tag.type || '').toLowerCase()
        if (['number', 'integer', 'float'].includes(rawType)) type = 'number'
        else if (['boolean', 'bool'].includes(rawType)) type = 'boolean'
        else if (['object', 'record', 'json'].includes(rawType)) type = 'object'
        else if (['array', 'list'].includes(rawType) || rawType.endsWith('[]')) type = 'array'

        const required = !tag.optional
        const defaultValue = tag.default ? tag.default.replace(/^['"]|['"]$/g, '') : undefined

        const param: ToolParameter = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          type,
          description: tag.description.replace(/^- /, '').trim(),
          required,
          defaultValue
        }
        paramMap.set(name, param)
      }
    }

    paramMap.forEach(param => parameters.push(param))
  }

  return {
    parameters,
    extractedTitle,
    extractedDescription,
  }
}

/**
 * Surgically updates a specific parameter line in the JSDoc block.
 */
export function surgicallyUpdateParamInCode(
  code: string,
  oldParamName: string,
  updatedParam: ToolParameter
): string {
  // Regex to match the specific @param line for args.oldParamName
  const regex = new RegExp(`(@param\\s+\\{[^}]+\\}\\s+(?:\\[?)args\\.${oldParamName}(?:(?:=[^\\]]+)?\\]?)?(?:[ \\t]*(?:-|—)?[ \\t]*[^\\n*]*))`, 'i')
  
  const isOptional = !updatedParam.required
  let namePart = `args.${updatedParam.name}`
  if (isOptional) {
    namePart = updatedParam.defaultValue 
      ? `[${namePart}="${updatedParam.defaultValue}"]` 
      : `[${namePart}]`
  }

  const newParamLine = `@param {${updatedParam.type}} ${namePart}${updatedParam.description ? ` - ${updatedParam.description}` : ''}`
  
  if (regex.test(code)) {
    return code.replace(regex, newParamLine)
  }
  return code
}

/**
 * Surgically adds a new parameter to the JSDoc block.
 */
export function surgicallyAddParamToCode(code: string, newParam: ToolParameter): string {
  const isOptional = !newParam.required
  let namePart = `args.${newParam.name}`
  if (isOptional) {
    namePart = newParam.defaultValue 
      ? `[${namePart}="${newParam.defaultValue}"]` 
      : `[${namePart}]`
  }

  const newParamLine = ` * @param {${newParam.type}} ${namePart}${newParam.description ? ` - ${newParam.description}` : ''}`

  if (code.includes('@returns')) {
    return code.replace(/\s*\*\s*@returns/, `\n${newParamLine}\n * @returns`)
  } else if (code.includes('*/')) {
    return code.replace(/\s*\*\//, `\n${newParamLine}\n */`)
  }
  return code
}

/**
 * Surgically removes a parameter from the JSDoc block.
 */
export function surgicallyRemoveParamFromCode(code: string, paramName: string): string {
  const regex = new RegExp(`\\n?[ \\t]*\\*[ \\t]*@param\\s+\\{[^}]+\\}\\s+(?:\\[?)args\\.${paramName}(?:(?:=[^\\]]+)?\\]?)?[^\\n]*`, 'i')
  return code.replace(regex, '')
}

/**
 * Generates a complete fresh starter scaffold if the user explicitly wants to reset to template.
 */
export function generateFreshTemplate(
  name: string,
  description: string,
  parameters: ToolParameter[]
): string {
  const destructuredVars = parameters.map(p => p.name).filter(Boolean).join(', ') || 'param'
  
  const paramDocs = parameters.length
    ? parameters
        .map(
          p =>
            ` * @param {${p.type}} ${p.required ? `args.${p.name}` : `[args.${p.name}]`}${
              p.description ? ` - ${p.description}` : p.defaultValue ? ` (default: ${p.defaultValue})` : ''
            }`
        )
        .join('\n')
    : ' * @param {Object} args - Input parameters'

  return `/**
 * ${name || 'Tool Title'}
 * ${description || 'Documentation for the AI model describing when and how to invoke this capability.'}
 *
${paramDocs}
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function execute(args) {
  try {
    // 1. Destructure arguments
    const { ${destructuredVars} } = args;

    // 2. Perform tool logic / API fetch
    const result = {
      message: "Tool executed successfully",
      receivedArgs: args,
      timestamp: new Date().toISOString()
    };

    // 3. Return structured response to the AI model
    return {
      success: true,
      data: result
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}`
}
