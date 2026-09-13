/**
 * @fileoverview Custom Hook for Tool Card Dropdown Menu Management
 *
 * Manages the open/closed state of the three-dots action menu on a ToolCard
 * and automatically dismisses the menu when clicking outside the target element.
 */

import { useState, useRef, useEffect, RefObject } from 'react'

/**
 * Return type for the `useToolCardMenu` hook.
 */
export interface UseToolCardMenuReturn {
  /** Whether the context menu dropdown is currently visible */
  menuOpen: boolean
  /** State updater to toggle or set menu visibility */
  setMenuOpen: (open: boolean) => void
  /** React ref to attach to the dropdown container element to detect clicks outside */
  menuRef: RefObject<HTMLDivElement | null>
}

/**
 * Hook providing dropdown state management with automatic outside-click dismissal.
 *
 * @returns An object containing `menuOpen`, `setMenuOpen`, and the `menuRef` container ref.
 */
export function useToolCardMenu(): UseToolCardMenuReturn {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return { menuOpen, setMenuOpen, menuRef }
}

