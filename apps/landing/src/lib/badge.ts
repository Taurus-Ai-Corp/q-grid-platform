/**
 * Live QRS badge — the zero-opt-in distribution surface.
 *
 * A README embeds `![](https://q-grid.net/api/badge/example.com.svg)` and it works
 * immediately: the target does nothing, commits nothing, installs nothing. That is the
 * whole point. The GitHub Action requires a repo to commit a `.gridera` bundle first;
 * this requires only that someone types a domain.
 *
 * Everything here is pure so it can be unit-tested without a network or a TLS handshake.
 */

export type BadgeState = 'ok' | 'warn' | 'bad' | 'unknown'

/** Palette. Greens/teal match the GRIDERA accent; grey is the honest "we don't know". */
const COLORS: Record<BadgeState, string> = {
  ok: '#00CCAA',
  warn: '#D4A017',
  bad: '#E5484D',
  unknown: '#9BA1A6',
}

/** QRS riskLevel -> badge state. Unknown is its own state, never silently a pass. */
export function stateForRisk(risk: string | undefined): BadgeState {
  switch (risk) {
    case 'low':
      return 'ok'
    case 'moderate':
      return 'warn'
    case 'high':
    case 'critical':
      return 'bad'
    default:
      return 'unknown'
  }
}

/**
 * Approximate rendered width of an 11px DejaVu/Verdana string.
 *
 * SVG has no layout engine available to us at render time, so shields.io-style badges
 * all estimate. 6.6px/char is the usual constant; digits and caps run wider, so we
 * nudge for them rather than letting long labels overflow their pill.
 */
export function textWidth(text: string): number {
  let w = 0
  for (const ch of text) {
    if (/[A-Z0-9]/.test(ch)) w += 7.2
    else if (/[ilj.,:'!|]/.test(ch)) w += 3.0
    else if (/[mwMW]/.test(ch)) w += 9.0
    else w += 6.4
  }
  return Math.ceil(w)
}

/** Escape for XML text nodes. Badge input includes user-supplied domains. */
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export interface BadgeOptions {
  label?: string
  message: string
  state: BadgeState
}

/**
 * Render a flat two-part SVG badge.
 *
 * Self-contained by design — no shields.io round-trip, no external font, no remote
 * reference. A badge that depends on a third party can be blocked by CSP, rate-limited,
 * or simply go down, and a broken image in someone's README is a reason to delete it.
 */
export function renderBadge({ label = 'GRIDERA', message, state }: BadgeOptions): string {
  const PAD = 10
  const labelW = textWidth(label) + PAD * 2
  const msgW = textWidth(message) + PAD * 2
  const total = labelW + msgW
  const color = COLORS[state]

  const l = escapeXml(label)
  const m = escapeXml(message)
  // Text anchors sit at the centre of each pill, x10 for the shields-style transform.
  const labelX = (labelW / 2) * 10
  const msgX = (labelW + msgW / 2) * 10

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${l}: ${m}">
  <title>${l}: ${m}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelW}" height="20" fill="#2B2F31"/>
    <rect x="${labelW}" width="${msgW}" height="20" fill="${color}"/>
    <rect width="${total}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,DejaVu Sans,Geneva,sans-serif" font-size="110" text-rendering="geometricPrecision">
    <text transform="scale(.1)" x="${labelX}" y="140" fill="#000" fill-opacity=".25">${l}</text>
    <text transform="scale(.1)" x="${labelX}" y="130">${l}</text>
    <text transform="scale(.1)" x="${msgX}" y="140" fill="#000" fill-opacity=".25">${m}</text>
    <text transform="scale(.1)" x="${msgX}" y="130">${m}</text>
  </g>
</svg>`
}

// ---------------------------------------------------------------------------
// Hostname safety
// ---------------------------------------------------------------------------

/**
 * `scanDomain()` opens a TLS socket to whatever host it is handed and has no guard of
 * its own. That is tolerable behind a POST form; it is not tolerable on an
 * unauthenticated GET that lives in READMEs, gets crawled, prefetched and cached. Without
 * this check the badge is a remote scanner for internal networks — anyone could ask our
 * server "does host:443 exist inside your VPC, and what certificate does it present?".
 *
 * Shape-checking alone is not enough: a public DNS name can resolve to 127.0.0.1. The
 * route therefore also resolves and re-checks the address via `isPublicAddress`.
 */
export function normalizeDomain(input: string): string | null {
  const d = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
    .replace(/\.svg$/, '')

  if (!d || d.length < 4 || d.length > 253) return null
  // Must be a dotted DNS name. Rejects bare IPv4, "localhost", and IPv6 literals.
  if (!/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(d)) return null
  // Reserved / internal-use suffixes (RFC 6761, RFC 8375) never resolve publicly.
  if (/\.(local|internal|localhost|localdomain|home\.arpa|test|invalid|example)$/.test(d)) {
    return null
  }
  return d
}

/** True only for addresses safe to connect to: rejects private, loopback, link-local, CGNAT. */
export function isPublicAddress(addr: string): boolean {
  if (addr.includes(':')) {
    const v6 = addr.toLowerCase()
    if (v6 === '::1' || v6 === '::') return false
    if (/^f[cd][0-9a-f]{2}:/.test(v6)) return false // fc00::/7 unique-local
    if (/^fe[89ab][0-9a-f]:/.test(v6)) return false // fe80::/10 link-local
    // IPv4-mapped (::ffff:10.0.0.1) must be judged on the embedded v4 address.
    const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapped?.[1]) return isPublicAddress(mapped[1])
    return true
  }

  const parts = addr.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return false
  }
  const [a, b] = parts as [number, number, number, number]
  if (a === 0 || a === 10 || a === 127) return false
  if (a === 169 && b === 254) return false // link-local + cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return false
  if (a === 192 && b === 168) return false
  if (a === 100 && b >= 64 && b <= 127) return false // CGNAT
  if (a >= 224) return false // multicast + reserved
  return true
}
