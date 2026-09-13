/**
 * @fileoverview Bi-Directional JSDoc & Code Synchronization Engine
 *
 * Provides utilities to parse JSDoc comments from JavaScript code and synchronize
 * parameter definitions bi-directionally between visual UI editors and code.
 *
 * Functions include surgical regex-based mutations that modify specific parameter lines
 * in the JSDoc block without altering the user's custom function logic or code formatting.
 */

import { ToolParameter, ParameterType } from '../types'
import { parse as parseJSDoc } from 'comment-parser'

/**
 * Result object returned when parsing parameters and metadata from code.
 */
export interface ParsedCodeMetadata {
  /** List of extracted parameters from `@param` tags */
  parameters: ToolParameter[]
  /** Extracted tool title from the first line of the JSDoc description */
  extractedTitle?: string
  /** Extracted tool description from subsequent lines of the JSDoc description */
  extractedDescription?: string
}

/**
 * Parses JSDoc comments from JavaScript code to extract typed parameters,
 * tool title, and descriptions. Treats code as the authoritative source of truth.
 *
 * Recognizes `@param {type} args.paramName - description` tags and maps raw types
 * (e.g., 'integer', 'float', 'json', 'list') to canonical ParameterTypes ('string', 'number', 'boolean', 'object', 'array').
 *
 * @param code - The JavaScript source code containing JSDoc comments.
 * @returns ParsedCodeMetadata containing extracted parameters, title, and description.
 *
 * @example
 * ```ts
 * const meta = parseParametersFromCode(code);
 * console.log(meta.extractedTitle, meta.parameters);
 * ```
 */
export function parseParametersFromCode(code: string): ParsedCodeMetadata {
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
 * Surgically updates a specific parameter line in the JSDoc comment block without
 * touching any surrounding code or comments.
 *
 * Formats optional parameters as `[args.paramName="default"]` and required as `args.paramName`.
 *
 * @param code - The original source code.
 * @param oldParamName - The original name of the parameter before update.
 * @param updatedParam - The updated ToolParameter definition.
 * @returns Modified source code with the replaced parameter line.
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
 * Surgically appends a new parameter to the JSDoc block immediately before the `@returns`
 * tag or before the closing comment delimiter `*\/`.
 *
 * @param code - The original source code.
 * @param newParam - The new ToolParameter definition to insert.
 * @returns Modified source code containing the new parameter tag.
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
 * Surgically deletes a parameter tag line from the JSDoc block using regex.
 *
 * @param code - The original source code.
 * @param paramName - The name of the parameter tag to remove.
 * @returns Modified source code without the removed parameter line.
 */
export function surgicallyRemoveParamFromCode(code: string, paramName: string): string {
  const regex = new RegExp(`\\n?[ \\t]*\\*[ \\t]*@param\\s+\\{[^}]+\\}\\s+(?:\\[?)args\\.${paramName}(?:(?:=[^\\]]+)?\\]?)?[^\\n]*`, 'i')
  return code.replace(regex, '')
}

/**
 * Generates a complete fresh starter scaffold for a client-side tool function,
 * including structured JSDoc comments, destructuring arguments, and a try/catch execution block.
 *
 * @param name - The tool function title.
 * @param description - High-level purpose and usage explanation for the AI.
 * @param parameters - Array of initial input parameters to document and destructure.
 * @returns Standardized JavaScript source code template string.
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


