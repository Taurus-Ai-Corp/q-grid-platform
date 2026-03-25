import { describe, it, expect } from 'vitest'
import { generateRecommendations } from '../src/recommendations.js'
import type { ScanResult } from '../src/types.js'

describe('recommendations', () => {
  it('generates critical recommendation for vulnerable algorithms', () => {
    const scan: ScanResult = {
      domain: 'weak.com',
      scannedAt: new Date().toISOString(),
      algorithms: [{ name: 'RSA', keySize: 1024, grade: 'CRITICAL', vulnerable: true, severity: 'critical' }],
      certificates: [],
      tlsVersion: 'TLSv1.2',
    }
    const recs = generateRecommendations(scan, 'na')
    expect(recs.some((r) => r.priority === 'critical')).toBe(true)
  })

  it('includes jurisdiction-specific recommendations', () => {
    const scan: ScanResult = {
      domain: 'eu-company.com',
      scannedAt: new Date().toISOString(),
      algorithms: [{ name: 'RSA', keySize: 2048, grade: 'WEAK', vulnerable: true, severity: 'high' }],
      certificates: [],
      tlsVersion: 'TLSv1.3',
    }
    const recs = generateRecommendations(scan, 'eu')
    expect(recs.some((r) => r.framework === 'eu-ai-act' || r.description.includes('EU AI Act'))).toBe(true)
  })

  it('recommends immediate migration for CRITICAL grade', () => {
    const scan: ScanResult = {
      domain: 'critical.com',
      scannedAt: new Date().toISOString(),
      algorithms: [{ name: 'RSA', keySize: 512, grade: 'CRITICAL', vulnerable: true, severity: 'critical' }],
      certificates: [],
      tlsVersion: 'TLSv1.2',
    }
    const recs = generateRecommendations(scan, 'ae')
    expect(recs.some((r) => r.title.toLowerCase().includes('immediate') || r.priority === 'critical')).toBe(true)
  })

  it('includes PQC readiness assessment when no PQC detected', () => {
    const scan: ScanResult = {
      domain: 'rsa-only.com',
      scannedAt: new Date().toISOString(),
      algorithms: [{ name: 'RSA', keySize: 4096, grade: 'STRONG', vulnerable: false, severity: 'low' }],
      certificates: [],
      tlsVersion: 'TLSv1.3',
    }
    const recs = generateRecommendations(scan, 'in')
    expect(recs.some((r) => r.description.includes('PQC readiness'))).toBe(true)
    expect(recs.some((r) => r.description.includes('RBI'))).toBe(true)
  })

  it('includes RSA-2048 upgrade recommendation', () => {
    const scan: ScanResult = {
      domain: 'rsa2048.com',
      scannedAt: new Date().toISOString(),
      algorithms: [{ name: 'RSA', keySize: 2048, grade: 'WEAK', vulnerable: true, severity: 'high' }],
      certificates: [],
      tlsVersion: 'TLSv1.3',
    }
    const recs = generateRecommendations(scan, 'na')
    expect(recs.some((r) => r.description.includes('ML-DSA-65') || r.title.includes('RSA-2048'))).toBe(true)
  })
})
