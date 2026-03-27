'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ClipboardCheck, Plus, ChevronRight, X } from 'lucide-react'
import type { SystemRecord } from '@/lib/systems-store'
import type { AssessmentRecord } from '@/lib/assessment-store'

type AssessmentWithSystem = AssessmentRecord & { systemName: string }

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-[var(--graphite-med)]', bg: 'bg-[var(--bone)]' },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50' },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50' },
}

const RISK_STYLES: Record<string, { label: string; color: string }> = {
  minimal: { label: 'Minimal', color: 'text-emerald-700' },
  limited: { label: 'Limited', color: 'text-blue-700' },
  high: { label: 'High', color: 'text-amber-700' },
  unacceptable: { label: 'Unacceptable', color: 'text-red-700' },
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES['draft']!
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${style.color} ${style.bg}`}>
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

// Separate component that uses useSearchParams — must be inside Suspense
function SearchParamsHandler({ onNewParam }: { onNewParam: () => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('new') === '1') onNewParam()
  }, [searchParams, onNewParam])
  return null
}

function AssessmentsContent() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<AssessmentWithSystem[]>([])
  const [systems, setSystems] = useState<SystemRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedSystemId, setSelectedSystemId] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/assessments').then((r) => {
        if (!r.ok) throw new Error('Failed to load assessments')
        return r.json() as Promise<{ assessments: AssessmentWithSystem[] }>
      }),
      fetch('/api/systems').then((r) => {
        if (!r.ok) throw new Error('Failed to load systems')
        return r.json() as Promise<{ systems: SystemRecord[] }>
      }),
    ])
      .then(([aData, sData]) => {
        setAssessments(aData.assessments)
        setSystems(sData.systems)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [])

  async function handleStartAssessment() {
    if (!selectedSystemId) return
    setCreating(true)
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemId: selectedSystemId }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to create assessment')
      }
      const assessment = await res.json() as AssessmentRecord
      router.push(`/dashboard/assessments/${assessment.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
      setCreating(false)
    }
  }

  return (
    <div>
      {/* Suspense-wrapped search params handler */}
      <Suspense fallback={null}>
        <SearchParamsHandler onNewParam={() => setShowModal(true)} />
      </Suspense>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--graphite)] mb-1">
            Assessments
          </h1>
          <p className="text-sm text-[var(--graphite-med)]">
            EU AI Act conformity assessments for your registered systems
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Start Assessment
        </button>
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
          Loading assessments…
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && assessments.length === 0 && (
        <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-12 flex flex-col items-center text-center max-w-[480px] mx-auto mt-12">
          <div className="w-12 h-12 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-4">
            <ClipboardCheck className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <h2 className="font-semibold text-base text-[var(--graphite)] mb-2">
            No assessments yet
          </h2>
          <p className="text-sm text-[var(--graphite-med)] mb-6 leading-relaxed">
            Start a conformity assessment for one of your registered AI systems to evaluate EU AI Act compliance.
          </p>
          {systems.length === 0 ? (
            <Link
              href="/dashboard/systems/new"
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] transition-colors"
            >
              Register an AI System first
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] transition-colors"
            >
              Start your first assessment
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && !error && assessments.length > 0 && (
        <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--graphite-ghost)] bg-[var(--bone)]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide">
                  System
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide hidden sm:table-cell">
                  Score
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide hidden md:table-cell">
                  Risk Level
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide hidden lg:table-cell">
                  Date
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => {
                const riskStyle = assessment.riskLevel
                  ? (RISK_STYLES[assessment.riskLevel] ?? { label: assessment.riskLevel, color: 'text-[var(--graphite-med)]' })
                  : null
                return (
                  <tr
                    key={assessment.id}
                    className="border-b border-[var(--graphite-ghost)] last:border-0 hover:bg-[var(--bone)] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-[var(--graphite)]">{assessment.systemName}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={assessment.status} />
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      {assessment.score !== undefined ? (
                        <span className="font-mono text-sm font-semibold text-[var(--graphite)]">
                          {assessment.score}%
                        </span>
                      ) : (
                        <span className="text-[var(--graphite-faint)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {riskStyle ? (
                        <span className={`text-xs font-semibold capitalize ${riskStyle.color}`}>
                          {riskStyle.label}
                        </span>
                      ) : (
                        <span className="text-[var(--graphite-faint)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell font-mono text-xs text-[var(--graphite-light)]">
                      {formatDate(assessment.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {assessment.status === 'completed' ? (
                        <Link
                          href={`/dashboard/assessments/${assessment.id}/results`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
                        >
                          View Results
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <Link
                          href={`/dashboard/assessments/${assessment.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
                        >
                          Continue
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Start Assessment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-[var(--radius)] shadow-xl border border-[var(--graphite-ghost)] w-full max-w-md p-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[var(--graphite-light)] hover:text-[var(--graphite)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center shrink-0">
                <ClipboardCheck className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <h2 className="font-semibold text-base text-[var(--graphite)]">Start Assessment</h2>
                <p className="text-xs text-[var(--graphite-med)]">Select a system to assess</p>
              </div>
            </div>

            {systems.length === 0 ? (
              <div className="text-sm text-[var(--graphite-med)] mb-5">
                No AI systems registered yet.{' '}
                <Link href="/dashboard/systems/new" className="text-[var(--accent)] hover:underline font-medium">
                  Register one first.
                </Link>
              </div>
            ) : (
              <div className="space-y-2 mb-5">
                {systems.map((system) => (
                  <button
                    key={system.id}
                    onClick={() => setSelectedSystemId(system.id)}
                    className={`w-full text-left px-4 py-3 rounded-[var(--radius)] border text-sm transition-colors ${
                      selectedSystemId === system.id
                        ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--graphite)]'
                        : 'border-[var(--graphite-ghost)] hover:border-[var(--accent)] hover:bg-[var(--bone)] text-[var(--graphite)]'
                    }`}
                  >
                    <div className="font-medium">{system.name}</div>
                    {system.description && (
                      <div className="text-xs text-[var(--graphite-light)] mt-0.5 truncate">
                        {system.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleStartAssessment}
                disabled={!selectedSystemId || creating || systems.length === 0}
                className="flex-1 h-10 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Starting…' : 'Start Assessment'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="h-10 px-4 text-sm font-medium text-[var(--graphite-med)] hover:text-[var(--graphite)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AssessmentsPage() {
  return <AssessmentsContent />
}
