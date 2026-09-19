/**
 * @fileoverview Root Route (/)
 *
 * Defaults to the Login page for unauthenticated visitors.
 * If an active session cookie/token is detected, automatically routes to /home.
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { tokenStorage } from '@/api/requests'
import LoginPage from '@/app/login/page'
import { LoomIcon } from '@/components/ui/LoomIcon'

export default function RootPage() {
  const router = useRouter()
  const [hasToken, setHasToken] = useState<boolean | null>(null)

  useEffect(() => {
    const authenticated = tokenStorage.hasAuthToken()
    if (authenticated) {
      setHasToken(true)
      router.replace('/home')
    } else {
      setHasToken(false)
    }
  }, [router])

  // While checking auth on initial mount or redirecting to /home
  if (hasToken === true || hasToken === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#070709]">
        <LoomIcon className="size-8 text-indigo-400 animate-pulse" />
      </div>
    )
  }

  // Unauthenticated default is Login
  return <LoginPage />
}
