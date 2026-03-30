import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EU AI Act Risk Assessment (Embed)',
  description:
    'Embeddable EU AI Act risk classification quiz by Quantum Grid.',
  robots: { index: false, follow: false },
}

export default function EmbedAssessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
