import type { Metadata } from 'next'

// page.tsx is a client component (form state), which cannot export metadata — hence a
// route layout. Without this the page inherited the generic root title, leaving the
// flagship "05 — Prove Trust" tile indistinguishable in tabs and search results.
export const metadata: Metadata = {
  title: 'GRIDERA|Certify — Verifiable Attestation for Board and Regulators',
  description:
    'Cryptographically verifiable attestation: ML-DSA-65-signed evidence anchored to Hedera HCS, independently checkable without trusting us. 38 regulations across 5 sovereign jurisdictions.',
  openGraph: {
    title: 'GRIDERA|Certify — Verifiable Attestation',
    description:
      'ML-DSA-65-signed, Hedera-anchored compliance evidence. Anyone can verify it without trusting us.',
    url: 'https://q-grid.net/certify',
    siteName: 'GRIDERA',
    locale: 'en_US',
    type: 'website',
  },
}

export default function CertifyLayout({ children }: { children: React.ReactNode }) {
  return children
}
