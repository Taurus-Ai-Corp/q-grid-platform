import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | GRIDERA Comply',
    default: 'GRIDERA Comply — Post-Quantum Compliance for EU AI Act',
  },
  description:
    'GRIDERA Comply — EU AI Act compliance automation with blockchain audit trails and post-quantum cryptography. Sovereign AI report generation.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#008E8A',
          borderRadius: '8px',
          fontFamily: 'DM Sans, system-ui, sans-serif',
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
