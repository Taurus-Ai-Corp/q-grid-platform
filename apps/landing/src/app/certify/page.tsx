"use client"

import { useState } from 'react'
import ProductShell from '@/components/product-shell'
import ProductHero from '@/components/product-hero'
import ProductSection from '@/components/product-section'

export default function CertifyPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <ProductShell>
      <ProductHero
        badge="EXECUTIVE • ATTESTATION • VERIFIABLE PROOF"
        eyebrow="GRIDERA|Certify"
        title={
          <>
            Verifiable Proof for Your
            <br />
            <span className="gradient-text">Board and Regulators</span>
          </>
        }
        description="Cryptographically verifiable attestation — anyone can check it without trusting us. ML-DSA-65-signed evidence anchored to Hedera HCS. 38 regulations mapped across 5 sovereign jurisdictions. CBOM visualization and unified compliance dashboard with QRS scoring."
        cta={{ label: 'Request Executive Briefing', href: '#inquire' }}
        secondary={{ label: 'View Dashboard', href: '#features' }}
      />

      <ProductSection id="features" eyebrow="Layer 6: Governance & Reporting" title="What Certify Delivers" bg="bone-deep">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[var(--graphite-ghost)] p-6 bg-[var(--bone)]">
            <p className="font-mono text-[10px] text-[var(--accent)] tracking-[0.1em] uppercase mb-3">Executive Reports</p>
            <p className="text-[14px] text-[var(--graphite-med)] leading-[1.7]">
              Board-ready posture summaries with QRS scoring, risk trends, and remediation status.
              Exportable as signed PDF or interactive dashboard.
            </p>
          </div>
          <div className="border border-[var(--graphite-ghost)] p-6 bg-[var(--bone)]">
            <p className="font-mono text-[10px] text-[var(--accent)] tracking-[0.1em] uppercase mb-3">GRC Framework Mapping</p>
            <p className="text-[14px] text-[var(--graphite-med)] leading-[1.7]">
              38 regulations across 5 sovereign jurisdiction packs — EU AI Act, DORA, PIPEDA,
              Québec Law 25, OSFI B-13/E-23, CCCS PQC, NIST FIPS, DPDP, VARA — mapped to your
              assessment evidence. Broader GRC coverage via CISO Assistant API is on the roadmap.
            </p>
          </div>
          <div className="border border-[var(--graphite-ghost)] p-6 bg-[var(--bone)]">
            <p className="font-mono text-[10px] text-[var(--accent)] tracking-[0.1em] uppercase mb-3">CBOM Visualization</p>
            <p className="text-[14px] text-[var(--graphite-med)] leading-[1.7]">
              CycloneDX CBOM visualization with dependency graphs, algorithm inventory, and
              migration tracking. Machine-verifiable, offline-diffable.
            </p>
          </div>
          <div className="border border-[var(--graphite-ghost)] p-6 bg-[var(--bone)]">
            <p className="font-mono text-[10px] text-[var(--accent)] tracking-[0.1em] uppercase mb-3">Immutable Evidence Trail</p>
            <p className="text-[14px] text-[var(--graphite-med)] leading-[1.7]">
              Every attestation ML-DSA-65-signed and anchored to Hedera HCS. Regulators verify
              independently — no server trust required. Tamper-evident and independently verifiable.
            </p>
          </div>
        </div>
      </ProductSection>

      <ProductSection eyebrow="Roadmap — not yet shipping" title="Planned GRC Integrations" bg="bone">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-surface p-6">
            <p className="font-mono text-[10px] text-[var(--graphite-med)] tracking-[0.1em] uppercase mb-3">CISO Assistant API — planned</p>
            <p className="text-[14px] text-[var(--graphite-med)] leading-[1.7]">
              Planned integration to extend framework mapping beyond the 38 regulations shipping
              today, with per-control coverage gap detection.
            </p>
          </div>
          <div className="glass-surface p-6">
            <p className="font-mono text-[10px] text-[var(--graphite-med)] tracking-[0.1em] uppercase mb-3">VerifyWise API — planned</p>
            <p className="text-[14px] text-[var(--graphite-med)] leading-[1.7]">
              Planned AI-governance integration to map AI system assessments to NIST AI RMF
              functions and organizational AI policies alongside the shipping EU AI Act coverage.
            </p>
          </div>
        </div>
      </ProductSection>

      <ProductSection eyebrow="Board-ready output" title="What Executives Receive" bg="bone-deep">
        <div className="max-w-[800px] mx-auto space-y-4">
          {[
            { label: 'Posture Summary', desc: 'One-page cryptographic risk snapshot with QRS score, trend arrow, and top 5 exposures.' },
            { label: 'Compliance Matrix', desc: 'Framework-by-framework coverage map. Green/amber/red per control. Exportable as evidence package.' },
            { label: 'Attestation Bundle', desc: 'ML-DSA-65-signed attestation documents anchored to Hedera HCS. Machine-verifiable proof for auditors and regulators.' },
            { label: '30/60/90-Day Plan', desc: 'Prioritized remediation roadmap with risk scoring, dependency classification, and rollback decision criteria.' },
          ].map((item) => (
            <div key={item.label} className="flex gap-4 border border-[var(--graphite-ghost)] p-5 bg-[var(--bone)]">
              <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--accent)] shrink-0 mt-1">{item.label}</span>
              <p className="text-[14px] text-[var(--graphite-med)] leading-[1.7]">{item.desc}</p>
            </div>
          ))}
        </div>
      </ProductSection>

      <ProductSection id="inquire" eyebrow="Talk to us" title="Request an Executive Briefing" bg="bone">
        <div className="max-w-md mx-auto">
          {submitted ? (
            <div className="p-6 border border-[var(--accent)] bg-[var(--bone-deep)] text-center">
              <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--accent)] mb-2">Request Received</p>
              <p className="text-[14px] text-[var(--graphite-med)]">
                We'll respond within 24 hours with a customized executive briefing for your organization.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                className="w-full h-12 px-4 text-sm bg-[var(--bone-deep)] border border-[var(--graphite-ghost)] text-[var(--graphite)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--graphite-ghost)]"
              />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="work email"
                className="w-full h-12 px-4 text-sm bg-[var(--bone-deep)] border border-[var(--graphite-ghost)] text-[var(--graphite)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--graphite-ghost)]"
              />
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="company"
                className="w-full h-12 px-4 text-sm bg-[var(--bone-deep)] border border-[var(--graphite-ghost)] text-[var(--graphite)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--graphite-ghost)]"
              />
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="What frameworks do you need to prove compliance against?"
                rows={3}
                className="w-full px-4 py-3 text-sm bg-[var(--bone-deep)] border border-[var(--graphite-ghost)] text-[var(--graphite)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--graphite-ghost)]"
              />
              <button
                type="submit"
                className="w-full h-12 bg-[var(--accent)] text-[#0B0E14] text-sm font-semibold hover:brightness-110"
              >
                Request Briefing
              </button>
            </form>
          )}
        </div>
      </ProductSection>
    </ProductShell>
  )
}