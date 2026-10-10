/**
 * @fileoverview Tools API Client Service
 *
 * Implements typed API callers for the backend Tools endpoints according to OpenAPI 3.1.0:
 * - GET /tools (list tools with filters)
 * - POST /tools (create tool shell)
 * - GET /tools/{id} (get tool by ID with current version)
 * - PATCH /tools/{id} (update tool metadata & lifecycle)
 * - DELETE /tools/{id} (soft-archive or admin purge)
 * - POST /tools/{id}/versions (create atomic version)
 * - GET /tools/{id}/versions (list historical versions descending)
 * - GET /tools/{id}/versions/{versionNumber} (get specific version details)
 * - GET /tools/{id}/diff (compare two historical versions)
 * - POST /tools/{id}/register (Cloudflare Sandbox automated audit & verification)
 */

import { apiClient } from './requests'
import {
  CreateTool,
  UpdateTool,
  CreateToolVersion,
  ToolResponse,
  ToolVersionResponse,
  ToolDiffResponse,
  ToolRegisterInput,
  ToolRegistrationResponse,
  MessageResponse,
} from './types'

export interface GetToolsFilterParams {
  include_public?: boolean
  include_archived?: boolean
  type?: 'client' | 'mcp'
  status?: string
}

/**
 * List tools owned by the authenticated caller, optionally including verified public tools.
 */
export async function getTools(
  params?: GetToolsFilterParams,
  options?: { signal?: AbortSignal }
): Promise<ToolResponse[]> {
  const queryParams = new URLSearchParams()
  if (params?.include_public !== undefined) {
    queryParams.set('include_public', String(params.include_public))
  }
  if (params?.include_archived !== undefined) {
    queryParams.set('include_archived', String(params.include_archived))
  }
  if (params?.type) {
    queryParams.set('type', params.type)
  }
  if (params?.status) {
    queryParams.set('status', params.status)
  }

  const query = queryParams.toString()
  const endpoint = query ? `/tools?${query}` : '/tools'
  return apiClient.get<ToolResponse[]>(endpoint, { signal: options?.signal })
}

/**
 * Get full tool details by UUID including its current version payload.
 */
export async function getToolById(
  id: string,
  options?: { signal?: AbortSignal }
): Promise<ToolResponse> {
  return apiClient.get<ToolResponse>(`/tools/${encodeURIComponent(id)}`, {
    signal: options?.signal,
  })
}

/**
 * Create a new tool shell in draft status.
 */
export async function createTool(
  data: CreateTool,
  options?: { signal?: AbortSignal }
): Promise<ToolResponse> {
  return apiClient.post<ToolResponse>('/tools', data, { signal: options?.signal })
}

/**
 * Update tool metadata (name, description, visibility, lifecycle status).
 */
export async function updateTool(
  id: string,
  data: UpdateTool,
  options?: { signal?: AbortSignal }
): Promise<ToolResponse> {
  return apiClient.patch<ToolResponse>(`/tools/${encodeURIComponent(id)}`, data, {
    signal: options?.signal,
  })
}

/**
 * Soft-delete a tool (marks is_archived = true), or admin purge.
 */
export async function deleteTool(
  id: string,
  purge: boolean = false,
  options?: { signal?: AbortSignal }
): Promise<MessageResponse> {
  const query = purge ? '?purge=true' : ''
  return apiClient.delete<MessageResponse>(`/tools/${encodeURIComponent(id)}${query}`, {
    signal: options?.signal,
  })
}

/**
 * Create a new version for a tool atomically.
 */
export async function createToolVersion(
  id: string,
  data: CreateToolVersion,
  options?: { signal?: AbortSignal }
): Promise<ToolVersionResponse> {
  return apiClient.post<ToolVersionResponse>(
    `/tools/${encodeURIComponent(id)}/versions`,
    data,
    { signal: options?.signal }
  )
}

/**
 * List all historical versions of a tool ordered descending.
 */
export async function getToolVersions(
  id: string,
  options?: { signal?: AbortSignal }
): Promise<ToolVersionResponse[]> {
  return apiClient.get<ToolVersionResponse[]>(
    `/tools/${encodeURIComponent(id)}/versions`,
    { signal: options?.signal }
  )
}

/**
 * Get full details of a specific tool version by version number.
 */
export async function getToolVersion(
  id: string,
  versionNumber: number,
  options?: { signal?: AbortSignal }
): Promise<ToolVersionResponse> {
  return apiClient.get<ToolVersionResponse>(
    `/tools/${encodeURIComponent(id)}/versions/${versionNumber}`,
    { signal: options?.signal }
  )
}

/**
 * Compare two historical tool versions for visual diffing.
 */
export async function diffToolVersions(
  id: string,
  from: number,
  to: number,
  options?: { signal?: AbortSignal }
): Promise<ToolDiffResponse> {
  return apiClient.get<ToolDiffResponse>(
    `/tools/${encodeURIComponent(id)}/diff?from=${from}&to=${to}`,
    { signal: options?.signal }
  )
}

/**
 * Run automated sandbox registration audit for client tool inside isolated Cloudflare Sandbox Worker.
 * On pass, transitions tool lifecycle status from draft to registered.
 */
export async function registerTool(
  id: string,
  input?: ToolRegisterInput,
  options?: { signal?: AbortSignal }
): Promise<ToolRegistrationResponse> {
  return apiClient.post<ToolRegistrationResponse>(
    `/tools/${encodeURIComponent(id)}/register`,
    input || {},
    { signal: options?.signal }
  )
}
