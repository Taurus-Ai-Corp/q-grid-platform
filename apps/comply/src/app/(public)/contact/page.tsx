import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact GRIDERA|Comply — reach sales, compliance, or legal teams directly. AI compliance automation for EU AI Act.',
}

type ContactEntry = {
  email: string
  label: string
  description: string
}

const CONTACTS: ContactEntry[] = [
  {
    email: 'hello@q-grid.net',
    label: 'General & Sales',
    description: 'Product questions, demo requests, partnerships, pricing.',
  },
  {
    email: 'dpo@q-grid.net',
    label: 'Data Protection',
    description:
      'GDPR data-subject requests, privacy questions, data-processing agreements.',
  },
  {
    email: 'legal@q-grid.net',
    label: 'Legal',
    description:
      'Terms of service, contract reviews, takedown requests, press inquiries.',
  },
]

export default function ContactPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 pt-16 pb-24">
      <div className="mb-12">
        <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--accent)] mb-4">
          Contact
        </p>
        <h1 className="font-[var(--font-heading)] text-[36px] md:text-[48px] font-medium tracking-[-0.02em] leading-[1.15] mb-4">
          Get in touch
        </h1>
        <p className="text-[16px] leading-[1.75] text-[var(--graphite-med)]">
          Email the right team directly. We reply within one business day.
        </p>
      </div>

      <section className="space-y-4">
        {CONTACTS.map((c) => (
          <a
            key={c.email}
            href={`mailto:${c.email}`}
            className="block p-6 border border-[var(--graphite-ghost)] bg-[var(--bone-deep)] hover:border-[var(--accent)] transition-colors duration-200"
          >
            <div className="flex items-baseline justify-between mb-2 gap-4">
              <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--accent)]">
                {c.label}
              </span>
              <span className="font-mono text-[13px] text-[var(--graphite)] group-hover:text-[var(--accent)]">
                {c.email}
              </span>
            </div>
            <p className="text-[14px] leading-[1.6] text-[var(--graphite-med)]">
              {c.description}
            </p>
          </a>
        ))}
      </section>

      <div className="mt-16 pt-8 border-t border-[var(--graphite-ghost)] flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-[13px] text-[var(--graphite-med)] hover:text-[var(--accent)] transition-colors duration-200"
        >
          ← Back to Home
        </Link>
        <Link
          href="/features"
          className="font-mono text-[13px] text-[var(--graphite-med)] hover:text-[var(--accent)] transition-colors duration-200"
        >
          Features →
        </Link>
      </div>
    </div>
  )
}
