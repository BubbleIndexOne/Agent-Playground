/**
 * @fileoverview Reactive Connectivity & Service Status Notification
 *
 * Pure UI shell for the HealthStatusBanner. Logic is in useHealthStatus.
 */

'use client'

import React from 'react'
import { WifiOff, Radio, CheckCircle2, X, RefreshCw } from 'lucide-react'
import { useHealthStatus } from './useHealthStatus'

export function HealthStatusBanner() {
  const {
    status,
    isDismissed,
    setIsDismissed,
    showRestoredNotice,
    isRetrying,
    handleManualRetry,
  } = useHealthStatus()

  // Don't render if healthy and no temporary restored message, or if user dismissed
  if ((status === 'healthy' && !showRestoredNotice) || isDismissed) {
    return null
  }

  return (
    <aside
      aria-label="System status notification"
      className="fixed top-4 right-4 z-50 pointer-events-none flex max-w-[340px] flex-col transition-all duration-300 animate-in fade-in slide-in-from-top-3"
    >
      <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border/80 bg-card/95 px-3.5 py-3 shadow-xl backdrop-blur-md">
        {/* Status icon */}
        <div className="mt-0.5 shrink-0">
          {status === 'offline' && (
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
              <WifiOff className="size-4" />
            </div>
          )}
          {status === 'server_unreachable' && (
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
              <Radio className="size-4 animate-pulse" />
            </div>
          )}
          {status === 'healthy' && showRestoredNotice && (
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="size-4" />
            </div>
          )}
        </div>

        {/* User-friendly message details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block size-1.5 rounded-full ${
                status === 'offline'
                  ? 'bg-amber-400'
                  : status === 'server_unreachable'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <p className="text-[12px] font-semibold leading-tight text-foreground">
              {status === 'offline'
                ? 'Offline Mode'
                : status === 'server_unreachable'
                ? 'Connecting to Services...'
                : 'Connected'}
            </p>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {status === 'offline'
              ? 'No internet connection detected. Check your network to continue.'
              : status === 'server_unreachable'
              ? 'Unable to reach workspace server. Reconnecting automatically...'
              : 'All workspace services are online.'}
          </p>

          {status === 'server_unreachable' && (
            <button
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`size-3 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Checking...' : 'Check connection'}</span>
            </button>
          )}
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
