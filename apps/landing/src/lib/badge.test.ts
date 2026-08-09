import { describe, expect, it } from 'vitest'
import {
  escapeXml,
  isPublicAddress,
  normalizeDomain,
  renderBadge,
  stateForRisk,
  textWidth,
} from './badge'

describe('stateForRisk', () => {
  it('maps QRS risk levels to badge states', () => {
    expect(stateForRisk('low')).toBe('ok')
    expect(stateForRisk('moderate')).toBe('warn')
    expect(stateForRisk('high')).toBe('bad')
    expect(stateForRisk('critical')).toBe('bad')
  })

  it('never treats an unrecognised or missing risk level as a pass', () => {
    expect(stateForRisk(undefined)).toBe('unknown')
    expect(stateForRisk('')).toBe('unknown')
    expect(stateForRisk('definitely-fine')).toBe('unknown')
  })
})

describe('normalizeDomain', () => {
  it('strips scheme, path, port and the .svg suffix', () => {
    expect(normalizeDomain('https://q-grid.net/scan')).toBe('q-grid.net')
    expect(normalizeDomain('EXAMPLE.COM')).toBe('example.com')
    expect(normalizeDomain('example.com:8443')).toBe('example.com')
    expect(normalizeDomain('example.com.svg')).toBe('example.com')
  })

  it('rejects hosts that are not public dotted DNS names', () => {
    for (const bad of [
      'localhost',
      '127.0.0.1',
      '10.0.0.1',
      '169.254.169.254', // cloud metadata
      '::1',
      'box.local',
      'svc.internal',
      'foo.test',
      '',
      'a.b',
    ]) {
      expect(normalizeDomain(bad), bad).toBeNull()
    }
  })
})

describe('isPublicAddress', () => {
  it('accepts public unicast addresses', () => {
    expect(isPublicAddress('66.33.60.129')).toBe(true)
    expect(isPublicAddress('8.8.8.8')).toBe(true)
    expect(isPublicAddress('2606:4700::1111')).toBe(true)
  })

  it('rejects loopback, private, link-local and CGNAT ranges', () => {
    for (const bad of [
      '127.0.0.1',
      '10.1.2.3',
      '172.16.0.1',
      '172.31.255.255',
      '192.168.1.1',
      '169.254.169.254', // AWS/GCP metadata — the one that matters most
      '100.64.0.1',
      '0.0.0.0',
      '224.0.0.1',
      '::1',
      'fc00::1',
      'fe80::1',
    ]) {
      expect(isPublicAddress(bad), bad).toBe(false)
    }
  })

  it('judges IPv4-mapped IPv6 on the embedded v4 address', () => {
    expect(isPublicAddress('::ffff:10.0.0.1')).toBe(false)
    expect(isPublicAddress('::ffff:8.8.8.8')).toBe(true)
  })

  it('rejects addresses just outside the public boundary', () => {
    expect(isPublicAddress('172.15.0.1')).toBe(true)
    expect(isPublicAddress('172.32.0.1')).toBe(true)
    expect(isPublicAddress('172.16.0.1')).toBe(false)
  })
})

describe('renderBadge', () => {
  it('produces a self-contained svg with no external references', () => {
    const out = renderBadge({ message: 'QRS 82', state: 'ok' })
    expect(out).toContain('<svg')
    expect(out).toContain('QRS 82')
    expect(out).toContain('GRIDERA')
    // A badge that fetches anything can be blocked by CSP or go down. The xmlns
    // declaration is a namespace identifier, never dereferenced — ignore it and
    // assert no *fetchable* reference survives.
    const withoutNamespace = out.replace(/xmlns="[^"]*"/g, '')
    expect(withoutNamespace).not.toMatch(/https?:\/\//)
    expect(out).not.toContain('<image')
    expect(out).not.toMatch(/@import|url\(\s*['"]?https?:/)
  })

  it('colours by state', () => {
    expect(renderBadge({ message: 'x', state: 'ok' })).toContain('#00CCAA')
    expect(renderBadge({ message: 'x', state: 'bad' })).toContain('#E5484D')
    expect(renderBadge({ message: 'x', state: 'unknown' })).toContain('#9BA1A6')
  })

  it('escapes hostile input rather than emitting raw markup', () => {
    const out = renderBadge({ message: '"><script>alert(1)</script>', state: 'unknown' })
    expect(out).not.toContain('<script>')
    expect(out).toContain('&lt;script&gt;')
  })

  it('widens the pill as the message grows', () => {
    const short = renderBadge({ message: 'QRS 8', state: 'ok' })
    const long = renderBadge({ message: 'QRS 100 pending', state: 'ok' })
    const w = (s: string) => Number(/width="(\d+)"/.exec(s)?.[1])
    expect(w(long)).toBeGreaterThan(w(short))
  })
})

describe('escapeXml / textWidth', () => {
  it('escapes the five XML metacharacters', () => {
    expect(escapeXml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&apos;')
  })

  it('scales width with content and never returns zero for non-empty text', () => {
    expect(textWidth('')).toBe(0)
    expect(textWidth('i')).toBeGreaterThan(0)
    expect(textWidth('MMMM')).toBeGreaterThan(textWidth('iiii'))
  })
})
