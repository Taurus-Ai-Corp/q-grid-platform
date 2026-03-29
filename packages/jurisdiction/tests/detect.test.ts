import { describe, it, expect } from 'vitest'
import { detectJurisdiction, getJurisdictionConfig } from '../src/index.js'

describe('jurisdiction detection', () => {
  // Subdomain pattern (primary — eu.q-grid.net)
  it('detects EU from eu.q-grid.net', () => {
    expect(detectJurisdiction('eu.q-grid.net')).toBe('eu')
  })
  it('detects NA from na.q-grid.net', () => {
    expect(detectJurisdiction('na.q-grid.net')).toBe('na')
  })
  it('detects IN from in.q-grid.net', () => {
    expect(detectJurisdiction('in.q-grid.net')).toBe('in')
  })
  it('detects AE from ae.q-grid.net', () => {
    expect(detectJurisdiction('ae.q-grid.net')).toBe('ae')
  })

  // Root domain → NA default
  it('detects NA from q-grid.net', () => {
    expect(detectJurisdiction('q-grid.net')).toBe('na')
  })

  // Legacy TLD patterns (backward compat)
  it('detects EU from comply.q-grid.eu (legacy)', () => {
    expect(detectJurisdiction('comply.q-grid.eu')).toBe('eu')
  })
  it('detects IN from comply.q-grid.in (legacy)', () => {
    expect(detectJurisdiction('comply.q-grid.in')).toBe('in')
  })

  // Defaults
  it('falls back to NA for localhost', () => {
    expect(detectJurisdiction('localhost')).toBe('na')
  })

  // Env override
  it('prefers env override', () => {
    expect(detectJurisdiction('eu.q-grid.net', 'in')).toBe('in')
  })
  it('ignores invalid env override', () => {
    expect(detectJurisdiction('eu.q-grid.net', 'invalid')).toBe('eu')
  })
})

describe('jurisdiction config', () => {
  it('returns valid config for each jurisdiction', () => {
    for (const j of ['na', 'eu', 'in', 'ae'] as const) {
      const config = getJurisdictionConfig(j)
      expect(config.id).toBe(j)
      expect(config.regulations.length).toBeGreaterThan(0)
      expect(config.currency.code).toBeTruthy()
      expect(config.dataResidencyRegion).toBeTruthy()
      expect(config.vercelRegion).toBeTruthy()
    }
  })
  it('NA config has OSFI and PIPEDA', () => {
    const config = getJurisdictionConfig('na')
    const ids = config.regulations.map(r => r.id)
    expect(ids).toContain('osfi-e23')
    expect(ids).toContain('pipeda')
  })
  it('EU config has EU AI Act and GDPR', () => {
    const config = getJurisdictionConfig('eu')
    const ids = config.regulations.map(r => r.id)
    expect(ids).toContain('eu-ai-act')
    expect(ids).toContain('gdpr')
  })
  it('IN config has DPDP and RBI FREE-AI', () => {
    const config = getJurisdictionConfig('in')
    const ids = config.regulations.map(r => r.id)
    expect(ids).toContain('dpdp-act')
    expect(ids).toContain('rbi-free-ai')
  })
  it('AE config has VARA and DFSA', () => {
    const config = getJurisdictionConfig('ae')
    const ids = config.regulations.map(r => r.id)
    expect(ids).toContain('vara')
    expect(ids).toContain('dfsa')
  })
})
