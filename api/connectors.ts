/**
 * @fileoverview Connectors & MCP Vault API Client
 *
 * Implements typed API callers for backend connector integrations:
 * - GET /connectors (list configured connectors & previews)
 * - PUT /connectors/{type}/credentials (save encrypted credentials in vault)
 * - POST /connectors/{type}/test (test connector connectivity)
 * - DELETE /connectors/{type} (delete credentials)
 */

import { apiClient } from './requests'
import {
  ConnectorItem,
  PostgresCredentials,
  SlackCredentials,
} from './types'

export type SupportedConnectorType = 'postgres' | 'slack'

export interface GetConnectorsResponse {
  success: boolean
  connectors: ConnectorItem[]
}

export interface SaveConnectorResponse {
  success: boolean
  message: string
  connector: ConnectorItem
}

export interface TestConnectorResponse {
  success: boolean
  message: string
}

export interface DeleteConnectorResponse {
  success: boolean
  message: string
}

/**
 * List configured connector integrations with previews.
 */
export async function getConnectors(options?: {
  signal?: AbortSignal
}): Promise<GetConnectorsResponse> {
  return apiClient.get<GetConnectorsResponse>('/connectors', {
    signal: options?.signal,
  })
}

/**
 * Save encrypted credentials for a connector (e.g. postgres, slack).
 * Pass verify = true to validate connection before persisting.
 */
export async function saveConnectorCredentials(
  type: SupportedConnectorType,
  credentials: PostgresCredentials | SlackCredentials,
  verify: boolean = true,
  options?: { signal?: AbortSignal }
): Promise<SaveConnectorResponse> {
  const query = verify ? '?verify=true' : ''
  return apiClient.put<SaveConnectorResponse>(
    `/connectors/${encodeURIComponent(type)}/credentials${query}`,
    credentials,
    { signal: options?.signal }
  )
}

/**
 * Test connectivity for a connector with supplied credentials or vault-stored credentials.
 */
export async function testConnector(
  type: SupportedConnectorType,
  credentials?: PostgresCredentials | SlackCredentials,
  options?: { signal?: AbortSignal }
): Promise<TestConnectorResponse> {
  return apiClient.post<TestConnectorResponse>(
    `/connectors/${encodeURIComponent(type)}/test`,
    credentials,
    { signal: options?.signal }
  )
}

/**
 * Delete connector credentials from vault.
 */
export async function deleteConnectorCredentials(
  type: SupportedConnectorType,
  options?: { signal?: AbortSignal }
): Promise<DeleteConnectorResponse> {
  return apiClient.delete<DeleteConnectorResponse>(
    `/connectors/${encodeURIComponent(type)}/credentials`,
    undefined,
    { signal: options?.signal }
  )
}
