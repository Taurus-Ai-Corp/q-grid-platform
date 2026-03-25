import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Q-Grid',
    default: 'Q-Grid — Post-Quantum Compliance Infrastructure',
  },
  description:
    'The first compliance-first post-quantum cryptography platform. Get quantum-safe in 45 minutes, not months.',
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
