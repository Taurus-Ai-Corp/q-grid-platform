'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Server } from 'lucide-react'

const INDUSTRIES = [
  { value: 'healthcare', label: 'Healthcare & Medical' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'government', label: 'Government & Public Sector' },
  { value: 'defense', label: 'Defense & Security' },
  { value: 'education', label: 'Education' },
  { value: 'employment', label: 'Employment & HR' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' },
]

const DEPLOYMENT_SCOPES = [
  { value: 'internal', label: 'Internal — used within the organization only' },
  { value: 'b2b', label: 'B2B — deployed to business customers' },
  { value: 'b2c', label: 'B2C — deployed to end consumers' },
  { value: 'public', label: 'Public — freely accessible to anyone' },
]

const AUTONOMY_LEVELS = [
  { value: 'advisory', label: 'Advisory — provides recommendations, human decides' },
  { value: 'semi-autonomous', label: 'Semi-autonomous — acts with human oversight' },
  { value: 'fully-autonomous', label: 'Fully autonomous — acts without human review' },
]

interface FormState {
  name: string
  description: string
  useCase: string
  industry: string
  deploymentScope: string
  autonomyLevel: string
}

const INITIAL_FORM: FormState = {
  name: '',
  description: '',
  useCase: '',
  industry: 'technology',
  deploymentScope: 'internal',
  autonomyLevel: 'advisory',
}

function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-[var(--graphite)] mb-1.5"
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

export default function RegisterSystemPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('System name is required.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Registration failed')
      }

      router.push('/dashboard/systems')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[640px]">
      {/* Back link */}
      <Link
        href="/dashboard/systems"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--graphite-med)] hover:text-[var(--graphite)] mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to AI Systems
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-lg bg-[var(--accent-light)] flex items-center justify-center shrink-0">
          <Server className="h-6 w-6 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--graphite)] mb-1">
            Register AI System
          </h1>
          <p className="text-sm text-[var(--graphite-med)]">
            Provide details about your AI system for EU AI Act risk classification and
            compliance assessment.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm divide-y divide-[var(--graphite-ghost)]">

          {/* Section: Identity */}
          <div className="p-6 space-y-5">
            <h2 className="text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide">
              System Identity
            </h2>

            <div>
              <FieldLabel htmlFor="name" required>System Name</FieldLabel>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Customer Churn Predictor"
                className="w-full h-10 px-3 text-sm rounded-[var(--radius)] border border-[var(--graphite-ghost)] bg-white text-[var(--graphite)] placeholder:text-[var(--graphite-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition"
              />
            </div>

            <div>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of what this AI system does…"
                className="w-full px-3 py-2.5 text-sm rounded-[var(--radius)] border border-[var(--graphite-ghost)] bg-white text-[var(--graphite)] placeholder:text-[var(--graphite-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition resize-none"
              />
            </div>

            <div>
              <FieldLabel htmlFor="useCase">Use Case</FieldLabel>
              <input
                id="useCase"
                name="useCase"
                type="text"
                value={form.useCase}
                onChange={handleChange}
                placeholder="e.g. Predict customer churn for retention campaigns"
                className="w-full h-10 px-3 text-sm rounded-[var(--radius)] border border-[var(--graphite-ghost)] bg-white text-[var(--graphite)] placeholder:text-[var(--graphite-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Section: Classification */}
          <div className="p-6 space-y-5">
            <h2 className="text-xs font-semibold text-[var(--graphite-light)] uppercase tracking-wide">
              Classification
            </h2>

            <div>
              <FieldLabel htmlFor="industry">Industry</FieldLabel>
              <select
                id="industry"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                className="w-full h-10 px-3 text-sm rounded-[var(--radius)] border border-[var(--graphite-ghost)] bg-white text-[var(--graphite)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition appearance-none cursor-pointer"
              >
                {INDUSTRIES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel htmlFor="deploymentScope">Deployment Scope</FieldLabel>
              <select
                id="deploymentScope"
                name="deploymentScope"
                value={form.deploymentScope}
                onChange={handleChange}
                className="w-full h-10 px-3 text-sm rounded-[var(--radius)] border border-[var(--graphite-ghost)] bg-white text-[var(--graphite)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition appearance-none cursor-pointer"
              >
                {DEPLOYMENT_SCOPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel htmlFor="autonomyLevel">Autonomy Level</FieldLabel>
              <select
                id="autonomyLevel"
                name="autonomyLevel"
                value={form.autonomyLevel}
                onChange={handleChange}
                className="w-full h-10 px-3 text-sm rounded-[var(--radius)] border border-[var(--graphite-ghost)] bg-white text-[var(--graphite)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition appearance-none cursor-pointer"
              >
                {AUTONOMY_LEVELS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-[var(--graphite-light)]">
                Fully autonomous systems are automatically classified as high-risk under EU AI Act Annex III.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-[var(--radius)] px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 h-10 px-6 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Registering…' : 'Register System'}
          </button>
          <Link
            href="/dashboard/systems"
            className="inline-flex items-center h-10 px-4 text-sm font-medium text-[var(--graphite-med)] hover:text-[var(--graphite)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
