/**
 * @fileoverview Login API Endpoint
 *
 * POST /auth/login
 * Authenticates user credentials and receives JWT access and refresh tokens.
 */

import { apiClient, tokenStorage } from '../requests'
import { LoginRequest, AuthTokensResponse } from '../types'

/**
 * Authenticate with email and password to receive JWT tokens.
 * Automatically saves the returned tokens into browser storage.
 *
 * @param data - User credentials payload.
 * @returns JWT access and refresh token pair.
 */
export async function login(data: LoginRequest): Promise<AuthTokensResponse> {
  const tokens = await apiClient.post<AuthTokensResponse>('/auth/login', data, { auth: false })
  if (tokens?.accessToken && tokens?.refreshToken) {
    tokenStorage.setTokens(tokens)
  }
  return tokens
}
