'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Server, Plus, ChevronRight } from 'lucide-react'
import type { SystemRecord } from '@/lib/systems-store'

const RISK_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  minimal: { label: 'Minimal', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  limited: { label: 'Limited', color: 'text-blue-700', bg: 'bg-blue-50' },
  high: { label: 'High', color: 'text-amber-700', bg: 'bg-amber-50' },
  unacceptable: { label: 'Unacceptable', color: 'text-red-700', bg: 'bg-red-50' },
}

const INDUSTRY_LABELS: Record<string, string> = {
  healthcare: 'Healthcare',
  finance: 'Finance',
  government: 'Government',
  defense: 'Defense',
  education: 'Education',
  employment: 'Employment',
  technology: 'Technology',
  other: 'Other',
}

const FALLBACK_RISK = { label: 'Minimal', color: 'text-emerald-700', bg: 'bg-emerald-50' }

function RiskBadge({ level }: { level: string }) {
  const style = RISK_STYLES[level] ?? FALLBACK_RISK
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${style.color} ${style.bg}`}
    >
      {style.label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function SystemsPage() {
  const [systems, setSystems] = useState<SystemRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/systems')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load systems')
        return res.json() as Promise<{ systems: SystemRecord[] }>
      })
      .then((data) => setSystems(data.systems))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--graphite)] mb-1">
            AI Systems
          </h1>
          <p className="text-sm text-[var(--graphite-med)]">
            Registered AI systems under EU AI Act assessment
          </p>
        </div>
        <Link
          href="/dashboard/systems/new"
          className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Register System
        </Link>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center h-48 text-sm text-[var(--graphite-light)]">
          Loading systems…
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[var(--radius)] p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && systems.length === 0 && (
        <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-12 flex flex-col items-center text-center max-w-[480px] mx-auto mt-12">
          <div className="w-12 h-12 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-4">
            <Server className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <h2 className="font-semibold text-base text-[var(--graphite)] mb-2">
            No AI systems registered
          </h2>
          <p className="text-sm text-[var(--graphite-med)] mb-6 leading-relaxed">
            Register your first AI system to begin compliance assessment under the EU AI Act.
          </p>
          <Link
            href="/dashboard/systems/new"
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] transition-colors"
          >
            Register your first system
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {!loading && !error && systems.length > 0 && (
        <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--graphite-ghost)] bg-[var(--bone)]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide">
                  System
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide">
                  Risk Level
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide hidden sm:table-cell">
                  Industry
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide hidden md:table-cell">
                  Scope
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide hidden lg:table-cell">
                  Registered
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {systems.map((system) => (
                <tr
                  key={system.id}
                  className="border-b border-[var(--graphite-ghost)] last:border-0 hover:bg-[var(--bone)] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-[var(--graphite)]">{system.name}</div>
                    {system.description && (
                      <div className="text-xs text-[var(--graphite-light)] mt-0.5 max-w-[240px] truncate">
                        {system.description}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <RiskBadge level={system.riskLevel} />
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell text-[var(--graphite-med)] capitalize">
                    {INDUSTRY_LABELS[system.industry] ?? system.industry}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-[var(--graphite-med)] capitalize">
                    {system.deploymentScope}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell font-mono text-xs text-[var(--graphite-light)]">
                    {formatDate(system.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/assessments/new?systemId=${system.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
                    >
                      Assess
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
