/**
 * @fileoverview Type Definitions for Tool Creation Components
 *
 * Defines the props and event handlers for the visual ToolParametersBuilder UI component.
 */

import { ToolParameter } from '../types'

/**
 * Props for the `ToolParametersBuilder` component.
 */
export interface ToolParametersBuilderProps {
  /** Current array of configured parameters */
  parameters: ToolParameter[]
  /** Callback to append a newly created parameter */
  onAddParam: (newParam: ToolParameter) => void
  /** Callback to update an existing parameter by ID */
  onUpdateParam: (id: string, oldName: string, updatedParam: ToolParameter) => void
  /** Callback to delete an existing parameter by ID and name */
  onRemoveParam: (id: string, name: string) => void
  /** Current synchronization state between the JSDoc AST parser and the visual builder */
  parseStatus?: 'idle' | 'parsing' | 'error' | 'success'
}

