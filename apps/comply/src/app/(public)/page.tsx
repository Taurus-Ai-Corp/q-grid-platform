import Link from 'next/link'
import { Shield, Lock, Cpu, FileCheck, ChevronRight } from 'lucide-react'
import { JurisdictionBadge } from '@/components/jurisdiction-badge'

const EU_REGULATIONS = [
  {
    id: 'eu-ai-act',
    name: 'EU AI Act Regulation 2024/1689',
    authority: 'European Commission',
    status: 'Active' as const,
    deadline: 'Aug 2026',
  },
  {
    id: 'gdpr',
    name: 'GDPR — General Data Protection Regulation',
    authority: 'European Commission',
    status: 'Active' as const,
    deadline: null,
  },
  {
    id: 'dora',
    name: 'DORA — Digital Operational Resilience Act',
    authority: 'European Council',
    status: 'Active' as const,
    deadline: 'Jan 2025',
  },
  {
    id: 'nis2',
    name: 'NIS2 Directive',
    authority: 'European Commission',
    status: 'Active' as const,
    deadline: null,
  },
  {
    id: 'enisa-pqc',
    name: 'ENISA PQC Recommendations',
    authority: 'ENISA',
    status: 'Pending' as const,
    deadline: null,
  },
]

const FEATURES = [
  {
    icon: Lock,
    title: 'Post-Quantum Security',
    description:
      'ML-DSA-65 digital signatures on every compliance artifact. Future-proof your compliance against quantum computing threats with NIST FIPS 204 approved algorithms.',
    pills: ['ML-DSA-65', 'NIST FIPS 204', 'Hybrid Keys'],
  },
  {
    icon: Cpu,
    title: 'Sovereign AI Reports',
    description:
      'Self-hosted AI option. Your compliance data never leaves your infrastructure. Air-gapped deployment support with Ollama/vLLM integration.',
    pills: ['Zero Data Leakage', 'Ollama/vLLM', 'Air-Gapped'],
  },
  {
    icon: FileCheck,
    title: 'Blockchain Audit Trails',
    description:
      'Hedera HCS anchoring. Immutable, publicly verifiable compliance proof. Every audit event is PQC-signed and anchored to the Hedera network.',
    pills: ['HCS Anchoring', 'HTS Tokens', 'Public Verify'],
  },
]

export default function EULandingPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-24 text-center">
        {/* EU badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full">
          <JurisdictionBadge jurisdiction="eu" size="sm" />
          <span className="text-sm font-medium text-[#2563EB]">EU AI Act Compliant</span>
        </div>

        {/* H1 */}
        <h1
          className="font-[var(--font-heading)] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--graphite)] mb-6"
          style={{ fontSize: 'clamp(36px, 5vw, 60px)', maxWidth: '800px', margin: '0 auto 1.5rem' }}
        >
          AI Compliance Automation
          <br />
          for the{' '}
          <span className="text-[var(--accent)]">European Union</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-[var(--graphite-med)] max-w-[620px] mx-auto mb-8 leading-relaxed">
          The only platform where compliance, post-quantum cryptography, and AI governance
          are inseparable. Automate EU AI Act documentation with blockchain-backed audit trails.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 text-base font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] transition-colors"
          >
            Start Free Trial
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center h-12 px-8 text-base font-medium text-[var(--graphite)] border border-[var(--graphite-ghost)] rounded-[var(--radius)] hover:bg-[var(--graphite-whisper)] transition-colors"
          >
            Learn More
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {['NIST FIPS 204', 'EU AI Act Aug 2026', 'Blockchain Audit'].map((pill) => (
            <span
              key={pill}
              className="font-[var(--font-mono)] text-[11px] font-medium tracking-wide text-[var(--accent)] border border-[var(--accent)] px-3 py-1 rounded-full"
            >
              {pill}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[var(--bone)] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2
              className="font-[var(--font-heading)] font-bold text-[var(--graphite)] mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              Why Comply.Q-Grid?
            </h2>
            <p className="text-[var(--graphite-med)] max-w-[520px] mx-auto">
              Built for fintechs and enterprises who need bulletproof EU compliance
              without compromising on security or data sovereignty.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-[var(--radius)] p-7 shadow-sm border border-[var(--graphite-ghost)]"
                >
                  <div className="w-11 h-11 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-5">
                    <Icon className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-semibold text-[var(--graphite)] text-base mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--graphite-med)] leading-relaxed mb-5">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {feature.pills.map((pill) => (
                      <span
                        key={pill}
                        className="font-[var(--font-mono)] text-[10px] font-medium text-[var(--accent)] bg-[var(--accent-light)] px-2 py-0.5 rounded"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Regulation grid */}
      <section id="regulations" className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2
              className="font-[var(--font-heading)] font-bold text-[var(--graphite)] mb-4"
              style={{ fontSize: 'clamp(24px, 3.5vw, 38px)' }}
            >
              EU Regulatory Coverage
            </h2>
            <p className="text-[var(--graphite-med)] max-w-[480px] mx-auto">
              One platform to manage all applicable EU regulations for AI-driven enterprises.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EU_REGULATIONS.map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-[var(--radius)] p-5 border border-[var(--graphite-ghost)] shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[var(--graphite)] leading-snug">
                    {reg.name}
                  </h3>
                  <span
                    className={`shrink-0 inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      reg.status === 'Active'
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : 'bg-[#FEF9C3] text-[#A16207]'
                    }`}
                  >
                    {reg.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--graphite-light)]">{reg.authority}</span>
                  {reg.deadline && (
                    <span className="font-[var(--font-mono)] text-[10px] text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded">
                      {reg.deadline}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-[var(--bone)] py-20">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="max-w-[560px] mx-auto">
            <Shield className="h-12 w-12 text-[var(--accent)] mx-auto mb-6" />
            <h2
              className="font-[var(--font-heading)] font-bold text-[var(--graphite)] mb-4"
              style={{ fontSize: 'clamp(24px, 3.5vw, 38px)' }}
            >
              Start your EU AI Act compliance assessment
            </h2>
            <p className="text-[var(--graphite-med)] mb-8">
              14-day free trial. No credit card required.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 h-12 px-10 text-base font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] transition-colors"
            >
              Start Free Trial
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
