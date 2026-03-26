import Link from 'next/link'

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'EU AI Act', href: '#regulations' },
    { label: 'Security', href: '#security' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'GDPR', href: '/gdpr' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

export function PublicFooter() {
  return (
    <footer className="bg-[#F3F4F6] border-t border-[var(--graphite-ghost)]">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="col-span-1">
            <div className="font-[var(--font-heading)] text-base font-bold text-[var(--graphite)] mb-3">
              <span className="text-[var(--accent)]">COMPLY</span>.Q-GRID
            </div>
            <p className="text-sm text-[var(--graphite-med)] leading-relaxed max-w-[220px]">
              EU AI Act compliance automation with blockchain audit trails and
              post-quantum cryptography.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-[var(--graphite)] uppercase tracking-widest mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--graphite-med)] hover:text-[var(--graphite)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[var(--graphite-ghost)] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--graphite-light)]">
            © 2026 TAURUS AI Corp. Ontario, Canada | Dubai IFZA | Wyoming LLC
          </p>
          <p className="text-xs text-[var(--graphite-light)]">
            EU data residency:{' '}
            <span className="font-mono">eu-central-1</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
