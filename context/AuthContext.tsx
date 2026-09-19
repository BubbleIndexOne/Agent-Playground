/**
 * @fileoverview Authentication State Management & Context Provider
 *
 * Coordinates session lifecycle across the frontend:
 * - Bootstraps current user profile via getMe().
 * - Automatically redirects to /login on 401 Unauthorized responses.
 * - Exposes unified authentication controls (login, signUp, logout, refreshUser).
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  UserProfileResponse,
  LoginRequest,
  SignUpRequest,
  SignUpResponse,
  AuthTokensResponse,
} from '@/api/types'
import { getMe, login as apiLogin, signUp as apiSignUp } from '@/api/auth'
import { tokenStorage, onUnauthorized, ApiError } from '@/api/requests'

interface AuthContextType {
  user: UserProfileResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (data: LoginRequest) => Promise<AuthTokensResponse>
  signUp: (data: SignUpRequest) => Promise<SignUpResponse>
  logout: () => void
  refreshUser: () => Promise<UserProfileResponse | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const redirectToLogin = useCallback(() => {
    if (pathname && !pathname.startsWith('/login')) {
      router.push('/login')
    }
  }, [pathname, router])

  const refreshUser = useCallback(async (): Promise<UserProfileResponse | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const profile = await getMe()
      setUser(profile)
      return profile
    } catch (err) {
      setUser(null)
      if (err instanceof ApiError && err.statusCode === 401) {
        tokenStorage.clearTokens()
        redirectToLogin()
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch user profile')
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [redirectToLogin])

  // Bootstrap session on mount
  useEffect(() => {
    // Subscribe to unauthorized signals from any API call
    const unsubscribe = onUnauthorized(() => {
      setUser(null)
      redirectToLogin()
    })

    // If currently on login page, skip aggressive initial getMe() to avoid immediate loop
    if (pathname?.startsWith('/login')) {
      setIsLoading(false)
      return unsubscribe
    }

    // Call getMe() to verify session
    refreshUser()

    return unsubscribe
  }, [pathname, refreshUser, redirectToLogin])

  const handleLogin = async (data: LoginRequest): Promise<AuthTokensResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      const tokens = await apiLogin(data)
      await refreshUser()
      router.push('/home')
      return tokens
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      return await apiSignUp(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    tokenStorage.clearTokens()
    setUser(null)
    redirectToLogin()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        login: handleLogin,
        signUp: handleSignUp,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
