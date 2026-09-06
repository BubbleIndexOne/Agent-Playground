import { ToolParameter } from '../../types'

interface UseToolParametersProps {
  parameters: ToolParameter[]
  onAddParam: (newParam: ToolParameter) => void
  onUpdateParam: (id: string, oldName: string, updatedParam: ToolParameter) => void
}

export function useToolParameters({ parameters, onAddParam, onUpdateParam }: UseToolParametersProps) {
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
    // Enforce valid name
    updated.name = updated.name.replace(/[^a-zA-Z0-9_]/g, '')
    onUpdateParam(param.id, param.name, updated)
  }

  return { handleAdd, handleUpdate }
}
