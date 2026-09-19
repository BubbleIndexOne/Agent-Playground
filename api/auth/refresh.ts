/**
 * @fileoverview Refresh Token API Endpoint
 *
 * POST /auth/refresh
 * Exchanges a valid refresh token for a new access and refresh token pair.
 */

import { apiClient, tokenStorage } from '../requests'
import { RefreshTokenRequest, AuthTokensResponse } from '../types'

/**
 * Refresh expired access token using a valid refresh token.
 * Automatically updates tokens in browser storage upon success.
 *
 * @param data - Refresh token payload. If not provided, reads from storage.
 * @returns New JWT access and refresh token pair.
 */
export async function refreshToken(data?: RefreshTokenRequest): Promise<AuthTokensResponse> {
  const token = data?.refreshToken || tokenStorage.getRefreshToken()
  if (!token) {
    throw new Error('No refresh token available')
  }

  const tokens = await apiClient.post<AuthTokensResponse>(
    '/auth/refresh',
    { refreshToken: token },
    { auth: false }
  )

  if (tokens?.accessToken && tokens?.refreshToken) {
    tokenStorage.setTokens(tokens)
  }
  return tokens
}
