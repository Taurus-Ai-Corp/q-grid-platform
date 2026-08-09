import Link from 'next/link'

const PRODUCTS = [
  {
    id: 'scan',
    step: '01',
    name: 'Scan',
    tagline: 'Uncover risk',
    desc: 'See cryptographic exposure before attackers do. Free domain scan for quantum-vulnerable TLS, certificate algorithms, and NIST FIPS 203/204 gaps. Generates a CBOM and QRS risk score in seconds.',
    href: '/scan',
    outcome: 'Know your exposure',
  },
  {
    id: 'guard',
    step: '02',
    name: 'Guard',
    tagline: 'Control exposure',
    desc: 'Stop one-time assessments. Continuous PQC-signed guardrails for every LLM call, with EU AI Act, NIST AI RMF, and SOC 2 rule packs. ML-DSA-65 attestations anchored to Hedera HCS.',
    href: '/guard',
    outcome: 'Reduce operational risk',
  },
  {
    id: 'migrate',
    step: '03',
    name: 'Migrate',
    tagline: 'Transform crypto',
    desc: 'Turn post-quantum readiness into a managed transformation. Every migration decision is ML-DSA-65 signed and anchored to Hedera HCS. The crypto-agility layer (OpenFeature flags, zero-downtime TLS bridge) is architecture-complete and delivered as a funded engagement phase.',
    href: '/migrate',
    outcome: 'Modernize with confidence',
  },
  {
    id: 'comply',
    step: '04',
    name: 'Comply',
    tagline: 'Assess & regulate',
    desc: 'Move from compliance anxiety to operational control. EU AI Act risk classification, DORA compliance checks, GDPR alignment, and PIPEDA/DPDP coverage. Assessment, scoring, and regulator-facing reports on eu.q-grid.net.',
    href: '/comply',
    outcome: 'Regulate through your platform',
  },
  {
    id: 'certify',
    step: '05',
    name: 'Certify',
    tagline: 'Prove trust',
    desc: 'Cryptographically verifiable attestation for board and regulators. Executive reports, compliance matrix mapping (38 regulations across 5 sovereign jurisdictions), CBOM visualization, and a unified compliance dashboard with QRS scoring. Anyone can verify without trusting us.',
    href: '/certify',
    outcome: 'Protect business trust',
  },
]

export default function PlatformProducts() {
  return (
    <section id="products" className="py-24 bg-[var(--bone)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-baseline gap-4 mb-12">
          <span className="font-mono text-[14px] text-[var(--accent)] tracking-[0.02em]">§</span>
          <div>
            <h2 className="font-[var(--font-heading)] text-[28px] md:text-[36px] font-semibold tracking-[-0.02em] leading-[1.2] text-[var(--graphite)]">
              The Trust Ladder
            </h2>
            <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--graphite-med)] mt-1">
              Five steps from exposure to assurance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={product.href}
              className="group block border border-[var(--graphite-ghost)] bg-[var(--bone-deep)] p-6 hover:border-[var(--accent)]/40 hover:bg-[rgba(0,204,170,0.04)] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--accent)] border border-[var(--accent)] px-2 py-[2px]">
                    {product.step}
                  </span>
                  <span className="font-[var(--font-heading)] text-[20px] font-semibold text-[var(--graphite)] group-hover:text-[var(--accent)] transition-colors">
                    {product.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--graphite-med)]">
                  {product.tagline}
                </span>
              </div>
              <p className="text-[14px] text-[var(--graphite-med)] leading-[1.7] mb-4">{product.desc}</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--accent)] flex items-center gap-1">
                  {product.outcome} <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--graphite-ghost)]">
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--graphite-light)]">
            Each step produces machine-verifiable, ML-DSA-65-signed evidence anchored to Hedera HCS.
            Enter at any level. Grow upward without buying everything at once.
          </p>
        </div>
      </div>
    </section>
  )
}