/**
 * Publish contract for public/futurist-intel.html only.
 * Content denylist + required deck inventory — not HTTP headers.
 */

/** Multi-word / specific ops phrases only (avoids false positives like lone "breakfast"). */
export const FORBIDDEN_PUBLIC_PHRASES = [
  'use at breakfast',
  'reg & compliance breakfast',
  'reg &amp; compliance breakfast',
  'breakfast room map',
  'hozk',
  'source deck',
  'talking points',
  'that domain is not ours',
  'never gridera.net',
  'not gridera.net',
] as const

export const REQUIRED_INTEL_PDFS = [
  'quantum-resilient-ai-compliance.pdf',
  'web3-investor-pitch-deck.pdf',
  'industry-report.pdf',
  'ai-revenue-architecture-zero-investment.pdf',
  'strategic-architectural-intelligence.pdf',
] as const

export function findForbiddenPublicPhrases(html: string): string[] {
  const lower = html.toLowerCase()
  return FORBIDDEN_PUBLIC_PHRASES.filter((p) => lower.includes(p.toLowerCase()))
}

/** Root-relative /pdfs/*.pdf targets from href= and data-pdf=. */
export function listPdfHrefs(html: string): string[] {
  const found = new Set<string>()
  const re =
    /(?:href|data-pdf)=["'](\/pdfs\/[^"'#?\s]+\.pdf|https:\/\/q-grid\.net\/pdfs\/[^"'#?\s]+\.pdf)["']/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const raw = m[1]!
    // Normalize apex absolute → root-relative for inventory checks
    found.add(raw.replace(/^https:\/\/q-grid\.net/, ''))
  }
  return [...found].sort()
}

export function missingRequiredPdfs(html: string): string[] {
  const hrefs = listPdfHrefs(html)
  return REQUIRED_INTEL_PDFS.filter(
    (name) => !hrefs.includes(`/pdfs/${name}`),
  )
}
