/**
 * @fileoverview Service Health Check Endpoint
 *
 * GET /health
 * Retrieves the overall backend service status, server timestamp, and database connectivity.
 */

import { apiClient } from '../requests'
import { HealthResponse } from '../types'

/**
 * Fetch general health status of the backend service and connected databases.
 *
 * @param options - Optional custom request options (e.g., abort signal).
 * @returns Comprehensive health response containing service status and database latencies.
 */
export async function getHealth(options?: { signal?: AbortSignal }): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('/health', {
    auth: false,
    skipAuthRedirect: true,
    signal: options?.signal,
  })
}
