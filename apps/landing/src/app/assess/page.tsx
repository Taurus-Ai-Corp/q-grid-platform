'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Nav from '@/components/nav'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Option {
  label: string
  value: number
}

interface Question {
  id: number
  text: string
  options: Option[]
}

type RiskLevel = 'HIGH' | 'LIMITED' | 'MINIMAL'

interface RiskResult {
  level: RiskLevel
  article: string
  color: string
  borderColor: string
  description: string
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const questions: Question[] = [
  {
    id: 1,
    text: 'What is the primary use case of your AI system?',
    options: [
      { label: 'Critical Infrastructure (Water, Gas, Electricity)', value: 10 },
      { label: 'Employment, HR, or Recruitment', value: 10 },
      { label: 'Financial services (Credit scoring, insurance)', value: 10 },
      { label: 'General purpose (Chatbots, simple automation)', value: 2 },
    ],
  },
  {
    id: 2,
    text: 'Does your system make decisions about people?',
    options: [
      { label: 'Yes, automated decision-making', value: 15 },
      { label: 'Human-in-the-loop only', value: 8 },
      { label: 'No, purely backend / technical optimization', value: 2 },
    ],
  },
  {
    id: 3,
    text: 'Are you processing biometric or health data?',
    options: [
      { label: 'Yes, for identification or sensitive use', value: 20 },
      { label: 'No, but we handle personal data (GDPR scope)', value: 5 },
      { label: 'None of the above', value: 0 },
    ],
  },
  {
    id: 4,
    text: 'Do you have a blockchain-anchored audit trail?',
    options: [
      { label: 'Yes, fully immutable via HCS', value: 0 },
      { label: 'No, we use traditional log files', value: 15 },
      { label: 'We have no formal audit trail yet', value: 25 },
    ],
  },
]

function classifyRisk(score: number): RiskResult {
  if (score > 40) {
    return {
      level: 'HIGH',
      article: 'Article 6',
      color: '#FF4444',
      borderColor: '#FF4444',
      description:
        'Your system likely falls under the High-Risk category. You are mandated to have full technical documentation and a quality management system by August 2026.',
    }
  }
  if (score > 15) {
    return {
      level: 'LIMITED',
      article: 'Article 52',
      color: '#FFAA00',
      borderColor: '#FFAA00',
      description:
        'Your system has transparency requirements. You must inform users they are interacting with an AI system.',
    }
  }
  return {
    level: 'MINIMAL',
    article: '',
    color: 'var(--accent)',
    borderColor: 'var(--accent)',
    description:
      'Your system falls into the low-risk category, but voluntary codes of conduct are recommended.',
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AssessPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const handleSelect = useCallback(
    (value: number) => {
      setSelectedOption(value)

      // Short delay so the user sees the selection highlight before advancing
      setTimeout(() => {
        const newScore = score + value
        setScore(newScore)
        setSelectedOption(null)

        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion((prev) => prev + 1)
        } else {
          setFinished(true)
        }
      }, 300)
    },
    [score, currentQuestion],
  )

  const handleRestart = useCallback(() => {
    setCurrentQuestion(0)
    setScore(0)
    setFinished(false)
    setSelectedOption(null)
  }, [])

  const result = finished ? classifyRisk(score) : null
  const q = questions[currentQuestion]
  const progress = finished
    ? 100
    : ((currentQuestion) / questions.length) * 100

  return (
    <>
      <Nav />

      <main className="min-h-screen bg-[var(--bone)] flex items-center justify-center px-5 pt-24 pb-12">
        <div
          className="w-full max-w-[640px] glass-surface p-8 sm:p-10"
          style={{ border: '1px solid var(--graphite-ghost)' }}
        >
          {/* Header */}
          <div className="mb-8">
            <span
              className="inline-block font-[var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.14em] mb-3"
              style={{ color: 'var(--accent)' }}
            >
              EU AI Act Compliance
            </span>
            <h1
              className="font-[var(--font-heading)] text-[28px] sm:text-[32px] font-bold leading-tight mb-2"
              style={{ color: 'var(--graphite)' }}
            >
              Risk Classification Assessment
            </h1>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--graphite-med)' }}
            >
              Determine your system&apos;s risk level under the August 2026 deadline.
              4 questions, 2 minutes.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span
                className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.1em]"
                style={{ color: 'var(--graphite-light)' }}
              >
                Progress
              </span>
              <span
                className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.1em]"
                style={{ color: 'var(--graphite-light)' }}
              >
                {finished ? '4/4' : `${currentQuestion}/${questions.length}`}
              </span>
            </div>
            <div
              className="h-[3px] w-full overflow-hidden"
              style={{ background: 'var(--graphite-ghost)' }}
            >
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                }}
              />
            </div>
          </div>

          {/* Quiz body */}
          {!finished && q && (
            <div key={q.id}>
              <h2
                className="font-[var(--font-heading)] text-lg font-semibold mb-5"
                style={{ color: 'var(--graphite)' }}
              >
                <span
                  className="font-[var(--font-mono)] text-xs mr-2"
                  style={{ color: 'var(--accent)' }}
                >
                  Q{q.id}
                </span>
                {q.text}
              </h2>

              <div className="flex flex-col gap-3">
                {q.options.map((opt) => {
                  const isSelected = selectedOption === opt.value
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className="text-left px-5 py-4 transition-all duration-200 cursor-pointer"
                      style={{
                        background: isSelected
                          ? 'rgba(0, 204, 170, 0.1)'
                          : 'var(--bone-deep)',
                        border: isSelected
                          ? '1px solid var(--accent)'
                          : '1px solid var(--graphite-ghost)',
                        color: 'var(--graphite)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        lineHeight: '1.5',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Results */}
          {finished && result && (
            <div className="text-center">
              {/* Score circle */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-[160px] h-[160px] rounded-full flex flex-col items-center justify-center"
                  style={{
                    border: `6px solid ${result.borderColor}`,
                    background: 'var(--bone-deep)',
                  }}
                >
                  <span
                    className="font-[var(--font-heading)] text-[52px] font-extrabold leading-none"
                    style={{ color: result.color }}
                  >
                    {score}
                  </span>
                  <span
                    className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] mt-1"
                    style={{ color: 'var(--graphite-med)' }}
                  >
                    Risk Score
                  </span>
                </div>
              </div>

              {/* Risk level */}
              <h2
                className="font-[var(--font-heading)] text-2xl font-bold mb-1"
                style={{ color: result.color }}
              >
                {result.level} RISK
                {result.article && (
                  <span
                    className="font-[var(--font-mono)] text-sm font-normal ml-2"
                    style={{ color: 'var(--graphite-med)' }}
                  >
                    ({result.article})
                  </span>
                )}
              </h2>

              <p
                className="text-sm leading-relaxed max-w-[460px] mx-auto mt-3 mb-8"
                style={{ color: 'var(--graphite-med)' }}
              >
                {result.description}
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/scan" className="btn-primary">
                  Get Your Full CBOM Report
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="btn-secondary"
                >
                  Retake Assessment
                </button>
              </div>

              {/* Deadline reminder */}
              <div
                className="mt-8 px-5 py-4 text-left"
                style={{
                  background: 'rgba(255, 170, 0, 0.06)',
                  border: '1px solid rgba(255, 170, 0, 0.15)',
                }}
              >
                <p
                  className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.1em] mb-1"
                  style={{ color: '#FFAA00' }}
                >
                  Deadline Warning
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--graphite-med)' }}
                >
                  The EU AI Act compliance deadline is{' '}
                  <strong style={{ color: 'var(--graphite)' }}>August 2, 2026</strong>.
                  High-risk systems require a full Cryptographic Bill of Materials (CBOM),
                  quality management system, and conformity assessment.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
