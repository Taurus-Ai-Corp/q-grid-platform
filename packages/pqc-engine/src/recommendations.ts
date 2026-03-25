import type { Jurisdiction, Recommendation, ScanResult } from './types.js'

let recIdCounter = 0
function makeId(prefix: string): string {
  recIdCounter++
  return `${prefix}-${recIdCounter}`
}

const JURISDICTION_RECS: Record<Jurisdiction, Recommendation> = {
  na: {
    id: 'jur-na',
    title: 'OSFI B-13 Compliance Review',
    description: 'OSFI B-13 compliance review recommended for Canadian financial institutions.',
    priority: 'medium',
    framework: 'osfi-b13',
  },
  eu: {
    id: 'jur-eu',
    title: 'EU AI Act Conformity Assessment',
    description: 'EU AI Act conformity assessment required by August 2026.',
    priority: 'high',
    framework: 'eu-ai-act',
  },
  in: {
    id: 'jur-in',
    title: 'RBI Data Localisation Compliance',
    description: 'RBI data localization compliance check required for Indian payment data.',
    priority: 'high',
    framework: 'rbi-dpd',
  },
  ae: {
    id: 'jur-ae',
    title: 'VARA Compliance Documentation',
    description: 'VARA compliance documentation required for UAE Virtual Asset operations.',
    priority: 'high',
    framework: 'vara',
  },
}

export function generateRecommendations(scan: ScanResult, jurisdiction: Jurisdiction): Recommendation[] {
  const recs: Recommendation[] = []

  const hasCritical = scan.algorithms.some((a) => a.grade === 'CRITICAL')
  const hasWeak = scan.algorithms.some((a) => a.grade === 'WEAK')
  const hasRsa2048 = scan.algorithms.some((a) => a.name.toUpperCase().includes('RSA') && a.keySize <= 2048)
  const hasPqc = scan.algorithms.some((a) => a.grade === 'PQC_READY')

  if (hasCritical) {
    recs.push({
      id: makeId('critical-key-migration'),
      title: 'Immediate Key Migration Required',
      description:
        'Critical-strength cryptography detected. Immediate migration to ML-DSA-65 or stronger is required to prevent near-term compromise.',
      priority: 'critical',
      framework: 'nist-fips-203',
    })
  }

  if (hasWeak) {
    recs.push({
      id: makeId('pqc-migration-plan'),
      title: 'Plan PQC Migration Within 12 Months',
      description:
        'Weak cryptographic algorithms detected. Begin a structured migration to post-quantum algorithms (ML-DSA-65, ML-KEM-768) within 12 months.',
      priority: 'high',
      framework: 'nist-fips-204',
    })
  }

  if (hasRsa2048) {
    recs.push({
      id: makeId('rsa2048-upgrade'),
      title: 'Upgrade RSA-2048 Key',
      description: 'Upgrade to ML-DSA-65 or RSA-4096 minimum. RSA-2048 is insufficient for long-term security.',
      priority: 'high',
      framework: 'nist-sp-800-131a',
    })
  }

  if (!hasPqc) {
    recs.push({
      id: makeId('pqc-readiness-assessment'),
      title: 'Begin PQC Readiness Assessment',
      description:
        'No post-quantum cryptographic algorithms detected. Begin a PQC readiness assessment to plan the migration roadmap.',
      priority: 'medium',
      framework: 'nist-ir-8547',
    })
  }

  // Certificate expiry check
  const expiringCerts = scan.certificates.filter((c) => c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 180)
  if (expiringCerts.length > 0) {
    recs.push({
      id: makeId('cert-renewal'),
      title: 'Certificate Renewal with PQC Consideration',
      description: `${expiringCerts.length} certificate(s) expire within 6 months. Renew with PQC-hybrid certificates where possible.`,
      priority: 'medium',
    })
  }

  // Jurisdiction-specific recommendation
  const jurRec = JURISDICTION_RECS[jurisdiction]
  recs.push({ ...jurRec, id: makeId(`jur-${jurisdiction}`) })

  return recs
}
