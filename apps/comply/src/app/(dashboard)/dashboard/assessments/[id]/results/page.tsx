'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, FileText, AlertTriangle } from 'lucide-react'
import { euAssessmentSections } from '@/lib/assessment-sections'
import type { AssessmentRecord, Recommendation } from '@/lib/assessment-store'

type AssessmentWithSystem = AssessmentRecord & { systemName: string }

const RISK_CONFIG: Record<string, { label: string; color: string; stroke: string; bg: string; border: string }> = {
  minimal: {
    label: 'MINIMAL RISK',
    color: 'text-emerald-700',
    stroke: '#10b981',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  limited: {
    label: 'LIMITED RISK',
    color: 'text-blue-700',
    stroke: '#3b82f6',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  high: {
    label: 'HIGH RISK',
    color: 'text-amber-700',
    stroke: '#f59e0b',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  unacceptable: {
    label: 'UNACCEPTABLE RISK',
    color: 'text-red-700',
    stroke: '#ef4444',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', border: 'border-l-red-500' },
  high: { label: 'High', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-l-amber-500' },
  medium: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-l-blue-500' },
  low: { label: 'Low', color: 'text-[var(--graphite-med)]', bg: 'bg-[var(--bone)]', border: 'border-l-[var(--graphite-ghost)]' },
}

function ScoreGauge({ score, riskLevel }: { score: number; riskLevel: string }) {
  const config = RISK_CONFIG[riskLevel] ?? RISK_CONFIG['high']!
  const radius = 72
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 176 176">
          {/* Track */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Score arc */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            fill="none"
            stroke={config.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-[var(--font-heading)] text-3xl font-bold text-[var(--graphite)]">
            {score}%
          </span>
          <span className="text-xs text-[var(--graphite-light)]">score</span>
        </div>
      </div>
      <span
        className={`mt-3 inline-flex items-center px-3 py-1 rounded text-xs font-bold tracking-wide ${config.color} ${config.bg} border ${config.border}`}
      >
        {config.label}
      </span>
    </div>
  )
}

function CategoryBar({ label, score }: { label: string; score: number }) {
  let barColor = 'bg-emerald-500'
  if (score < 50) barColor = 'bg-red-400'
  else if (score < 75) barColor = 'bg-amber-400'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-[var(--graphite)]">{label}</span>
        <span className="text-xs font-semibold font-mono text-[var(--graphite)]">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const config = PRIORITY_CONFIG[rec.priority] ?? PRIORITY_CONFIG['medium']!
  return (
    <div className={`rounded-[var(--radius)] border border-[var(--graphite-ghost)] border-l-4 ${config.border} ${config.bg} p-4`}>
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h4 className="text-sm font-semibold text-[var(--graphite)]">{rec.title}</h4>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${config.color}`}>
          {config.label}
        </span>
      </div>
      <p className="text-xs text-[var(--graphite-med)] leading-relaxed">{rec.description}</p>
      <p className="text-xs text-[var(--graphite-light)] mt-2 font-medium">{rec.category}</p>
    </div>
  )
}

export default function AssessmentResultsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [assessment, setAssessment] = useState<AssessmentWithSystem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/assessments/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Assessment not found')
        return r.json() as Promise<AssessmentWithSystem>
      })
      .then((data) => setAssessment(data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[var(--graphite-light)]">
        Loading results…
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[var(--radius)] p-6 text-sm text-red-700 max-w-lg">
        {error ?? 'Assessment not found'}
      </div>
    )
  }

  const riskLevel = assessment.riskLevel ?? 'high'
  const score = assessment.score ?? 0
  const categoryScores = assessment.categoryScores ?? {}
  const recommendations = assessment.recommendations ?? []
  const keyFindings = assessment.keyFindings ?? []

  return (
    <div className="max-w-[900px]">
      {/* Back link */}
      <Link
        href="/dashboard/assessments"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--graphite-med)] hover:text-[var(--graphite)] mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessments
      </Link>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--graphite)] mb-1">
          Assessment Results
        </h1>
        <p className="text-sm text-[var(--graphite-med)]">
          System: <span className="font-medium text-[var(--graphite)]">{assessment.systemName}</span>
          {assessment.completedAt && (
            <>
              {' '}·{' '}
              <span>
                {new Date(assessment.completedAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Score gauge */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-6 flex flex-col items-center justify-center">
          <ScoreGauge score={score} riskLevel={riskLevel} />

          {/* PQC badge — placeholder */}
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bone)] border border-[var(--graphite-ghost)] text-xs text-[var(--graphite-med)]">
            <Shield className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="font-medium">ML-DSA-65 Signed</span>
            <span className="text-emerald-600 font-bold">✓</span>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="lg:col-span-2 bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-6">
          <h3 className="text-sm font-semibold text-[var(--graphite)] mb-4">Section Scores</h3>
          <div className="space-y-3.5">
            {euAssessmentSections.map((sec) => (
              <CategoryBar
                key={sec.id}
                label={sec.title}
                score={categoryScores[sec.id] ?? 0}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Key findings */}
      {keyFindings.length > 0 && (
        <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="text-sm font-semibold text-[var(--graphite)]">Key Findings</h3>
          </div>
          <ul className="space-y-2.5">
            {keyFindings.map((finding, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--graphite-med)]">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2" />
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-6 mb-5">
          <h3 className="text-sm font-semibold text-[var(--graphite)] mb-4">
            Recommendations
            <span className="ml-2 text-xs font-normal text-[var(--graphite-light)]">
              ({recommendations.length} items)
            </span>
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
              <FileText className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--graphite)]">Generate Compliance Report</p>
              <p className="text-xs text-[var(--graphite-light)]">
                PDF report with findings, recommendations, and Declaration of Conformity
              </p>
            </div>
          </div>
          <button
            disabled
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] opacity-40 cursor-not-allowed"
            title="Coming in Part 3E"
          >
            Generate Report
            <span className="text-xs font-normal opacity-80">(Coming in Part 3E)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
