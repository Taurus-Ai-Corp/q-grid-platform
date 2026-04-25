import type { Metadata } from 'next'
import Link from 'next/link'

export const cookiesMetadata: Metadata = {
  title: 'Cookie Notice',
  description:
    'Cookie notice for GRIDERA|Comply. This notice is being updated — contact dpo@q-grid.net for cookie questions.',
}

export function CookiesContent() {
  return (
    <>
      <div className="mb-12">
        <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--accent)] mb-4">
          Legal
        </p>
        <h1 className="font-[var(--font-heading)] text-[36px] md:text-[48px] font-medium tracking-[-0.02em] leading-[1.15] mb-4">
          Cookie Notice
        </h1>
        <p className="text-[14px] text-[var(--graphite-med)] font-mono">
          Last updated: <time dateTime="2026-04-19">April 19, 2026</time>
        </p>
      </div>

      <section className="space-y-6 text-[16px] leading-[1.75] text-[var(--graphite-med)]">
        <div className="p-6 border border-[var(--graphite-ghost)] bg-[var(--bone-deep)]">
          <p className="font-medium text-[var(--graphite)] mb-2">This notice is being updated.</p>
          <p>
            Our detailed cookie notice is currently being revised by our Data Protection Officer to
            meet the content requirements of GDPR and the ePrivacy Directive. In the interim,
            GRIDERA|Comply uses only strictly-necessary cookies required for authentication
            (Clerk), session continuity, and CSRF protection. No analytics, advertising, or
            third-party tracking cookies are set.
          </p>
          <p className="mt-4">
            For cookie-related questions, data-access requests, or to exercise your rights under
            GDPR Article 15–22, contact our Data Protection Officer:{' '}
            <Link
              href="mailto:dpo@q-grid.net"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              dpo@q-grid.net
            </Link>
            .
          </p>
        </div>

        <p className="text-[14px]">
          Our full{' '}
          <Link href="/privacy" className="text-[var(--accent)] underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          describes how we collect, use, and protect your data.
        </p>
      </section>

      <div className="mt-16 pt-8 border-t border-[var(--graphite-ghost)] flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-[13px] text-[var(--graphite-med)] hover:text-[var(--accent)] transition-colors duration-200"
        >
          ← Back to Home
        </Link>
        <Link
          href="/privacy"
          className="font-mono text-[13px] text-[var(--graphite-med)] hover:text-[var(--accent)] transition-colors duration-200"
        >
          Privacy Policy →
        </Link>
      </div>
    </>
  )
}
