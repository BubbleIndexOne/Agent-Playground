/**
 * @fileoverview Common HTTP Request Wrapper & Token Management
 *
 * Provides a unified, type-safe fetch client with:
 * - Configurable base URL via NEXT_PUBLIC_API_BASE_URL.
 * - Browser token storage (accessToken & refreshToken).
 * - Automatic Authorization Bearer header injection.
 * - Normalized error handling with ApiError.
 * - Automatic 401 Unauthorized detection and redirection to /login.
 */

import { AuthTokensResponse, ErrorResponse } from './types'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || ''

const ACCESS_TOKEN_KEY = 'ap_access_token'
const REFRESH_TOKEN_KEY = 'ap_refresh_token'

// ─── Token Management ─────────────────────────────────────────────────────────

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  setAccessToken(token: string | null): void {
    if (typeof window === 'undefined') return
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  },
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  setRefreshToken(token: string | null): void {
    if (typeof window === 'undefined') return
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  },
  setTokens(tokens: AuthTokensResponse): void {
    this.setAccessToken(tokens.accessToken)
    this.setRefreshToken(tokens.refreshToken)
  },
  clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

// ─── API Error Class ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  public statusCode: number
  public details: string | string[]

  constructor(statusCode: number, message: string | string[]) {
    const formattedMessage = Array.isArray(message) ? message.join(', ') : message
    super(formattedMessage || `Request failed with status ${statusCode}`)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = message
  }
}

// ─── Unauthorized Event Handling ──────────────────────────────────────────────

type UnauthorizedHandler = () => void
const unauthorizedListeners = new Set<UnauthorizedHandler>()

export function onUnauthorized(handler: UnauthorizedHandler): () => void {
  unauthorizedListeners.add(handler)
  return () => unauthorizedListeners.delete(handler)
}

export function handleUnauthorized(): void {
  tokenStorage.clearTokens()
  unauthorizedListeners.forEach((listener) => {
    try {
      listener()
    } catch {
      // Ignore listener error
    }
  })

  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login'
  }
}

// ─── Reactive Network & Service Health Events ─────────────────────────────────

export interface NetworkErrorInfo {
  statusCode: number
  message: string
}

type NetworkErrorHandler = (error: NetworkErrorInfo) => void
type NetworkRestoredHandler = () => void

const networkErrorListeners = new Set<NetworkErrorHandler>()
const networkRestoredListeners = new Set<NetworkRestoredHandler>()
let hasActiveNetworkFailure = false

export function onNetworkError(handler: NetworkErrorHandler): () => void {
  networkErrorListeners.add(handler)
  return () => networkErrorListeners.delete(handler)
}

export function onNetworkRestored(handler: NetworkRestoredHandler): () => void {
  networkRestoredListeners.add(handler)
  return () => networkRestoredListeners.delete(handler)
}

function notifyNetworkError(statusCode: number, message: string): void {
  hasActiveNetworkFailure = true
  networkErrorListeners.forEach((listener) => {
    try {
      listener({ statusCode, message })
    } catch {
      // Ignore listener errors
    }
  })
}

function notifyNetworkSuccess(): void {
  if (hasActiveNetworkFailure) {
    hasActiveNetworkFailure = false
    networkRestoredListeners.forEach((listener) => {
      try {
        listener()
      } catch {
        // Ignore listener errors
      }
    })
  }
}

// ─── Core Request Execution ───────────────────────────────────────────────────

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
  adminKey?: string
  skipAuthRedirect?: boolean
  _isRetry?: boolean
}

/**
 * Common request client wrapper.
 */
export async function makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers: customHeaders = {},
    body,
    auth = true,
    adminKey,
    skipAuthRedirect = false,
    _isRetry = false,
    ...rest
  } = options

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  }

  // Inject Bearer access token if requested or available
  if (auth) {
    const token = tokenStorage.getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  // Inject Admin key if provided
  if (adminKey) {
    headers['x-admin-key'] = adminKey
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    ...rest,
  }

  if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(url, fetchOptions)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed'
    notifyNetworkError(0, message)
    throw new ApiError(0, message)
  }

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // Avoid recursion on login/refresh calls or already retried requests
    const isAuthEndpoint = cleanEndpoint.startsWith('/auth/login') || cleanEndpoint.startsWith('/auth/refresh')
    if (!_isRetry && !isAuthEndpoint) {
      const refreshToken = tokenStorage.getRefreshToken()
      if (refreshToken) {
        try {
          // Attempt token refresh
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          })

          if (refreshRes.ok) {
            const newTokens: AuthTokensResponse = await refreshRes.json()
            tokenStorage.setTokens(newTokens)

            // Retry original request with new token
            return makeRequest<T>(endpoint, {
              ...options,
              _isRetry: true,
            })
          }
        } catch {
          // Refresh failed, proceed to 401 handling
        }
      }
    }

    if (!skipAuthRedirect) {
      handleUnauthorized()
    }
  }

  // Parse JSON or error body
  let data: any
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const errorResponse = data as ErrorResponse | null
    const message = errorResponse?.message || response.statusText || 'Request failed'
    if (response.status >= 500) {
      notifyNetworkError(response.status, Array.isArray(message) ? message.join(', ') : message)
    }
    throw new ApiError(response.status, message)
  }

  notifyNetworkSuccess()
  return data as T
}

// ─── Convenience Methods ──────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    makeRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    makeRequest<T>(endpoint, { ...options, method: 'POST', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    makeRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    makeRequest<T>(endpoint, { ...options, method: 'DELETE', body }),
}
