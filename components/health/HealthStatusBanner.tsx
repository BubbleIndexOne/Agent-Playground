/**
 * @fileoverview Non-Intrusive Health & Connectivity Status Notification
 *
 * Polls backend /health endpoint every 5-6 seconds to monitor server status.
 * Intelligently detects and differentiates between:
 * - Client network loss (navigator.onLine === false).
 * - Server unreachable or unhealthy status.
 *
 * Renders a discreet top-right floating pill that does not interrupt usability.
 */

'use client'

import React, { useEffect, useState, useRef } from 'react'
import { WifiOff, ServerCrash, CheckCircle2, X } from 'lucide-react'
import { getHealth } from '@/api/health'

type HealthStatus = 'healthy' | 'server_unreachable' | 'offline'

export function HealthStatusBanner() {
  const [status, setStatus] = useState<HealthStatus>('healthy')
  const [isDismissed, setIsDismissed] = useState(false)
  const [wasUnhealthy, setWasUnhealthy] = useState(false)
  const [showRestoredNotice, setShowRestoredNotice] = useState(false)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let isMounted = true

    const checkStatus = async () => {
      // 1. Check browser network connectivity
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        if (isMounted) {
          setStatus('offline')
          setWasUnhealthy(true)
          setIsDismissed(false)
        }
        return
      }

      // 2. Ping backend health check
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 4000)

        const response = await getHealth({ signal: controller.signal })
        clearTimeout(timeoutId)

        if (!isMounted) return

        if (response && response.status === 'ok') {
          if (wasUnhealthy) {
            // Briefly show restored indicator
            setShowRestoredNotice(true)
            setTimeout(() => {
              if (isMounted) setShowRestoredNotice(false)
            }, 3000)
          }
          setStatus('healthy')
          setWasUnhealthy(false)
        } else {
          setStatus('server_unreachable')
          setWasUnhealthy(true)
          setIsDismissed(false)
        }
      } catch {
        if (!isMounted) return
        setStatus('server_unreachable')
        setWasUnhealthy(true)
        setIsDismissed(false)
      }
    }

    // Run immediately on mount
    checkStatus()

    // Setup 5.5-second polling interval
    pollTimerRef.current = setInterval(checkStatus, 5500)

    const handleOnline = () => checkStatus()
    const handleOffline = () => {
      setStatus('offline')
      setWasUnhealthy(true)
      setIsDismissed(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      isMounted = false
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasUnhealthy])

  // Don't render if healthy and no temporary restored message, or if user dismissed
  if ((status === 'healthy' && !showRestoredNotice) || isDismissed) {
    return null
  }

  return (
    <aside
      aria-label="System status notification"
      className="fixed top-4 right-4 z-50 pointer-events-none flex max-w-[340px] flex-col transition-all duration-300 animate-in fade-in slide-in-from-top-3"
    >
      <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border/80 bg-card/90 px-3.5 py-3 shadow-xl backdrop-blur-md">
        {/* Status icon with pulse */}
        <div className="mt-0.5 shrink-0">
          {status === 'offline' && (
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
              <WifiOff className="size-4" />
            </div>
          )}
          {status === 'server_unreachable' && (
            <div className="flex size-7 items-center justify-center rounded-lg bg-red-500/15 text-red-400 ring-1 ring-red-500/30">
              <ServerCrash className="size-4" />
            </div>
          )}
          {status === 'healthy' && showRestoredNotice && (
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="size-4" />
            </div>
          )}
        </div>

        {/* Message details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block size-1.5 rounded-full ${
                status === 'offline'
                  ? 'bg-amber-400 animate-pulse'
                  : status === 'server_unreachable'
                  ? 'bg-red-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <p className="text-[12px] font-semibold leading-tight text-foreground">
              {status === 'offline'
                ? 'No Internet Connection'
                : status === 'server_unreachable'
                ? 'Backend Unavailable'
                : 'Connection Restored'}
            </p>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {status === 'offline'
              ? 'Check your network. Requests may fail until you reconnect.'
              : status === 'server_unreachable'
              ? 'Cannot reach backend API. Retrying in background...'
              : 'Backend service and databases are responding normally.'}
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss notification"
          className="ml-1 -mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </aside>
  )
}
