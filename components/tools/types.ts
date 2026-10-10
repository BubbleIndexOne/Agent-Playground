/**
 * @fileoverview Type Definitions for Tool Builder and Management
 *
 * Defines the schema for tool parameters, runtime sandbox capabilities,
 * MCP service connections, lifecycle creation steps, and header state.
 */

/**
 * Permitted data types for tool input parameters passed to functions or services.
 */
export type ParameterType = 'string' | 'number' | 'boolean' | 'object' | 'array'

/**
 * Definition of an input parameter accepted by a tool.
 */
export interface ToolParameter {
  /** Unique parameter identifier */
  id: string
  /** Variable name for the parameter (must be alphanumeric or underscore) */
  name: string
  /** Data type expected by the tool */
  type: ParameterType
  /** Instructional description provided to the LLM detailing the parameter's purpose */
  description: string
  /** Whether the parameter must be provided by the caller */
  required: boolean
  /** Optional fallback value if the parameter is omitted */
  defaultValue?: string
}

/**
 * Permissions and environment access gates granted to a client-side tool in the sandbox.
 */
export interface ToolCapabilities {
  /** Allows HTTP/fetch and XMLHttpRequest calls to external web endpoints */
  network: boolean
  /** Allows reading and persisting data to browser `localStorage` */
  storage: boolean
  /** Allows accessing mock runtime environment variables */
  environment: boolean
}

/**
 * Configuration payload for connected MCP services and external databases.
 */
export interface ToolServiceConfig {
  /** Service driver or platform type (e.g. 'postgresql', 'slack', 'custom') */
  serviceType: string
  /** Endpoint connection string or URL */
  connectionString: string
}

/**
 * Defines the status lifecycle of a tool on the backend.
 */
export type ToolStatus = 'draft' | 'testing' | 'verified' | 'registered' | 'rejected' | 'deprecated'

/**
 * Definition of a specific version of a tool (code, schema, capabilities).
 */
export interface ToolVersionResponse {
  id: string
  tool_id: string
  version_number: number
  code: string | null
  schema_json: Record<string, any>
  capabilities_json: string[]
  code_hash: string | null
  test_results_json: Record<string, any> | null
  created_at: string
}

/**
 * Complete definition of a workspace tool (client function or connected service).
 * This maps to the backend ToolResponse object.
 */
export interface Tool {
  /** Unique tool identifier */
  id: string
  /** Owner ID of the tool */
  owner_id?: string
  /** Human-readable tool title */
  name: string
  /** Comprehensive tool documentation explaining when and how the AI should invoke it */
  description: string | null
  /** Execution type: browser JavaScript client function or connected MCP service */
  type: 'client' | 'mcp'
  /** Current lifecycle status of the tool */
  status: ToolStatus
  /** Whether the tool is publicly available */
  is_public: boolean
  /** Whether the tool can be executed client-side */
  allow_client_execution: boolean
  /** Connector type for connected external services */
  connector_type: string | null
  /** Current version ID */
  current_version_id: string | null
  /** Current version details (code, schema, etc) */
  current_version: ToolVersionResponse | null
  /** Is the tool archived */
  is_archived?: boolean
  /** Timestamp of creation */
  created_at: string
  /** Timestamp of the last modification */
  updated_at: string

  // --- Legacy fields (kept for UI compatibility, these are mapped in context) ---
  /** Array of declared input parameters for client tools */
  parameters?: ToolParameter[]
  /** Connection details for connected external services */
  serviceConfig?: ToolServiceConfig
  /** Legacy code field */
  code?: string
  /** Legacy capabilities field */
  capabilities?: ToolCapabilities
  /** Legacy published field */
  published?: boolean
}

/**
 * Active modal/editor step in the tool creation workflow:
 * - `none`: Viewing the main tools list.
 * - `choose`: Tool type picker card dialog.
 * - `client`: In-browser client tool editor.
 * - `service`: External service connection modal.
 */
export type CreationStep = 'none' | 'choose' | 'client' | 'service'

/**
 * Filter categories for querying workspace tools.
 */
export type ToolFilter = 'all' | 'client' | 'mcp' | 'verified' | 'draft'

/**
 * Props for the ToolsHeader presentation component.
 */
export interface ToolsHeaderProps {
  /** Active top-level tab ('my-tools' or 'marketplace') */
  activeTab: 'my-tools' | 'marketplace'
  /** Callback triggered when switching tabs */
  onTabChange: (tab: 'my-tools' | 'marketplace') => void
  /** Search query string for filtering tools */
  searchQuery: string
  /** Callback triggered on search input change */
  onSearchChange: (query: string) => void
  /** Currently active filter pill */
  activeFilter: ToolFilter
  /** Callback triggered when a filter pill is selected */
  onFilterChange: (filter: ToolFilter) => void
  /** Callback triggered when the "New Tool" button is clicked */
  onNewTool: () => void
  /** Total count of tools in the workspace */
  toolCount: number
}

