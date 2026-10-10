/**
 * @fileoverview useLiveTestSandbox hook
 *
 * Provides two testing engines:
 * 1. In-browser mock sandbox with scoped capabilities (network, storage, env).
 * 2. Automated Cloudflare Sandbox Worker Audit & Registration (POST /tools/{id}/register).
 */

import { useState, useEffect, useRef } from 'react'
import { ToolParameter, ToolCapabilities } from '../types'
import { ToolRegistrationResponse } from '../../../api/types'
import * as toolsApi from '../../../api/tools'

export interface UseLiveTestSandboxProps {
  code: string
  parameters: ToolParameter[]
  capabilities: ToolCapabilities
  toolName: string
  toolId?: string
  onRegisterSuccess?: (result: ToolRegistrationResponse) => void
}

export function useLiveTestSandbox({
  code,
  parameters,
  capabilities,
  toolName,
  toolId,
  onRegisterSuccess,
}: UseLiveTestSandboxProps) {
  const [inputArgsJson, setInputArgsJson] = useState('{}')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [hasRun, setHasRun] = useState(false)

  // Cloudflare Sandbox Registration State
  const [isAuditing, setIsAuditing] = useState(false)
  const [auditResult, setAuditResult] = useState<ToolRegistrationResponse | null>(null)
  const [auditError, setAuditError] = useState<string | null>(null)

  const [inputHeightPercent, setInputHeightPercent] = useState(38)
  const [isResizingVertical, setIsResizingVertical] = useState(false)
  const sandboxContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingVertical || !sandboxContainerRef.current) return
      const rect = sandboxContainerRef.current.getBoundingClientRect()
      const newHeightPercent = ((e.clientY - rect.top) / rect.height) * 100
      const clamped = Math.min(Math.max(newHeightPercent, 20), 75)
      setInputHeightPercent(clamped)
    }

    const handleMouseUp = () => {
      if (isResizingVertical) {
        setIsResizingVertical(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    if (isResizingVertical) {
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingVertical])

  const generateDefaultArgs = () => {
    const defaultObj: Record<string, any> = {}
    parameters.forEach((p) => {
      const cleanName = p.name.trim()
      if (cleanName) {
        switch (p.type) {
          case 'number':
            defaultObj[cleanName] = 10
            break
          case 'boolean':
            defaultObj[cleanName] = true
            break
          case 'object':
            defaultObj[cleanName] = { key: `test_${cleanName}_val` }
            break
          case 'array':
            defaultObj[cleanName] = [`test_${cleanName}_1`, `test_${cleanName}_2`]
            break
          case 'string':
          default:
            defaultObj[cleanName] = `test_${cleanName}`
            break
        }
      }
    })
    return JSON.stringify(defaultObj, null, 2)
  }

  useEffect(() => {
    setInputArgsJson(generateDefaultArgs())
  }, [parameters])

  const handleResetInputs = () => {
    setInputArgsJson(generateDefaultArgs())
  }

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(inputArgsJson)
      setInputArgsJson(JSON.stringify(parsed, null, 2))
    } catch {
      // ignore invalid json format attempt
    }
  }

  // 1. In-browser local mock test runner
  const handleRun = async () => {
    setIsRunning(true)
    setError(null)
    setResult(null)
    setLatency(null)
    setLogs([])
    setHasRun(true)

    const startTime = performance.now()
    const capturedLogs: string[] = []

    try {
      let parsedArgs = {}
      try {
        parsedArgs = JSON.parse(inputArgsJson)
      } catch (err: any) {
        throw new Error(`Invalid Input JSON: ${err.message}`)
      }

      const customConsole = {
        log: (...args: any[]) => {
          const formatted = args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
            .join(' ')
          capturedLogs.push(`[LOG] ${formatted}`)
        },
        warn: (...args: any[]) => {
          const formatted = args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
            .join(' ')
          capturedLogs.push(`[WARN] ${formatted}`)
        },
        error: (...args: any[]) => {
          const formatted = args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
            .join(' ')
          capturedLogs.push(`[ERROR] ${formatted}`)
        },
      }

      const customFetch = capabilities.network
        ? (...fetchArgs: any[]) => (window.fetch as any)(...fetchArgs)
        : () => {
            throw new Error(
              "Permission Denied: Network access is disabled for this tool. Enable 'Network Access' in the Permissions tab to allow HTTP/API requests."
            )
          }

      const customXHR = capabilities.network
        ? window.XMLHttpRequest
        : class {
            constructor() {
              throw new Error('Permission Denied: Network access is disabled for this tool.')
            }
          }

      const customLocalStorage = capabilities.storage
        ? window.localStorage
        : new Proxy(
            {},
            {
              get() {
                throw new Error(
                  "Permission Denied: Local storage access is disabled for this tool. Enable 'Local Storage' in the Permissions tab."
                )
              },
            }
          )

      const customEnv = capabilities.environment
        ? { NODE_ENV: 'development', RUNTIME: 'browser-sandbox' }
        : new Proxy(
            {},
            {
              get() {
                throw new Error(
                  "Permission Denied: Environment access is disabled for this tool. Enable 'Environment Variables' in the Permissions tab."
                )
              },
            }
          )

      let cleanCode = code
      if (/function\s+execute\s*\(/.test(cleanCode)) {
        const match = cleanCode.match(/function\s+execute\s*\([^)]*\)\s*\{([\s\S]*)\}/)
        if (match && match[1]) {
          cleanCode = match[1]
        }
      } else if (/const\s+execute\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/.test(cleanCode)) {
        const match = cleanCode.match(
          /const\s+execute\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{([\s\S]*)\}/
        )
        if (match && match[1]) {
          cleanCode = match[1]
        }
      }

      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
      const runner = new AsyncFunction(
        'args',
        'fetch',
        'XMLHttpRequest',
        'localStorage',
        'sessionStorage',
        'process',
        'console',
        cleanCode
      )

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timed out after 8000ms.')), 8000)
      )

      const executionPromise = runner(
        parsedArgs,
        customFetch,
        customXHR,
        customLocalStorage,
        customLocalStorage,
        { env: customEnv },
        customConsole
      )

      const res = await Promise.race([executionPromise, timeoutPromise])
      setResult(res !== undefined ? res : { status: 'Execution completed without return value' })
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      const elapsed = Math.round(performance.now() - startTime)
      setLatency(elapsed)
      setLogs(capturedLogs)
      setIsRunning(false)
    }
  }

  // 2. Cloudflare Sandbox Automated Audit & Verification
  const handleCloudflareRegister = async () => {
    if (!toolId) {
      setAuditError('Please save this tool before running the Cloudflare sandbox verification audit.')
      return
    }

    setIsAuditing(true)
    setAuditError(null)
    setAuditResult(null)

    try {
      let parsedArgs: Record<string, any> = {}
      try {
        parsedArgs = JSON.parse(inputArgsJson)
      } catch (err: any) {
        throw new Error(`Invalid Input JSON: ${err.message}`)
      }

      const response = await toolsApi.registerTool(toolId, { inputs: parsedArgs })
      setAuditResult(response)
      if (response.success && onRegisterSuccess) {
        onRegisterSuccess(response)
      }
    } catch (err: any) {
      setAuditError(err.message || 'Cloudflare sandbox registration audit failed')
    } finally {
      setIsAuditing(false)
    }
  }

  return {
    inputArgsJson,
    setInputArgsJson,
    isRunning,
    result,
    error,
    latency,
    logs,
    hasRun,
    isAuditing,
    auditResult,
    auditError,
    inputHeightPercent,
    isResizingVertical,
    setIsResizingVertical,
    sandboxContainerRef,
    handleResetInputs,
    handleFormatJson,
    handleRun,
    handleCloudflareRegister,
  }
}
