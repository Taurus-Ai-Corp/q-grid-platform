/**
 * =============================================================================
 * LAUNCH STUB — replace before marketing launch.
 * -----------------------------------------------------------------------------
 * This page exists to unblock the P0 UX/QA fix on 2026-04-17 where /features
 * was gated behind Clerk auth and returned 404 to logged-out visitors. The
 * section scaffolding below maps to the five features the QA audit expected
 * to find. Fill each section with real copy, screenshots, and proof points
 * before shipping the site to customers.
 *
 * Do NOT treat this as marketing copy. It is a route-existence placeholder.
 * =============================================================================
 */
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'GRIDERA|Comply features — compliance frameworks, risk register, policy generation, reports, and integrations for EU AI Act readiness.',
}

type FeatureSection = {
  id: string
  title: string
  summary: string
}

const SECTIONS: FeatureSection[] = [
  {
    id: 'frameworks',
    title: 'Compliance Frameworks',
    summary:
      'EU AI Act, ISO 42001, NIST AI RMF, SOC 2, and GDPR coverage in one workspace.',
  },
  {
    id: 'risk-register',
    title: 'Risk Register',
    summary:
      'Structured AI-system risk tracking with severity scoring, mitigation status, and audit history.',
  },
  {
    id: 'policy-generation',
    title: 'Policy Generation',
    summary:
      'Auto-drafted policies from your system inventory — reviewed by humans, signed with post-quantum attestations.',
  },
  {
    id: 'reports',
    title: 'Reports',
    summary:
      'One-click SOC 2, EU AI Act conformity, and board-level readiness summaries. Export as PDF or live link.',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    summary:
      'Hedera HCS for immutable audit trails, Clerk for SSO, Stripe for billing, and webhooks for your stack.',
  },
]

export default function FeaturesPage() {
  return (
    <div className="max-w-[900px] mx-auto px-6 pt-16 pb-24">
      <div className="mb-12">
        <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--accent)] mb-4">
          Platform
        </p>
        <h1 className="font-[var(--font-heading)] text-[36px] md:text-[48px] font-medium tracking-[-0.02em] leading-[1.15] mb-4">
          Features
        </h1>
        <p className="text-[16px] leading-[1.75] text-[var(--graphite-med)] max-w-[640px]">
          GRIDERA|Comply turns AI governance into an operational workflow —
          frameworks, risk, policies, reports, and integrations in one
          cryptographically-anchored platform.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <article
            key={s.id}
            id={s.id}
            className="p-6 border border-[var(--graphite-ghost)] bg-[var(--bone-deep)]"
          >
            <h2 className="font-[var(--font-heading)] text-[22px] font-medium text-[var(--graphite)] mb-3 tracking-[-0.01em]">
              {s.title}
            </h2>
            <p className="text-[14px] leading-[1.65] text-[var(--graphite-med)]">
              {s.summary}
            </p>
          </article>
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
          href="/pricing"
          className="font-mono text-[13px] text-[var(--graphite-med)] hover:text-[var(--accent)] transition-colors duration-200"
        >
          See Pricing →
        </Link>
      </div>
    </div>
  )
}
