/**
 * @fileoverview WorkspaceShell – Navigation Constants
 */

import { Clock3, MessageSquare, SlidersHorizontal, Sparkles, Wrench } from 'lucide-react'

export interface NavItem {
  label: string
  description: string
  icon: typeof MessageSquare
  href: string
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: 'Chat', description: 'Interactive AI workspace', icon: MessageSquare, href: '/home' },
  { label: 'Tools', description: 'Reusable capabilities & plugins', icon: Wrench, href: '/tools' },
  { label: 'Agent Studio', description: 'Compose & craft playful AI personas', icon: Sparkles, href: '/agents' },
  { label: 'Models', description: 'Configure LLM presets & parameters', icon: SlidersHorizontal, href: '/models' },
  { label: 'History', description: 'Audit past prompts & telemetry', icon: Clock3, href: '/history' },
]
