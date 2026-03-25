import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Comply.Q-Grid',
    default: 'Comply.Q-Grid — Multi-Geographic PQC Compliance',
  },
  description:
    'Multi-geographic post-quantum compliance platform. Jurisdiction-aware PQC enforcement for enterprise.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--bone)] text-[var(--graphite)] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
