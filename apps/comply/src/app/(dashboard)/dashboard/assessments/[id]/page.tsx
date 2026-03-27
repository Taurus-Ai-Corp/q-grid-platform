'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Info,
  AlertTriangle,
  Database,
  Eye,
  Users,
  Shield,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { euAssessmentSections } from '@/lib/assessment-sections'
import type { AssessmentRecord } from '@/lib/assessment-store'

type AssessmentWithSystem = AssessmentRecord & { systemName: string }

const SECTION_ICONS: Record<string, React.ElementType> = {
  Info,
  AlertTriangle,
  Database,
  Eye,
  Users,
  Shield,
}

function getSectionIcon(iconName: string): React.ElementType {
  return SECTION_ICONS[iconName] ?? Info
}

export default function AssessmentWizardPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [assessment, setAssessment] = useState<AssessmentWithSystem | null>(null)
  const [responses, setResponses] = useState<Record<string, string | boolean>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load assessment on mount
  useEffect(() => {
    fetch(`/api/assessments/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Assessment not found')
        return r.json() as Promise<AssessmentWithSystem>
      })
      .then((data) => {
        if (data.status === 'completed') {
          router.replace(`/dashboard/assessments/${id}/results`)
          return
        }
        setAssessment(data)
        setResponses(data.responses ?? {})
        setCurrentSection(data.currentSection ?? 0)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, router])

  const saveProgress = useCallback(
    async (updatedResponses: Record<string, string | boolean>, sectionIdx: number) => {
      setSaving(true)
      try {
        await fetch(`/api/assessments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responses: updatedResponses,
            currentSection: sectionIdx,
            status: 'in_progress',
          }),
        })
      } catch {
        // Non-blocking — don't surface auto-save errors
      } finally {
        setSaving(false)
      }
    },
    [id],
  )

  function isSectionComplete(sectionIdx: number): boolean {
    const section = euAssessmentSections[sectionIdx]
    if (!section) return false
    return section.questions.every((q) => {
      const val = responses[q.id]
      if (val === undefined || val === null) return false
      if (typeof val === 'string') return val.trim().length > 0
      return true
    })
  }

  function handleTextChange(questionId: string, value: string) {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleBooleanChange(questionId: string, value: boolean) {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
  }

  async function handleNavigate(targetSection: number) {
    await saveProgress(responses, targetSection)
    setCurrentSection(targetSection)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      // Save final responses first
      await fetch(`/api/assessments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, currentSection, status: 'in_progress' }),
      })
      // Then submit for scoring
      const res = await fetch(`/api/assessments/${id}/submit`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Submission failed')
      }
      router.push(`/dashboard/assessments/${id}/results`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
      setSubmitting(false)
    }
  }

  const totalSections = euAssessmentSections.length
  const completedSections = euAssessmentSections.filter((_, i) => isSectionComplete(i)).length
  const progressPercent = Math.round((completedSections / totalSections) * 100)

  const section = euAssessmentSections[currentSection]
  const isFirst = currentSection === 0
  const isLast = currentSection === totalSections - 1

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
      </div>
    )
  }

  if (error && !assessment) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[var(--radius)] p-6 text-sm text-red-700 max-w-lg">
        {error}
      </div>
    )
  }

  if (!section) return null

  const SectionIcon = getSectionIcon(section.icon)

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--graphite)] mb-1">
          EU AI Act Conformity Assessment
        </h1>
        {assessment && (
          <p className="text-sm text-[var(--graphite-med)]">
            System: <span className="font-medium text-[var(--graphite)]">{assessment.systemName}</span>
          </p>
        )}
      </div>

      <div className="flex gap-6 items-start">
        {/* Left sidebar */}
        <aside className="w-[220px] shrink-0 bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm overflow-hidden">
          <div className="px-3 py-3 border-b border-[var(--graphite-ghost)]">
            <p className="text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide">
              Sections
            </p>
          </div>

          <nav className="px-2 py-2">
            {euAssessmentSections.map((sec, idx) => {
              const Icon = getSectionIcon(sec.icon)
              const isCurrent = idx === currentSection
              const isDone = isSectionComplete(idx)

              return (
                <button
                  key={sec.id}
                  onClick={() => handleNavigate(idx)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius)] text-left mb-0.5 text-sm transition-colors ${
                    isCurrent
                      ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
                      : 'text-[var(--graphite-med)] hover:bg-[var(--bone)] hover:text-[var(--graphite)]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Icon className="h-4 w-4" />
                    {isDone && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="h-1.5 w-1.5 text-white" />
                      </span>
                    )}
                  </div>
                  <span className="leading-tight">{sec.title}</span>
                </button>
              )
            })}
          </nav>

          {/* Progress */}
          <div className="px-4 py-4 border-t border-[var(--graphite-ghost)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--graphite-light)]">Progress</span>
              <span className="text-xs font-semibold text-[var(--graphite)]">
                {completedSections}/{totalSections}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {saving && (
              <p className="text-xs text-[var(--graphite-light)] mt-2 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving…
              </p>
            )}
          </div>
        </aside>

        {/* Main question area */}
        <div className="flex-1 min-w-0">
          {/* Section header */}
          <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-6 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-light)] flex items-center justify-center shrink-0">
                <SectionIcon className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-[var(--font-heading)] text-lg font-semibold text-[var(--graphite)]">
                    {section.title}
                  </h2>
                  <span className="text-xs text-[var(--graphite-faint)] font-mono">
                    {currentSection + 1}/{totalSections}
                  </span>
                </div>
                <p className="text-sm text-[var(--graphite-med)]">{section.description}</p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {section.questions.map((question, qIdx) => (
              <div
                key={question.id}
                className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-6"
              >
                <div className="mb-3">
                  <label className="block text-sm font-medium text-[var(--graphite)] mb-0.5">
                    <span className="text-[var(--graphite-faint)] font-mono mr-2 text-xs">
                      {qIdx + 1}.
                    </span>
                    {question.label}
                  </label>
                  {question.helpText && (
                    <p className="text-xs text-[var(--graphite-light)] mt-0.5">{question.helpText}</p>
                  )}
                </div>

                {question.type === 'text' && (
                  <textarea
                    value={(responses[question.id] as string) ?? ''}
                    onChange={(e) => handleTextChange(question.id, e.target.value)}
                    rows={3}
                    placeholder="Enter your response…"
                    className="w-full px-3 py-2.5 text-sm rounded-[var(--radius)] border border-[var(--graphite-ghost)] bg-white text-[var(--graphite)] placeholder:text-[var(--graphite-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition resize-none"
                  />
                )}

                {question.type === 'boolean' && (
                  <div className="flex gap-3">
                    {[true, false].map((val) => {
                      const isSelected = responses[question.id] === val
                      return (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => handleBooleanChange(question.id, val)}
                          className={`flex-1 h-12 rounded-[var(--radius)] border-2 text-sm font-semibold transition-all ${
                            isSelected
                              ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm'
                              : 'border-[var(--graphite-ghost)] bg-white text-[var(--graphite-med)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                          }`}
                        >
                          {val ? 'Yes' : 'No'}
                        </button>
                      )
                    })}
                  </div>
                )}

                {question.type === 'select' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((opt) => {
                      const isSelected = responses[question.id] === opt
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] border cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-[var(--accent)] bg-[var(--accent-light)]'
                              : 'border-[var(--graphite-ghost)] hover:border-[var(--accent)] hover:bg-[var(--bone)]'
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={opt}
                            checked={isSelected}
                            onChange={() => handleTextChange(question.id, opt)}
                            className="accent-[var(--accent)]"
                          />
                          <span className="text-sm text-[var(--graphite)]">{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-[var(--radius)] px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => handleNavigate(currentSection - 1)}
              disabled={isFirst}
              className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-[var(--graphite-med)] border border-[var(--graphite-ghost)] rounded-[var(--radius)] hover:text-[var(--graphite)] hover:border-[var(--graphite-med)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 h-10 px-6 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Submit Assessment'
                )}
              </button>
            ) : (
              <button
                onClick={() => handleNavigate(currentSection + 1)}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
