import { promises as dns } from 'dns'
import {
  isPublicAddress,
  normalizeDomain,
  renderBadge,
  stateForRisk,
  type BadgeState,
} from '@/lib/badge'

// tls.connect() via @taurus/pqc-engine — not edge-compatible.
export const runtime = 'nodejs'

/**
 * Per-connection socket budget handed to the engine.
 *
 * This is NOT a race deadline. scanDomain opens a TLS socket and then awaits
 * probeHybridKex, which opens a second one, so the engine's own worst case is roughly
 * 2x this. An outer race shorter than that would make every slow-but-valid host resolve
 * to "unknown" forever — and with a short failure TTL the badge would re-scan and
 * re-fail on a loop, never recovering. So the engine gets a real budget and the outer
 * guard sits above its worst case.
 */
const SOCKET_BUDGET_MS = 6_000
/** Outer backstop, above the engine's ~2x worst case, so it only fires on a true hang. */
const HARD_DEADLINE_MS = SOCKET_BUDGET_MS * 2 + 3_000

/**
 * Cache aggressively. GitHub proxies README images through camo, which re-fetches on its
 * own schedule, and a TLS handshake per view would be both slow and abusive to the target
 * being scanned. `stale-while-revalidate` keeps a badge rendering while it refreshes.
 */
const CACHE_OK = 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400'
/** Failures get a short TTL so a transient outage doesn't pin "unknown" for six hours. */
const CACHE_UNKNOWN = 'public, max-age=300, s-maxage=300'

function svg(body: string, cache: string): Response {
  return new Response(body, {
    status: 200, // Always 200: a non-200 renders as a broken image in a README.
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': cache,
      // camo strips cookies anyway; be explicit that this is a public, credential-free asset.
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function unknown(message: string): Response {
  return svg(renderBadge({ message, state: 'unknown' }), CACHE_UNKNOWN)
}

/**
 * GET /api/badge/{domain}.svg — live quantum-readiness badge for any public domain.
 *
 * Zero opt-in by design: the domain owner does not sign up, install, or commit anything.
 * That is what makes this a distribution channel rather than a feature — the OpenSSF
 * Scorecard badge appears in more READMEs than its Action has installs for exactly this
 * reason.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ domain: string }> },
): Promise<Response> {
  try {
    const { domain: raw } = await params
    const domain = normalizeDomain(decodeURIComponent(raw ?? ''))
    if (!domain) return unknown('invalid domain')

    // Shape is not enough — a public name can resolve to 127.0.0.1 or 169.254.169.254.
    // Resolve first and refuse anything that is not a public unicast address, so the
    // badge cannot be used to probe internal networks through our server.
    let addrs: string[]
    try {
      const [v4, v6] = await Promise.all([
        dns.resolve4(domain).catch(() => [] as string[]),
        dns.resolve6(domain).catch(() => [] as string[]),
      ])
      addrs = [...v4, ...v6]
    } catch {
      return unknown('dns error')
    }
    if (addrs.length === 0) return unknown('no dns')
    // ALL addresses must be public: a name resolving to both a public and a private IP is
    // a classic DNS-rebinding shape, so treat any private answer as disqualifying.
    if (!addrs.every(isPublicAddress)) return unknown('non-public host')

    // Pin the connection to the address we just validated. Passing the hostname instead
    // would let the engine re-resolve, so the address that was checked and the address
    // that gets connected to could differ — the TOCTOU window a TTL-0 rebinding record
    // is built to exploit. servername stays the hostname, so SNI is unaffected.
    const address = addrs[0] as string

    const { scanDomain, calculateQrsScore } = await import('@taurus/pqc-engine')

    let deadline: ReturnType<typeof setTimeout> | undefined
    const scan = await Promise.race([
      scanDomain(domain, { address, timeoutMs: SOCKET_BUDGET_MS }),
      new Promise<null>((resolve) => {
        deadline = setTimeout(() => resolve(null), HARD_DEADLINE_MS)
      }),
    ]).finally(() => clearTimeout(deadline))

    if (!scan || scan.error) return unknown('scan failed')
    // A scan can succeed with nothing to report: scanner.ts only pushes algorithms when
    // the peer certificate is non-empty. calculateQrsScore then returns overall 0 /
    // riskLevel 'critical', which would publish a RED badge asserting critical failure
    // about a third party's domain — cached for hours, on a product that sells verifiable
    // truth. No evidence must render as "unknown", never as a verdict.
    if (scan.algorithms.length === 0) return unknown('no data')

    const qrs = calculateQrsScore(scan)
    const state: BadgeState = stateForRisk(qrs.riskLevel)

    return svg(renderBadge({ message: `QRS ${qrs.overall}`, state }), CACHE_OK)
  } catch {
    // Never surface a 500 — an error page where an image should be is worse than a
    // grey "unknown", and gets the badge removed from the README.
    return unknown('unavailable')
  }
}
