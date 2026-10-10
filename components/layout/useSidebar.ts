/**
 * @fileoverview Layout – useSidebar hook
 *
 * Encapsulates sidebar open/close state, user menu toggle,
 * computed user display values, and active-nav detection.
 */

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function useSidebar() {
  const [open, setOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()

  const isNavActive = (href: string) => {
    if (href === '/home') {
      return pathname === '/home' || pathname === '/playground' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const initials = user
    ? ((user.first_name?.[0] || '') + (user.last_name?.[0] || user.display_name?.[0] || 'U')).toUpperCase()
    : 'U'

  const displayName = user
    ? user.display_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User'
    : 'Guest User'

  const userSubtext = user ? user.email : 'Personal workspace'

  return {
    open,
    setOpen,
    showUserMenu,
    setShowUserMenu,
    isNavActive,
    user,
    logout,
    isLoading,
    initials,
    displayName,
    userSubtext,
  }
}
