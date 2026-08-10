import type { NextConfig } from 'next'
import path from 'path'
import { buildSecurityHeaderPairs } from './security-headers'

// Build identifier to force cache invalidation on Vercel CDN
const BUILD_ID = 'gridera-jwt-auth-v2-' + Date.now()

const nextConfig: NextConfig = {
  transpilePackages: [
    '@taurus/ui',
    '@taurus/pqc-engine',
    '@taurus/pqc-crypto',
    '@taurus/jurisdiction',
    '@taurus/db',
  ],
  turbopack: {
    // Explicitly set the monorepo root so Next.js 16 Turbopack does not
    // walk up to the parent HEDERA workspace and pick up the wrong pnpm-workspace.yaml.
    root: path.resolve(__dirname, '../..'),
  },
  generateBuildId: async () => BUILD_ID,
  /**
   * Canada sovereign cell interim routing.
   *
   * ca.q-grid.net is configured on Vercel but has no public DNS record yet —
   * the apex zone is still on Name.com nameservers (not Replit). Until the
   * registrar CNAME/NS cutover lands, expose the live CA Comply deploy under a
   * path we already control on q-grid.net.
   *
   * Redirect (not reverse-proxy) so Next.js asset/auth paths on the CA app
   * resolve against the CA host, not the landing host.
   */
  async redirects() {
    const caCell = 'https://q-grid-comply-ca.vercel.app'
    return [
      {
        source: '/ca',
        destination: `${caCell}/`,
        permanent: false,
      },
      {
        source: '/ca/:path*',
        destination: `${caCell}/:path*`,
        permanent: false,
      },
      {
        source: '/canada',
        destination: `${caCell}/`,
        permanent: false,
      },
    ]
  },
  async headers() {
    const securityHeaders = buildSecurityHeaderPairs()
    // Only the PDF route gets same-origin framing; everything else stays DENY.
    const pdfHeaders = buildSecurityHeaderPairs({ frameOptions: 'SAMEORIGIN' })
    return [
      {
        source: '/pdfs/:path*',
        headers: [
          ...pdfHeaders,
          { key: 'Content-Disposition', value: 'inline' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      {
        source: '/videos/:path*',
        headers: [
          ...securityHeaders,
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      // Badge SVGs set their own Cache-Control in the route handler. They MUST stay
      // cacheable: a README badge is fetched on every page view, and no-store would mean
      // a fresh TLS handshake against the scanned domain each time — slow for the viewer
      // and abusive to the target. Security headers still apply.
      {
        source: '/api/badge/:path*',
        headers: securityHeaders,
      },
      // Exclude media + badge paths so no-store does not override their cache policy
      {
        source: '/:path((?!pdfs/|videos/|api/badge/).*)',
        headers: [
          ...securityHeaders,
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

export default nextConfig
