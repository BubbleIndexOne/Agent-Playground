/**
 * @fileoverview useHealthStatus hook
 */

import { useEffect, useState } from 'react'
import { onNetworkError, onNetworkRestored } from '@/api/requests'
import { getHealth } from '@/api/health'

export type HealthStatus = 'healthy' | 'server_unreachable' | 'offline'

export function useHealthStatus() {
  const [status, setStatus] = useState<HealthStatus>('healthy')
  const [isDismissed, setIsDismissed] = useState(false)
  const [showRestoredNotice, setShowRestoredNotice] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setStatus('offline')
      setIsDismissed(false)
    }

    const handleOnline = () => {
      setStatus('healthy')
      setShowRestoredNotice(true)
      setTimeout(() => setShowRestoredNotice(false), 3000)
    }

    const handleOffline = () => {
      setStatus('offline')
      setIsDismissed(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const unsubscribeError = onNetworkError(() => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setStatus('offline')
      } else {
        setStatus('server_unreachable')
      }
      setIsDismissed(false)
    })

    const unsubscribeRestored = onNetworkRestored(() => {
      setStatus('healthy')
      setShowRestoredNotice(true)
      setTimeout(() => setShowRestoredNotice(false), 3000)
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      unsubscribeError()
      unsubscribeRestored()
    }
  }, [])

  const handleManualRetry = async () => {
    if (isRetrying) return
    setIsRetrying(true)
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setStatus('offline')
        return
      }

      const res = await getHealth()
      if (res?.status === 'ok') {
        setStatus('healthy')
        setShowRestoredNotice(true)
        setTimeout(() => setShowRestoredNotice(false), 3000)
      } else {
        setStatus('server_unreachable')
      }
    } catch {
      setStatus('server_unreachable')
    } finally {
      setIsRetrying(false)
    }
  }

  return {
    status,
    isDismissed,
    setIsDismissed,
    showRestoredNotice,
    isRetrying,
    handleManualRetry,
  }
}
