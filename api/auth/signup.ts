/**
 * @fileoverview Sign Up API Endpoint
 *
 * POST /auth/signup
 * Registers a new user account.
 */

import { apiClient } from '../requests'
import { SignUpRequest, SignUpResponse } from '../types'

/**
 * Register a new user account with email, password, and profile names.
 *
 * @param data - User registration payload.
 * @returns Success message upon registration.
 */
export async function signUp(data: SignUpRequest): Promise<SignUpResponse> {
  return apiClient.post<SignUpResponse>('/auth/signup', data, { auth: false })
}
