/**
 * @fileoverview Workspace Shell & Unified Layout
 *
 * Provides the persistent outer shell with a responsive sidebar and route-based navigation:
 * - Playground -> /home
 * - Tools -> /tools
 * - Agents -> /agents
 * - History -> /history
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bot,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Menu,
  Play,
  Settings2,
  Wrench,
  X,
  LogOut,
  User,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

/** Navigation items specification */
export const NAVIGATION_ITEMS = [
  { label: 'Playground', description: 'Experiment with models', icon: Play, href: '/home' },
  { label: 'Tools', description: 'Reusable capabilities', icon: Wrench, href: '/tools' },
  { label: 'Agents', description: 'Automated workflows', icon: Bot, href: '/agents' },
  { label: 'History', description: 'Your recent runs', icon: Clock3, href: '/history' },
]

/**
 * Workspace brand logo component.
 */
export function Logo() {
  return (
    <Link href="/home" className="flex items-center gap-3">
      <div className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
        <Command className="size-4" strokeWidth={2.5} />
      </div>
      <span className="text-[15px] font-semibold tracking-[-0.02em]">Console</span>
    </Link>
  )
}

/**
 * Responsive navigation sidebar with active URL detection.
 */
export function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isNavActive = (href: string) => {
    if (href === '/home') {
      return pathname === '/home' || pathname === '/playground' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const { user, logout, isLoading } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const initials = user
    ? ((user.first_name?.[0] || '') + (user.last_name?.[0] || user.display_name?.[0] || 'U')).toUpperCase()
    : 'U'
  const displayName = user
    ? user.display_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User'
    : 'Guest User'
  const userSubtext = user ? user.email : 'Personal workspace'

  return (
    <>
      <button
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-20 flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-4" />
      </button>

      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-background/70 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r border-border bg-sidebar px-3 py-5 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-3">
          <Logo />
          <button
            aria-label="Close navigation"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent md:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-9 flex flex-col gap-6">
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Workspace
            </p>
            <nav aria-label="Main navigation" className="flex flex-col gap-1">
              {NAVIGATION_ITEMS.map(({ label, description, icon: Icon, href }) => {
                const selected = isNavActive(href)
                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      selected
                        ? 'bg-primary/[0.1] text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                    aria-current={selected ? 'page' : undefined}
                  >
                    <Icon
                      className={`size-[17px] shrink-0 ${
                        selected
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                      strokeWidth={selected ? 2.3 : 1.8}
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[13px] font-medium leading-4">{label}</span>
                      <span className="truncate text-[11px] leading-4 text-muted-foreground">
                        {description}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Resources
            </p>
            <Link
              href="/history"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <CircleHelp className="size-[17px]" strokeWidth={1.8} />
              <span className="text-[13px] font-medium">Documentation</span>
            </Link>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <Settings2 className="size-[17px]" strokeWidth={1.8} />
            <span className="text-[13px] font-medium">Settings</span>
          </button>

          <div className="relative mt-2">
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              aria-label="User profile options"
              className="flex w-full items-center gap-3 rounded-lg bg-accent/60 px-3 py-2.5 text-left transition-colors hover:bg-accent"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                {isLoading ? '...' : initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-foreground">
                  {isLoading ? 'Loading...' : displayName}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {isLoading ? 'Fetching profile...' : userSubtext}
                </p>
              </div>
              <ChevronDown
                className={`ml-auto size-3.5 text-muted-foreground transition-transform duration-150 ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 mb-1.5 w-full rounded-lg border border-border bg-card p-1 shadow-lg backdrop-blur-md">
                {user ? (
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign out</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setShowUserMenu(false)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <User className="size-3.5 text-muted-foreground" />
                    <span>Sign in / Register</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

/**
 * Common workspace wrapper surrounding route pages with the sidebar.
 */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
