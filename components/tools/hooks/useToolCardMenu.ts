import { useState, useRef, useEffect, RefObject } from 'react'

export function useToolCardMenu(): { 
  menuOpen: boolean; 
  setMenuOpen: (open: boolean) => void; 
  menuRef: RefObject<HTMLDivElement | null>;
} {
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
