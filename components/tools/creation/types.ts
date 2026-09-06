import { ToolParameter } from '../types'

export interface ToolParametersBuilderProps {
  parameters: ToolParameter[]
  onAddParam: (newParam: ToolParameter) => void
  onUpdateParam: (id: string, oldName: string, updatedParam: ToolParameter) => void
  onRemoveParam: (id: string, name: string) => void
  parseStatus?: 'idle' | 'parsing' | 'error' | 'success'
}
