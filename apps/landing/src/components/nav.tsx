export default function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] border-b border-[var(--graphite-ghost)]"
      style={{
        background: 'var(--glass-bg, rgba(11,14,20,0.7))',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      }}
    >
      <div className="flex items-center justify-between h-16 max-w-[1200px] mx-auto px-6">
        {/* Logo */}
        <a href="/" className="flex items-center font-mono text-sm font-medium tracking-[0.06em]">
          <span className="text-[var(--graphite)]">Q-GRID</span>
          <span className="text-[var(--graphite-med)] mx-1">/</span>
          <span className="text-[var(--accent)]">COMPLY</span>
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            ['Why Q-Grid', '/#differentiators'],
            ['AI Agents', '/#agents'],
            ['Frameworks', '/#frameworks'],
            ['Blog', '/blog'],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="font-mono text-[11px] font-normal tracking-[0.08em] uppercase text-[var(--graphite-med)] hover:text-[var(--accent)] transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/scan"
          className="nav-cta-btn inline-flex items-center gap-2 font-mono text-[12px] font-medium tracking-[0.06em] uppercase px-5 py-[10px] transition-all duration-200 hover:-translate-y-px"
        >
          Free PQC Scan
        </a>
      </div>
    </nav>
  )
}
