/**
 * @fileoverview Tools Utils
 */

import { ToolStatus } from './types'

export function getStatusDescription(status: ToolStatus): string {
  switch (status) {
    case 'draft': return 'Tool is in development and not yet ready for use.'
    case 'testing': return 'Tool is currently being tested.'
    case 'verified': return 'Tool has been verified and is ready for use.'
    case 'registered': return 'Tool is registered in the MCP directory.'
    case 'rejected': return 'Tool verification failed or was rejected.'
    case 'deprecated': return 'Tool is no longer supported or recommended.'
    default: return 'Unknown status.'
  }
}
