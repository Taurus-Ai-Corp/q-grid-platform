/**
 * Canonical site origin — the single place the public hostname is decided.
 *
 * Before this existed the hostname was hardcoded in ~40 places across metadata,
 * canonical URLs, OG tags, API responses and email copy. That made a domain change a
 * find-and-replace across the app, which is how a half-finished cutover leaves some
 * links on the old host and some on the new one.
 *
 * Domain state (verified 2026-08-10 — re-check with `dig +short <host>` before editing):
 *
 *   grid-era.com       LIVE   A 76.76.21.21          -> vercel "landing"   (canonical)
 *   eu.grid-era.com    LIVE   CNAME cname.vercel-dns -> vercel "comply"
 *   q-grid.net         LIVE   still serving, kept during cutover
 *   eu.q-grid.net      LIVE   still serving
 *   na|in|ae|ca.grid-era.com   NOT PROVISIONED — no DNS. Do not link to these. brand-allow
 *
 * Override per environment with NEXT_PUBLIC_SITE_URL. The regional cells stay on
 * q-grid.net until each is actually provisioned; see REGIONAL_CELLS below.
 */

const DEFAULT_SITE_URL = 'https://grid-era.com'

function normalize(url: string): string {
  return url.replace(/\/+$/, '')
}

/** Canonical origin, no trailing slash. */
export const SITE_URL: string = normalize(
  process.env['NEXT_PUBLIC_SITE_URL'] || DEFAULT_SITE_URL,
)

/** Absolute URL for a site-relative path. `siteUrl('/certify')` -> canonical /certify. */
export function siteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Regional jurisdiction cells.
 *
 * Deliberately NOT derived from SITE_URL. Only the EU cell exists on grid-era.com;
 * na/in/ae/ca resolve to nothing there, so generating them from the canonical origin
 * would produce four dead links the moment SITE_URL moved. Each entry flips to
 * grid-era.com only once its DNS is provisioned and verified.
 */
export const REGIONAL_CELLS = {
  na: 'https://na.q-grid.net',
  eu: 'https://eu.grid-era.com',
  in: 'https://in.q-grid.net',
  ae: 'https://ae.q-grid.net',
} as const

export type RegionCode = keyof typeof REGIONAL_CELLS
