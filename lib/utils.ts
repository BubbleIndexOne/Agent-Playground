/**
 * @fileoverview Style Utilities
 *
 * Provides className merging utilities for Tailwind CSS combining conditional classes
 * from `clsx` and conflict resolution from `tailwind-merge`.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple conditional class names into a single string and merges conflicting
 * Tailwind CSS utility classes intelligently.
 *
 * @param inputs - Variable list of ClassValue inputs (strings, objects, arrays, falsy values).
 * @returns Clean, de-duplicated string of merged CSS class names.
 *
 * @example
 * ```ts
 * cn('px-2 py-1', isPrimary && 'bg-primary text-white', className)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

