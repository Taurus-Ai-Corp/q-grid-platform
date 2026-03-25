export interface Algorithm {
  name: string
  keySize: number
  grade: CryptoGrade
  vulnerable: boolean
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'none'
}

export type CryptoGrade = 'CRITICAL' | 'WEAK' | 'MODERATE' | 'STRONG' | 'PQC_READY' | 'ERROR'

export interface CertificateInfo {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  daysUntilExpiry: number
  serialNumber: string
  fingerprint: string
}

export interface ScanResult {
  domain: string
  scannedAt: string
  algorithms: Algorithm[]
  certificates: CertificateInfo[]
  tlsVersion: string
  error?: string
}

export interface QrsScore {
  overall: number
  categories: {
    algorithms: number
    keySize: number
    pqcReadiness: number
    compliance: number
  }
  riskLevel: 'critical' | 'high' | 'moderate' | 'low'
  vulnerableAlgorithms: Algorithm[]
  migrationPriority: 'immediate' | 'high' | 'medium' | 'low'
}

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  framework?: string
}

export type Jurisdiction = 'na' | 'eu' | 'in' | 'ae'
