/**
 * @fileoverview Get Current User Profile API Endpoint
 *
 * GET /auth/me
 * Retrieves the currently authenticated user's profile information.
 */

import { apiClient } from '../requests'
import { UserProfileResponse } from '../types'

/**
 * Fetch profile information for the currently authenticated user.
 * Sends Bearer token in the Authorization header.
 *
 * @returns User profile data including id, email, names, and timestamps.
 */
export async function getMe(): Promise<UserProfileResponse> {
  return apiClient.get<UserProfileResponse>('/auth/me', { auth: true })
}
