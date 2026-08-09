/**
 * Deploy-time HTTP security headers for next.config.ts.
 * Kept next to config — not mixed with marketing content rules.
 */

export type HeaderPair = { key: string; value: string }

/**
 * DENY everywhere by default. Only the PDF viewer route needs same-origin framing —
 * relaxing it site-wide to fix one path would make every page, including future
 * authenticated ones, same-origin framable for no reason.
 */
export const X_FRAME_OPTIONS = 'DENY' as const
/** Narrow exception: /pdfs/* is embedded in our own pages, which DENY blocks. */
export const X_FRAME_OPTIONS_EMBEDDABLE = 'SAMEORIGIN' as const

export function buildSecurityHeaderPairs(
  opts: { frameOptions?: string } = {},
): HeaderPair[] {
  return [
    { key: 'X-Frame-Options', value: opts.frameOptions ?? X_FRAME_OPTIONS },
    // frame-ancestors is the modern control and overrides XFO where both are honoured;
    // keeping them aligned means no gap if a browser ignores one.
    {
      key: 'Content-Security-Policy',
      value: `frame-ancestors ${(opts.frameOptions ?? X_FRAME_OPTIONS) === 'DENY' ? "'none'" : "'self'"}`,
    },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()',
    },
  ]
}
