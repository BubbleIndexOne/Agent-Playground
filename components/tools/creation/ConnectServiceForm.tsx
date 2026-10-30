/**
 * @fileoverview Connected Service Integration Form
 *
 * Form component for configuring external service connections (PostgreSQL database,
 * Slack workspace) adhering to the Model Context Protocol (MCP) pattern.
 * Saves encrypted credentials into the backend vault via PUT /connectors/{type}/credentials
 * and verifies live connectivity via POST /connectors/{type}/test.
 */

import { useState, useEffect } from 'react'
import {
  ChevronDown,
  Database,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Key,
} from 'lucide-react'
import { Tool } from '../types'
import * as connectorsApi from '../../../api/connectors'
import { ConnectorItem, PostgresCredentials, SlackCredentials } from '../../../api/types'

export interface ConnectServiceFormProps {
  initialTool?: Tool | null
  onCancel: () => void
  onSave: (tool: Tool) => void
}

export const SERVICES = [
  { id: 'postgres', name: 'PostgreSQL Database', icon: Database },
  { id: 'slack', name: 'Slack Workspace', icon: MessageSquare },
]

export function ConnectServiceForm({ initialTool, onCancel, onSave }: ConnectServiceFormProps) {
  const [name, setName] = useState(initialTool?.name || '')
  const [description, setDescription] = useState(initialTool?.description || '')
  const [serviceId, setServiceId] = useState<connectorsApi.SupportedConnectorType>(
    (initialTool?.connector_type as connectorsApi.SupportedConnectorType) || 'postgres'
  )

  // Postgres Fields
  const [pgHost, setPgHost] = useState('')
  const [pgPort, setPgPort] = useState(5432)
  const [pgDatabase, setPgDatabase] = useState('')
  const [pgUser, setPgUser] = useState('')
  const [pgPassword, setPgPassword] = useState('')
  const [pgSsl, setPgSsl] = useState(true)
  const [pgUriInput, setPgUriInput] = useState('')

  // Slack Fields
  const [slackBotToken, setSlackBotToken] = useState('')
  const [slackSigningSecret, setSlackSigningSecret] = useState('')

  const [configuredConnectors, setConfiguredConnectors] = useState<ConnectorItem[]>([])
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    latency: number
    message: string
  } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  // Fetch configured connectors from backend vault
  useEffect(() => {
    connectorsApi
      .getConnectors()
      .then((res) => {
        if (res.success && res.connectors) {
          setConfiguredConnectors(res.connectors)
        }
      })
      .catch((err) => {
        console.warn('Could not fetch existing connectors:', err)
      })
  }, [])

  // Auto-parse connection URI when pasted
  const handlePgUriChange = (uri: string) => {
    setPgUriInput(uri)
    try {
      const parsed = new URL(uri)
      if (parsed.protocol.startsWith('postgres')) {
        if (parsed.hostname) setPgHost(parsed.hostname)
        if (parsed.port) setPgPort(parseInt(parsed.port, 10))
        if (parsed.pathname) setPgDatabase(parsed.pathname.replace(/^\//, ''))
        if (parsed.username) setPgUser(decodeURIComponent(parsed.username))
        if (parsed.password) setPgPassword(decodeURIComponent(parsed.password))
        const sslMode = parsed.searchParams.get('sslmode')
        if (sslMode === 'disable') setPgSsl(false)
      }
    } catch {
      // not a full URI yet, let user continue typing
    }
  }

  const isNameValid = name.trim().length > 0
  const isDescValid = description.trim().length > 0

  const areCredentialsValid = () => {
    if (serviceId === 'postgres') {
      return (
        pgHost.trim().length > 0 &&
        pgDatabase.trim().length > 0 &&
        pgUser.trim().length > 0 &&
        pgPassword.length > 0
      )
    }
    if (serviceId === 'slack') {
      return slackBotToken.trim().startsWith('xoxb-')
    }
    return false
  }

  const isValid = isNameValid && isDescValid && areCredentialsValid()

  const getCredentialsPayload = (): PostgresCredentials | SlackCredentials => {
    if (serviceId === 'postgres') {
      return {
        host: pgHost.trim(),
        port: pgPort || 5432,
        database: pgDatabase.trim(),
        user: pgUser.trim(),
        password: pgPassword,
        ssl: pgSsl,
      }
    }
    return {
      botToken: slackBotToken.trim(),
      signingSecret: slackSigningSecret.trim() || undefined,
    }
  }

  const handleTestConnection = async () => {
    if (!areCredentialsValid()) {
      setShowValidation(true)
      return
    }

    setIsTesting(true)
    setTestResult(null)
    setActionError(null)

    const startTime = performance.now()
    try {
      const creds = getCredentialsPayload()
      const res = await connectorsApi.testConnector(serviceId, creds)
      const elapsed = Math.round(performance.now() - startTime)
      setTestResult({
        success: res.success,
        latency: elapsed,
        message: res.message || `Connected to ${serviceId} successfully.`,
      })
    } catch (err: any) {
      setActionError(err.message || 'Connection test failed')
    } finally {
      setIsTesting(false)
    }
  }

  const handleSaveClick = async () => {
    if (!isValid) {
      setShowValidation(true)
      return
    }

    setIsSaving(true)
    setActionError(null)

    try {
      // 1. Save and verify credentials directly in backend vault
      const creds = getCredentialsPayload()
      await connectorsApi.saveConnectorCredentials(serviceId, creds, true)

      // 2. Build Tool object
      const toolToSave: Tool = {
        id: initialTool?.id || Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        description: description.trim(),
        type: 'mcp',
        published: initialTool ? initialTool.published : false,
        serviceConfig: {
          serviceType: serviceId,
          connectionString: '',
        },
        status: initialTool?.status || 'draft',
        is_public: initialTool?.is_public || false,
        allow_client_execution: initialTool?.allow_client_execution || false,
        connector_type: serviceId,
        current_version_id: initialTool?.current_version_id || null,
        current_version: initialTool?.current_version || null,
        created_at: initialTool?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      onSave(toolToSave)
    } catch (err: any) {
      setActionError(err.message || 'Failed to save credentials to vault')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col mx-auto max-w-xl w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border p-6 bg-background/50">
        <h3 className="text-[18px] font-semibold tracking-[-0.025em] text-foreground">
          {initialTool ? 'Edit Connected Service' : 'Connect a Service'}
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Link an external database or messaging platform via Model Context Protocol (MCP).
        </p>
      </div>

      <div className="p-6 flex flex-col gap-5">
        {showValidation && !isValid && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-[12px] text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              {serviceId === 'slack' && !slackBotToken.trim().startsWith('xoxb-')
                ? 'Slack bot token must start with "xoxb-"'
                : 'Please fill out all required fields.'}
            </span>
          </div>
        )}

        {/* Existing Vault Connectors info if present */}
        {configuredConnectors.length > 0 && (
          <div className="rounded-lg border border-border/80 bg-accent/40 p-3 flex flex-col gap-1.5 text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Key className="size-3.5 text-primary" /> Active Vault Connectors
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {configuredConnectors.map((c, i) => (
                <span
                  key={i}
                  className="rounded bg-background px-2 py-0.5 border border-border/60 text-muted-foreground font-mono"
                >
                  {c.connector_type}: {c.preview || 'Configured'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Service Type */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-foreground">Service Driver</label>
          <div className="relative">
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value as connectorsApi.SupportedConnectorType)}
              className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
          </div>
        </div>

        {/* Tool Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-foreground">Tool Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Analytics Postgres DB"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-foreground">
            Documentation (Provided to AI Agent)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Explain to the AI agent what tables, queries, or actions this service supports..."
            className="w-full resize-none rounded-lg border border-border bg-background p-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Credentials Form Section */}
        {serviceId === 'postgres' && (
          <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-accent/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-foreground">PostgreSQL Credentials</span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !areCredentialsValid()}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {isTesting ? <Activity className="size-3 animate-spin" /> : null}
                Test Connection
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">Quick Paste URI (Optional)</label>
              <input
                type="text"
                value={pgUriInput}
                onChange={(e) => handlePgUriChange(e.target.value)}
                placeholder="postgres://user:password@host:5432/database"
                className="h-8 w-full rounded border border-border bg-background px-2.5 font-mono text-[11px] text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[11px] text-muted-foreground">Host *</label>
                <input
                  type="text"
                  value={pgHost}
                  onChange={(e) => setPgHost(e.target.value)}
                  placeholder="db.example.com"
                  className="h-8 w-full rounded border border-border bg-background px-2.5 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-muted-foreground">Port</label>
                <input
                  type="number"
                  value={pgPort}
                  onChange={(e) => setPgPort(parseInt(e.target.value, 10) || 5432)}
                  className="h-8 w-full rounded border border-border bg-background px-2.5 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-muted-foreground">Database *</label>
                <input
                  type="text"
                  value={pgDatabase}
                  onChange={(e) => setPgDatabase(e.target.value)}
                  placeholder="main"
                  className="h-8 w-full rounded border border-border bg-background px-2.5 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-muted-foreground">User *</label>
                <input
                  type="text"
                  value={pgUser}
                  onChange={(e) => setPgUser(e.target.value)}
                  placeholder="postgres"
                  className="h-8 w-full rounded border border-border bg-background px-2.5 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">Password *</label>
              <input
                type="password"
                value={pgPassword}
                onChange={(e) => setPgPassword(e.target.value)}
                placeholder="••••••••"
                className="h-8 w-full rounded border border-border bg-background px-2.5 text-[12px] text-foreground outline-none focus:border-primary"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={pgSsl}
                onChange={(e) => setPgSsl(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-[11px] text-foreground">Require SSL</span>
            </label>
          </div>
        )}

        {serviceId === 'slack' && (
          <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-accent/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-foreground">Slack Workspace Credentials</span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !areCredentialsValid()}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {isTesting ? <Activity className="size-3 animate-spin" /> : null}
                Test Connection
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">Bot User OAuth Token (xoxb-...) *</label>
              <input
                type="password"
                value={slackBotToken}
                onChange={(e) => setSlackBotToken(e.target.value)}
                placeholder="xoxb-your-token-here"
                className="h-8 w-full rounded border border-border bg-background px-2.5 font-mono text-[12px] text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">Signing Secret (Optional)</label>
              <input
                type="password"
                value={slackSigningSecret}
                onChange={(e) => setSlackSigningSecret(e.target.value)}
                placeholder="Signing secret for event verification"
                className="h-8 w-full rounded border border-border bg-background px-2.5 text-[12px] text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Test connection result pill */}
        {testResult && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-[12px] text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{testResult.message}</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] opacity-80">
              <Clock className="size-3" />
              {testResult.latency}ms
            </span>
          </div>
        )}

        {actionError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-[12px] text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      <div className="border-t border-border p-6 flex items-center justify-between bg-background/50 rounded-b-xl mt-auto">
        <button
          type="button"
          onClick={onCancel}
          className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? <Activity className="size-4 animate-spin" /> : null}
          {initialTool ? 'Update Service' : 'Connect Service'}
        </button>
      </div>
    </div>
  )
}
