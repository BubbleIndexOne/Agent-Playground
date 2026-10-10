/**
 * @fileoverview Tools Utils
 */

import { ToolStatus } from './types'

export function getStatusDescription(status: ToolStatus): string {
  switch (status) {
    case 'draft': return 'Tool is in draft status. Run sandbox audit or request publish to verify.'
    case 'testing': return 'Tool is undergoing automated test evaluation in the sandbox.'
    case 'verified': return 'Verified server-side and approved for workspace & public publication.'
    case 'registered': return 'Successfully audited and registered in Cloudflare sandbox.'
    case 'rejected': return 'Audit rejected (schema mismatch, runtime error, or capability violation).'
    case 'deprecated': return 'Tool version has been deprecated.'
    default: return 'Unknown status.'
  }
}
