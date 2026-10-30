/**
 * @fileoverview API Types & Data Contracts
 *
 * Generated according to the backend OpenAPI 3.1.0 specification.
 * Corresponds to Milestone S1: Authentication and System Health.
 */

// ─── Authentication Schemas ───────────────────────────────────────────────────

export interface SignUpRequest {
  email: string
  password: string
  first_name: string
  middle_name?: string | null
  last_name?: string | null
  display_name?: string | null
}

export interface SignUpResponse {
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthTokensResponse {
  accessToken: string
  refreshToken: string
}

export interface UserProfileResponse {
  id: string
  email: string
  first_name: string
  middle_name?: string | null
  last_name?: string | null
  display_name?: string | null
  created_at?: string
}

export interface UpdateProfileRequest {
  first_name?: string
  middle_name?: string | null
  last_name?: string | null
  display_name?: string | null
  current_password?: string
  new_password?: string
}

export interface DeleteAccountRequest {
  password: string
}

export interface MessageResponse {
  message: string
}

// ─── Health Schemas ───────────────────────────────────────────────────────────

export interface DatabaseHealthResponse {
  environment: string
  status: string
  currentTime: string
  latencyMs: number
}

export interface HealthResponse {
  status: string
  timestamp: string
  databases: DatabaseHealthResponse[]
}

// ─── Error Schemas ────────────────────────────────────────────────────────────

export interface ErrorResponse {
  statusCode: number
  message: string | string[]
}

// ─── Tool & Version Schemas ───────────────────────────────────────────────────

export type ToolStatus =
  | 'draft'
  | 'testing'
  | 'verified'
  | 'registered'
  | 'rejected'
  | 'deprecated'

export type ToolType = 'client' | 'mcp'

export interface CreateTool {
  name: string
  description?: string | null
  type: ToolType
  connector_type?: string | null
  is_public?: boolean
  allow_client_execution?: boolean
}

export interface UpdateTool {
  name?: string
  description?: string | null
  is_public?: boolean
  allow_client_execution?: boolean
  status?: ToolStatus
}

export interface CreateToolVersion {
  code?: string | null
  schema_json: Record<string, any>
  capabilities_json?: string[]
  test_results_json?: Record<string, any> | null
}

export interface ToolVersionResponse {
  id: string
  tool_id: string
  version_number: number
  code: string | null
  schema_json: Record<string, any>
  capabilities_json: string[]
  code_hash: string | null
  test_results_json: Record<string, any> | null
  created_at: string
}

export interface ToolResponse {
  id: string
  owner_id: string
  is_owner?: boolean
  name: string
  description: string | null
  type: ToolType
  status: ToolStatus
  is_public: boolean
  allow_client_execution: boolean
  connector_type: string | null
  current_version_id: string | null
  is_archived?: boolean
  created_at: string
  updated_at: string
  current_version: ToolVersionResponse | null
}

export interface ToolDiffResponse {
  tool_id: string
  from: ToolVersionResponse
  to: ToolVersionResponse
  diff: {
    code_changed: boolean
    schema_changed: boolean
  }
}

export interface ToolRegisterInput {
  inputs?: Record<string, any>
}

export interface ToolRegistrationTestResults {
  status: 'passed' | 'failed'
  result?: any
  observedCalls?: string[]
  durationMs?: number
  inputsUsed?: Record<string, any>
  timestamp: string
  reason?: string | null
  details?: any
}

export interface ToolRegistrationResponse {
  success: boolean
  message: string
  testResults: ToolRegistrationTestResults
}

// ─── Connector Schemas ────────────────────────────────────────────────────────

export interface PostgresCredentials {
  host: string
  port?: number
  database: string
  user: string
  password: string
  ssl?: boolean
}

export interface SlackCredentials {
  botToken: string
  signingSecret?: string
}

export interface ConnectorItem {
  id?: string
  connector_type?: string
  preview?: string
  key_version?: number
  created_at?: string
  updated_at?: string
}
