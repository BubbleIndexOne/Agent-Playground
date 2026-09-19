/**
 * @fileoverview Delete Account API Endpoint
 *
 * DELETE /auth/me
 * Permanently deletes the authenticated user's own account after password confirmation.
 */

import { apiClient, tokenStorage } from '../requests'
import { DeleteAccountRequest, MessageResponse } from '../types'

/**
 * Self-delete current user account with password confirmation.
 * Automatically clears stored credentials upon successful deletion.
 *
 * @param data - Account deletion confirmation containing the current password.
 * @returns Confirmation message upon successful account deletion.
 */
export async function deleteMe(data: DeleteAccountRequest): Promise<MessageResponse> {
  const result = await apiClient.delete<MessageResponse>('/auth/me', data, { auth: true })
  tokenStorage.clearTokens()
  return result
}
