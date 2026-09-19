/**
 * @fileoverview Backend API Client SDK
 *
 * Central export point for all typed API clients, request wrappers, and schema models.
 */

export * from './types'
export * from './requests'
export * as authApi from './auth'
export * as healthApi from './health'

// Flat convenience re-exports
export { signUp, login, refreshToken, getMe, updateMe, deleteMe } from './auth'
export { getHealth, getDbHealth } from './health'
