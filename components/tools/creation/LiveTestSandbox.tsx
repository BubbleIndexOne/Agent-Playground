import { useState, useEffect } from 'react'
import { Play, Activity, CheckCircle2, AlertCircle, Clock, RotateCcw, Terminal } from 'lucide-react'
import { ToolParameter, ToolCapabilities } from '../types'

interface LiveTestSandboxProps {
  code: string
  parameters: ToolParameter[]
  capabilities: ToolCapabilities
  toolName: string
}

export function LiveTestSandbox({ code, parameters, capabilities, toolName }: LiveTestSandboxProps) {
  const [inputArgsJson, setInputArgsJson] = useState('{}')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [hasRun, setHasRun] = useState(false)

  // Generate sensible default JSON mock values based on parameters
  const generateDefaultArgs = () => {
    const defaultObj: Record<string, any> = {}
    parameters.forEach(p => {
      if (p.name.trim()) {
        switch (p.type) {
          case 'number':
            defaultObj[p.name] = 42
            break
          case 'boolean':
            defaultObj[p.name] = true
            break
          case 'object':
            defaultObj[p.name] = { sampleKey: 'sampleValue' }
            break
          case 'array':
            defaultObj[p.name] = ['item1', 'item2']
            break
          case 'string':
          default:
            defaultObj[p.name] = p.defaultValue || (p.name.toLowerCase().includes('location') ? 'London' : `test_${p.name}`)
            break
        }
      }
    })
    return JSON.stringify(defaultObj, null, 2)
  }

  // Populate mock arguments whenever parameters change initially
  useEffect(() => {
    setInputArgsJson(generateDefaultArgs())
  }, [parameters])

  const handleResetInputs = () => {
    setInputArgsJson(generateDefaultArgs())
  }

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
      // 1. Validate JSON args
      let parsedArgs = {}
      try {
        parsedArgs = JSON.parse(inputArgsJson)
      } catch (err: any) {
        throw new Error(`Invalid Input JSON: ${err.message}`)
      }

      // 2. Build Sandboxed Scope / Capabilities Enforcers
      const customConsole = {
        log: (...args: any[]) => {
          const formatted = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
          capturedLogs.push(`[LOG] ${formatted}`)
        },
        warn: (...args: any[]) => {
          const formatted = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
          capturedLogs.push(`[WARN] ${formatted}`)
        },
        error: (...args: any[]) => {
          const formatted = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
          capturedLogs.push(`[ERROR] ${formatted}`)
        },
      }

      // Enforce Network capability
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
              throw new Error("Permission Denied: Network access is disabled for this tool.")
            }
          }

      // Enforce Storage capability
      const customLocalStorage = capabilities.storage
        ? window.localStorage
        : new Proxy(
            {},
            {
              get() {
                throw new Error("Permission Denied: Local storage access is disabled for this tool. Enable 'Local Storage' in the Permissions tab.")
              },
            }
          )

      // Enforce Environment capability
      const customEnv = capabilities.environment
        ? { NODE_ENV: 'development', RUNTIME: 'browser-sandbox' }
        : new Proxy(
            {},
            {
              get() {
                throw new Error("Permission Denied: Environment access is disabled for this tool. Enable 'Environment Variables' in the Permissions tab.")
              },
            }
          )

      // 3. Extract executable function body
      let cleanCode = code
      // Extract function body if formatted as export async function execute(...) { ... }
      if (/function\s+execute\s*\(/.test(cleanCode)) {
        const match = cleanCode.match(/function\s+execute\s*\([^)]*\)\s*\{([\s\S]*)\}/)
        if (match && match[1]) {
          cleanCode = match[1]
        }
      } else if (/const\s+execute\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/.test(cleanCode)) {
        const match = cleanCode.match(/const\s+execute\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{([\s\S]*)\}/)
        if (match && match[1]) {
          cleanCode = match[1]
        }
      }

      // 4. Construct Async Sandbox runner with timeout
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

      // 8-second timeout promise
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

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-[13px] font-semibold text-foreground">Live Sandbox Runner</h4>
            {!capabilities.network && (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                Network Blocked
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Execute this tool client-side with mock inputs and capability sandboxing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetInputs}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Reset to default mock parameters"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
          <button
            type="button"
            id="run-sandbox-test-btn"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isRunning ? <Activity className="size-3.5 animate-spin" /> : <Play className="size-3.5 fill-current" />}
            Run Test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-[240px]">
        {/* Input parameters editor */}
        <div className="flex flex-col rounded-lg border border-border bg-background/60 p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span>Input Arguments (JSON)</span>
            <span className="font-mono text-[10px] text-primary select-none">args</span>
          </div>
          <textarea
            id="sandbox-input-json"
            value={inputArgsJson}
            onChange={e => setInputArgsJson(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full resize-none rounded border border-border/70 bg-card p-2.5 font-mono text-[11px] text-foreground outline-none focus:border-primary/50"
            placeholder="{\n  &quot;param&quot;: &quot;value&quot;\n}"
          />
        </div>

        {/* Execution Output console */}
        <div className="flex flex-col rounded-lg border border-border bg-background/60 p-3 overflow-hidden">
          <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span>Execution Output</span>
            {latency !== null && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                <Clock className="size-3 text-primary" />
                {latency}ms
              </span>
            )}
          </div>

          <div id="sandbox-output-console" className="flex-1 overflow-auto rounded border border-border/70 bg-card p-3 font-mono text-[11px]">
            {isRunning ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Activity className="size-4 animate-spin text-primary" />
                <span className="text-[11px]">Executing tool function...</span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-semibold">Execution Error:</span>
                  <span className="whitespace-pre-wrap mt-1 leading-relaxed">{error}</span>
                </div>
              </div>
            ) : result !== null ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold">
                    <CheckCircle2 className="size-3.5" />
                    <span>SUCCESS (200 OK)</span>
                  </div>
                </div>

                {logs.length > 0 && (
                  <div className="rounded bg-background/80 p-2 border border-border/60 text-[10px] text-muted-foreground flex flex-col gap-1">
                    <span className="flex items-center gap-1 font-semibold text-foreground text-[9px] uppercase tracking-wider">
                      <Terminal className="size-2.5" /> Console Logs
                    </span>
                    {logs.map((l, i) => (
                      <span key={i} className="font-mono">
                        {l}
                      </span>
                    ))}
                  </div>
                )}

                <pre className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
                </pre>
              </div>
            ) : hasRun ? (
              <span className="text-muted-foreground">Execution completed with undefined return.</span>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground/70">
                <p>Click &quot;Run Test&quot; to execute &quot;{toolName || 'Tool'}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
