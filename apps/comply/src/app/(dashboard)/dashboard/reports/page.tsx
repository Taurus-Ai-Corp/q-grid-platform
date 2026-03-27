'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Shield, ChevronRight } from 'lucide-react'

interface ReportSummary {
  id: string
  assessmentId: string
  mode: 'template' | 'cloud' | 'sovereign'
  model?: string
  pqcHash?: string
  hederaTxId?: string
  createdAt: string
}

const MODE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  template: { label: 'Template', color: 'text-[var(--graphite-med)]', bg: 'bg-[var(--bone)]' },
  cloud: { label: 'AI Cloud', color: 'text-blue-700', bg: 'bg-blue-50' },
  sovereign: { label: 'AI Sovereign', color: 'text-emerald-700', bg: 'bg-emerald-50' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function truncateHash(hash: string | undefined): string {
  if (!hash) return '—'
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load reports')
        return r.json() as Promise<ReportSummary[]>
      })
      .then(setReports)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--graphite)] mb-1">
            Reports
          </h1>
          <p className="text-sm text-[var(--graphite-med)]">
            EU AI Act conformity assessment reports — PQC signed
          </p>
        </div>
        <Link
          href="/dashboard/assessments"
          className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold text-[var(--graphite)] bg-white border border-[var(--graphite-ghost)] rounded-[var(--radius)] hover:bg-[var(--bone)] transition-colors"
        >
          <FileText className="h-4 w-4" />
          Go to Assessments
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[var(--radius)] p-4 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48 text-sm text-[var(--graphite-light)]">
          Loading reports…
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && reports.length === 0 && (
        <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-12 flex flex-col items-center text-center max-w-[480px] mx-auto mt-12">
          <div className="w-12 h-12 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <h2 className="font-semibold text-base text-[var(--graphite)] mb-2">No reports yet</h2>
          <p className="text-sm text-[var(--graphite-med)] mb-6 leading-relaxed">
            Generate a conformity assessment report from a completed assessment to see it here.
          </p>
          <Link
            href="/dashboard/assessments"
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] transition-colors"
          >
            Go to Assessments
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Reports table */}
      {!loading && !error && reports.length > 0 && (
        <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--graphite-ghost)] bg-[var(--bone)]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide">
                  Report ID
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide hidden sm:table-cell">
                  Mode
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide hidden md:table-cell">
                  PQC Signature
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide hidden lg:table-cell">
                  Generated
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const modeStyle = MODE_CONFIG[report.mode] ?? MODE_CONFIG['template']!
                return (
                  <tr
                    key={report.id}
                    className="border-b border-[var(--graphite-ghost)] last:border-0 hover:bg-[var(--bone)] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-mono text-xs text-[var(--graphite)]">
                        {report.id.slice(0, 8)}…
                      </div>
                      <div className="text-xs text-[var(--graphite-light)] mt-0.5">
                        Assessment: {report.assessmentId.slice(0, 8)}…
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${modeStyle.color} ${modeStyle.bg}`}
                      >
                        {modeStyle.label}
                      </span>
                      {report.model && (
                        <span className="ml-2 font-mono text-xs text-[var(--graphite-light)]">
                          {report.model}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {report.pqcHash ? (
                        <div className="inline-flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
                          <span className="font-mono text-xs text-[var(--graphite-med)]">
                            {truncateHash(report.pqcHash)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--graphite-faint)]">Unsigned (dev)</span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell font-mono text-xs text-[var(--graphite-light)]">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
                      >
                        View
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
