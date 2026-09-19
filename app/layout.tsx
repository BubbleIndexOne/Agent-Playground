/**
 * @fileoverview Root Application Shell & Layout
 *
 * Configures the Next.js App Router root layout:
 * - Loads Google Fonts (Geist Sans & JetBrains Mono for code blocks).
 * - Declares global HTML metadata and mobile viewport settings.
 * - Injects Vercel Analytics in production environments.
 */

import { Analytics } from '@vercel/analytics/next'
import { Geist, JetBrains_Mono } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/context/AuthContext'
import { HealthStatusBanner } from '@/components/health/HealthStatusBanner'
import './globals.css'

/** Primary sans-serif typography font */
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

/** Monospace typography font for code blocks and JSON inspectors */
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

/** Global application metadata for SEO and page title */
export const metadata: Metadata = {
  title: 'Loom — An architecture studio for AI systems',
  description: 'Compose agents, connect tools, and deploy powerful AI systems — all in one place.',
}

/** Global mobile viewport and theme color configuration */
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0A0A0B',
  userScalable: false,
}

/**
 * Root layout component wrapping all application pages.
 *
 * @param props - Layout props containing React children nodes.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="antialiased">
        <AuthProvider>
          <HealthStatusBanner />
          {children}
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
