'use client'

/**
 * @fileoverview Playground Alias Route (/playground)
 *
 * Redirects to the canonical default home route (/home).
 */

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlaygroundScreen } from '@/components/playground/PlaygroundScreen'

export default function PlaygroundAliasPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/home')
  }, [router])

  return <PlaygroundScreen />
}
