/**
 * @fileoverview useClientToolEditor hook
 *
 * Encapsulates state management, split-pane resizing, JS Doc parsing sync,
 * and surgical AST updates for the ClientToolEditor.
 */

import { useState, useEffect, useRef } from 'react'
import { Tool, ToolParameter, ToolCapabilities } from '../types'
import {
  parseParametersFromCode,
  surgicallyUpdateParamInCode,
  surgicallyAddParamToCode,
  surgicallyRemoveParamFromCode,
  generateFreshTemplate,
} from '../utils/codeSync'

export interface UseClientToolEditorProps {
  initialTool?: Tool | null
  onCancel: () => void
  onSave: (tool: Tool) => void
}

export function useClientToolEditor({ initialTool, onSave }: UseClientToolEditorProps) {
  const [name, setName] = useState(initialTool?.name || '')
  const [description, setDescription] = useState(initialTool?.description || '')
  
  const [parameters, setParameters] = useState<ToolParameter[]>(initialTool?.parameters || [])
  
  const [code, setCode] = useState(
    initialTool?.code ||
      generateFreshTemplate(
        initialTool?.name || 'MyTool',
        initialTool?.description || 'Custom capability for the AI agent.',
        initialTool?.parameters || []
      )
  )
  
  const [capabilities, setCapabilities] = useState<ToolCapabilities>(
    initialTool?.capabilities || {
      network: true,
      storage: false,
      environment: false,
    }
  )

  const [activeRightTab, setActiveRightTab] = useState<'schema' | 'capabilities' | 'sandbox'>('schema')
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  
  const [parseStatus, setParseStatus] = useState<'idle' | 'parsing' | 'error' | 'success'>('idle')
  const isEditingFromUI = useRef(false)

  const [leftWidthPercent, setLeftWidthPercent] = useState(55)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100
      const clamped = Math.min(Math.max(newLeftWidth, 25), 75)
      setLeftWidthPercent(clamped)
    }

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    if (isResizing) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const toggleCapability = (key: keyof ToolCapabilities) => {
    setCapabilities(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const showNotification = (msg: string) => {
    setFeedbackNotice(msg)
    setTimeout(() => setFeedbackNotice(null), 3000)
  }

  useEffect(() => {
    setParseStatus('parsing')
    
    const handler = setTimeout(() => {
      try {
        const parsed = parseParametersFromCode(code)
        if (parsed.extractedTitle && !name.trim()) setName(parsed.extractedTitle)
        if (parsed.extractedDescription && !description.trim()) setDescription(parsed.extractedDescription)
        
        setParameters(parsed.parameters)
        setParseStatus('success')
        setTimeout(() => setParseStatus('idle'), 2000)
      } catch (err) {
        setParseStatus('error')
      }
      isEditingFromUI.current = false
    }, 400)

    return () => clearTimeout(handler)
  }, [code, name, description])

  const handleAddParam = (newParam: ToolParameter) => {
    isEditingFromUI.current = true
    const newCode = surgicallyAddParamToCode(code, newParam)
    setCode(newCode)
    setParameters(prev => [...prev, newParam])
  }

  const handleUpdateParam = (id: string, oldName: string, updatedParam: ToolParameter) => {
    isEditingFromUI.current = true
    const newCode = surgicallyUpdateParamInCode(code, oldName, updatedParam)
    setCode(newCode)
    setParameters(prev => prev.map(p => p.id === id ? updatedParam : p))
  }

  const handleRemoveParam = (id: string, paramName: string) => {
    isEditingFromUI.current = true
    const newCode = surgicallyRemoveParamFromCode(code, paramName)
    setCode(newCode)
    setParameters(prev => prev.filter(p => p.id !== id))
  }

  const handleResetToTemplate = () => {
    const fresh = generateFreshTemplate(name || 'MyTool', description || '', parameters)
    setCode(fresh)
    setShowResetConfirm(false)
    showNotification('Code reset to standard template')
  }

  const isNameValid = name.trim().length > 0
  const isDescValid = description.trim().length > 0
  const isValid = isNameValid && isDescValid

  const handleSaveClick = () => {
    if (!isValid) {
      setShowValidationErrors(true)
      return
    }

    const toolToSave: Tool = {
      id: initialTool?.id || Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      description: description.trim(),
      type: 'client',
      published: initialTool ? initialTool.published : false,
      parameters,
      code,
      capabilities,
      status: initialTool?.status || 'draft',
      is_public: initialTool?.is_public || false,
      allow_client_execution: initialTool?.allow_client_execution || true,
      connector_type: initialTool?.connector_type || null,
      current_version_id: initialTool?.current_version_id || null,
      current_version: initialTool?.current_version || null,
      created_at: initialTool?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onSave(toolToSave)
  }

  return {
    name, setName,
    description, setDescription,
    parameters,
    code, setCode,
    capabilities,
    activeRightTab, setActiveRightTab,
    showValidationErrors,
    feedbackNotice,
    showResetConfirm, setShowResetConfirm,
    parseStatus,
    leftWidthPercent,
    isResizing, setIsResizing,
    containerRef,
    toggleCapability,
    handleAddParam,
    handleUpdateParam,
    handleRemoveParam,
    handleResetToTemplate,
    isNameValid,
    isDescValid,
    handleSaveClick,
    showNotification,
  }
}
