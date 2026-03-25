import { describe, it, expect } from 'vitest'
import { calculateQrsScore } from '../src/qrs-score.js'
import type { ScanResult } from '../src/types.js'

describe('QRS scoring', () => {
  it('scores RSA-2048 as high risk (low QRS)', () => {
    const scan: ScanResult = {
      domain: 'example.com',
      scannedAt: new Date().toISOString(),
      algorithms: [{ name: 'RSA', keySize: 2048, grade: 'WEAK', vulnerable: true, severity: 'high' }],
      certificates: [],
      tlsVersion: 'TLSv1.2',
    }
    const score = calculateQrsScore(scan)
    expect(score.overall).toBeLessThan(50)
    expect(score.riskLevel).toBe('high')
    expect(score.vulnerableAlgorithms.length).toBe(1)
  })

  it('scores PQC-ready cert highly', () => {
    const scan: ScanResult = {
      domain: 'quantum-safe.com',
      scannedAt: new Date().toISOString(),
      algorithms: [{ name: 'ML-DSA-65', keySize: 0, grade: 'PQC_READY', vulnerable: false, severity: 'none' }],
      certificates: [],
      tlsVersion: 'TLSv1.3',
    }
    const score = calculateQrsScore(scan)
    expect(score.overall).toBeGreaterThan(80)
    expect(score.riskLevel).toBe('low')
  })

  it('scores mixed algorithms appropriately', () => {
    const scan: ScanResult = {
      domain: 'mixed.com',
      scannedAt: new Date().toISOString(),
      algorithms: [
        { name: 'RSA', keySize: 4096, grade: 'STRONG', vulnerable: false, severity: 'low' },
        { name: 'ECDSA', keySize: 256, grade: 'WEAK', vulnerable: true, severity: 'high' },
      ],
      certificates: [],
      tlsVersion: 'TLSv1.3',
    }
    const score = calculateQrsScore(scan)
    expect(score.overall).toBeGreaterThan(30)
    expect(score.overall).toBeLessThan(70)
    expect(score.riskLevel).toBe('moderate')
  })

  it('scores CRITICAL algorithm as critical risk', () => {
    const scan: ScanResult = {
      domain: 'ancient.com',
      scannedAt: new Date().toISOString(),
      algorithms: [{ name: 'RSA', keySize: 512, grade: 'CRITICAL', vulnerable: true, severity: 'critical' }],
      certificates: [],
      tlsVersion: 'TLSv1.2',
    }
    const score = calculateQrsScore(scan)
    expect(score.overall).toBeLessThan(26)
    expect(score.riskLevel).toBe('critical')
    expect(score.migrationPriority).toBe('immediate')
  })

  it('returns no vulnerable algorithms for PQC-ready cert', () => {
    const scan: ScanResult = {
      domain: 'quantum-safe.com',
      scannedAt: new Date().toISOString(),
      algorithms: [{ name: 'ML-KEM-768', keySize: 0, grade: 'PQC_READY', vulnerable: false, severity: 'none' }],
      certificates: [],
      tlsVersion: 'TLSv1.3',
    }
    const score = calculateQrsScore(scan)
    expect(score.vulnerableAlgorithms).toHaveLength(0)
  })

  it('handles empty algorithms gracefully', () => {
    const scan: ScanResult = {
      domain: 'unknown.com',
      scannedAt: new Date().toISOString(),
      algorithms: [],
      certificates: [],
      tlsVersion: 'TLSv1.2',
      error: 'Connection failed',
    }
    const score = calculateQrsScore(scan)
    expect(score.overall).toBe(0)
    expect(score.riskLevel).toBe('critical')
  })
})
