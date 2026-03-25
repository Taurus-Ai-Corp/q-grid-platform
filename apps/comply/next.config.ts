import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@taurus/ui',
    '@taurus/pqc-engine',
    '@taurus/pqc-crypto',
    '@taurus/jurisdiction',
    '@taurus/db',
    '@taurus/hedera',
  ],
  turbopack: {
    // Explicitly set the monorepo root so Next.js 16 Turbopack does not
    // walk up to the parent HEDERA workspace and pick up the wrong pnpm-workspace.yaml.
    root: path.resolve(__dirname, '../..'),
  },
}

export default nextConfig
