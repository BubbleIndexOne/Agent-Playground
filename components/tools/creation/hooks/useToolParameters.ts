/**
 * @fileoverview Custom Hook for Tool Parameter Mutations
 *
 * Handles adding new parameters with default values and updating existing parameters
 * while enforcing alphanumeric and underscore naming sanitization.
 */

import { ToolParameter } from '../../types'

/**
 * Props for the `useToolParameters` hook.
 */
export interface UseToolParametersProps {
  /** Array of current parameters */
  parameters: ToolParameter[]
  /** Callback to append a new parameter */
  onAddParam: (newParam: ToolParameter) => void
  /** Callback to update a parameter by ID */
  onUpdateParam: (id: string, oldName: string, updatedParam: ToolParameter) => void
}

/**
 * Return type for the `useToolParameters` hook.
 */
export interface UseToolParametersReturn {
  /** Handler to create and append a new parameter with placeholder values */
  handleAdd: () => void
  /** Handler to sanitize and apply partial updates to an existing parameter */
  handleUpdate: (param: ToolParameter, updates: Partial<ToolParameter>) => void
}

/**
 * Hook providing handlers for adding and updating tool parameters with naming sanitization.
 *
 * @param props - Hook properties including parameters array and mutation callbacks.
 * @returns Object containing `handleAdd` and `handleUpdate` action handlers.
 */
export function useToolParameters({
  parameters,
  onAddParam,
  onUpdateParam
}: UseToolParametersProps): UseToolParametersReturn {
  const handleAdd = () => {
    const newParam: ToolParameter = {
      id: Math.random().toString(36).substring(2, 9),
      name: `new_param_${parameters.length + 1}`,
      type: 'string',
      description: 'Description...',
      required: true,
    }
    onAddParam(newParam)
  }

  const handleUpdate = (param: ToolParameter, updates: Partial<ToolParameter>) => {
    const updated = { ...param, ...updates }
    // Enforce valid name: only alphanumeric characters and underscores
    updated.name = updated.name.replace(/[^a-zA-Z0-9_]/g, '')
    onUpdateParam(param.id, param.name, updated)
  }

  return { handleAdd, handleUpdate }
}

