import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '../components/analytics'

// Fonts loaded via CSS @import in globals.css (avoids Google Fonts fetch failures during parallel builds)
// DM Sans (body), IBM Plex Mono (code), Jura (headings)

export const metadata: Metadata = {
  title: {
    template: '%s | Q-Grid Comply',
    default: 'Q-Grid Comply — Post-Quantum Compliance Infrastructure',
  },
  description:
    'The first compliance-first post-quantum cryptography platform. Get quantum-safe in 45 minutes, not months. NIST FIPS 203/204, EU AI Act, SWIFT 2027.',
  openGraph: {
    title: 'Q-Grid Comply — Post-Quantum Compliance Infrastructure',
    description:
      'Get quantum-safe in 45 minutes, not months. NIST FIPS 203/204, EU AI Act Aug 2026, SWIFT 2027.',
    url: 'https://comply.q-grid.net',
    siteName: 'Q-Grid Comply',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Q-Grid Comply — Post-Quantum Compliance Infrastructure',
    description:
      'Get quantum-safe in 45 minutes, not months. 37 AI Agents. NIST FIPS 203/204.',
  },
  metadataBase: new URL('https://comply.q-grid.net'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--bone)] text-[var(--graphite)] font-[var(--font-sans)] antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
