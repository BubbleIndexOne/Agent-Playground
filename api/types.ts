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
