import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  REQUIRED_INTEL_PDFS,
  findForbiddenPublicPhrases,
  listPdfHrefs,
  missingRequiredPdfs,
} from './futurist-intel-contract'
import {
  X_FRAME_OPTIONS,
  buildSecurityHeaderPairs,
} from '../../security-headers'

describe('findForbiddenPublicPhrases', () => {
  it('flags internal ops phrases', () => {
    const dirty = `
      Interactive room for Reg & Compliance Breakfast and HoZK conversations.
      USE AT BREAKFAST · SOURCE DECK 01 · TALKING POINTS
      never gridera.net — that domain is not ours
    `
    const hits = findForbiddenPublicPhrases(dirty)
    expect(hits).toEqual(
      expect.arrayContaining([
        'use at breakfast',
        'hozk',
        'source deck',
        'talking points',
        'never gridera.net',
        'that domain is not ours',
      ]),
    )
  })

  it('does not flag clean public marketing copy', () => {
    const clean = `
      GRIDERA Intelligence Room on q-grid.net
      Research decks · PRODUCT LINE · RESOURCE · Open PDF
    `
    expect(findForbiddenPublicPhrases(clean)).toEqual([])
  })

  it('does not false-positive on bare product words', () => {
    // lone "breakfast" or brand logo path must not fail publish
    expect(
      findForbiddenPublicPhrases('continental breakfast menu · /gridera-logo.png'),
    ).toEqual([])
  })
})

describe('listPdfHrefs / missingRequiredPdfs', () => {
  it('normalizes absolute and relative pdf links', () => {
    const html = `
      <a href="/pdfs/a.pdf">r</a>
      <a href="https://q-grid.net/pdfs/b.pdf">a</a>
      <div data-pdf="/pdfs/c.pdf"></div>
    `
    expect(listPdfHrefs(html)).toEqual([
      '/pdfs/a.pdf',
      '/pdfs/b.pdf',
      '/pdfs/c.pdf',
    ])
  })

  it('reports missing required decks', () => {
    const onlyOne = `<a href="/pdfs/${REQUIRED_INTEL_PDFS[0]}">x</a>`
    expect(missingRequiredPdfs(onlyOne).length).toBe(
      REQUIRED_INTEL_PDFS.length - 1,
    )
  })
})

describe('security-headers', () => {
  // The real requirement is that futurist-intel.html can embed its own PDFs in an
  // iframe/object. That needs SAMEORIGIN on the PDF route ONLY. This previously
  // asserted the site-wide constant was SAMEORIGIN, which made every page — including
  // future authenticated ones — same-origin framable to fix one path.
  const xfo = (pairs: { key: string; value: string }[]) =>
    pairs.find((h) => h.key === 'X-Frame-Options')?.value

  it('denies framing site-wide by default', () => {
    expect(X_FRAME_OPTIONS).toBe('DENY')
    expect(xfo(buildSecurityHeaderPairs())).toBe('DENY')
  })

  it('allows same-origin framing only where explicitly requested (the PDF route)', () => {
    expect(xfo(buildSecurityHeaderPairs({ frameOptions: 'SAMEORIGIN' }))).toBe('SAMEORIGIN')
  })

  it('keeps CSP frame-ancestors aligned with X-Frame-Options', () => {
    const csp = (pairs: { key: string; value: string }[]) =>
      pairs.find((h) => h.key === 'Content-Security-Policy')?.value
    expect(csp(buildSecurityHeaderPairs())).toBe("frame-ancestors 'none'")
    expect(csp(buildSecurityHeaderPairs({ frameOptions: 'SAMEORIGIN' }))).toBe(
      "frame-ancestors 'self'",
    )
  })
})

// This asset is NOT tracked by git. It exists on the author's machine and nowhere
// else, so readFileSync threw ENOENT in CI and failed the whole landing suite while
// passing locally — the classic works-on-my-machine divergence.
//
// The deeper problem the red test exposed: an untracked file under public/ is never
// deployed either. https://grid-era.com/futurist-intel.html and the q-grid.net
// equivalent both return 404, and public/QR_CODES/futurist-intel.png is a QR code
// pointing at that 404.
//
// Whether the page should ship is a content decision, so the contract is skipped
// rather than deleted: commit the HTML and these assertions run automatically.
const INTEL_HTML = resolve(__dirname, '../../public/futurist-intel.html')
const intelHtml = existsSync(INTEL_HTML) ? readFileSync(INTEL_HTML, 'utf8') : null

describe.skipIf(intelHtml === null)('live futurist-intel.html', () => {
  const html = intelHtml as string

  it('has no forbidden ops phrases', () => {
    expect(findForbiddenPublicPhrases(html)).toEqual([])
  })

  it('links every required deck under /pdfs/', () => {
    expect(missingRequiredPdfs(html)).toEqual([])
  })
})
