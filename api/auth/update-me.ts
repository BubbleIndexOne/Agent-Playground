/**
 * @fileoverview Update Current User Profile API Endpoint
 *
 * PATCH /auth/me
 * Updates profile fields (names) and/or changes password for the authenticated user.
 */

import { apiClient } from '../requests'
import { UpdateProfileRequest, UserProfileResponse } from '../types'

/**
 * Update authenticated user's profile details and/or password.
 *
 * @param data - Partial profile updates or password change payload.
 * @returns Updated user profile data.
 */
export async function updateMe(data: UpdateProfileRequest): Promise<UserProfileResponse> {
  return apiClient.patch<UserProfileResponse>('/auth/me', data, { auth: true })
}
