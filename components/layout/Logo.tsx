'use client'

/**
 * @fileoverview Logo – Workspace brand component.
 */

import Link from 'next/link'
import { LoomIcon } from '@/components/ui/LoomIcon'

export function Logo() {
  return (
    <Link href="/home" className="flex items-center gap-2.5">
      <LoomIcon className="size-6 text-primary transition-transform hover:scale-105" />
      <span className="text-[16px] font-semibold tracking-[-0.02em] text-foreground">Loom</span>
    </Link>
  )
}
