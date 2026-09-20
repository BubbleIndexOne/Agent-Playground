import fs from 'node:fs'
import path from 'node:path'

/**
 * Resolves NEXT_PUBLIC_API_BASE_URL dynamically from wrangler.toml per environment.
 * Priority:
 * 1. CLI / process.env override (if explicitly provided)
 * 2. [env.<targetEnv>.vars] from wrangler.toml (dev vs production)
 * 3. [vars] default section from wrangler.toml
 */
function resolveWranglerApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL
  }

  try {
    const wranglerPath = path.resolve(process.cwd(), 'wrangler.toml')
    if (!fs.existsSync(wranglerPath)) {
      return ''
    }

    const content = fs.readFileSync(wranglerPath, 'utf8')
    const targetEnv =
      process.env.CF_ENV ||
      process.env.APP_ENV ||
      'dev'

    const extractVarFromSection = (sectionName, key) => {
      const escapedSection = sectionName.replace(/\./g, '\\.')
      const regex = new RegExp(`\\[${escapedSection}\\]([\\s\\S]*?)(?=\\n\\s*\\[|$)`, 'i')
      const match = content.match(regex)
      if (!match) return null

      const keyRegex = new RegExp(`^\\s*${key}\\s*=\\s*["']([^"']*)["']`, 'm')
      const keyMatch = match[1].match(keyRegex)
      return keyMatch ? keyMatch[1] : null
    }

    // 1. Check target environment section [env.<targetEnv>.vars]
    const envSpecific = extractVarFromSection(`env.${targetEnv}.vars`, 'NEXT_PUBLIC_API_BASE_URL')
    if (envSpecific) return envSpecific

    // 2. Fall back to root [vars]
    const defaultVar = extractVarFromSection('vars', 'NEXT_PUBLIC_API_BASE_URL')
    if (defaultVar) return defaultVar

    return ''
  } catch {
    return ''
  }
}

const apiBaseUrl = resolveWranglerApiBaseUrl()

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
  },
}

export default nextConfig
