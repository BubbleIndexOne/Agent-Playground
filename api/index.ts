/**
 * @fileoverview Backend API Client SDK
 *
 * Central export point for all typed API clients, request wrappers, and schema models.
 */

export * from './types'
export * from './requests'
export * as authApi from './auth'
export * as healthApi from './health'
export * as toolsApi from './tools'
export * as connectorsApi from './connectors'

// Flat convenience re-exports
export { signUp, login, refreshToken, getMe, updateMe, deleteMe } from './auth'
export { getHealth, getDbHealth } from './health'
export {
  getTools,
  getToolById,
  createTool,
  updateTool,
  deleteTool,
  createToolVersion,
  getToolVersions,
  getToolVersion,
  diffToolVersions,
  registerTool,
} from './tools'
export {
  getConnectors,
  saveConnectorCredentials,
  testConnector,
  deleteConnectorCredentials,
} from './connectors'
