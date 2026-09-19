/**
 * @fileoverview Database Health Check Endpoint
 *
 * GET /health/db
 * Retrieves dedicated database connectivity status, latency, and server timestamp.
 */

import { apiClient } from '../requests'
import { DatabaseHealthResponse } from '../types'

/**
 * Fetch direct database connectivity and latency metrics.
 *
 * @param options - Optional custom request options (e.g., abort signal).
 * @returns Database health status with latency in milliseconds.
 */
export async function getDbHealth(options?: { signal?: AbortSignal }): Promise<DatabaseHealthResponse> {
  return apiClient.get<DatabaseHealthResponse>('/health/db', {
    auth: false,
    skipAuthRedirect: true,
    signal: options?.signal,
  })
}
