/**
 * @fileoverview WorkspaceShell – Navigation Constants
 */

import { Bot, Clock3, Play, Settings2, Wrench } from 'lucide-react'

export interface NavItem {
  label: string
  description: string
  icon: typeof Play
  href: string
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: 'Playground', description: 'Experiment with models', icon: Play, href: '/home' },
  { label: 'Tools', description: 'Reusable capabilities', icon: Wrench, href: '/tools' },
  { label: 'Agents', description: 'Automated workflows', icon: Bot, href: '/agents' },
  { label: 'Models', description: 'Configure LLM presets', icon: Settings2, href: '/models' },
  { label: 'History', description: 'Your recent runs', icon: Clock3, href: '/history' },
]
