import Link from 'next/link'
import { Server, ClipboardCheck, FileText, ChevronRight } from 'lucide-react'

const STAT_CARDS = [
  {
    label: 'AI Systems',
    value: 0,
    icon: Server,
    description: 'Registered AI systems',
  },
  {
    label: 'Assessments',
    value: 0,
    icon: ClipboardCheck,
    description: 'Conformity assessments',
  },
  {
    label: 'Reports',
    value: 0,
    icon: FileText,
    description: 'Generated reports',
  },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--graphite)] mb-1">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--graphite-med)]">
          EU AI Act compliance overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white rounded-[var(--radius)] p-5 border border-[var(--graphite-ghost)] shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[var(--graphite-light)] uppercase tracking-wide">
                  {card.label}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[var(--accent)]" />
                </div>
              </div>
              <p className="font-[var(--font-heading)] text-3xl font-bold text-[var(--graphite)]">
                {card.value}
              </p>
              <p className="text-xs text-[var(--graphite-light)] mt-1">{card.description}</p>
            </div>
          )
        })}
      </div>

      {/* Get started card */}
      <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-8 max-w-[600px]">
        <div className="w-12 h-12 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-5">
          <Server className="h-6 w-6 text-[var(--accent)]" />
        </div>
        <h2 className="font-semibold text-lg text-[var(--graphite)] mb-2">
          Get Started
        </h2>
        <p className="text-sm text-[var(--graphite-med)] mb-6 leading-relaxed">
          Register your first AI system to begin EU AI Act compliance assessment. We'll
          guide you through risk classification, technical documentation, and conformity
          declaration.
        </p>
        <Link
          href="/dashboard/systems/new"
          className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent-dark)] transition-colors"
        >
          Register AI System
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
