import Link from 'next/link'
import { JurisdictionBadge } from './jurisdiction-badge'

export function PublicNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-[var(--graphite-ghost)]">
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo + jurisdiction badge */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="font-[var(--font-heading)] text-lg font-bold tracking-tight text-[var(--graphite)]"
          >
            <span className="text-[var(--accent)]">COMPLY</span>
            <span className="text-[var(--graphite-med)]">.</span>
            <span>Q-GRID</span>
          </Link>
          <JurisdictionBadge jurisdiction="eu" size="sm" />
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm text-[var(--graphite-med)] hover:text-[var(--graphite)] transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-[var(--graphite-med)] hover:text-[var(--graphite)] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="text-sm text-[var(--graphite-med)] hover:text-[var(--graphite)] transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="inline-flex items-center h-9 px-4 text-sm font-medium text-[var(--graphite)] border border-[var(--graphite-ghost)] rounded-[var(--radius)] hover:bg-[var(--graphite-whisper)] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center h-9 px-4 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </header>
  )
}
