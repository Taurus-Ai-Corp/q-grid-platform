/**
 * Deploy-time HTTP security headers for next.config.ts.
 * Kept next to config — not mixed with marketing content rules.
 */

export type HeaderPair = { key: string; value: string }

/** Site-wide X-Frame-Options. DENY blanked same-origin PDF embeds. */
export const X_FRAME_OPTIONS = 'SAMEORIGIN' as const

export function buildSecurityHeaderPairs(): HeaderPair[] {
  return [
    { key: 'X-Frame-Options', value: X_FRAME_OPTIONS },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()',
    },
  ]
}
